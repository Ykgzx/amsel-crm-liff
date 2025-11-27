// app/admin/rewards/page.tsx
'use client';

import { Package, Gift, TrendingUp, AlertCircle } from 'lucide-react';

export default function RewardsPage() {
  return (
    <>
      {/* หัวข้อหน้า */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
          Rewards & Stock Management
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          ภาพรวมคะแนนสะสมและสต็อกของรางวัลทั้งหมด
        </p>
      </div>

      {/* การ์ดสรุป 4 ใบ - Responsive สวยทุกหน้าจอ */}
      <div className="grid grid-cols-1 sm:grid-cols- colg-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Points Issued */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Points Issued</p>
              <p className="text-3xl md:text-4xl font-bold mt-2">8,420,000</p>
              <p className="text-blue-100 text-sm mt-1">pts</p>
            </div>
            <Gift className="w-10 h-10 md:w-12 md:h-12 opacity-80" />
          </div>
          <div className="mt-4 flex items-center text-blue-100 text-xs">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12.5% จากเดือนที่แล้ว</span>
          </div>
        </div>

        {/* Stock Remaining */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition duration-300">
          <div className="flex items-centerJPG justify-between">
            <div>
              <p className="text-orange-100 text-sm">Stock Remaining</p>
              <p className="text-3xl md:text-4xl font-bold mt-2">1,240</p>
              <p className="text-orange-100 text-sm mt-1">ชิ้น</p>
            </div>
            <Package className="w-10 h-10 md:w-12 md:h-12 opacity-80" />
          </div>
          <div className="mt-4 flex items-center text-orange-100 text-xs">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>เหลือน้อยกว่า 30% ของสต็อกเดิม</span>
          </div>
        </div>

        {/* Points Redeemed (This Month) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Points Redeemed (เดือนนี้)</p>
              <p className="text-3xl md:text-4xl font-bold text-green-600 mt-2">248,500</p>
              <p className="text-gray-500 text-sm mt-1">pts</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Gift className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">สินค้าที่ใกล้หมด</p>
              <p className="text-3xl md:text-4xl font-bold text-red-600 mt-2">5</p>
              <p className="text-gray-500 text-sm mt-1">รายการ</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนเพิ่มเติม (ตัวอย่างตารางสต็อก) */}
      <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">รายการสต็อกยอดนิยม</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">ชื่อรางวัล</th>
                <th className="px-4 py-3 text-center">คะแนนที่ใช้</th>
                <th className="px-4 py-3 text-center">เหลือ</th>
                <th className="px-4 py-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-medium">Gift Voucher 500 บาท</td>
                <td className="px-4 py-4 text-center">5,000 pts</td>
                <td className="px-4 py-4 text-center">320</td>
                <td className="px-4 py-4 text-center"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">ปกติ</span></td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-medium">Collagen 1 กล่อง</td>
                <td className="px-4 py-4 text-center">8,000 pts</td>
                <td className="px-4 py-4 text-center">45</td>
                <td className="px-4 py-4 text-center"><span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs">ใกล้หมด</span></td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4 font-medium">Vitamin C Set</td>
                <td className="px-4 py-4 text-center">3,500 pts</td>
                <td className="px-4 py-4 text-center">180</td>
                <td className="px-4 py-4 text-center"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">ปกติ</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ปุ่มจัดการ (มือถือซ่อนข้อความ) */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition transform hover:scale-105">
          <span className="hidden sm:inline">เพิ่มรางวัลใหม่</span>
          <span className="sm:hidden">+ เพิ่มรางวัล</span>
        </button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition">
          <span className="hidden sm:inline">นำเข้าสต็อกจาก Excel</span>
          <span className="sm:hidden">นำเข้า Excel</span>
        </button>
      </div>
    </>
  );
}