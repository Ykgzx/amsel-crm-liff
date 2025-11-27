// app/admin/approvals/page.tsx
export default function ApprovalsPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Pending Approvals</h1>
          <p className="text-gray-600 mt-2">มีใบเสร็จรออนุมัติทั้งหมด 12 รายการ</p>
        </div>
        <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold text-lg">12</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-6xl mb-4">Receipt List Here</div>
        <p className="text-gray-500">รายการใบเสร็จจะแสดงเป็นการ์ดหรือตารางตรงนี้</p>
      </div>
    </>
  );
}