import React from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, Clock3, XCircle, Dumbbell, Phone, X, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { th } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface ExerciseSet {
  set: number;
  reps: number;
  weight: number;
  rpe: number;
  completed: boolean;
}

interface Exercise {
  id: number;
  name: string;
  type: 'Compound' | 'Isolation' | 'Cardio' | 'Flexibility';
  sets: ExerciseSet[];
  note?: string;
}

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
  exercises?: Exercise[];
}

interface ScheduleViewProps {
  schedules: Schedule[];
}

// ฟังก์ชันสร้างปฏิทิน 7 วันข้างหน้า
const generateCalendarDays = (schedules: Schedule[]) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const sessionsOnDay = schedules.filter(s => s.date === dateStr);
    
    days.push({
      date: date,
      dateStr: dateStr,
      dayName: format(date, 'EEE', { locale: th }), // ย่อให้สั้น
      dayNumber: format(date, 'd'),
      month: format(date, 'MMM', { locale: th }),
      isToday: isToday(date),
      sessions: sessionsOnDay,
      hasWorkout: sessionsOnDay.length > 0,
      sessionCount: sessionsOnDay.length
    });
  }
  return days;
};

// ฟังก์ชันแปลงวันที่เป็นภาษาไทย
const formatThaiDate = (dateString: string) => {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return 'วันนี้';
  } else if (isTomorrow(date)) {
    return 'พรุ่งนี้';
  }
  
  return format(date, 'd MMM yyyy', { locale: th });
};

