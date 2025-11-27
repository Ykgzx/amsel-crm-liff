// app/admin/layout.tsx
'use client';

import AdminSidebar from '../components/AdminSidebar';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar - Drawer */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black opacity-50" />
        </div>

        <div
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 transform transition-transform duration-300 lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white">AMSEL ADMIN</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-gray-800 p-2 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <AdminSidebar /> {/* ใช้ Sidebar เดียวกันได้เลย */}
          </div>
        </div>

        {/* Main Content + Mobile Header */}
        <div className="flex-1 flex flex-col w-full">
          {/* Mobile Top Bar */}
          <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">AMSEL ADMIN</h1>
            <div className="w-10" /> {/* ตัวเว้นว่างขวาสุดให้สมดุลกับปุ่มเมนู */}
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}