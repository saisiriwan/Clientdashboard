import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Dumbbell, Target, Activity, CheckCircle2, Scale, Clock, Award, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface ProgressViewProps {
  workouts: any[];
}

// Mock data - ข้อมูลเป้าหมาย
const goalData = {
  type: 'ลดน้ำหนัก',
  targetWeight: 70, // เป้าหมาย
  startWeight: 74.5,
  currentWeight: 72.5,
  targetDate: '2025-03-01',
  startDate: '2024-11-18',
};

// คำนวณความก้าวหน้าเป็น %
const calculateGoalProgress = () => {
  const totalToLose = goalData.startWeight - goalData.targetWeight; // 4.5 kg
  const currentLost = goalData.startWeight - goalData.currentWeight; // 2 kg
  const percentage = (currentLost / totalToLose) * 100;
  return {
    percentage: Math.min(percentage, 100).toFixed(1),
    lost: currentLost.toFixed(1),
    remaining: (totalToLose - currentLost).toFixed(1),
    total: totalToLose.toFixed(1)
  };
};

// Mock data - ตารางการฝึกซ้อม (Session History)
const trainingSchedule = [
  {
    id: 1,
    date: '2024-12-16',
    startTime: '14:00',
    endTime: '15:00',
    trainer: 'โค้ชเบน',
    type: 'Strength Training',
    status: 'completed'
  },
  {
    id: 2,
    date: '2024-12-14',
    startTime: '10:00',
    endTime: '10:45',
    trainer: 'โค้ชมิกกี้',
    type: 'Cardio & HIIT',
    status: 'completed'
  },
  {
    id: 3,
    date: '2024-12-12',
    startTime: '16:30',
    endTime: '17:00',
    trainer: 'โค้ชอนันต์',
    type: 'Flexibility',
    status: 'completed'
  },
  {
    id: 4,
    date: '2024-12-10',
    startTime: '14:00',
    endTime: '15:00',
    trainer: 'โค้ชเบน',
    type: 'Strength Training',
    status: 'completed'
  },
  {
    id: 5,
    date: '2024-12-08',
    startTime: '09:00',
    endTime: '10:00',
    trainer: 'โค้ชมิกกี้',
    type: 'Cardio & HIIT',
    status: 'completed'
  },
];

// Mock data - โปรแกรมการฝึกในปัจจุบัน
const currentProgram = {
  name: 'Full Body Strength',
  description: 'โปรแกรมเน้นเพิ่มความแข็งแรงทั่วร่างกาย',
  duration: '12 สัปดาห์',
  currentWeek: 4,
  exercises: [
    { name: 'Squat', sets: 4, reps: 8, currentWeight: '100kg', lastWeight: '95kg' },
    { name: 'Bench Press', sets: 4, reps: 8, currentWeight: '80kg', lastWeight: '77.5kg' },
    { name: 'Deadlift', sets: 3, reps: 6, currentWeight: '120kg', lastWeight: '115kg' },
    { name: 'Overhead Press', sets: 3, reps: 10, currentWeight: '50kg', lastWeight: '47.5kg' },
    { name: 'Barbell Row', sets: 4, reps: 8, currentWeight: '70kg', lastWeight: '67.5kg' },
  ]
};

// Mock data for exercises history - ประวัติท่าออกกำลังกาย
const exerciseHistoryData = [
  { exercise: 'Squat', data: [
    { date: '2024-11-18', weight: 70, reps: 8, sets: 5 },
    { date: '2024-11-25', weight: 75, reps: 8, sets: 5 },
    { date: '2024-12-02', weight: 80, reps: 8, sets: 5 },
    { date: '2024-12-09', weight: 85, reps: 8, sets: 4 },
    { date: '2024-12-16', weight: 100, reps: 8, sets: 4 },
  ]},
  { exercise: 'Bench Press', data: [
    { date: '2024-11-18', weight: 55, reps: 10, sets: 4 },
    { date: '2024-11-25', weight: 60, reps: 10, sets: 4 },
    { date: '2024-12-02', weight: 65, reps: 10, sets: 4 },
    { date: '2024-12-09', weight: 70, reps: 10, sets: 4 },
    { date: '2024-12-16', weight: 80, reps: 8, sets: 4 },
  ]},
  { exercise: 'Deadlift', data: [
    { date: '2024-11-18', weight: 80, reps: 6, sets: 4 },
    { date: '2024-11-25', weight: 90, reps: 6, sets: 4 },
    { date: '2024-12-02', weight: 100, reps: 6, sets: 4 },
    { date: '2024-12-09', weight: 110, reps: 6, sets: 3 },
    { date: '2024-12-16', weight: 120, reps: 6, sets: 3 },
  ]},
  { exercise: 'Overhead Press', data: [
    { date: '2024-11-18', weight: 30, reps: 10, sets: 3 },
    { date: '2024-11-25', weight: 35, reps: 10, sets: 3 },
    { date: '2024-12-02', weight: 40, reps: 10, sets: 3 },
    { date: '2024-12-09', weight: 45, reps: 10, sets: 3 },
    { date: '2024-12-16', weight: 50, reps: 10, sets: 3 },
  ]},
  { exercise: 'Barbell Row', data: [
    { date: '2024-11-18', weight: 50, reps: 8, sets: 4 },
    { date: '2024-11-25', weight: 55, reps: 8, sets: 4 },
    { date: '2024-12-02', weight: 60, reps: 8, sets: 4 },
    { date: '2024-12-09', weight: 65, reps: 8, sets: 4 },
    { date: '2024-12-16', weight: 70, reps: 8, sets: 4 },
  ]},
];

