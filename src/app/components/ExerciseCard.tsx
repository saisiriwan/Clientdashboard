import React from 'react';
import { Card, CardContent } from './ui/card';
import { Dumbbell, Zap, Activity, Timer, Heart, Flame } from 'lucide-react';
import { ExerciseType } from '@/api/types';
import { Badge } from './ui/badge';

interface ExerciseCardProps {
  name: string;
  type: ExerciseType;
  data: any;
  isCompact?: boolean;
}

// Helper function to get icon based on exercise type
const getExerciseIcon = (type: ExerciseType) => {
  switch (type) {
    case 'weight_training': return Dumbbell;
    case 'cardio': return Zap;
    case 'flexibility': return Timer;
    default: return Activity;
  }
};

// Helper function to get color based on exercise type
const getExerciseColor = (type: ExerciseType) => {
  switch (type) {
    case 'weight_training': return 'text-blue-600 bg-blue-50';
    case 'cardio': return 'text-green-600 bg-green-50';
    case 'flexibility': return 'text-purple-600 bg-purple-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

// Helper function to get type label
const getTypeLabel = (type: ExerciseType) => {
  switch (type) {
    case 'weight_training': return '💪 เวทเทรนนิ่ง';
    case 'cardio': return '🏃 คาร์ดิโอ';
    case 'flexibility': return '🧘 เฟล็กซ์';
    default: return '';
  }
};

export function ExerciseCard({ name, type, data, isCompact = false }: ExerciseCardProps) {
  const Icon = getExerciseIcon(type);
  const colorClass = getExerciseColor(type);
  const typeLabel = getTypeLabel(type);

  // Render different content based on exercise type
  const renderContent = () => {
    switch (type) {
      case 'weight_training':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">น้ำหนัก</span>
              <span className="text-2xl font-bold text-blue-600">{data.weight || data.currentWeight} kg</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">เซต: </span>
                <span className="font-semibold">{data.sets}</span>
              </div>
              <div>
                <span className="text-muted-foreground">รอบ: </span>
                <span className="font-semibold">{data.reps}</span>
              </div>
            </div>
            {data.volume && (
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground">ปริมาณรวม: </span>
                <span className="font-bold text-blue-600">{data.volume.toLocaleString()}</span>
              </div>
            )}
          </div>
        );

      case 'cardio':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ระยะทาง</span>
              <span className="text-2xl font-bold text-green-600">{data.distance} km</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">เวลา: </span>
                <span className="font-semibold">{data.duration || data.currentTime} นาที</span>
              </div>
              <div>
                <span className="text-muted-foreground">จังหวะ: </span>
                <span className="font-semibold">{data.pace?.toFixed(2) || '-'} นาที/km</span>
              </div>
            </div>
            {data.calories && (
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground">แคลอรี่: </span>
                <span className="font-bold text-green-600">{data.calories} kcal</span>
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-sm text-muted-foreground">ไม่มีข้อมูล</div>;
    }
  };

  if (isCompact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{name}</p>
          <p className="text-xs text-muted-foreground">{typeLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${colorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{name}</h3>
              <Badge variant="outline" className="mt-1 text-xs">
                {typeLabel}
              </Badge>
            </div>
          </div>
        </div>
        
        {renderContent()}
      </CardContent>
    </Card>
  );
}