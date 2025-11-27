// app/admin/layout.tsx   ← ใช้ไฟล์นี้แทนของเดิมทั้งหมด
'use client';

import AdminSidebar from '../components/AdminSidebar';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar (Drawer) */}
        <div
          className={`fixed inset-0 z-40 lg:hidden transition-opacity ${
            mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className={`absolute left-0 top-0 h-full w-64 bg-gray-900 transform transition-transform ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h1 className="text-2xl font-bold text-white">AMSEL ADMIN</h1>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:bg-gray-800 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <AdminSidebar />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full">
          {/* Mobile Header – โผล่มาแค่ในมือถือ/แท็บเล็ต */}
          <header className="lg:hidden bg-gray-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">AMSEL ADMIN</h1>
            <div className="w-10" /> {/* spacer */}
          </header>

          {/* เนื้อหาหน้า */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}