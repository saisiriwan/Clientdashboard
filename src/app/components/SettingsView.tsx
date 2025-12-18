import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Bell,
  BellOff,
  Moon,
  Sun,
  Globe,
  Shield,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

// Mock data - ข้อมูลผู้ใช้
const userData = {
  name: 'สมชาย ใจดี',
  email: 'somchai.jaidee@email.com',
  phone: '081-234-5678',
  dateOfBirth: '1995-05-15',
  gender: 'ชาย',
  address: 'กรุงเทพมหานคร, ประเทศไทย',
  memberSince: '2024-01-15',
  profileImage: null,
  height: 175, // cm
  weight: 75, // kg
  goal: 'เพิ่มกล้ามเนื้อและลดไขมัน',
  trainer: 'โค้ชเบน',
  emergencyContact: {
    name: 'สมหญิง ใจดี',
    relationship: 'คู่สมรส',
    phone: '081-234-5679'
  }
};

// Mock data - การตั้งค่าการแจ้งเตือน
const notificationSettings = {
  email: {
    sessionReminder: true, // แจ้งเตือนเซสชันการฝึก
    programUpdate: true, // อัปเดตโปรแกรม
    achievement: true, // ผลสำเร็จ
    newsletter: false // จดหมายข่าว
  },
  push: {
    sessionReminder: true,
    dailyReminder: true, // แจ้งเตือนรายวัน
    achievement: true,
    trainerMessage: true // ข้อความจากเทรนเนอร์
  },
  sms: {
    sessionReminder: false,
    emergencyOnly: true
  }
};

// Mock data - การตั้งค่าทั่วไป
const generalSettings = {
  language: 'th', // th = ไทย, en = อังกฤษ
  theme: 'auto', // auto, light, dark
  timezone: 'Asia/Bangkok',
  dateFormat: 'dd/MM/yyyy',
  measurementUnit: 'metric' // metric = กิโลกรัม, imperial = ปอนด์
};

