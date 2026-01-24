import React from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Star,
  Calendar,
  Clock,
  MessageSquare,
  Target,
  TrendingUp,
  Dumbbell,
  Zap,
  Activity,
  Timer,
  Flame,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { ExerciseCard } from "./ExerciseCard";

interface SessionCardsViewProps {
  cards: any[];
}

export function SessionCardsView({
  cards,
}: SessionCardsViewProps) {
  // Mock session data
  const sessionSummaries = [
    {
      id: 1,
      date: "20 ม.ค. 2024",
      time: "14:00-15:00",
      trainer: "โค้ชเบน",
      type: "Strength Training",
      rating: 4,
      feedback:
        "เป็นเซสชั่นที่ยอดเยี่ยม! นัทธกรมีความก้าวหน้าเด่นชัดในการยก Squat และ Deadlift ควรเน้นการฝึกความแข็งแรงแกนกลางต่อไป ในท่า Squat สังเกตว่า Form ดีขึ้นมาก มีความลึกที่พอดี และเข่าไม่เกิน ปลายเท้า ในท่า Deadlift เริ่มยกได้แรงขึ้น แต่ระวังหลังโค้งนะ ให้ขึ้นจากขา ไม่ใช่หลัง",
      exercises: [
        {
          name: "Squat",
          sets: 4,
          reps: 8,
          weight: "100kg",
          improvement: "+5kg",
        },
        {
          name: "Deadlift",
          sets: 3,
          reps: 6,
          weight: "120kg",
          improvement: "+10kg",
        },
        {
          name: "Bench Press",
          sets: 4,
          reps: 8,
          weight: "80kg",
          improvement: "0kg",
        },
      ],
      nextGoals: [
        "เพิ่มน้ำหนัก Squat เป็น 105kg",
        "ฝึก Core Stability",
        "ปรับท่า Bench Press",
      ],
    },
    {
      id: 2,
      date: "18 ม.ค. 2024",
      time: "10:00-10:45",
      trainer: "โค้ชมิกกี้",
      type: "Cardio & HIIT",
      rating: 4,
      feedback:
        "วันนี้เน้นการฝึก Cardio และ HIIT เพื่อเพิ่มความอึด ควรดื่มน้ำให้เพียงพอและพักผ่อนให้เต็มที่",
      exercises: [
        {
          name: "Treadmill",
          sets: 1,
          reps: "20 min",
          weight: "Speed 8",
          improvement: "+0.5 speed",
        },
        {
          name: "Burpees",
          sets: 3,
          reps: 10,
          weight: "Bodyweight",
          improvement: "+2 reps",
        },
        {
          name: "Mountain Climbers",
          sets: 3,
          reps: 30,
          weight: "Bodyweight",
          improvement: "+5 reps",
        },
      ],
      nextGoals: [
        "เพิ่มความเร็วในการวิ่ง",
        "ลดเวลาพักระหว่างเซ็ต",
        "ฝึก Jump Rope",
      ],
    },
    {
      id: 3,
      date: "15 ม.ค. 2024",
      time: "16:30-17:00",
      trainer: "โค้ชอนันต์",
      type: "Flexibility & Recovery",
      rating: 5,
      feedback:
        "เซสชั่น Recovery ที่ดีมาก ช่วยคลายกล้ามเนื้อที่ตึงจากการฝึกหนัก ควรทำ Stretching แบบนี้เป็นประจำ",
      exercises: [
        {
          name: "Full Body Stretch",
          sets: 1,
          reps: "15 min",
          weight: "-",
          improvement: "ยืดหยุ่นขึ้น",
        },
        {
          name: "Foam Rolling",
          sets: 1,
          reps: "10 min",
          weight: "-",
          improvement: "คลายได้ดีขึ้น",
        },
        {
          name: "Yoga Flow",
          sets: 1,
          reps: "15 min",
          weight: "-",
          improvement: "ทำท่าได้ดีขึ้น",
        },
      ],
      nextGoals: [
        "ฝึก Flexibility เป็นประจำ",
        "เรียนรู้ท่า Yoga เพิ่มเติม",
        "ดื่มน้ำให้เพียงพอ",
      ],
    },
  ];

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "excellent":
        return "bg-accent/20 text-accent border-accent/30";
      case "good":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700";
      case "relaxed":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700";
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "excellent":
        return "🔥";
      case "good":
        return "💪";
      case "relaxed":
        return "😌";
      default:
        return "👍";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Strength Training":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700";
      case "Cardio & HIIT":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700";
      case "Flexibility & Recovery":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">สรุปผลการฝึก</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          รีวิวเซสชั่นที่ผ่านมาและคำแนะนำจากเทรนเนอร์
        </p>
      </div>

      {/* Session Summary Cards */}
      <div className="space-y-6 sm:space-y-8">
        {sessionSummaries.map((session) => (
          <div
            key={session.id}
            className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              {/* Trainer Info */}
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <AvatarFallback className="bg-foreground text-background">
                    {session.trainer.charAt(2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    {session.trainer}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{session.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <Badge
                  variant="outline"
                  className={`text-xs ${getTypeColor(session.type)}`}
                >
                  {session.type}
                </Badge>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">
                คะแนนเซสชั่น:
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= session.rating
                        ? "text-foreground fill-foreground"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({session.rating}/5)
              </span>
            </div>

            {/* Feedback Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">
                  ความคิดเห็นจากเทรนเนอร์
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-7">
                {session.feedback}
              </p>
            </div>

            {/* Exercises Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground">
                <Target className="w-5 h-5" />
                <span className="text-sm">รายการการฝึก</span>
              </div>
              <div className="space-y-2 pl-7">
                {session.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex-1">
                      <h5 className="text-foreground">
                        {exercise.name}
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} sets
                      </p>
                    </div>
                    {exercise.improvement &&
                      exercise.improvement !== "0kg" && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          <span>{exercise.improvement}</span>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Goals Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground">
                <Target className="w-5 h-5" />
                <span className="text-sm">
                  เป้าหมายครั้งต่อไป
                </span>
              </div>
              <div className="space-y-2 pl-7">
                {session.nextGoals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-muted-foreground">
                      {goal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}