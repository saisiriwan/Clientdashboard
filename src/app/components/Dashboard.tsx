import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ProfilePage } from './ProfilePage';
import { ProgressView } from './ProgressView';
import { SessionCardsView } from './SessionCardsView';
import { ScheduleView } from './ScheduleView';
import { DashboardOverview } from './DashboardOverview';
import { SettingsView } from './SettingsView';

interface DashboardProps {
  onLogout: () => void;
}

// Demo data
const demoSchedules = [
  {
    id: 1,
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: 60,
    title: 'Strength Training',
    trainer: 'โค้ชบเนศ',
    trainerPhone: '081-234-5678',
    location: 'ห้องฟิตเนส A',
    status: 'confirmed'
  },
  {
    id: 2,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00',
    duration: 45,
    title: 'ไม่ระบุ',
    trainer: 'โค้ชมิกกี้',
    trainerPhone: '082-345-6789',
    location: 'ห้องผลงานกีฬา',
    status: 'pending'
  },
  {
    id: 3,
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '16:30',
    duration: 30,
    title: 'Flexibility & Recovery',
    trainer: 'โค้ชอนนต์',
    trainerPhone: '081-234-5678',
    location: 'ห้องโยคะ',
    status: 'confirmed'
  },
  {
    id: 4,
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    title: 'Functional Training',
    trainer: 'โค้ชจิม',
    trainerPhone: '083-456-7890',
    location: 'ห้องฟิตเนส B',
    status: 'confirmed'
  }
];

const demoWorkouts = [
  {
    id: 1,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    weight: 72.5,
    bmi: 23.2,
    bodyFat: 18.5
  },
  {
    id: 2,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    weight: 73.0,
    bmi: 23.4,
    bodyFat: 19.0
  },
  {
    id: 3,
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    weight: 73.5,
    bmi: 23.6,
    bodyFat: 19.5
  },
  {
    id: 4,
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    weight: 74.0,
    bmi: 23.8,
    bodyFat: 20.0
  },
  {
    id: 5,
    date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    weight: 74.5,
    bmi: 24.0,
    bodyFat: 20.5
  }
];

const demoSessionCards = [
  {
    id: 1,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Upper Body Strength',
    trainer: 'โค้ช สมชาย',
    duration: 60,
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 10, weight: '60kg', pr: true, notes: 'ทำได้ดีมาก! เพิ่มน้ำหนักได้แล้ว' },
      { name: 'Lat Pulldown', sets: 4, reps: 12, weight: '50kg' },
      { name: 'Shoulder Press', sets: 3, reps: 10, weight: '20kg' },
      { name: 'Bicep Curls', sets: 3, reps: 12, weight: '12kg' }
    ],
    notes: 'การฝึกวันนี้ดีมาก! พัฒนาในท่า Bench Press อย่างเห็นได้ชัด ทำ PR ใหม่ที่ 60kg ครั้งหน้าลองเพิ่มน้ำหนักอีก 2.5kg ในท่า Shoulder Press ให้ระวังการทรงตัว อย่าโยกตัวมากเกินไป',
    rating: 4.5,
    nextGoals: [
      'เพิ่มน้ำหนัก Bench Press เป็น 62.5kg',
      'ปรับปรุงท่า Shoulder Press ให้มีความมั่นคงมากขึ้น',
      'เพิ่มความแข็งแรงของกล้ามเนื้อแขน'
    ]
  },
  {
    id: 2,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Lower Body Power',
    trainer: 'โค้ช สมหญิง',
    duration: 75,
    exercises: [
      { name: 'Squat', sets: 5, reps: 8, weight: '80kg', notes: 'ควบคุมการลงให้ลึกและช้า' },
      { name: 'Romanian Deadlift', sets: 4, reps: 10, weight: '70kg', pr: true },
      { name: 'Leg Press', sets: 3, reps: 12, weight: '120kg' },
      { name: 'Calf Raises', sets: 4, reps: 15, weight: '40kg' }
    ],
    notes: 'ทรงตัวดีขึ้นเยอะในท่า Squat ให้ลองฝึกความยืดหยุ่นของข้อเท้าด้วยจะช่วยให้ลงลึกได้ดีขึ้น Romanian Deadlift ทำได้ดีมากวันนี้ ทำ PR ใหม่! รักษาฟอร์มไว้ได้ดีตลอดทั้งเซต',
    rating: 5,
    nextGoals: [
      'เพิ่มความลึกของ Squat โดยการฝึกความยืดหยุ่นข้อเท้า',
      'รักษาน้ำหนัก Romanian Deadlift ที่ 70kg พร้อมเพิ่มรอบเป็น 12 reps',
      'เน้นการควบคุมความเร็วในการลงของ Leg Press'
    ]
  },
  {
    id: 3,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'HIIT Cardio',
    trainer: 'โค้ช สมชาย',
    duration: 45,
    exercises: [
      { name: 'Burpees', sets: 5, reps: 15, weight: 'Bodyweight' },
      { name: 'Mountain Climbers', sets: 5, reps: 30, weight: 'Bodyweight' },
      { name: 'Jump Squats', sets: 4, reps: 20, weight: 'Bodyweight' },
      { name: 'High Knees', sets: 4, reps: 30, weight: 'Bodyweight' }
    ],
    notes: 'ความทนทานดีขึ้นมาก! ทำได้ครบทุกรอบโดยไม่ต้องหยุดพัก พร้อมสำหรับเพิ่มความเข้มข้นแล้ว อัตราการเต้นของหัวใจอยู่ในโซนที่ดี สังเกตว่าการหายใจสม่ำเสมอขึ้นระหว่างเซต',
    rating: 4,
    nextGoals: [
      'เพิ่มจำนวนรอบของ Burpees เป็น 18 reps',
      'ลดเวลาพักระหว่างเซตลง 10 วินาที',
      'เพิ่ม 1 เซตให้กับทุกท่า'
    ]
  }
];

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content - ปรับ margin และ padding ให้ responsive */}
      <main className="flex-1 lg:ml-56 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        {activeTab === 'feed' && (
          <DashboardOverview schedules={demoSchedules} />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView schedules={demoSchedules} />
        )}

        {activeTab === 'exercises' && (
          <ProgressView workouts={demoWorkouts} />
        )}

        {activeTab === 'profile' && (
          <SessionCardsView cards={demoSessionCards} />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>
    </div>
  );
}