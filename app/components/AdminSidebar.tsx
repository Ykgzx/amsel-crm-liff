// components/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, Users, Gift, LogOut } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: Home, dot: 'bg-purple-500' },
  { name: 'Approvals', href: '/admin/approvals', icon: CheckSquare, dot: 'bg-blue-500', badge: 12 },
  { name: 'Members (CRM)', href: '/admin/members', icon: Users, dot: 'bg-green-500' },
  { name: 'Rewards/Stock', href: '/admin/rewards', icon: Gift, dot: 'bg-orange-500' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">AMSEL ADMIN</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gray-800 shadow-lg ring-2 ring-purple-500/20'
                  : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${item.dot} rounded-full`} />
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout (อยู่ล่างสุดเสมอ) */}
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 w-full transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}