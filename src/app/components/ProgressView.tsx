import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Dumbbell, Target, Activity, CheckCircle2, Scale, Clock, Award, CalendarDays, Zap, Heart, Flame, Timer } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ExerciseType } from '@/api/types';

interface ProgressViewProps {
  workouts: any[];
}

// Mock data - ข้อมูลเป้าหมาย (ใช้สำหรับกราฟน้ำหนักตัว)
const goalData = {
  startWeight: 74.5,
  currentWeight: 72.5,
};

// Mock data - โปรแกรมการฝึกในปัจจุบัน (3 ประเภทหลัก)
const currentProgram = {
  name: 'Full Body Strength & Cardio',
  description: 'โปรแกรมเน้นเพิ่มความแข็งแรง พัฒนาระบบหัวใจ และเพิ่มความยืดหยุ่น',
  duration: '12 สัปดาห์',
  currentWeek: 4,
  exercises: [
    // เวทเทรนนิ่ง (Weight Training)
    { name: 'Squat', type: 'weight_training' as ExerciseType, sets: 4, reps: 8, currentWeight: '100kg', lastWeight: '95kg', icon: Dumbbell, isBodyweight: false },
    { name: 'Bench Press', type: 'weight_training' as ExerciseType, sets: 4, reps: 8, currentWeight: '80kg', lastWeight: '77.5kg', icon: Dumbbell, isBodyweight: false },
    { name: 'Push-ups', type: 'weight_training' as ExerciseType, sets: 4, reps: 20, currentReps: '20', lastReps: '18', icon: Activity, isBodyweight: true },
    // คาร์ดิโอ (Cardio)
    { name: 'Running', type: 'cardio' as ExerciseType, sets: 1, distance: '5.2km', currentTime: '27:30', lastTime: '28:15', icon: Zap },
    { name: 'Cycling', type: 'cardio' as ExerciseType, sets: 1, distance: '15km', currentTime: '35:00', lastTime: '36:30', icon: Heart },
    // เฟล็กซ์ (Flexibility)
    { name: 'Yoga Flow', type: 'flexibility' as ExerciseType, sets: 1, duration: '30 นาที', currentDuration: '30 นาที', lastDuration: '25 นาที', icon: Timer },
  ]
};

