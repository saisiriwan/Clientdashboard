import React from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

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

export function ScheduleView({ schedules }: ScheduleViewProps) {
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