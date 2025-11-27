// app/admin/layout.tsx
import AdminSidebar from '../components/AdminSidebar';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar ติดแน่นตลอดกาล */}
      <AdminSidebar />

      {/* Content Area */}
      <div className="flex-1 ml-0 lg:ml-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}