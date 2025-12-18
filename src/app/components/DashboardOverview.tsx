import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Dumbbell,
  Bell,
  ChevronRight,
  Award,
  TrendingUp,
  CalendarDays,
  CircleDot,
  Circle,
  Droplets,
  Utensils
} from 'lucide-react';
import { format, parseISO, addDays, isSameDay, isToday, isTomorrow } from 'date-fns';
import { th } from 'date-fns/locale';

interface DashboardOverviewProps {
  schedules: any[];
}

// Mock data - โปรแกรมที่กำลังดำเนินอยู่
const activeProgram = {
  name: 'Full Body Strength',
  description: 'โปรแกรมเน้นเพิ่มความแข็งแรงทั่วร่างกาย',
  duration: '12 สัปดาห์',
  currentWeek: 4,
  totalWeeks: 12,
  trainer: 'โค้ชเบน',
  startDate: '2024-11-18',
  endDate: '2025-02-10',
  sessionsCompleted: 24,
  totalSessions: 72,
  nextSession: {
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    type: 'Strength Training',
    exercises: ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press']
  }
};

// Mock data - To-do List วันนี้
const todayTasks = [
  {
    id: 1,
    title: 'เซสชันการฝึกกับโค้ชเบน',
    time: '14:00-15:00',
    type: 'workout',
    status: 'pending',
    priority: 'high'
  },
  {
    id: 2,
    title: 'ดื่มน้ำ 2 ลิตร',
    type: 'habit',
    status: 'in-progress',
    progress: 60,
    priority: 'medium'
  },
  {
    id: 3,
    title: 'ทานโปรตีน 150g',
    type: 'nutrition',
    status: 'completed',
    priority: 'medium'
  },
];

// Mock data - การแจ้งเตือน
const notifications = [
  {
    id: 1,
    type: 'reminder',
    title: 'อย่าลืม! เซสชันการฝึกวันนี้',
    message: 'เวลา 14:00 น. กับโค้ชเบน - Strength Training',
    time: '1 ชั่วโมง',
    priority: 'high'
  },
  {
    id: 2,
    type: 'achievement',
    title: 'ยินดีด้วย! คุณทำ PR ใหม่',
    message: 'Squat 100kg - สถิติใหม่ของคุณ! 💪',
    time: '2 ชั่วโมง',
    priority: 'normal'
  },
  {
    id: 3,
    type: 'info',
    title: 'โค้ชมิกกี้แสดงความคิดเห็น',
    message: 'ได้เพิ่มคำแนะนำในเซสชันล่าสุดของคุณแล้ว',
    time: '5 ชั่วโมง',
    priority: 'normal'
  }
];

// Mock data - ปฏิทินกำหนดการ (7 วันข้างหน้า)
const generateCalendarDays = (schedules: any[]) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const sessionsOnDay = schedules.filter(s => s.date === dateStr);
    
    days.push({
      date: date,
      dateStr: dateStr,
      dayName: format(date, 'EEEE', { locale: th }),
      dayNumber: format(date, 'd'),
      month: format(date, 'MMM', { locale: th }),
      isToday: isToday(date),
      isTomorrow: isTomorrow(date),
      sessions: sessionsOnDay,
      hasWorkout: sessionsOnDay.length > 0
    });
  }
  return days;
};

