// app/admin/rewards/page.tsx
export default function RewardsPage() {
  return (
    <>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Rewards & Stock Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 border">
          <h3 className="text-xl font-bold">Total Points Issued</h3>
          <p className="text-4xl font-bold text-blue-600 mt-4">8,420,000 pts</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border">
          <h3 className="text-xl font-bold">Stock Remaining</h3>
          <p className="text-4xl font-bold text-orange-600 mt-4">1,240 ชิ้น</p>
        </div>
      </div>
    </>
  );
}