// Mock data - กราฟน้ำหนักตัว
const weightProgressData = [
  { date: '2024-11-18', weight: 74.5 },
  { date: '2024-11-25', weight: 74.0 },
  { date: '2024-12-02', weight: 73.5 },
  { date: '2024-12-09', weight: 73.0 },
  { date: '2024-12-16', weight: 72.5 },
];

export function ProgressView({ workouts }: ProgressViewProps) {
  const [selectedExercise, setSelectedExercise] = useState(exerciseHistoryData[0].exercise);

  const progress = calculateGoalProgress();

  // Get selected exercise data
  const selectedExerciseData = useMemo(() => {
    return exerciseHistoryData.find(e => e.exercise === selectedExercise)?.data || [];
  }, [selectedExercise]);

  // Calculate exercise progress percentage
  const exerciseProgress = useMemo(() => {
    if (selectedExerciseData.length < 2) return 0;
    const first = selectedExerciseData[0];
    const last = selectedExerciseData[selectedExerciseData.length - 1];
    return ((last.weight - first.weight) / first.weight * 100).toFixed(1);
  }, [selectedExerciseData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">ความก้าวหน้าของฉัน</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          ติดตามความก้าวหน้าและสถิติการฝึกของคุณ
        </p>
      </div>

      {/* เป้าหมายและความคืบหน้า */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* ส่วนที่ 1: เป้าหมายและความก้าวหน้า */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-primary" />
                  เป้าหมายของคุณ
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {goalData.type}: จาก {goalData.startWeight} kg → {goalData.targetWeight} kg
                </CardDescription>
              </div>
              <Badge className="text-lg px-4 py-2" variant="default">
                {progress.percentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">ความก้าวหน้า</span>
                <span className="font-bold">
                  ลดไปแล้ว {progress.lost} kg / เป้าหมาย {progress.total} kg
                </span>
              </div>
              <Progress value={parseFloat(progress.percentage)} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                เหลืออีก {progress.remaining} kg เพื่อบรรลุเป้าหมาย
              </p>
            </div>

            {/* สถิติเป้าหมาย */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-card border rounded-lg p-4">
                <p className="text-xs text-muted-foreground">น้ำหนักเริ่มต้น</p>
                <p className="text-2xl font-bold">{goalData.startWeight}</p>
                <p className="text-xs text-muted-foreground">kg</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <p className="text-xs text-muted-foreground">น้ำหนักปัจจุบัน</p>
                <p className="text-2xl font-bold text-blue-600">{goalData.currentWeight}</p>
                <p className="text-xs text-muted-foreground">kg</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <p className="text-xs text-muted-foreground">เป้าหมาย</p>
                <p className="text-2xl font-bold text-green-600">{goalData.targetWeight}</p>
                <p className="text-xs text-muted-foreground">kg</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <p className="text-xs text-muted-foreground">ครบกำหนด</p>
                <p className="text-lg font-bold">1 มี.ค. 25</p>
                <p className="text-xs text-muted-foreground">เป้าหมาย</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs สำหรับข้อมูลต่างๆ */}
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions">การฝึกซ้อม</TabsTrigger>
            <TabsTrigger value="program">โปรแกรมปัจจุบัน</TabsTrigger>
            <TabsTrigger value="progress">ความก้าวหน้า</TabsTrigger>
          </TabsList>

          {/* Tab: การฝึกซ้อม - จำนวนครั้งและตาราง */}
          <TabsContent value="sessions" className="space-y-6">
            {/* ส่วนที่ 2: จำนวนครั้งที่ฝึกซ้อม */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">จำนวนครั้งทั้งหมด</CardTitle>
                  <Dumbbell className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{trainingSchedule.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">เซสชันที่ฝึกมาแล้ว</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">สัปดาห์นี้</CardTitle>
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">3</div>
                  <p className="text-xs text-muted-foreground mt-1">เซสชันในสัปดาห์นี้</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">เซสชันล่าสุด</CardTitle>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">16 ธ.ค. 24</div>
                  <p className="text-xs text-muted-foreground mt-1">{trainingSchedule[0].type}</p>
                </CardContent>
              </Card>
            </div>

            {/* ส่วนที่ 3: ตารางการฝึกซ้อม */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  ตารางการฝึกซ้อม
                </CardTitle>
                <CardDescription>ประวัติการฝึกทั้งหมด พร้อมวันและเวลา</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trainingSchedule.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {format(parseISO(session.date), 'dd MMMM yyyy', { locale: th })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            เวลา: {session.startTime} - {session.endTime} ({session.trainer})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{session.type}</Badge>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          เสร็จสิ้น
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: โปรแกรมปัจจุบัน */}
          <TabsContent value="program" className="space-y-6">
            {/* ส่วนที่ 4: โปรแกรมการฝึกในปัจจุบัน */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Award className="w-6 h-6 text-blue-600" />
                  {currentProgram.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentProgram.description} • ระยะเวลา: {currentProgram.duration}
                </CardDescription>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">ความคืบหน้าโปรแกรม</span>
                    <span className="font-bold">สัปดาห์ที่ {currentProgram.currentWeek}/12</span>
                  </div>
                  <Progress value={(currentProgram.currentWeek / 12) * 100} className="h-2" />
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-3">ท่าออกกำลังกายในโปรแกรม</h4>
                <div className="space-y-3">
                  {currentProgram.exercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-accent/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{exercise.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} เซต × {exercise.reps} รอบ
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-blue-600">{exercise.currentWeight}</p>
                        <p className="text-xs text-muted-foreground">
                          ครั้งก่อน: {exercise.lastWeight}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ประวัติท่าออกกำลังกาย */}
            <Card>
              <CardHeader>
                <CardTitle>ประวัติท่าออกกำลังกาย</CardTitle>
                <CardDescription>ดูความก้าวหน้าในแต่ละท่า</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Exercise Selector - READ-ONLY: เลือกดูกราฟต่างๆ เท่านั้น */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {exerciseHistoryData.map((exercise) => (
                    <button
                      key={exercise.exercise}
                      onClick={() => setSelectedExercise(exercise.exercise)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedExercise === exercise.exercise
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground hover:bg-accent/70'
                      }`}
                    >
                      {exercise.exercise}
                    </button>
                  ))}
                </div>

                {/* Progress Badge */}
                <div className="mb-4 flex items-center gap-2">
                  <Badge variant="outline" className="text-base py-1 px-3">
                    ความก้าวหน้า: 
                    <span className={`ml-2 font-bold ${parseFloat(exerciseProgress) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(exerciseProgress) > 0 ? '+' : ''}{exerciseProgress}%
                    </span>
                  </Badge>
                </div>

                {/* Exercise Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedExerciseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
                    />
                    <YAxis yAxisId="left" label={{ value: 'น้ำหนัก (kg)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'รอบ', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value as string), 'dd MMM yyyy', { locale: th })}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} name="น้ำหนัก (kg)" />
                    <Line yAxisId="right" type="monotone" dataKey="reps" stroke="#10b981" strokeWidth={2} name="รอบ" />
                  </LineChart>
                </ResponsiveContainer>

                {/* Exercise History Table */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">ประวัติการฝึก - {selectedExercise}</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">วันที่</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">น้ำหนัก (kg)</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">รอบ</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">เซต</th>
                          <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">ปริมาณรวม</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedExerciseData.slice().reverse().map((record, idx) => (
                          <tr key={idx} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm">
                              {format(parseISO(record.date), 'dd MMM yyyy', { locale: th })}
                            </td>
                            <td className="px-4 py-3 text-sm text-center font-medium">{record.weight}</td>
                            <td className="px-4 py-3 text-sm text-center">{record.reps}</td>
                            <td className="px-4 py-3 text-sm text-center">{record.sets}</td>
                            <td className="px-4 py-3 text-sm text-center font-bold text-blue-600">
                              {(record.weight * record.reps * record.sets).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: ความก้าวหน้า - กราฟน้ำหนักตัว */}
          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    กราฟความก้าวหน้าน้ำหนักตัว
                  </span>
                  <div className="flex items-center gap-2 text-sm font-normal">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">
                      -{(goalData.startWeight - goalData.currentWeight).toFixed(1)} kg
                    </span>
                  </div>
                </CardTitle>
                <CardDescription>ติดตามน้ำหนักตัวเพื่อบรรลุเป้าหมาย</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={weightProgressData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'dd/MM', { locale: th })}
                    />
                    <YAxis domain={[69, 75]} />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value as string), 'dd MMM yyyy', { locale: th })}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                      name="น้ำหนัก (kg)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* ตารางน้ำหนัก */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">ประวัติน้ำหนักตัว</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {weightProgressData.slice().reverse().map((record, idx) => (
                      <div key={idx} className="border rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(parseISO(record.date), 'dd MMM', { locale: th })}
                        </p>
                        <p className="text-xl font-bold">{record.weight}</p>
                        <p className="text-xs text-muted-foreground">kg</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* สถิติเพิ่มเติม */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">น้ำหนักเฉลี่ย/สัปดาห์</CardTitle>
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">-0.5 kg</div>
                  <p className="text-xs text-muted-foreground">ลดลงอย่างสม่ำเสมอ</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">เวลาเฉลี่ย/เซสชัน</CardTitle>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">52</div>
                  <p className="text-xs text-muted-foreground">นาทีต่อเซสชัน</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">วันติดต่อกัน</CardTitle>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">7</div>
                  <p className="text-xs text-muted-foreground">วันที่ฝึกต่อเนื่อง</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}