import React from 'react';
import { ProfileHeader } from './ProfileHeader';
import { StatisticsCard } from './StatisticsCard';
import { ScheduleView } from './ScheduleView';

export function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <ProfileHeader />

      {/* 2 Column Layout: Statistics + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Statistics (60%) */}
        <div className="lg:col-span-2">
          <StatisticsCard />
        </div>

        {/* Right Column - Calendar (40%) */}
        <div className="lg:col-span-1">
          <ScheduleView schedules={[]} />
        </div>
      </div>
    </div>
  );
}
