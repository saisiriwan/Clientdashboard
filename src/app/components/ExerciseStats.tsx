import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dumbbell, Zap, Activity, Timer, TrendingUp, Award } from 'lucide-react';
import { ExerciseType } from '@/api/types';
import { Badge } from './ui/badge';

interface ExerciseStatsProps {
  exercises: Array<{
    type: ExerciseType;
    count: number;
    totalVolume?: number;
    totalDistance?: number;
    totalDuration?: number;
    improvement?: number;
  }>;
}

export function ExerciseStats({ exercises }: ExerciseStatsProps) {
  // Calculate totals by type
  const statsByType = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.type]) {
      acc[exercise.type] = {
        count: 0,
        totalVolume: 0,
        totalDistance: 0,
        totalDuration: 0,
      };
    }
    
    acc[exercise.type].count += exercise.count;
    acc[exercise.type].totalVolume += exercise.totalVolume || 0;
    acc[exercise.type].totalDistance += exercise.totalDistance || 0;
    acc[exercise.type].totalDuration += exercise.totalDuration || 0;
    
    return acc;
  }, {} as Record<ExerciseType, any>);

  const getTypeConfig = (type: ExerciseType) => {
    switch (type) {
      case 'weight_training':
        return {
          icon: Dumbbell,
          label: 'เวทเทรนนิ่ง',
          color: 'text-blue-600 bg-blue-50',
          metric: 'ปริมาณรวม',
          unit: 'kg',
        };
      case 'cardio':
        return {
          icon: Zap,
          label: 'คาร์ดิโอ',
          color: 'text-green-600 bg-green-50',
          metric: 'ระยะทาง',
          unit: 'km',
        };
      case 'flexibility':
        return {
          icon: Timer,
          label: 'เฟล็กซ์',
          color: 'text-purple-600 bg-purple-50',
          metric: 'เวลารวม',
          unit: 'นาที',
        };
      default:
        return {
          icon: Activity,
          label: 'อื่นๆ',
          color: 'text-gray-600 bg-gray-50',
          metric: 'จำนวน',
          unit: '',
        };
    }
  };

  const formatValue = (type: ExerciseType, stats: any) => {
    switch (type) {
      case 'weight_training':
        return stats.totalVolume?.toLocaleString() || 0;
      case 'cardio':
        return (stats.totalDistance || 0).toFixed(1);
      case 'flexibility':
        return Math.round((stats.totalDuration || 0) / 60);
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">สถิติตามประเภท</h3>
        <Badge variant="outline" className="gap-1">
          <Award className="w-3 h-3" />
          {Object.keys(statsByType).length} ประเภท
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statsByType).map(([type, stats]) => {
          const config = getTypeConfig(type as ExerciseType);
          const Icon = config.icon;
          const value = formatValue(type as ExerciseType, stats);

          return (
            <Card key={type} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stats.count} ท่า
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{config.unit}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{config.metric}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Component for showing exercise type distribution
export function ExerciseTypeDistribution({ exercises }: ExerciseStatsProps) {
  const total = exercises.reduce((sum, e) => sum + e.count, 0);

  const getTypeConfig = (type: ExerciseType) => {
    switch (type) {
      case 'weight_training': return { label: 'ยกน้ำหนัก', color: 'bg-blue-500' };
      case 'cardio': return { label: 'คาร์ดิโอ', color: 'bg-green-500' };
      case 'flexibility': return { label: 'ยืดเหยียด', color: 'bg-purple-500' };
      default: return { label: 'อื่นๆ', color: 'bg-gray-500' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">การกระจายประเภทการออกกำลังกาย</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {exercises.map((exercise) => {
          const config = getTypeConfig(exercise.type);
          const percentage = total > 0 ? (exercise.count / total) * 100 : 0;

          return (
            <div key={exercise.type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{config.label}</span>
                <span className="text-muted-foreground">
                  {exercise.count} ท่า ({percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {exercise.improvement !== undefined && exercise.improvement > 0 && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>เพิ่มขึ้น {exercise.improvement}%</span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}