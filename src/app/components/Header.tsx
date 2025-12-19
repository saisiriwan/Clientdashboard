import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import profileImage from 'figma:asset/0c46f5e896931e5da3ab9e69e8554a37c8cf0347.png';

interface HeaderProps {
  onLogout: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mockNotifications = [
    {
      id: 1,
      title: 'เซสชันใหม่ถูกจองแล้ว',
      message: 'โค้ชเบนจองเซสชันวันพรุ่งนี้ เวลา 14:00',
      time: '5 นาทีที่แล้ว',
      isNew: true
    },
    {
      id: 2,
      title: 'สรุปผลการฝึกใหม่',
      message: 'โค้ชอัพเดทสรุปผลการฝึกเมื่อวาน',
      time: '2 ชั่วโมงที่แล้ว',
      isNew: true
    },
    {
      id: 3,
      title: 'ความก้าวหน้าประจำสัปดาห์',
      message: 'คุณทำเซสชันครบ 4 วันแล้วในสัปดาห์นี้!',
      time: '1 วันที่แล้ว',
      isNew: false
    }
  ];

  const unreadCount = mockNotifications.filter(n => n.isNew).length;

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Logo/Title สำหรับ Mobile */}
        <div className="lg:hidden">
          <h1 className="font-bold text-lg text-primary">Trainee App</h1>
        </div>

        {/* Spacer สำหรับ Desktop */}
        <div className="hidden lg:block flex-1"></div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-muted"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Notification Button */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full hover:bg-muted relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full border-2 border-background" />
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">การแจ้งเตือน</h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      คุณมี {unreadCount} การแจ้งเตือนใหม่
                    </p>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                        notification.isNew ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {notification.isNew && (
                          <div className="h-2 w-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border text-center">
                  <button className="text-sm text-primary hover:underline font-medium">
                    ดูการแจ้งเตือนทั้งหมด
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-border"
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-background">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                {/* Profile Info */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">อาจารย์เจมส์</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        james.trainer@example.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <span>ตั้งค่า</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-destructive/10 transition-colors text-left text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
