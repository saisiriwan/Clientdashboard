import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.88.0";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-cc60af31/health", (c) => {
  return c.json({ status: "ok" });
});

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Sign up endpoint
app.post("/make-server-cc60af31/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString()
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error during user creation:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Get user schedule - requires auth
app.get("/make-server-cc60af31/schedule/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Authorization error while getting schedule:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get schedule from KV store
    const schedules = await kv.getByPrefix(`schedule:${userId}:`);
    
    return c.json({ schedules: schedules || [] });
  } catch (error) {
    console.log('Error fetching schedule:', error);
    return c.json({ error: 'Failed to fetch schedule' }, 500);
  }
});

// Get workout history - requires auth
app.get("/make-server-cc60af31/workouts/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Authorization error while getting workouts:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get workouts from KV store
    const workouts = await kv.getByPrefix(`workout:${userId}:`);
    
    return c.json({ workouts: workouts || [] });
  } catch (error) {
    console.log('Error fetching workouts:', error);
    return c.json({ error: 'Failed to fetch workouts' }, 500);
  }
});

// Get session cards - requires auth
app.get("/make-server-cc60af31/session-cards/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Authorization error while getting session cards:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get session cards from KV store
    const cards = await kv.getByPrefix(`session_card:${userId}:`);
    
    return c.json({ cards: cards || [] });
  } catch (error) {
    console.log('Error fetching session cards:', error);
    return c.json({ error: 'Failed to fetch session cards' }, 500);
  }
});

// Create schedule (for trainer) - requires auth
app.post("/make-server-cc60af31/schedule", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Authorization error while creating schedule:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { userId, date, time, exercises, trainerId } = await c.req.json();
    
    const scheduleId = `schedule:${userId}:${date}`;
    await kv.set(scheduleId, {
      userId,
      date,
      time,
      exercises,
      trainerId,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Error creating schedule:', error);
    return c.json({ error: 'Failed to create schedule' }, 500);
  }
});

// Create workout record (for trainer) - requires auth
app.post("/make-server-cc60af31/workouts", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Authorization error while creating workout:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { userId, date, exercises, notes } = await c.req.json();
    
    const workoutId = `workout:${userId}:${Date.now()}`;
    await kv.set(workoutId, {
      userId,
      date,
      exercises,
      notes,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Error creating workout:', error);
    return c.json({ error: 'Failed to create workout' }, 500);
  }
});

// Create session card (for trainer) - requires auth
app.post("/make-server-cc60af31/session-cards", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return c.json({ error: 'Unauthorized - No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log('Authorization error while creating session card:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { userId, date, summary, achievements } = await c.req.json();
    
    const cardId = `session_card:${userId}:${date}`;
    await kv.set(cardId, {
      userId,
      date,
      summary,
      achievements,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true });
  } catch (error) {
    console.log('Error creating session card:', error);
    return c.json({ error: 'Failed to create session card' }, 500);
  }
});

Deno.serve(app.fetch);