// Mock data for exercises history - 3 ประเภทหลัก
const exerciseHistoryData = [
  // เวทเทรนนิ่ง (Weight Training) - ท่าใช้อุปกรณ์
  { 
    exercise: 'Squat', 
    type: 'weight_training' as ExerciseType,
    isBodyweight: false,
    icon: Dumbbell,
    data: [
      { date: '2024-11-18', weight: 70, reps: 8, sets: 5, volume: 2800 },
      { date: '2024-11-25', weight: 75, reps: 8, sets: 5, volume: 3000 },
      { date: '2024-12-02', weight: 80, reps: 8, sets: 5, volume: 3200 },
      { date: '2024-12-09', weight: 85, reps: 8, sets: 4, volume: 2720 },
      { date: '2024-12-16', weight: 100, reps: 8, sets: 4, volume: 3200 },
    ]
  },
  { 
    exercise: 'Bench Press', 
    type: 'weight_training' as ExerciseType,
    isBodyweight: false,
    icon: Dumbbell,
    data: [
      { date: '2024-11-18', weight: 55, reps: 10, sets: 4, volume: 2200 },
      { date: '2024-11-25', weight: 60, reps: 10, sets: 4, volume: 2400 },
      { date: '2024-12-02', weight: 65, reps: 10, sets: 4, volume: 2600 },
      { date: '2024-12-09', weight: 70, reps: 10, sets: 4, volume: 2800 },
      { date: '2024-12-16', weight: 80, reps: 8, sets: 4, volume: 2560 },
    ]
  },
  { 
    exercise: 'Deadlift', 
    type: 'weight_training' as ExerciseType,
    isBodyweight: false,
    icon: Dumbbell,
    data: [
      { date: '2024-11-18', weight: 80, reps: 6, sets: 4, volume: 1920 },
      { date: '2024-11-25', weight: 90, reps: 6, sets: 4, volume: 2160 },
      { date: '2024-12-02', weight: 100, reps: 6, sets: 4, volume: 2400 },
      { date: '2024-12-09', weight: 110, reps: 6, sets: 3, volume: 1980 },
      { date: '2024-12-16', weight: 120, reps: 6, sets: 3, volume: 2160 },
    ]
  },
  // เวทเทรนนิ่ง (Weight Training) - ท่าใช้น้ำหนักตัว
  { 
    exercise: 'Push-ups', 
    type: 'weight_training' as ExerciseType,
    isBodyweight: true,
    icon: Activity,
    data: [
      { date: '2024-11-19', reps: 15, sets: 4, totalReps: 60 },
      { date: '2024-11-26', reps: 16, sets: 4, totalReps: 64 },
      { date: '2024-12-03', reps: 17, sets: 4, totalReps: 68 },
      { date: '2024-12-10', reps: 18, sets: 4, totalReps: 72 },
      { date: '2024-12-17', reps: 20, sets: 4, totalReps: 80 },
    ]
  },
  { 
    exercise: 'Pull-ups', 
    type: 'weight_training' as ExerciseType,
    isBodyweight: true,
    icon: Activity,
    data: [
      { date: '2024-11-19', reps: 6, sets: 4, totalReps: 24 },
      { date: '2024-11-26', reps: 7, sets: 4, totalReps: 28 },
      { date: '2024-12-03', reps: 8, sets: 4, totalReps: 32 },
      { date: '2024-12-10', reps: 8, sets: 4, totalReps: 32 },
      { date: '2024-12-17', reps: 9, sets: 4, totalReps: 36 },
    ]
  },
  // คาร์ดิโอ (Cardio)
  { 
    exercise: 'Running', 
    type: 'cardio' as ExerciseType,
    icon: Zap,
    data: [
      { date: '2024-11-18', distance: 3.5, duration: 21, pace: 6.0, calories: 280 },
      { date: '2024-11-25', distance: 4.0, duration: 23, pace: 5.75, calories: 320 },
      { date: '2024-12-02', distance: 4.5, duration: 26, pace: 5.78, calories: 360 },
      { date: '2024-12-09', distance: 5.0, duration: 28, pace: 5.6, calories: 400 },
      { date: '2024-12-16', distance: 5.2, duration: 27.5, pace: 5.29, calories: 416 },
    ]
  },
  { 
    exercise: 'Cycling', 
    type: 'cardio' as ExerciseType,
    icon: Heart,
    data: [
      { date: '2024-11-20', distance: 10, duration: 28, speed: 21.4, calories: 250 },
      { date: '2024-11-27', distance: 12, duration: 32, speed: 22.5, calories: 300 },
      { date: '2024-12-04', distance: 13, duration: 34, speed: 22.9, calories: 325 },
      { date: '2024-12-11', distance: 14, duration: 36, speed: 23.3, calories: 350 },
      { date: '2024-12-18', distance: 15, duration: 35, speed: 25.7, calories: 375 },
    ]
  },
  // เฟล็กซ์ (Flexibility)
  { 
    exercise: 'Yoga Flow', 
    type: 'flexibility' as ExerciseType,
    icon: Timer,
    data: [
      { date: '2024-11-21', duration: 20, sets: 1, totalDuration: 20 },
      { date: '2024-11-28', duration: 22, sets: 1, totalDuration: 22 },
      { date: '2024-12-05', duration: 25, sets: 1, totalDuration: 25 },
      { date: '2024-12-12', duration: 28, sets: 1, totalDuration: 28 },
      { date: '2024-12-19', duration: 30, sets: 1, totalDuration: 30 },
    ]
  },
  { 
    exercise: 'Static Stretching', 
    type: 'flexibility' as ExerciseType,
    icon: Timer,
    data: [
      { date: '2024-11-22', duration: 10, sets: 1, totalDuration: 10 },
      { date: '2024-11-29', duration: 12, sets: 1, totalDuration: 12 },
      { date: '2024-12-06', duration: 15, sets: 1, totalDuration: 15 },
      { date: '2024-12-13', duration: 15, sets: 1, totalDuration: 15 },
      { date: '2024-12-20', duration: 18, sets: 1, totalDuration: 18 },
    ]
  },
];

