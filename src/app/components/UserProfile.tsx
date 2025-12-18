import React, { useEffect, useState } from 'react';
import { API_URL } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Mail, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface UserProfileProps {
  userId: string;
  accessToken: string;
}

export function UserProfile({ userId, accessToken }: UserProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // For now, we'll use dummy data
      // In a real app, you would fetch from the API
      setProfile({
        name: 'ผู้ใช้งาน',
        email: 'user@example.com',
        role: 'client',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>ข้อมูลส่วนตัว</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-blue-600 text-white text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex items-center text-gray-700">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">{profile?.name || 'ไม่ระบุ'}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              <span>{profile?.email || 'ไม่ระบุ'}</span>
            </div>
            {profile?.createdAt && (
              <div className="flex items-center text-gray-600 text-sm">
                <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                <span>
                  เริ่มใช้งานเมื่อ{' '}
                  {format(new Date(profile.createdAt), 'dd MMMM yyyy', { locale: th })}
                </span>
              </div>
            )}
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              ลูกเทรน
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
