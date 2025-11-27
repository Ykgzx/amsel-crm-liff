// app/rewardstore/page.tsx หรือ pages/rewardstore.tsx
'use client';

import Navbar from "../components/Navbar";
import { Gift, Star } from "lucide-react";
import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-api.com";

interface UserProfile {
  points: number;
  name?: string;
  // เพิ่ม field อื่น ๆ ตาม response จริง
}

export default function RewardstorePage() {
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ฟังก์ชันดึง access token (รองรับทั้ง localStorage และ cookie)
  const getAccessToken = (): string | null => {
    // วิธีที่ 1: เก็บใน localStorage (ทั่วไป)
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) return token;

    // วิธีที่ 2: อ่านจาก httpOnly cookie (ถ้า backend ส่งมาใน cookie ชื่อ access_token)
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="));
    return cookie ? cookie.split("=")[1] : null;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          setError("กรุณาล็อกอินก่อนเข้าใช้งาน");
          setLoading(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include", // สำคัญมาก! ถ้า backend ใช้ refresh token ด้วย cookie
        });

        if (response.status === 401) {
          setError("เซสชันหมดอายุ กรุณาล็อกอินใหม่");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          // ถ้าหน้า login อยู่ที่ /login
          setTimeout(() => (window.location.href = "/login"), 2000);
          return;
        }

        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลได้");
        }

        const data: UserProfile = await response.json();
        setCurrentPoints(data.points || 0);
        setError(null);
      } catch (err) {
        console.error("Fetch profile error:", err);
        setError("เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const rewards = [
    { id: 1, name: "Vitamin C 500 มก. 1 กล่อง", price: 390, image: "/Vitamin-C.png" },
    { id: 2, name: "Zinc Plus 1 กล่อง", price: 450, image: "/zinc.png" },
    { id: 3, name: "Gluta Plus Red Orange 1 กล่อง", price: 890, image: "/gluta.png" },
    { id: 4, name: "แอมเซลมัลติวิต พลัส 1 กล่อง", price: 300, image: "/Amsel-Multi-Vit-Plus.png" },
  ];

  // Loading UI
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดพอยต์...</p>
          </div>
        </div>
      </>
    );
  }

  // Error UI
  if (error) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen pt-32 flex items-center justify-center px-6">
          <div className="text-center bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-sm">
            <p className="text-red-600 font-bold text-lg mb-3">เกิดข้อผิดพลาด</p>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-8 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </>
    );
  }

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
            <div className="inline-flex items-center gap-3 bg-orange-50 border-2 border-orange-200 rounded-2xl px-8 py-4 shadow-sm">
              <Gift className="w-9 h-9 text-orange-600" />
              <div>
                <p className="text-gray-600 text-sm">พอยต์ของคุณ</p>
                <p className="text-3xl font-bold text-orange-600">
                  {currentPoints.toLocaleString()} <span className="text-lg">Pts</span>
                </p>
              </div>
              <Star className="w-9 h-9 text-orange-500 fill-orange-500" />
            </div>
          </div>

          {/* Reward Grid */}
          <div className="grid grid-cols-2 gap-5">
            {rewards.map((reward) => {
              const canRedeem = currentPoints >= reward.price;

              return (
                <div
                  key={reward.id}
                  className="bg-white rounded-2xl border-2 border-orange-100 shadow-md overflow-hidden transition-all hover:shadow-xl hover:border-orange-300 hover:scale-105"
                >
                  <div className="p-4 flex flex-col items-center text-center h-full justify-between">
                    <div className="w-full h-32 bg-orange-50 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                      <img
                        src={reward.image}
                        alt={reward.name}
                        className="max-w-28 max-h-28 object-contain"
                      />
                    </div>

                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 px-2 mb-2">
                      {reward.name}
                    </h3>

                    <div className="flex items-center gap-1 mb-3">
                      <Gift className="w-5 h-5 text-orange-600" />
                      <span className="text-lg font-bold text-orange-600">
                        {reward.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-orange-500">Pts</span>
                    </div>

                    <button
                      className={`w-full py-3 rounded-full font-bold text-sm transition-all ${
                        canRedeem
                          ? "bg-orange-500 text-white hover:bg-orange-600 shadow-md"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={!canRedeem}
                      onClick={() => {
                        if (canRedeem) {
                          alert(`แลก "${reward.name}" เรียบร้อย!`);
                          // ต่อไปเชื่อม API จริง: POST /api/rewards/redeem
                        }
                      }}
                    >
                      {canRedeem ? "แลกของรางวัล" : "พอยต์ไม่พอ"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}