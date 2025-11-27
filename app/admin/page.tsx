// app/admin/page.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, XCircle, ZoomIn } from 'lucide-react';

const healthData = [
  { name: 'Skin', value: 40 },
  { name: 'Immunity', value: 60 },
];

export default function DashboardPage() {
  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h2>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <p className="text-gray-600 text-sm">Total Members</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">45,200</p>
          <p className="text-green-600 text-sm mt-2">+120 today</p>
        </div>

        <div className="bg-red-500 text-white rounded-2xl shadow-sm p-6">
          <p className="text-red-100 text-sm">Pending Receipts</p>
          <p className="text-4xl font-bold mt-2">12</p>
          <p className="text-red-100 text-sm mt-2">Requires Action</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <p className="text-gray-600 text-sm">Points Liability</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">1,500,000 pts</p>
          <p className="text-gray-500 text-sm mt-2">(Worth 150K THB)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Customer Health Concerns (Quiz Data)
            </h3>
            <div className="h-64">
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

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-bold text-lg">JD</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Customer Insight : Jane Doe</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Goal:</span><span className="font-medium">Skin Care</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tier:</span><span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium">Silver</span></div>
              <div className="text-gray-600 text-xs">
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

        {/* Right: Receipt Tool */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 font-bold text-lg">
            Receipt Verification Tool
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-gray-700 font-medium">User: Jane Doe</p>
              <p className="text-3xl font-bold text-green-600 mt-3">Detected: 1,500 THB</p>
              <input type="text" value="1,500 THB" readOnly className="mt-3 w-full text-center border border-gray-300 rounded-lg py-3 bg-gray-50" />
              <input type="text" placeholder="Receipt # T-99281" readOnly className="mt-3 w-full text-center border border-gray-300 rounded-lg py-3 bg-gray-50" />

              <div className="mt-8 relative">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center cursor-zoom-in hover:bg-gray-250 transition">
                  <ZoomIn className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 text-center mt-3">[ RECEIPT IMAGE ] (Zoomable)</p>
              </div>

              <div className="flex items-center justify-center space-x-2 mt-6 text-green-600 font-medium">
                <CheckCircle className="w-6 h-6" />
                <span>No Duplicate Found</span>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-5 rounded-xl text-lg shadow-lg transition transform hover:scale-105">
                APPROVE (+1500 pts)
              </button>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-xl text-lg shadow-lg transition flex items-center justify-center gap-3">
                <XCircle className="w-6 h-6" />
                REJECT
              </button>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-4 text-gray-700">
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