import React, { useState } from 'react';
import { API_URL } from '../../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Database, Loader2 } from 'lucide-react';
import { publicAnonKey } from '../../utils/supabase/info';

interface DemoDataProps {
  userId: string;
  accessToken: string;
  onDataCreated: () => void;
}

export function DemoData({ userId, accessToken, onDataCreated }: DemoDataProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createDemoData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      // Create demo schedules
      const schedules = [
        {
          userId,
          date: '2025-01-20',
          time: '10:00',
          exercises: ['Squat', 'Bench Press', 'Deadlift'],
          trainerId: 'demo-trainer'
        },
        {
          userId,
          date: '2025-01-22',
          time: '14:00',
          exercises: ['Pull-ups', 'Dips', 'Plank'],
          trainerId: 'demo-trainer'
        },
        {
          userId,
          date: '2025-01-25',
          time: '09:00',
          exercises: ['Lunges', 'Push-ups', 'Burpees'],
          trainerId: 'demo-trainer'
        }
      ];

      for (const schedule of schedules) {
        await fetch(`${API_URL}/schedule`, {
          method: 'POST',
          headers,
          body: JSON.stringify(schedule)
        });
      }

      // Create demo workouts
      const workouts = [
        {
          userId,
          date: '2025-01-15',
          exercises: [
            { name: 'Squat', sets: 3, reps: 10, weight: 60 },
            { name: 'Bench Press', sets: 3, reps: 8, weight: 50 },
            { name: 'Deadlift', sets: 3, reps: 6, weight: 80 }
          ],
          notes: 'ฟอร์มดีมาก! พยายามรักษาจังหวะการหายใจ'
        },
        {
          userId,
          date: '2025-01-17',
          exercises: [
            { name: 'Pull-ups', sets: 4, reps: 8, weight: 0 },
            { name: 'Dips', sets: 3, reps: 12, weight: 0 },
            { name: 'Plank', sets: 3, reps: 1, weight: 0 }
          ],
          notes: 'ความแข็งแรงเพิ่มขึ้นเห็นได้ชัด!'
        },
        {
          userId,
          date: '2025-01-18',
          exercises: [
            { name: 'Lunges', sets: 3, reps: 12, weight: 20 },
            { name: 'Push-ups', sets: 4, reps: 15, weight: 0 },
            { name: 'Burpees', sets: 3, reps: 10, weight: 0 }
          ],
          notes: 'พลังงานดีมาก ทำได้เต็มที่'
        }
      ];

      for (const workout of workouts) {
        await fetch(`${API_URL}/workouts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(workout)
        });
      }

      // Create demo session cards
      const sessionCards = [
        {
          userId,
          date: '2025-01-15',
          summary: 'เซสชันวันนี้เยี่ยมมาก! พัฒนาการดีขึ้นเรื่อย ๆ',
          achievements: [
            'ทำ Squat ได้น้ำหนักเพิ่มขึ้น 5 kg',
            'ฟอร์ม Deadlift ดีขึ้นมาก',
            'ความทนทานเพิ่มขึ้น'
          ]
        },
        {
          userId,
          date: '2025-01-17',
          summary: 'สร้างสถิติใหม่! Pull-ups ทำได้มากขึ้น',
          achievements: [
            'Pull-ups ทำได้ 8 ครั้งต่อเซต (เพิ่มจาก 6 ครั้ง)',
            'Plank ถือท่าได้ 90 วินาที',
            'ความแข็งแรงแกนกลางดีขึ้น'
          ]
        },
        {
          userId,
          date: '2025-01-18',
          summary: 'พลังงานเต็มเปี่ยม! ทำท่าได้หลากหลาย',
          achievements: [
            'Burpees ทำได้ต่อเนื่อง 30 ครั้ง',
            'Push-ups ฟอร์มสมบูรณ์แบบ',
            'ความคล่องตัวดีขึ้น'
          ]
        }
      ];

      for (const card of sessionCards) {
        await fetch(`${API_URL}/session-cards`, {
          method: 'POST',
          headers,
          body: JSON.stringify(card)
        });
      }

      setMessage('สร้างข้อมูลตัวอย่างสำเร็จ!');
      setTimeout(() => {
        onDataCreated();
      }, 1000);

    } catch (error) {
      console.error('Error creating demo data:', error);
      setMessage('เกิดข้อผิดพลาดในการสร้างข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2" />
          สร้างข้อมูลตัวอย่าง
        </CardTitle>
        <CardDescription>
          คลิกปุ่มด้านล่างเพื่อสร้างข้อมูลตัวอย่างสำหรับทดสอบระบบ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={createDemoData} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              กำลังสร้างข้อมูล...
            </>
          ) : (
            'สร้างข้อมูลตัวอย่าง'
          )}
        </Button>
        
        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.includes('สำเร็จ') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2 border-t pt-4">
          <p className="font-medium">ข้อมูลที่จะสร้าง:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>ตารางนัดหมาย 3 รายการ</li>
            <li>ประวัติการฝึก 3 เซสชัน</li>
            <li>การ์ดสรุปผล 3 ใบ</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