// Component สำหรับแสดง Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
    confirmed: {
      label: 'ยืนยันแล้ว',
      variant: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      icon: <CheckCircle className="w-3 h-3" />
    },
    pending: {
      label: 'รอยืนยัน',
      variant: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      icon: <Clock3 className="w-3 h-3" />
    },
    cancelled: {
      label: 'ยกเลิก',
      variant: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      icon: <XCircle className="w-3 h-3" />
    },
    completed: {
      label: 'เสร็จสิ้น',
      variant: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
      icon: <CheckCircle className="w-3 h-3" />
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.variant}`}>
      {config.icon}
      {config.label}
    </div>
  );
};

// Component สำหรับแสดง Schedule Card
const ScheduleCard = ({ schedule, onClick }: { schedule: Schedule; onClick?: () => void }) => {
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Trainer Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-[#002140] to-[#003d75] rounded-full flex items-center justify-center shadow-md">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{schedule.trainer}</h3>
                <p className="text-sm text-muted-foreground">{schedule.title}</p>
              </div>
              <StatusBadge status={schedule.status} />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{formatThaiDate(schedule.date)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>{schedule.time} ({schedule.duration} นาที)</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{schedule.location}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component สำหรับแสดงแต่ละท่าออกกำลังกาย
const ExerciseItem = ({ exercise, defaultOpen = false }: { exercise: Exercise; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const completedSets = exercise.sets.filter(s => s.completed).length;
  const totalSets = exercise.sets.length;

  return (
    <div className="border rounded-lg">
      {/* Exercise Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm text-muted-foreground">○</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{exercise.name}</span>
              <Badge 
                variant="secondary" 
                className="text-xs"
              >
                {exercise.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{totalSets} เซต</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Exercise Sets Table */}
      {isOpen && (
        <div className="border-t">
          {/* Table Header */}
          <div className="grid grid-cols-[60px_80px_110px_80px_50px] gap-2 px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
            <div>Set</div>
            <div>Reps</div>
            <div>น้ำหนัก (kg)</div>
            <div>RPE</div>
            <div className="text-center">✓</div>
          </div>

          {/* Table Rows */}
          {exercise.sets.map((set) => (
            <div
              key={set.set}
              className="grid grid-cols-[60px_80px_110px_80px_50px] gap-2 px-3 py-3 border-t text-sm items-center"
            >
              <div className="text-muted-foreground">{set.set}</div>
              <div>{set.reps}</div>
              <div>{set.weight}</div>
              <div>{set.rpe}</div>
              <div className="flex justify-center">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  set.completed 
                    ? 'bg-[#002140] border-[#002140]' 
                    : 'border-muted-foreground'
                }`}>
                  {set.completed && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Note */}
          {exercise.note && (
            <div className="px-3 py-2 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground">
                โน้ต: {exercise.note}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Component สำหรับ Empty State
const EmptyState = ({ message }: { message: string }) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export function ScheduleView({ schedules }: ScheduleViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // State สำหรับเก็บวันที่เลือก
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  
  // State สำหรับเก็บเซสชันที่เลือกเพื่อดูรายละเอียด
  const [selectedSchedule, setSelectedSchedule] = React.useState<Schedule | null>(null);

  // สร้างปฏิทิน 7 วัน
  const calendarDays = generateCalendarDays(schedules);

  // แยก schedules ตาม tab
  const todaySchedules = schedules.filter(s => {
    const scheduleDate = parseISO(s.date);
    scheduleDate.setHours(0, 0, 0, 0);
    return scheduleDate.getTime() === today.getTime();
  });

  const upcomingSchedules = schedules.filter(s => {
    const scheduleDate = parseISO(s.date);
    scheduleDate.setHours(0, 0, 0, 0);
    return scheduleDate.getTime() > today.getTime();
  }).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const pastSchedules = schedules.filter(s => {
    const scheduleDate = parseISO(s.date);
    scheduleDate.setHours(0, 0, 0, 0);
    return scheduleDate.getTime() < today.getTime();
  }).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  // ฟังก์ชันเมื่อคลิกวันในปฏิทิน
  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  // เซสชันของวันที่เลือก
  const selectedDaySchedules = selectedDate 
    ? schedules.filter(s => s.date === selectedDate)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">ตารางนัดหมาย</h1>
        <p className="text-muted-foreground">รายการนัดหมายการฝึกของคุณ</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today" className="relative">
            วันนี้
            {todaySchedules.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0 h-5 min-w-5 text-xs">
                {todaySchedules.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="relative">
            กำลังจะมา
            {upcomingSchedules.length > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5 min-w-5 text-xs">
                {upcomingSchedules.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">ผ่านมาแล้ว</TabsTrigger>
        </TabsList>

        {/* Tab: Today */}
        <TabsContent value="today" className="space-y-3 mt-6">
          {todaySchedules.length > 0 ? (
            todaySchedules.map((schedule) => (
              <ScheduleCard 
                key={schedule.id} 
                schedule={schedule} 
                onClick={() => setSelectedSchedule(schedule)}
              />
            ))
          ) : (
            <EmptyState message="ไม่มีนัดหมายวันนี้" />
          )}
        </TabsContent>

        {/* Tab: Upcoming */}
        <TabsContent value="upcoming" className="space-y-3 mt-6">
          {upcomingSchedules.length > 0 ? (
            upcomingSchedules.map((schedule) => (
              <ScheduleCard 
                key={schedule.id} 
                schedule={schedule} 
                onClick={() => setSelectedSchedule(schedule)}
              />
            ))
          ) : (
            <EmptyState message="ไม่มีนัดหมายที่กำลังจะมา" />
          )}
        </TabsContent>

        {/* Tab: Past */}
        <TabsContent value="past" className="space-y-3 mt-6">
          {pastSchedules.length > 0 ? (
            pastSchedules.map((schedule) => (
              <ScheduleCard 
                key={schedule.id} 
                schedule={schedule} 
                onClick={() => setSelectedSchedule(schedule)}
              />
            ))
          ) : (
            <EmptyState message="ไม่มีประวัตินัดหมาย" />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog สำหรับแสดงรายละเอียดเต็มรูปแบบ */}
      <Dialog open={selectedSchedule !== null} onOpenChange={(open) => !open && setSelectedSchedule(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
          {selectedSchedule && (
            <>
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#002140] to-[#003d75] rounded-full flex items-center justify-center shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedSchedule.trainer}</h3>
                    <p className="text-sm text-muted-foreground font-normal">{selectedSchedule.title}</p>
                  </div>
                  <StatusBadge status={selectedSchedule.status} />
                </DialogTitle>
                <DialogDescription className="sr-only">
                  รายละเอียดนัดหมายการฝึก
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2">
                {/* รายละเอียดย่อย - Compact Layout */}
                <div className="text-xs text-muted-foreground space-y-1.5 pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>วันที่</span>
                    <span className="font-medium text-foreground ml-auto">{formatThaiDate(selectedSchedule.date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>เวลา</span>
                    <span className="font-medium text-foreground ml-auto">{selectedSchedule.time} ({selectedSchedule.duration} นาที)</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B35]" />
                    <span>สถานที่</span>
                    <span className="font-medium text-foreground ml-auto">{selectedSchedule.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#002140]" />
                    <span>เบอร์ติดต่อเทรนเนอร์</span>
                    <span className="font-medium text-foreground ml-auto">{selectedSchedule.trainerPhone}</span>
                  </div>
                </div>

                {/* รายการออกกำลังกาย - เนื้อหาหลัก */}
                {selectedSchedule.exercises && selectedSchedule.exercises.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Dumbbell className="w-5 h-5 text-[#002140]" />
                      <h4 className="font-semibold">
                        ท่าออกกำลังกาย ({selectedSchedule.exercises.filter(e => e.sets.every(s => s.completed)).length}/{selectedSchedule.exercises.length})
                      </h4>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedSchedule.exercises.map((exercise, idx) => (
                        <ExerciseItem key={exercise.id} exercise={exercise} defaultOpen={idx < 2} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedSchedule(null)}
                >
                  ปิด
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}