// Mock data - กราฟน้ำหนักตัว
const weightProgressData = [
  { date: '2024-11-18', weight: 74.5 },
  { date: '2024-11-25', weight: 74.0 },
  { date: '2024-12-02', weight: 73.5 },
  { date: '2024-12-09', weight: 73.0 },
  { date: '2024-12-16', weight: 72.5 },
];

// Helper function to get metric label based on exercise type
const getMetricLabel = (type: ExerciseType, isBodyweight?: boolean) => {
  switch (type) {
    case 'weight_training':
      return isBodyweight 
        ? { primary: 'รอบ/เซต', secondary: 'รอบรวม' }
        : { primary: 'น้ำหนัก (kg)', secondary: 'รอบ' };
    case 'cardio':
      return { primary: 'ระยะทาง (km)', secondary: 'เวลา (นาที)' };
    case 'flexibility':
      return { primary: 'เวลา (นาที)', secondary: 'เวลารวม (นาที)' };
    default:
      return { primary: 'ค่า', secondary: 'รวม' };
  }
};

// Helper function to get type config
const getTypeConfig = (type: ExerciseType) => {
  switch (type) {
    case 'weight_training':
      return {
        label: '💪 เวทเทรนนิ่ง',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        badgeColor: 'bg-blue-100 text-blue-700',
        chartColor: '#3b82f6',
        frequency: '2-4 ครั้ง/สัปดาห์',
        description: 'พัฒนาความแข็งแรง, มวลกล้ามเนื้อ, เพิ่มอัตราการเผาผลาญ',
      };
    case 'cardio':
      return {
        label: '🏃 คาร์ดิโอ',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        badgeColor: 'bg-green-100 text-green-700',
        chartColor: '#10b981',
        frequency: '3-5 ครั้ง/สัปดาห์',
        description: 'พัฒนาระบบหัวใจและหลอดเลือด, เผาผลาญไขมัน, เพิ่มความทนทาน',
      };
    case 'flexibility':
      return {
        label: '🧘 เฟล็กซ์',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        badgeColor: 'bg-purple-100 text-purple-700',
        chartColor: '#a855f7',
        frequency: 'ทุกวัน หรือ 3-5 ครั้ง/สัปดาห์',
        description: 'ป้องกันการบาดเจ็บ, เพิ่มช่วงการเคลื่อนไหว, ช่วยการฟื้นตัว',
      };
    default:
      return {
        label: 'อื่นๆ',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        badgeColor: 'bg-gray-100 text-gray-700',
        chartColor: '#6b7280',
        frequency: '-',
        description: '',
      };
  }
};

// Helper function to render exercise value
const renderExerciseValue = (exercise: any) => {
  const config = getTypeConfig(exercise.type);
  
  switch (exercise.type) {
    case 'weight_training':
      if (exercise.isBodyweight) {
        return (
          <div className="text-right">
            <p className={`font-bold text-lg ${config.color}`}>{exercise.currentReps} รอบ/เซต</p>
            <p className="text-xs text-muted-foreground">ครั้งก่อน: {exercise.lastReps} รอบ/เซต</p>
          </div>
        );
      } else {
        return (
          <div className="text-right">
            <p className={`font-bold text-lg ${config.color}`}>{exercise.currentWeight}</p>
            <p className="text-xs text-muted-foreground">ครั้งก่อน: {exercise.lastWeight}</p>
          </div>
        );
      }
    case 'cardio':
      return (
        <div className="text-right">
          <p className={`font-bold text-lg ${config.color}`}>{exercise.distance}</p>
          <p className="text-xs text-muted-foreground">เวลา: {exercise.currentTime} (ครั้งก่อน: {exercise.lastTime})</p>
        </div>
      );
    case 'flexibility':
      return (
        <div className="text-right">
          <p className={`font-bold text-lg ${config.color}`}>{exercise.currentDuration}</p>
          <p className="text-xs text-muted-foreground">ครั้งก่อน: {exercise.lastDuration}</p>
        </div>
      );
    default:
      return null;
  }
};

