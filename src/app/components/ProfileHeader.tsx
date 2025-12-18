import React from 'react';
import { User } from 'lucide-react';
import { Button } from './ui/button';

export function ProfileHeader() {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          
          {/* User Info */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-base font-semibold text-card-foreground">โรซ่า จิน</h2>
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 text-xs px-3 border-border hover:bg-accent"
              >
                Edit Profile
              </Button>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">ROSA JIN</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-medium text-card-foreground">0</span>
                <span className="text-muted-foreground">Workouts</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-card-foreground">0</span>
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-card-foreground">0</span>
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}