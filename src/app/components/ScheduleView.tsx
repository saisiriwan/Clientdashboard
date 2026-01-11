import React from 'react';
import { Calendar, Clock, MapPin, User, Dumbbell } from 'lucide-react';
import { format, parseISO, addDays, isToday, isTomorrow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';

interface Schedule {
  id: number;
  date: string;
  time: string;
  duration: number;
  title: string;
  trainer: string;
  trainerPhone: string;
  location: string;
  status: string;
}

interface ScheduleViewProps {
  schedules: Schedule[];
}

// ฟังก์ชันสร้างปฏิทิน 7 วันข้างหน้า
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

export function ScheduleView({ schedules }: ScheduleViewProps) {
  const calendarDays = generateCalendarDays(schedules);
  const upcomingSessions = schedules.filter(s => {
    const sessionDate = parseISO(s.date);
    return sessionDate > new Date() && sessionDate <= addDays(new Date(), 7);
  });

  // Format date to Thai format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    return `วัน${date.toLocaleDateString('th-TH', { weekday: 'long' }).replace('วัน', '')}ที่ ${day} ${month}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">ตารางนัดหมายการฝึก</h1>
        <p className="text-sm sm:text-base text-muted-foreground">รายการกำหนดการที่กำลังจะมาถึง</p>
      </div>

      {/* ปฏิทินกำหนดการ 7 วันข้างหน้า */}
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

      {/* Schedule List */}
      <div className="space-y-3 sm:space-y-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Trainer Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Trainer Info */}
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-foreground">{schedule.trainer}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    schedule.status === 'confirmed' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                  }`}>
                    {schedule.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{schedule.trainerPhone}</p>

                {/* Schedule Details */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Date & Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(schedule.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{schedule.time} ({schedule.duration} นาที)</span>
                    </div>
                  </div>

                  {/* Location & Type */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{schedule.location}</span>
                    </div>
                    {schedule.title !== 'ไม่ระบุ' && (
                      <div className="flex items-start gap-2">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs inline-block">
                          {schedule.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}