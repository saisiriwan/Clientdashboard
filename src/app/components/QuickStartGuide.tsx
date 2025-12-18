import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function QuickStartGuide() {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Info className="w-5 h-5 mr-2" />
          คู่มือเริ่มต้นใช้งาน
        </CardTitle>
        <CardDescription className="text-blue-700">
          วิธีใช้งานระบบสำหรับลูกเทรน
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <span className="font-medium">ตารางนัดหมาย:</span> ดูวัน เวลา และท่าฝึกที่เทรนเนอร์กำหนดให้
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <span className="font-medium">ความก้าวหน้า:</span> ติดตามสถิติการฝึกและดูกราฟพัฒนาการของคุณ
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <span className="font-medium">การ์ดสรุปผล:</span> ดูความสำเร็จและคำชมจากเทรนเนอร์หลังการฝึกแต่ละครั้ง
          </div>
        </div>
        
        <Alert className="mt-4 bg-white border-blue-300">
          <AlertDescription className="text-sm text-blue-800">
            💡 <span className="font-medium">เคล็ดลับ:</span> ถ้ายังไม่มีข้อมูล สามารถคลิก "สร้างข้อมูลตัวอย่าง" เพื่อดูตัวอย่างการใช้งานระบบได้เลย!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
