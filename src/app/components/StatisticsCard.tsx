import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';

export function StatisticsCard() {
  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-card-foreground">Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <Tabs defaultValue="duration" className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 mb-6">
            <TabsTrigger 
              value="duration" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 mr-6 data-[state=active]:text-accent text-muted-foreground font-medium"
            >
              Duration
            </TabsTrigger>
            <TabsTrigger 
              value="reps" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 data-[state=active]:text-accent text-muted-foreground font-medium"
            >
              Reps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="duration" className="mt-0">
            {/* Big Number Display */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <h2 className="text-5xl font-bold text-card-foreground">0</h2>
                <span className="text-3xl font-bold text-card-foreground">min</span>
                <span className="text-sm text-muted-foreground ml-2">This week</span>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="mb-6">
              <Button 
                variant="outline" 
                size="sm"
                className="text-sm text-accent border-accent hover:bg-accent/10 h-8"
              >
                Last 12 weeks
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Chart Placeholder */}
            <div className="h-48 flex items-end justify-between gap-2 border-b border-border pb-4">
              {/* Empty chart bars */}
              <div className="flex-1 flex items-end">
                <div className="w-full h-1 bg-muted rounded-t"></div>
              </div>
              <div className="flex-1 flex items-end">
                <div className="w-full h-1 bg-muted rounded-t"></div>
              </div>
              <div className="flex-1 flex items-end">
                <div className="w-full h-1 bg-muted rounded-t"></div>
              </div>
              <div className="flex-1 flex items-end">
                <div className="w-full h-1 bg-muted rounded-t"></div>
              </div>
              <div className="flex-1 flex items-end">
                <div className="w-full h-1 bg-muted rounded-t"></div>
              </div>
              <div className="flex-1 flex items-end">
                <div className="w-full h-1 bg-muted rounded-t"></div>
              </div>
            </div>

            {/* Date Labels */}
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">Oct 05</span>
              <span className="text-xs text-muted-foreground">Oct 19</span>
              <span className="text-xs text-muted-foreground">Nov 02</span>
              <span className="text-xs text-muted-foreground">Nov 16</span>
              <span className="text-xs text-muted-foreground">Nov 30</span>
              <span className="text-xs text-muted-foreground">Dec 14</span>
            </div>

            {/* 0 hrs label */}
            <div className="mt-4">
              <span className="text-xs text-muted-foreground">0 hrs</span>
            </div>
          </TabsContent>

          <TabsContent value="reps" className="mt-0">
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <h2 className="text-5xl font-bold text-card-foreground">0</h2>
                <span className="text-sm text-muted-foreground ml-2">This week</span>
              </div>
            </div>
            <div className="h-48 flex items-center justify-center border border-border rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">No reps data</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Workouts Section */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Workouts</h3>
          <div className="flex items-center justify-center py-12 border border-border rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">No workouts yet</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}