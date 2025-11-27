'use client';

import Navbar from "../components/Navbar";
import { HelpCircle, MessageCircle, Phone, Mail, ChevronRight, Gift, Package, Star, User } from "lucide-react";

export default function HelpPage() {
  const currentPoints = 1250; // เหมือนหน้าอื่น ๆ

  const helpTopics = [
    {
      title: "วิธีสั่งซื้อสินค้า",
      icon: <HelpCircle className="w-6 h-6" />,
      desc: "ขั้นตอนการเลือกสินค้า ชำระเงิน และติดตามพัสดุ",
    },
    {
      title: "การชำระเงิน",
      icon: <Gift className="w-6 h-6" />,
      desc: "รองรับบัตรเครดิต/เดบิต, โอนเงิน, เงินสดปลายทาง",
    },
    {
      title: "การจัดส่งและรับสินค้า",
      icon: <Package className="w-6 h-6" />,
      desc: "ระยะเวลาจัดส่ง บริษัทขนส่งที่ใช้ และนโยบายเปลี่ยน/คืนสินค้า",
    },
    {
      title: "พอยต์และรางวัล",
      icon: <Star className="w-6 h-6" />,
      desc: "วิธีสะสมพอยต์ แลกของรางวัล และเงื่อนไขการใช้งาน",
    },
    {
      title: "บัญชีและข้อมูลส่วนตัว",
      icon: <User className="w-6 h-6" />,
      desc: "แก้ไขข้อมูล ลืมรหัสผ่าน และการลบบัญชี",
    },
  ];

  const contactChannels = [
    {
      name: "แชทกับแอดมิน",
      icon: <MessageCircle className="w-7 h-7" />,
      color: "bg-green-500",
      desc: "ตอบไวภายใน 1 นาที",
      action: "แชทเลย",
    },
    {
      name: "โทรหาเรา",
      icon: <Phone className="w-7 h-7" />,
      color: "bg-blue-500",
      desc: "ทุกวัน 08:30 - 16:30 น.",
      action: "โทร 02-123-4567",
    },
    {
      name: "อีเมล",
      icon: <Mail className="w-7 h-7" />,
      color: "bg-purple-500",
      desc: "ตอบกลับภายใน 24 ชม.",
      action: "support@shop.co.th",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="bg-white min-h-screen pt-32 pb-16">
        <div className="max-w-md mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-orange-500 rounded-full px-6 py-2 w-fit mx-auto mb-4">
              <h1 className="text-xl font-bold text-white">ช่วยเหลือ</h1>
            </div>
          </div>

          {/* หัวข้อช่วยเหลือยอดนิยม */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-gray-800 mb-4">คำถามที่พบบ่อย</h2>
            <div className="space-y-4">
              {helpTopics.map((topic, i) => (
                <div
                  key={i}
                  className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 flex items-center gap-4 hover:bg-orange-100 transition-all cursor-pointer"
                >
                  <div className="text-orange-600">{topic.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{topic.title}</h3>
                    <p className="text-sm text-gray-600">{topic.desc}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-orange-500" />
                </div>
              ))}
            </div>
          </div>

          {/* ช่องทางติดต่อ */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">ติดต่อเราได้เลย!</h2>
            <div className="space-y-4">
              {contactChannels.map((channel) => (
                <div
                  key={channel.name}
                  className="bg-white rounded-2xl border-2 border-orange-100 shadow-md p-6 flex items-center gap-5 hover:shadow-lg transition-all"
                >
                  <div className={`${channel.color} text-white p-4 rounded-2xl`}>
                    {channel.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{channel.name}</h3>
                    <p className="text-sm text-gray-600">{channel.desc}</p>
                  </div>
                  <button className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-orange-600 transition-all">
                    {channel.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ข้อความท้ายหน้า */}
          <div className="mt-10 text-center bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
            <p className="text-gray-700 font-medium">
              ทีมงานพร้อมดูแลคุณทุกวัน ตั้งแต่ 08:30 - 16:30 น.
            </p>
            <p className="text-orange-600 font-bold mt-2 text-lg">
              ยิ้มได้เสมอเมื่อมีเรา ♡
            </p>
          </div>

        </div>
      </div>
    </>
  );
}