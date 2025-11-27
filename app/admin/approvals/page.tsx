// app/admin/approvals/page.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, ZoomIn, Calendar, User, DollarSign, ChevronDown, X } from 'lucide-react';

interface Receipt {
  id: number;
  user: string;
  amount: number;
  receiptNo: string;
  date: string;
  image: string;
  duplicate: boolean;
}

const mockReceipts: Receipt[] = [
  { id: 1, user: 'Jane Doe', amount: 1500, receiptNo: 'T-99281', date: '27 พ.ย. 2025', image: '/api/placeholder/600/800', duplicate: false },
  { id: 2, user: 'สมชาย ใจดี', amount: 2890, receiptNo: 'S-12345', date: '26 พ.ย. 2025', image: '/api/placeholder/600/800', duplicate: false },
  { id: 3, user: 'นภัสวรรณ สุวรรณวงศ์', amount: 890, receiptNo: 'X-88771', date: '25 พ.ย. 2025', image: '/api/placeholder/600/800', duplicate: true },
  { id: 4, user: 'กิตติพงษ์ รัตนวงศ์', amount: 3500, receiptNo: 'P-55662', date: '24 พ.ย. 2025', image: '/api/placeholder/600/800', duplicate: false },
  { id: 5, user: 'พัชรี แซ่ตั้ง', amount: 1200, receiptNo: 'R-33441', date: '23 พ.ย. 2025', image: '/api/placeholder/600/800', duplicate: false },
];

export default function ApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredReceipts = mockReceipts.filter(r =>
    r.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.receiptNo.includes(searchTerm)
  );

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              Pending Approvals
            </h1>
            <p className="text-gray-600 mt-2">
              มีใบเสร็จรออนุมัติทั้งหมด{' '}
              <span className="font-bold text-red-600">{mockReceipts.length}</span> รายการ
            </p>
          </div>
          <div className="bg-red-100 text-red-700 px-5 py-3 rounded-full font-bold text-lg shadow-sm">
            {mockReceipts.length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ใช้ หรือเลขใบเสร็จ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-4 font-medium text-gray-700">ผู้ใช้</th>
              <th className="text-left px-6 py-4">ใบเสร็จ</th>
              <th className="text-center px-6 py-4">ยอดเงิน</th>
              <th className="text-center px-6 py-4">วันที่อัปโหลด</th>
              <th className="text-center px-6 py-4">สถานะซ้ำ</th>
              <th className="text-center px-6 py-4">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReceipts.map((receipt) => (
              <tr key={receipt.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-5">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      {receipt.user.charAt(0)}
                    </div>
                    <span className="ml-4 font-medium">{receipt.user}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <button
                    onClick={() => setSelectedImage(receipt.image)}
                    className="text-orange-600 hover:text-orange-800 font-medium underline underline-offset-2"
                  >
                    {receipt.receiptNo}
                  </button>
                </td>
                <td className="px-6 py-5 text-center font-bold text-green-600">
                  {receipt.amount.toLocaleString()} ฿
                </td>
                <td className="px-6 py-5 text-center text-gray-600">
                  {receipt.date}
                </td>
                <td className="px-6 py-5 text-center">
                  {receipt.duplicate ? (
                    <span className="text-red-600 font-medium flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5" /> ซ้ำ
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" /> ปกติ
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex justify-center gap-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow transition transform hover:scale-105">
                      APPROVE
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium shadow transition">
                      REJECT
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredReceipts.map((receipt) => (
          <div key={receipt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {receipt.user.charAt(0)}
                </div>
                <div className="ml-4">
                  <p className="font-bold text-gray-900">{receipt.user}</p>
                  <p className="text-sm text-gray-500">{receipt.receiptNo}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${receipt.duplicate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {receipt.duplicate ? 'ซ้ำ' : 'ปกติ'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-gray-500 text-sm">ยอดเงิน</p>
                <p className="text-2xl font-bold text-green-600">{receipt.amount.toLocaleString()} ฿</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">วันที่</p>
                <p className="font-medium">{receipt.date}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedImage(receipt.image)}
              className="w-full bg-gray-100 hover:bg-gray-200 rounded-xl h-48 flex items-center justify-center transition mb-4"
            >
              <ZoomIn className="w-12 h-12 text-gray-400" />
            </button>

            <div className="flex gap-3">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow transition transform active:scale-95">
                APPROVE
              </button>
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow transition active:scale-95">
                REJECT
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gray-200 border-4 border-dashed border-gray-400 rounded-2xl w-full h-96 md:h-screen max-h-screen flex items-center justify-center">
                <ZoomIn className="w-24 h-24 text-gray-500" />
              </div>
              <div className="p-6 bg-gray-50 text-center">
                <p className="text-lg font-medium">ใบเสร็จ {mockReceipts.find(r => r.image === selectedImage)?.receiptNo}</p>
                <p className="text-gray-600">คลิกด้านนอกเพื่อปิด</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}