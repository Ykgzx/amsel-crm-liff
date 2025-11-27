// app/admin/layout.tsx
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}