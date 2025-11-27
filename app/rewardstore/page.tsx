// app/rewardstore/page.tsx
'use client';

import { useState, useEffect } from 'react';
import liff from '@line/liff';
import Navbar from '../components/Navbar';
import { Gift, Star, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.amsel-crm.com';

interface UserProfile {
  points: number;
  firstName?: string;
  lastName?: string;
}

const REWARDS = [
  { id: 1, name: "Vitamin C 500 มก. 1 กล่อง", price: 390, image: "/Vitamin-C.png" },
  { id: 2, name: "Zinc Plus 1 กล่อง", price: 450, image: "/zinc.png" },
  { id: 3, name: "Gluta Plus Red Orange 1 กล่อง", price: 890, image: "/gluta.png" },
  { id: 4, name: "แอมเซลมัลติวิต พลัส 1 กล่อง", price: 300, image: "/Amsel-Multi-Vit-Plus.png" },
  { id: 5, name: "แคลเซียม แอลทรีโอเนต 1 กล่อง", price: 650, image: "/Calcium.png" },
  { id: 6, name: "อะมิโนบิลเบอร์รี่ 1 กล่อง", price: 750, image: "/amsel-amino-bilberry.png" },
] as const;

export default function RewardstorePage() {
  const [points, setPoints] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("สมาชิก");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLiffAndFetch = async () => {
      try {
        // 1. เริ่ม LIFF
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        await liff.ready;

        const profile = await liff.getProfile();
        const accessToken = liff.getAccessToken();

        if (!accessToken) {
          throw new Error("ไม่สามารถเข้าสู่ระบบได้");
        }

        // 2. ดึงข้อมูลจาก Backend
        const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-Line-UserId': profile.userId,
          },
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`โหลดข้อมูลไม่สำเร็จ: ${res.status} - ${err}`);
        }

        const data = await res.json();

        setPoints(data.points || 0);
        setUserName(
          data.firstName
            ? `${data.title || ''} ${data.firstName} ${data.lastName || ''}`.trim()
            : profile.displayName || "สมาชิก"
        );

      } catch (err: any) {
        console.error("Reward Store Error:", err);
        setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      } finally {
        setIsLoading(false);
      }
    };

    initLiffAndFetch();
  }, []);

  // Loading UI
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen pt-32 pb-16">
          <div className="max-w-md mx-auto px-6">
            <div className="text-center mb-8">
              <div className="bg-orange-500 rounded-full px-8 py-3 w-fit mx-auto">
                <div className="h-7 w-48 bg-white/30 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="bg-gray-100 rounded-3xl h-40 animate-pulse mb-10" />
            <div className="grid grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
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
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg font-medium mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-10 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition"
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

      <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen pt-32 pb-20">
        <div className="max-w-md mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-orange-500 rounded-full px-8 py-3 w-fit mx-auto shadow-lg">
              <h1 className="text-2xl font-bold text-white">แลกของรางวัล</h1>
            </div>
            <p className="text-gray-600 mt-3 text-sm">สวัสดี, {userName}</p>
          </div>

          {/* Points Card */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 shadow-2xl text-white text-center mb-10 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Gift className="w-12 h-12" />
              <Star className="w-12 h-12 fill-yellow-300" />
            </div>
            <p className="text-lg opacity-90">พอยต์ของคุณตอนนี้</p>
            <p className="text-5xl font-bold mt-2">
              {points?.toLocaleString() || '0'}
              <span className="text-2xl ml-2">Pts</span>
            </p>
          </div>

          {/* Reward Grid */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {REWARDS.map((reward) => {
              const canRedeem = points! >= reward.price;
              const notEnough = reward.price - points!;

              return (
                <div
                  key={reward.id}
                  className={`bg-white rounded-3xl border-2 shadow-lg overflow-hidden transition-all duration-300 ${
                    canRedeem
                      ? 'border-orange-200 hover:border-orange-500 hover:shadow-2xl hover:-translate-y-2'
                      : 'border-gray-200 opacity-90'
                  }`}
                >
                  <div className="p-5 flex flex-col h-full">

                    {/* รูปสินค้า */}
                    <div className="w-full h-36 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                      <img
                        src={reward.image}
                        alt={reward.name}
                        className="w-28 h-28 object-contain"
                      />
                    </div>

                    {/* ชื่อ */}
                    <h3 className="text-sm font-bold text-gray-800 text-center line-clamp-2 mb-3 min-h-12">
                      {reward.name}
                    </h3>

                    {/* ราคา */}
                    <div className="flex items-center justify-center gap-2 mb-5">
                      <Gift className="w-6 h-6 text-orange-600" />
                      <span className="text-2xl font-bold text-orange-600">
                        {reward.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-orange-500 font-medium">Pts</span>
                    </div>

                    {/* ปุ่ม */}
                    <button
                      className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-md ${
                        canRedeem
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                      disabled={!canRedeem}
                      onClick={() => {
                        if (canRedeem) {
                          alert(`แลก "${reward.name}" เรียบร้อยแล้ว!\nหัก ${reward.price} พอยต์`);
                          // TODO: เรียก API แลกของจริง
                        }
                      }}
                    >
                      {canRedeem ? 'แลกทันที' : `ขาดอีก ${notEnough.toLocaleString()} Pts`}
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