export function DashboardOverview({ schedules }: DashboardOverviewProps) {
  const calendarDays = generateCalendarDays(schedules);
  const todaySessions = schedules.filter(s => isToday(parseISO(s.date)));
  const upcomingSessions = schedules.filter(s => {
    const sessionDate = parseISO(s.date);
    return sessionDate > new Date() && sessionDate <= addDays(new Date(), 7);
  });

  const programProgress = (activeProgram.sessionsCompleted / activeProgram.totalSessions) * 100;
  const weekProgress = (activeProgram.currentWeek / activeProgram.totalWeeks) * 100;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">ภาพรวมวันนี้</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: th })}
        </p>
      </div>

      {/* การแจ้งเตือนด้านบน */}
      <Card className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            <CardTitle className="text-sm sm:text-base">การแจ้งเตือนวันนี้</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-2">
            {notifications.slice(0, 2).map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-background rounded-lg border"
              >
                <div className={`p-1.5 sm:p-2 rounded-full shrink-0 ${
                  notif.type === 'reminder' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  notif.type === 'achievement' ? 'bg-green-100 dark:bg-green-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {notif.type === 'reminder' && <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />}
                  {notif.type === 'achievement' && <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />}
                  {notif.type === 'info' && <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs sm:text-sm truncate">{notif.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{notif.time}ที่แล้ว</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* ซ้าย: รายการที่ต้องทำวันนี้ */}
        <div className="lg:col-span-1 space-y-6">
          {/* To-do List วันนี้ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                งานวันนี้
              </CardTitle>
              <CardDescription>
                เสร็จสิ้น {todayTasks.filter(t => t.status === 'completed').length} จาก {todayTasks.length} งาน
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* READ-ONLY: แสดงสถานะงานเท่านั้น ไม่สามารถแก้ไขได้ */}
              <div className="space-y-3">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">ไม่มีงานที่ต้องทำวันนี้</p>
                    <p className="text-xs text-muted-foreground">พักผ่อนให้เต็มที่!</p>
                  </div>
                ) : (
                  todayTasks.map((task) => {
                    // กำหนด icon และสีตามประเภทงาน
                    const TaskIcon = 
                      task.type === 'workout' ? Dumbbell :
                      task.type === 'habit' ? Droplets :
                      Utensils;
                    
                    const taskTypeLabel = 
                      task.type === 'workout' ? 'การฝึก' :
                      task.type === 'habit' ? 'นิสัย' :
                      'โภชนาการ';

                    return (
                      <div
                        key={task.id}
                        className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                          task.status === 'completed' 
                            ? 'bg-green-50/50 dark:bg-green-950/10 border-green-300 dark:border-green-900' 
                            : task.status === 'in-progress'
                            ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-300 dark:border-blue-900'
                            : 'bg-orange-50/50 dark:bg-orange-950/10 border-orange-300 dark:border-orange-900'
                        }`}
                      >
                        {/* แถบสถานะด้านซ้าย */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in-progress' ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`} />

                        <div className="p-4 pl-5">
                          <div className="flex items-start gap-3">
                            {/* Icon ประเภทงาน */}
                            <div className={`p-2.5 rounded-lg ${
                              task.status === 'completed' 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : task.status === 'in-progress'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-orange-100 dark:bg-orange-900/30'
                            }`}>
                              <TaskIcon className={`w-5 h-5 ${
                                task.status === 'completed' ? 'text-green-600' :
                                task.status === 'in-progress' ? 'text-blue-600' :
                                'text-orange-600'
                              }`} />
                            </div>

                            <div className="flex-1">
                              {/* หัวข้องาน */}
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm">
                                  {task.title}
                                </h4>
                                
                                {/* Badge สถานะ */}
                                <Badge 
                                  variant="outline"
                                  className={`text-xs shrink-0 ${
                                    task.status === 'completed' 
                                      ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400' 
                                      : task.status === 'in-progress'
                                      ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400'
                                      : 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/20 dark:text-orange-400'
                                  }`}
                                >
                                  {task.status === 'completed' ? '✓ เสร็จสิ้น' :
                                   task.status === 'in-progress' ? '⟳ กำลังทำ' :
                                   '○ รอทำ'}
                                </Badge>
                              </div>

                              {/* ข้อมูลเพิ่มเติม */}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Circle className="w-3 h-3" />
                                  {taskTypeLabel}
                                </span>
                                {task.time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.time}
                                  </span>
                                )}
                              </div>

                              {/* Progress bar สำหรับงานที่กำลังทำ */}
                              {task.progress !== undefined && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-muted-foreground">ความคืบหน้า</span>
                                    <span className="text-xs font-bold text-blue-600">{task.progress}%</span>
                                  </div>
                                  <Progress value={task.progress} className="h-2" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* สถิติด่วน */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Dumbbell className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">เซสชันทั้งหมด</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">-2.0</div>
                  <p className="text-xs text-muted-foreground">kg ที่ลดไป</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* กลาง+ขวา: โปรแกรมและปฏิทิน */}
        <div className="lg:col-span-2 space-y-6">
          {/* โปรแกรมที่กำลังดำเนินอยู่ */}
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-background to-primary/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Award className="w-6 h-6 text-primary" />
                    โปรแกรมที่กำลังดำเนินอยู่
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {activeProgram.name} • โดย {activeProgram.trainer}
                  </CardDescription>
                </div>
                <Badge className="text-sm px-3 py-1">
                  สัปดาห์ที่ {activeProgram.currentWeek}/{activeProgram.totalWeeks}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {activeProgram.description}
              </p>

              {/* ความคืบหน้าโปรแกรม */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">ความคืบหน้าสัปดาห์</span>
                    <span className="text-sm font-bold">{weekProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={weekProgress} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">เซสชันที่เสร็จสิ้น</span>
                    <span className="text-sm font-bold">
                      {activeProgram.sessionsCompleted}/{activeProgram.totalSessions} เซสชัน
                    </span>
                  </div>
                  <Progress value={programProgress} className="h-2" />
                </div>
              </div>

              {/* เซสชันถัดไป */}
              <div className="mt-4 p-4 bg-background border rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">เซสชันถัดไป</p>
                      <p className="text-sm text-muted-foreground">
                        {isToday(parseISO(activeProgram.nextSession.date)) ? 'วันนี้' : 
                         isTomorrow(parseISO(activeProgram.nextSession.date)) ? 'พรุ่งนี้' :
                         format(parseISO(activeProgram.nextSession.date), 'dd MMM', { locale: th })} 
                        {' '}• {activeProgram.nextSession.time} น.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeProgram.nextSession.type}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* รายการท่าในเซสชัน */}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">ท่าที่จะฝึก:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeProgram.nextSession.exercises.map((exercise, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {exercise}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ปฏิทินกำหนดการ 7 วัน */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                ปฏิทินกำหนดการ 7 วันข้างหน้า
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">กำหนดการฝึกและนัดหมายของคุณ</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile: Horizontal Scroll | Desktop: Grid */}
              <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
                <div className="grid grid-cols-7 gap-2 min-w-[560px] sm:min-w-0">
                  {calendarDays.map((day, idx) => (
                    <div
                      key={idx}
                      className={`p-2 sm:p-3 rounded-lg border text-center transition-all ${
                        day.isToday 
                          ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                          : day.hasWorkout
                          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                          : 'bg-background border-border hover:bg-accent/50'
                      }`}
                    >
                      <p className={`text-[10px] sm:text-xs font-medium ${
                        day.isToday ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`}>
                        {day.dayName.slice(0, 3)}
                      </p>
                      <p className={`text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1 ${
                        day.isToday ? 'text-primary-foreground' : ''
                      }`}>
                        {day.dayNumber}
                      </p>
                      <p className={`text-[10px] sm:text-xs ${
                        day.isToday ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {day.month}
                      </p>
                      
                      {day.hasWorkout && (
                        <div className="mt-1 sm:mt-2">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mx-auto ${
                            day.isToday ? 'bg-primary-foreground' : 'bg-primary'
                          }`}></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* รายการเซสชันที่กำลังจะมา */}
              {upcomingSessions.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-sm">เซสชันที่กำลังจะมา</h4>
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Dumbbell className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{session.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(session.date), 'dd MMM', { locale: th })} • {session.time} น. ({session.duration} นาที)
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {session.trainer}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}