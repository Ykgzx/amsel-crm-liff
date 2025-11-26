'use client';

import Navbar from "../components/Navbar";
import { Package, Gift, Truck, CheckCircle2, Clock } from "lucide-react";

interface Order {
  id: string;
  date: string;
  status: "delivered" | "shipping" | "pending" | "cancelled";
  total: number;
  items: number;
  pointsEarned: number;
}

const mockOrders: Order[] = [
  { id: "ORD-2025-001", date: "20 พ.ย. 2568", status: "delivered", total: 2890, items: 3, pointsEarned: 289 },
  { id: "ORD-2025-002", date: "18 พ.ย. 2568", status: "shipping", total: 1590, items: 2, pointsEarned: 159 },
  { id: "ORD-2025-003", date: "15 พ.ย. 2568", status: "pending", total: 890, items: 1, pointsEarned: 89 },
  { id: "ORD-2025-004", date: "10 พ.ย. 2568", status: "delivered", total: 4590, items: 5, pointsEarned: 459 },
];

const getStatusConfig = (status: Order["status"]) => {
  switch (status) {
    case "delivered":   return { label: "จัดส่งแล้ว", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> };
    case "shipping":    return { label: "กำลังจัดส่ง", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Truck className="w-5 h-5 text-blue-600" /> };
    case "pending":     return { label: "รอชำระเงิน", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="w-5 h-5 text-yellow-600" /> };
    case "cancelled":   return { label: "ยกเลิก", color: "bg-red-100 text-red-800 border-red-200", icon: null };
  }
};

export default function HistoryPage() {
  return (
    <>
      <Navbar />

      <div className="bg-white min-h-screen pt-32 pb-16">
        <div className="max-w-md mx-auto px-6">

          {/* Header เดียวกับ Reward Store */}
          <div className="mb-8 text-center">
            <div className="bg-orange-500 rounded-full px-6 py-2 w-fit mx-auto mb-4">
              <h1 className="text-xl font-bold text-white">ประวัติการสั่งซื้อ</h1>
            </div>
            <p className="text-gray-600">ดูคำสั่งซื้อทั้งหมดและพอยต์ที่ได้รับ</p>
          </div>

          {/* รายการคำสั่งซื้อ */}
          <div className="space-y-5">
            {mockOrders.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-20 h-20 text-orange-200 mx-auto mb-4" />
                <p className="text-lg text-gray-500">ยังไม่มีคำสั่งซื้อเลยนะ</p>
                <button className="mt-6 px-8 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition">
                  ไปช้อปปิ้งเลย!
                </button>
              </div>
            ) : (
              mockOrders.map((order) => {
                const status = getStatusConfig(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border-2 border-orange-100 shadow-md overflow-hidden transition-all hover:shadow-lg hover:border-orange-300"
                  >
                    <div className="p-5">

                      {/* ส่วนบน: เลขคำสั่งซื้อ + สถานะ */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                        <div className="flex items-center gap-3">
                          {status.icon}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* รายละเอียด */}
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>วันที่สั่งซื้อ</span>
                          <span className="font-medium text-gray-900">{order.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>จำนวนสินค้า</span>
                          <span className="font-medium text-gray-900">{order.items} รายการ</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ยอดรวม</span>
                          <span className="text-xl font-bold text-gray-900">
                            ฿{order.total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* พอยต์ที่ได้รับ (ไฮไลต์สไตล์ Reward) */}
                      <div className="mt-4 pt-4 border-t border-orange-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-6 h-6 text-orange-600" />
                          <span className="text-gray-700">ได้รับพอยต์</span>
                        </div>
                        <span className="text-2xl font-bold text-orange-600">
                          +{order.pointsEarned} <span className="text-lg">Pts</span>
                        </span>
                      </div>

                      {/* ปุ่มดูรายละเอียด */}
                      <button className="w-full mt-5 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition">
                        ดูรายละเอียดคำสั่งซื้อ
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer เชิญชวนช้อปเพิ่ม */}
          <div className="mt-10 text-center bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
            <p className="text-gray-700 mb-2">
              ทุกการช้อป = พอยต์สะสมเพิ่ม!
            </p>
            <p className="text-orange-600 font-bold">
              ไปช้อปปิ้งเลยเพื่อสะสมพอยต์แลกของรางวัล
            </p>
          </div>

        </div>
      </div>
    </>
  );
}