export function SettingsView() {
  const memberDuration = Math.floor(
    (new Date().getTime() - new Date(userData.memberSince).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">ตั้งค่าและข้อมูลส่วนตัว</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          ดูข้อมูลบัญชีและการตั้งค่าของคุณ
        </p>
      </div>

      {/* แจ้งเตือน: Read-Only Mode */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6 px-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg shrink-0">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                โหมดแสดงผลเท่านั้น
              </p>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mt-1">
                หากต้องการแก้ไขข้อมูลส่วนตัวหรือการตั้งค่า กรุณาติดต่อเทรนเนอร์ของคุณ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ข้อมูลส่วนตัว */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            ข้อมูลส่วนตัว
          </CardTitle>
          <CardDescription>ข้อมูลพื้นฐานและโปรไฟล์ของคุณ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* รูปโปรไฟล์และข้อมูลหลัก */}
          <div className="flex items-start gap-6 pb-6 border-b">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {userData.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{userData.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                สมาชิกมาแล้ว {memberDuration} วัน
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  ลูกเทรน
                </Badge>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  บัญชียืนยันแล้ว
                </Badge>
              </div>
            </div>
          </div>

          {/* ข้อมูลติดต่อ */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              ข้อมูลติดต่อ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-accent/30 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">อีเมล</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {userData.email}
                </p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">เบอร์โทรศัพท์</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {userData.phone}
                </p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg border md:col-span-2">
                <p className="text-xs text-muted-foreground mb-1">ที่อยู่</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {userData.address}
                </p>
              </div>
            </div>
          </div>

          {/* ข้อมูลส่วนบุคคล */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              ข้อมูลส่วนบุคคล
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-accent/30 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">วันเกิด</p>
                <p className="font-medium">
                  {format(new Date(userData.dateOfBirth), 'dd MMMM yyyy', { locale: th })}
                </p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">เพศ</p>
                <p className="font-medium">{userData.gender}</p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">เทรนเนอร์</p>
                <p className="font-medium">{userData.trainer}</p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">ส่วนสูง</p>
                <p className="font-medium">{userData.height} cm</p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">น้ำหนักปัจจุบัน</p>
                <p className="font-medium">{userData.weight} kg</p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">BMI</p>
                <p className="font-medium">
                  {(userData.weight / Math.pow(userData.height / 100, 2)).toFixed(1)}
                </p>
              </div>
              <div className="p-4 bg-accent/30 rounded-lg border md:col-span-3">
                <p className="text-xs text-muted-foreground mb-1">เป้าหมาย</p>
                <p className="font-medium">{userData.goal}</p>
              </div>
            </div>
          </div>

          {/* ผู้ติดต่อฉุกเฉิน */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              ผู้ติดต่อฉุกเฉิน
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <p className="text-xs text-muted-foreground mb-1">ชื่อ</p>
                <p className="font-medium">{userData.emergencyContact.name}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <p className="text-xs text-muted-foreground mb-1">ความสัมพันธ์</p>
                <p className="font-medium">{userData.emergencyContact.relationship}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <p className="text-xs text-muted-foreground mb-1">เบอร์โทรศัพท์</p>
                <p className="font-medium">{userData.emergencyContact.phone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* การตั้งค่าการแจ้งเตือน */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            การตั้งค่าการแจ้งเตือน
          </CardTitle>
          <CardDescription>การตั้งค่าการรับการแจ้งเตือนของคุณ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* การแจ้งเตือนทางอีเมล */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              การแจ้งเตือนทางอีเมล
            </h4>
            <div className="space-y-3">
              <NotificationItem
                label="แจ้งเตือนเซสชันการฝึก"
                description="รับการแจ้งเตือนก่อนเซสชันเริ่ม 1 ชั่วโมง"
                enabled={notificationSettings.email.sessionReminder}
              />
              <NotificationItem
                label="อัปเดตโปรแกรม"
                description="แจ้งเตือนเมื่อเทรนเนอร์อัปเดตโปรแกรมการฝึก"
                enabled={notificationSettings.email.programUpdate}
              />
              <NotificationItem
                label="ผลสำเร็จและความก้าวหน้า"
                description="แจ้งเตือนเมื่อบรรลุเป้าหมายหรือทำสถิติใหม่"
                enabled={notificationSettings.email.achievement}
              />
              <NotificationItem
                label="จดหมายข่าว"
                description="รับเคล็ดลับและข้อมูลสุขภาพรายสัปดาห์"
                enabled={notificationSettings.email.newsletter}
              />
            </div>
          </div>

          {/* การแจ้งเตือนแบบ Push */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              การแจ้งเตือนแบบ Push
            </h4>
            <div className="space-y-3">
              <NotificationItem
                label="แจ้งเตือนเซสชันการฝึก"
                description="รับการแจ้งเตือนบนอุปกรณ์มือถือก่อนเซสชัน"
                enabled={notificationSettings.push.sessionReminder}
              />
              <NotificationItem
                label="แจ้งเตือนรายวัน"
                description="เตือนให้ทำกิจกรรมและติดตามความคืบหน้า"
                enabled={notificationSettings.push.dailyReminder}
              />
              <NotificationItem
                label="ผลสำเร็จ"
                description="แจ้งเตือนทันทีเมื่อบรรลุเป้าหมาย"
                enabled={notificationSettings.push.achievement}
              />
              <NotificationItem
                label="ข้อความจากเทรนเนอร์"
                description="รับการแจ้งเตือนเมื่อเทรนเนอร์ส่งข้อความ"
                enabled={notificationSettings.push.trainerMessage}
              />
            </div>
          </div>

          {/* การแจ้งเตือนทาง SMS */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              การแจ้งเตือนทาง SMS
            </h4>
            <div className="space-y-3">
              <NotificationItem
                label="แจ้งเตือนเซสชันการฝึก"
                description="รับ SMS เตือนก่อนเซสชันเริ่ม"
                enabled={notificationSettings.sms.sessionReminder}
              />
              <NotificationItem
                label="เฉพาะกรณีฉุกเฉิน"
                description="รับ SMS เฉพาะการแจ้งเตือนสำคัญเท่านั้น"
                enabled={notificationSettings.sms.emergencyOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* การตั้งค่าทั่วไป */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            การตั้งค่าทั่วไป
          </CardTitle>
          <CardDescription>การตั้งค่าภาษา ธีม และหน่วยการวัด</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-accent/30 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  ภาษา
                </p>
                <Badge variant="outline">ไทย (TH)</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                ภาษาที่ใช้แสดงในระบบ
              </p>
            </div>

            <div className="p-4 bg-accent/30 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  {generalSettings.theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-muted-foreground" />
                  ) : generalSettings.theme === 'light' ? (
                    <Sun className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Sun className="w-4 h-4 text-muted-foreground" />
                  )}
                  ธีมสี
                </p>
                <Badge variant="outline">
                  {generalSettings.theme === 'auto' ? 'ตามระบบ' :
                   generalSettings.theme === 'dark' ? 'โหมดมืด' :
                   'โหมดสว่าง'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                รูปแบบสีของแอปพลิเคชัน
              </p>
            </div>

            <div className="p-4 bg-accent/30 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  รูปแบบวันที่
                </p>
                <Badge variant="outline">{generalSettings.dateFormat}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                รูปแบบการแสดงวันที่
              </p>
            </div>

            <div className="p-4 bg-accent/30 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  หน่วยการวัด
                </p>
                <Badge variant="outline">
                  {generalSettings.measurementUnit === 'metric' ? 'เมตริก (kg, cm)' : 'อิมพีเรียล (lb, in)'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                หน่วยการวัดน้ำหนักและส่วนสูง
              </p>
            </div>

            <div className="p-4 bg-accent/30 rounded-lg border md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  เขตเวลา
                </p>
                <Badge variant="outline">{generalSettings.timezone}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                เขตเวลาที่ใช้แสดงวันที่และเวลา
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ข้อมูลบัญชี */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            ข้อมูลบัญชี
          </CardTitle>
          <CardDescription>สถานะและรายละเอียดบัญชีของคุณ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-accent/30 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">สถานะบัญชี</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="font-medium text-green-700 dark:text-green-400">ใช้งานอยู่</p>
              </div>
            </div>
            <div className="p-4 bg-accent/30 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">ประเภทสมาชิก</p>
              <p className="font-medium">ลูกเทรน (Client)</p>
            </div>
            <div className="p-4 bg-accent/30 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">วันที่สมัครสมาชิก</p>
              <p className="font-medium">
                {format(new Date(userData.memberSince), 'dd MMMM yyyy', { locale: th })}
              </p>
            </div>
            <div className="p-4 bg-accent/30 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">เข้าสู่ระบบล่าสุด</p>
              <p className="font-medium">
                {format(new Date(), 'dd MMMM yyyy HH:mm', { locale: th })} น.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component สำหรับแสดง Notification Setting Item (Read-Only)
interface NotificationItemProps {
  label: string;
  description: string;
  enabled: boolean;
}

function NotificationItem({ label, description, enabled }: NotificationItemProps) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
      enabled 
        ? 'bg-green-50/50 dark:bg-green-950/10 border-green-300 dark:border-green-900' 
        : 'bg-gray-50/50 dark:bg-gray-950/10 border-gray-300 dark:border-gray-800'
    }`}>
      {/* Icon สถานะ */}
      <div className={`p-2 rounded-lg shrink-0 ${
        enabled 
          ? 'bg-green-100 dark:bg-green-900/30' 
          : 'bg-gray-100 dark:bg-gray-900/30'
      }`}>
        {enabled ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {/* เนื้อหา */}
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-semibold text-sm">{label}</p>
          <Badge 
            variant="outline"
            className={`text-xs shrink-0 ${
              enabled 
                ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-900/20 dark:text-gray-400'
            }`}
          >
            {enabled ? 'เปิด' : 'ปิด'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}