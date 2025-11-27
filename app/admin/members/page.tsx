// app/admin/members/page.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, MoreVertical, User, Mail, Phone, Calendar, Award, ChevronDown } from 'lucide-react';

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  // ข้อมูลตัวอย่างสมาชิก
  const members = [
    { id: 1, name: 'นภัสวรรณ สุวรรณวงศ์', email: 'naphat@gmail.com', phone: '081-234-5678', joinDate: '15 มี.ค. 2024', tier: 'Gold', points: 12450 },
    { id: 2, name: 'ชัยวัฒน์ พงษ์ประเสริฐ', email: 'chaiwat@outlook.com', phone: '092-345-6789', joinDate: '2 ม.ค. 2025', tier: 'Silver', points: 6850 },
    { id: 3, name: 'Jane Doe', email: 'jane.doe@example.com', phone: '065-111-2222', joinDate: '20 พ.ย. 2024', tier: 'Silver', points: 5200 },
    { id: 4, name: 'สมชาย ใจดี', email: 'somchai@hotmail.com', phone: '087-999-8888', joinDate: '10 ต.ค. 2023', tier: 'Platinum', points: 28500 },
    { id: 5, name: 'กัญญารัตน์ แซ่ตั้ง', email: 'kanya@gmail.com', phone: '094-567-8901', joinDate: '5 เม.ย. 2025', tier: 'Bronze', points: 1800 },
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm);
    const matchesTier = filterTier === 'all' || member.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* หัวข้อหน้า */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
          Members Management (CRM)
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          จัดการข้อมูลสมาชิกทั้งหมด {members.length} คน
        </p>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล, หรือเบอร์โทร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tier */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="pl-12 pr-10 py-3 border border-gray-300 rounded-xl appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุก Tier</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition">
            Export CSV
          </button>
        </div>
      </div>

      {/* ตารางสมาชิก - Responsive */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-4 text-sm:pl-6 text-sm font-medium text-gray-700">สมาชิก</th>
                <th className="text-left px-4 py-4 hidden sm:table-cell">อีเมล</th>
                <th className="text-left px-4 py-4 hidden md:table-cell">เบอร์โทร</th>
                <th className="text-left px-4 py-4 hidden lg:table-cell">วันที่สมัคร</th>
                <th className="text-center px-4 py-4">Tier</th>
                <th className="text-right px-4 py-4 pr-6">คะแนน</th>
                <th className="text-center px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-5 sm:pl-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500 sm:hidden">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 hidden sm:table-cell text-gray-600">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {member.email}
                    </div>
                  </td>
                  <td className="px-4 py-5 hidden md:table-cell text-gray-600">
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {member.phone}
                    </div>
                  </td>
                  <td className="px-4 py-5 hidden lg:table-cell text-gray-600 text-sm">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {member.joinDate}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTierColor(member.tier)}`}>
                      <Award className="w-3 h-3 mr-1" />
                      {member.tier}
                    </span>
                  </td>
                  <td className="px-4 py-5 pr-6 text-right font-bold text-blue-600">
                    {member.points.toLocaleString()} pts
                  </td>
                  <td className="px-4 py-5 text-center">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (ซ่อนใน Desktop) */}
        <div className="sm:hidden p-4 space-y-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="font-bold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(member.tier)}`}>
                  {member.tier}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">เบอร์โทร</p>
                  <p className="font-medium">{member.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">สมัครเมื่อ</p>
                  <p className="font-medium">{member.joinDate}</p>
                </div>
              </div>
              <div className="mt-3 text-right">
                <p className="text-xl font-bold text-blue-600">{member.points.toLocaleString()} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          กำลังแสดง <span className="font-medium">{filteredMembers.length}</span> จาก{' '}
          <span className="font-medium">{members.length}</span> รายการ
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">ก่อนหน้า</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">ถัดไป</button>
        </div>
      </div>
    </>
  );
}