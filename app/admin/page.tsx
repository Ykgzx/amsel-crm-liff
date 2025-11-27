// app/admin/page.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, XCircle, Search } from 'lucide-react';

const healthData = [
  { name: 'Skin', value: 40 },
  { name: 'Immunity', value: 60 },
];

export default function DashboardPage() {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Dashboard Overview</h2>

      {/* Top Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-gray-100">
          <p className="text-gray-600 text-sm">Total Members</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">45,200</p>
          <p className="text-green-600 text-sm mt-2">+120 today</p>
        </div>

        <div className="bg-red-500 text-white rounded-2xl shadow-sm p-5 md:p-6">
          <p className="text-red-100 text-sm">Pending Receipts</p>
          <p className="text-3xl md:text-4xl font-bold mt-2">12</p>
          <p className="text-red-100 text-sm mt-2">Requires Action</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-gray-100">
          <p className="text-gray-600 text-sm">Points Liability</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">1,500,000 pts</p>
          <p className="text-gray-500 text-sm mt-2">(Worth 150K THB)</p>
        </div>
      </div>

      {/* Main Content - Stack on mobile, 2 columns on tablet+ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Health Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Customer Health Concerns (Quiz Data)
            </h3>
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={healthData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Insight */}
          <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 font-bold text-lg">JD</span>
              </div>
              <p className="font-semibold text-gray-900 text-base md:text-lg">
                Customer Insight : Jane Doe
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between flex">
                <span className="text-gray-600">Goal:</span>
                <span className="font-medium">Skin Care</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tier:</span>
                <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium">Silver</span>
              </div>
              <div className="text-gray-600 text-xs leading-relaxed">
                Last Order | Item | Date<br />
                #0910 | Vitamin C + Zinc | 30 days ago<br />
                #0988 | Zinc Plus | 30 days ago
              </div>

              <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg text-pink-700 text-sm">
                Admin Note: Customer asked about Collagen.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Receipt Tool */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-orange-500 text-white px-6 py-4 text-center">
            <h3 className="text-lg md:text-xl font-bold">Receipt Verification Tool</h3>
          </div>

          <div className="p-6 md:p-8 space-y-6 md:space-y-8">
            <div className="text-center">
              <p className="text-gray-700 font-medium text-base">User: Jane Doe</p>
              <p className="text-2xl md:text-4xl font-bold text-green-600 mt-2 md:mt-3">
                Detected: 1,500 THB
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value="1,500 THB"
                readOnly
                className="w-full text-center text-lg md:text-xl font-medium py-4 rounded-full bg-gray-50 border border-gray-300"
              />
              <input
                type="text"
                value="Receipt # T-99281"
                readOnly
                className="w-full text-center text-gray-600 py-4 rounded-full bg-gray-50 border border-gray-300"
              />
            </div>

            {/* Receipt Image */}
            <div className="relative">
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl w-full aspect-video md:aspect-square max-h-96 flex items-center justify-center">
                <Search className="w-16 h-16 md:w-20 md:h-20 text-gray-400" />
              </div>
              <p className="text-center text-sm text-gray-500 mt-3">[ RECEIPT IMAGE ] (Zoomable)</p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-green-600 font-medium">
              <CheckCircle className="w-6 h-6" />
              <span>No Duplicate Found</span>
            </div>

            {/* Buttons */}
            <div className="space-y-4">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg md:text-xl py-5 rounded-full shadow-lg transition transform hover:scale-105 active:scale-95">
                APPROVE (+1500 pts)
              </button>

              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg md:text-xl py-5 rounded-full shadow-lg transition flex items-center justify-center gap-3 active:scale-95">
                <XCircle className="w-7 h-7" />
                REJECT
              </button>

              <select className="w-full py-4 px-6 text-gray-700 rounded-full border border-gray-300 rounded-full text-base focus:ring-2 focus:ring-orange-400 focus:border-transparent">
                <option>Reason (Select...)</option>
                <option>Blurred Image</option>
                <option>Duplicate Receipt</option>
                <option>Invalid Amount</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}