import Navbar from "../components/Navbar";
import { Gift, Star } from "lucide-react";

export default function RewardstorePage() {
  // ข้อมูลสมมติพอยต์ (ดึงจาก profile หรือ context จริง ๆ)
  const currentPoints = 1250;

  const rewards = [
    { id: 1, name: "Vitamin C 500 มก. 1 กล่อง", price: 390, image: "/Vitamin-C.png" },
    { id: 2, name: "Zinc Plus 1 กล่อง", price: 450, image: "/zinc.png" },
    { id: 3, name: "Gluta Plus Red Orange 1 กล่อง", price: 890, image: "/gluta.png" },
    { id: 4, name: "แอมเซลมัลติวิต พลัส 1 กล่อง", price: 300, image: "/Amsel-Multi-Vit-Plus.png" },
  ];

  return (
    <>
      <Navbar />

      <div className="bg-white min-h-screen pt-32 pb-16">
        <div className="max-w-md mx-auto px-6">

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="bg-orange-500 rounded-full px-6 py-2 w-fit mx-auto mb-4">
              <h1 className="text-xl font-bold text-white">แลกของรางวัล</h1>
            </div>
            <div className="inline-flex items-center gap-3 bg-orange-50 border-2 border-orange-200 rounded-2xl px-8 py-4">
              <Gift className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-gray-600 text-sm">พอยต์ของคุณ</p>
                <p className="text-3xl font-bold text-orange-600">
                  {currentPoints.toLocaleString()} <span className="text-lg">Pts</span>
                </p>
              </div>
              <Star className="w-8 h-8 text-orange-500 fill-orange-500" />
            </div>
          </div>

          {/* Reward Grid */}
          <div className="grid grid-cols-2 gap-5">
            {rewards.map((reward) => {
              const canRedeem = currentPoints >= reward.price;

              return (
                <div
                  key={reward.id}
                  className="bg-white rounded-2xl border border-orange-100 shadow-md overflow-hidden transition-all hover:shadow-lg hover:border-orange-300"
                >
                  <div className="p-4 flex flex-col items-center text-center h-full">
                    {/* รูปสินค้า */}
                    <div className="w-full h-32 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                      <img
                        src={reward.image}
                        alt={reward.name}
                        className="w-25 h-25 object-contain"
                      />
                    </div>

                    {/* ชื่อรางวัล */}
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 px-2 mb-3">
                      {reward.name}
                    </h3>

                    {/* ราคาพอยต์ */}
                    <div className="flex items-center gap-1 mb-4">
                      <Gift className="w-5 h-5 text-orange-600" />
                      <span className="text-lg font-bold text-orange-600">
                        {reward.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-orange-500">Pts</span>
                    </div>

                    {/* ปุ่มแลก */}
                    <button
                      className={`w-full py-3 rounded-full font-bold text-sm transition-all ${
                        canRedeem
                          ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={!canRedeem}
                    >
                      {canRedeem ? "แลกของรางวัล" : "พอยต์ไม่พอ"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ข้อความเชิญชวนทำภารกิจ */}
          <div className="mt-10 text-center bg-orange-50 rounded-2xl p-6 border border-orange-200">
            <p className="text-gray-700">
              อยากได้พอยต์เพิ่มใช่มั้ย? 
            </p>
            <p className="text-orange-600 font-bold mt-2">
              ไปทำภารกิจได้ที่เมนู “ภารกิจประจำวัน”
            </p>
          </div>

        </div>
      </div>
    </>
  );
}