export function ProgressView({ workouts }: ProgressViewProps) {
  const [selectedExercise, setSelectedExercise] = useState(exerciseHistoryData[0].exercise);

  // Get selected exercise data
  const selectedExerciseData = useMemo(() => {
    const exercise = exerciseHistoryData.find(e => e.exercise === selectedExercise);
    return exercise || exerciseHistoryData[0];
  }, [selectedExercise]);

  // Calculate exercise progress percentage
  const exerciseProgress = useMemo(() => {
    const data = selectedExerciseData.data;
    if (data.length < 2) return '0.0';
    
    const first = data[0];
    const last = data[data.length - 1];
    
    // Calculate based on exercise type
    switch (selectedExerciseData.type) {
      case 'weight_training':
        if (selectedExerciseData.isBodyweight) {
          return ((last.totalReps - first.totalReps) / first.totalReps * 100).toFixed(1);
        } else {
          return ((last.weight - first.weight) / first.weight * 100).toFixed(1);
        }
      case 'cardio':
        return ((last.distance - first.distance) / first.distance * 100).toFixed(1);
      case 'flexibility':
        return ((last.totalDuration - first.totalDuration) / first.totalDuration * 100).toFixed(1);
      default:
        return '0.0';
    }
  }, [selectedExerciseData]);

  // Render chart based on exercise type
  const renderChart = () => {
    const data = selectedExerciseData.data;
    const labels = getMetricLabel(selectedExerciseData.type, selectedExerciseData.isBodyweight);
    const config = getTypeConfig(selectedExerciseData.type);

    switch (selectedExerciseData.type) {
      case 'weight_training':
        if (selectedExerciseData.isBodyweight) {
          // Bodyweight exercises - Bar Chart
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
                />
                <YAxis yAxisId="left" label={{ value: labels.primary, angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: labels.secondary, angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  labelFormatter={(value) => format(parseISO(value as string), 'dd MMM yyyy', { locale: th })}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="reps" fill={config.chartColor} name="รอบ/เซต" />
                <Bar yAxisId="right" dataKey="totalReps" fill="#93c5fd" name="รอบรวม" />
              </BarChart>
            </ResponsiveContainer>
          );
        } else {
          // Weight exercises - Line Chart
          return (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
                />
                <YAxis yAxisId="left" label={{ value: labels.primary, angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: labels.secondary, angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  labelFormatter={(value) => format(parseISO(value as string), 'dd MMM yyyy', { locale: th })}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="weight" stroke={config.chartColor} strokeWidth={2} name="น้ำหนัก (kg)" />
                <Line yAxisId="right" type="monotone" dataKey="reps" stroke="#10b981" strokeWidth={2} name="รอบ" />
              </LineChart>
            </ResponsiveContainer>
          );
        }

      case 'cardio':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
              />
              <YAxis yAxisId="left" label={{ value: labels.primary, angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: labels.secondary, angle: 90, position: 'insideRight' }} />
              <Tooltip 
                labelFormatter={(value) => format(parseISO(value as string), 'dd MMM yyyy', { locale: th })}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="distance" stroke={config.chartColor} strokeWidth={2} name="ระยะทาง (km)" />
              <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#f59e0b" strokeWidth={2} name="เวลา (นาที)" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'flexibility':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.chartColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={config.chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
              />
              <YAxis label={{ value: 'เวลา (นาที)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                labelFormatter={(value) => format(parseISO(value as string), 'dd MMM yyyy', { locale: th })}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="duration" 
                stroke={config.chartColor} 
                fillOpacity={1} 
                fill="url(#colorDuration)" 
                name="เวลา (นาที)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  // Render table based on exercise type
  const renderTable = () => {
    const data = selectedExerciseData.data;

    switch (selectedExerciseData.type) {
      case 'weight_training':
        if (selectedExerciseData.isBodyweight) {
          return (
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">วันที่</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">รอบ/เซต</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">เซต</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">รอบรวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.slice().reverse().map((record: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">
                      {format(parseISO(record.date), 'dd MMM yyyy', { locale: th })}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-medium">{record.reps}</td>
                    <td className="px-4 py-3 text-sm text-center">{record.sets}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-blue-600">
                      {record.totalReps}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        } else {
          return (
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
                {data.slice().reverse().map((record: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">
                      {format(parseISO(record.date), 'dd MMM yyyy', { locale: th })}
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-medium">{record.weight}</td>
                    <td className="px-4 py-3 text-sm text-center">{record.reps}</td>
                    <td className="px-4 py-3 text-sm text-center">{record.sets}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-blue-600">
                      {record.volume?.toLocaleString() || (record.weight * record.reps * record.sets).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }

      case 'cardio':
        return (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">วันที่</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">ระยะทาง (km)</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">เวลา (นาที)</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">จังหวะ (นาที/km)</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">แคลอรี่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.slice().reverse().map((record: any, idx: number) => (
                <tr key={idx} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">
                    {format(parseISO(record.date), 'dd MMM yyyy', { locale: th })}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-medium">{record.distance}</td>
                  <td className="px-4 py-3 text-sm text-center">{record.duration}</td>
                  <td className="px-4 py-3 text-sm text-center">{record.pace?.toFixed(2) || (record.duration / record.distance).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-green-600">
                    {record.calories?.toLocaleString() || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'flexibility':
        return (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">วันที่</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">เวลา (นาที)</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">เซต</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">เวลารวม (นาที)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.slice().reverse().map((record: any, idx: number) => (
                <tr key={idx} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">
                    {format(parseISO(record.date), 'dd MMM yyyy', { locale: th })}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-medium">{record.duration}</td>
                  <td className="px-4 py-3 text-sm text-center">{record.sets}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-purple-600">
                    {record.totalDuration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  const selectedConfig = getTypeConfig(selectedExerciseData.type);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">ความก้าวหน้าของฉัน</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          ติดตามความก้าวหน้าและสถิติการฝึกของคุณ
        </p>
      </div>

      {/* Tabs สำหรับข้อมูลต่างๆ */}
      <Tabs defaultValue="program" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="program">โปรแกรมปัจจุบัน</TabsTrigger>
          <TabsTrigger value="progress">ความก้าวหน้า</TabsTrigger>
        </TabsList>

        {/* Tab: โปรแกรมปัจจุบัน */}
        <TabsContent value="program" className="space-y-6">
          {/* โปรแกรมการฝึกในปัจจุบัน */}
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
                {currentProgram.exercises.map((exercise, idx) => {
                  const Icon = exercise.icon;
                  const config = getTypeConfig(exercise.type);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 ${config.bgColor} rounded-lg`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className={`w-5 h-5 ${config.color}`} />
                        <div className="flex-1">
                          <p className="font-semibold">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {exercise.type === 'weight_training' && `${exercise.sets} เซต × ${exercise.reps} รอบ`}
                            {exercise.type === 'cardio' && `${exercise.distance} • ${exercise.sets} เซสชัน`}
                            {exercise.type === 'flexibility' && `${exercise.duration}`}
                          </p>
                        </div>
                      </div>
                      {renderExerciseValue(exercise)}
                    </div>
                  );
                })}
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
              <div className="mb-6">
                <label htmlFor="exercise-select" className="block text-sm font-medium mb-2">
                  เลือกท่าออกกำลังกาย
                </label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger id="exercise-select" className="w-full md:w-96">
                    <SelectValue placeholder="เลือกท่าออกกำลังกาย" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseHistoryData.map((exercise) => {
                      const Icon = exercise.icon;
                      const config = getTypeConfig(exercise.type);
                      return (
                        <SelectItem 
                          key={exercise.exercise} 
                          value={exercise.exercise}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${config.color}`} />
                            <span>{exercise.exercise}</span>
                            <Badge className={`${config.badgeColor} text-xs ml-2`}>
                              {config.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Progress Badge และ Type Info */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-base py-1 px-3">
                  ความก้าวหน้า: 
                  <span className={`ml-2 font-bold ${parseFloat(exerciseProgress) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(exerciseProgress) > 0 ? '+' : ''}{exerciseProgress}%
                  </span>
                </Badge>
                <Badge className={selectedConfig.badgeColor}>
                  {selectedConfig.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  แนะนำ: {selectedConfig.frequency}
                </Badge>
              </div>

              {/* Description */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{selectedConfig.description}</p>
              </div>

              {/* Exercise Chart */}
              {renderChart()}

              {/* Exercise History Table */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">ประวัติการฝึก - {selectedExercise}</h4>
                <div className="border rounded-lg overflow-hidden overflow-x-auto">
                  {renderTable()}
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
  );
}