// app/page.tsx
'use client';

import { useRef, useState, useEffect, useSyncExternalStore } from 'react';
import liff from '@line/liff';
import Link from 'next/link';
import Navbar from './components/Navbar';

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

interface UserFullProfile {
  points: number;
  tier: 'Silver' | 'Gold' | 'Platinum';     // ต้องมีจาก backend
  tierMinPoints?: number;                  // optional (ถ้า backend ส่งมา)
  tierMaxPoints?: number;                  // optional (Infinity สำหรับ Platinum)
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phoneNumber?: string | null;
  birthDate?: string | null;
}

interface CachedHomeData {
  liffProfile: LiffProfile;
  userProfile: UserFullProfile;
  cachedAt: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.amsel-crm.com';

function useHomeCache(): CachedHomeData | null {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    () => {
      try {
        const data = localStorage.getItem('amsel_home_cache_v3');
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    },
    () => null
  );
}

// กำหนดข้อมูล Tier (ยังใช้ hardcode เพื่อสีและ min/max)
const TIER_CONFIG = [
  { name: 'Silver' as const,    min: 0,      max: 2000,    color: 'bg-gray-300',   text: 'text-gray-800' },
  { name: 'Gold' as const,      min: 2000,   max: 5000,    color: 'bg-yellow-500', text: 'text-white' },
  { name: 'Platinum' as const,  min: 5000,   max: Infinity,color: 'bg-blue-600',   text: 'text-white' },
] as const;

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const memberCardRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [liffProfile, setLiffProfile] = useState<LiffProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserFullProfile | null>(null);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({
    Silver: false,
    Gold: false,
    Platinum: false,
  });

  const cachedData = useHomeCache();

  // โหลดจาก Cache ก่อน
  useEffect(() => {
    if (cachedData && !liffProfile && !userProfile) {
      setLiffProfile(cachedData.liffProfile);
      setUserProfile(cachedData.userProfile);
      setIsLiffReady(true);
    }
  }, [cachedData, liffProfile, userProfile]);

  const saveToCache = (liffData: LiffProfile, userData: UserFullProfile) => {
    localStorage.setItem('amsel_home_cache_v3', JSON.stringify({
      liffProfile: liffData,
      userProfile: userData,
      cachedAt: Date.now(),
    }));
  };

  const fetchUserFullProfile = async (lineUserId: string) => {
    await liff.ready;
    const accessToken = liff.getAccessToken();
    if (!accessToken) {
      console.warn('ไม่มี Access Token');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Line-UserId': lineUserId,
        },
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Backend error: ${response.status} - ${err}`);
      }

      const data = await response.json();

      const profileData: UserFullProfile = {
        points: data.points || 0,
        tier: data.tier || 'Silver',                    // ดึง tier จาก backend
        tierMinPoints: data.tierMinPoints ?? undefined,
        tierMaxPoints: data.tierMaxPoints ?? undefined,
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        birthDate: data.birthDate,
      };

      setUserProfile(profileData);
      if (liffProfile) saveToCache(liffProfile, profileData);

    } catch (err: any) {
      console.error('ดึงข้อมูลจาก backend ไม่ได้:', err.message);
    }
  };

  // LIFF Initialization
  useEffect(() => {
    const init = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        await liff.ready;
        const profile = await liff.getProfile();
        setLiffProfile(profile);
        setIsLiffReady(true);

        // ใช้ cache ถ้ายังไม่เกิน 10 นาที
        if (cachedData && Date.now() - cachedData.cachedAt < 10 * 60 * 1000) {
          setUserProfile(cachedData.userProfile);
        }

        fetchUserFullProfile(profile.userId);

      } catch (error: any) {
        console.error('LIFF init ล้มเหลว:', error);
        setLiffError('กรุณาเปิดผ่านแอป LINE เท่านั้น');
        setIsLiffReady(true);
      }
    };

    init();
  }, []);

  // Refresh เมื่อกลับมาหน้า
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && liffProfile) {
        const cached = localStorage.getItem('amsel_home_cache_v3');
        if (cached) {
          const { cachedAt } = JSON.parse(cached);
          if (Date.now() - cachedAt > 5 * 60 * 1000) {
            fetchUserFullProfile(liffProfile.userId);
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [liffProfile]);

  // Auto scroll ไปที่ Tier ปัจจุบัน
  useEffect(() => {
    if (isLiffReady && memberCardRef.current && userProfile?.tier) {
      const index = TIER_CONFIG.findIndex(t => t.name === userProfile.tier);
      if (index >= 0) {
        setTimeout(() => {
          memberCardRef.current?.children[index]?.scrollIntoView({
            behavior: 'smooth',
            inline: 'start'
          });
        }, 300);
      }
    }
  }, [isLiffReady, userProfile?.tier]);

  const toggleDetails = (tierName: string) => {
    setShowDetails(prev => ({ ...prev, [tierName]: !prev[tierName] }));
  };

  const totalPages = 3;

  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && carouselRef.current) {
      setCurrentPage(prev => prev + 1);
      carouselRef.current.scrollBy({ left: 440, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0 && carouselRef.current) {
      setCurrentPage(prev => prev - 1);
      carouselRef.current.scrollBy({ left: -440, behavior: 'smooth' });
    }
  };

  const fullName = userProfile?.title
    ? `${userProfile.title} ${userProfile.firstName} ${userProfile.lastName}`
    : `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || liffProfile?.displayName || 'สมาชิก';

  const currentPoints = userProfile?.points || 0;
  const currentTierName = userProfile?.tier || 'Silver';
  const currentTierConfig = TIER_CONFIG.find(t => t.name === currentTierName) || TIER_CONFIG[0];

  // คำนวณ Progress
  const getProgress = () => {
    if (currentTierConfig.max === Infinity) return 100;
    const min = currentTierConfig.min;
    const max = currentTierConfig.max;
    return Math.min(100, ((currentPoints - min) / (max - min)) * 100);
  };
  const progress = getProgress();

  // Skeleton UI
  if (!isLiffReady) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen pt-26 pb-10">
          <div className="max-w-md mx-auto p-6">
            <div className="mb-6">
              <div className="bg-orange-500 rounded-full px-5 py-2 w-32 h-10 animate-pulse" />
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl p-6 bg-gray-50 border border-gray-200">
                  <div className="w-full h-14 rounded-xl bg-gray-300 mb-6 animate-pulse" />
                  <div className="space-y-4">
                    <div className="h-8 bg-orange-200 rounded w-48 mx-auto animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
            {/* ... Skeleton อื่น ๆ เหมือนเดิม ... */}
          </div>
        </div>
      </>
    );
  }

  if (liffError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-red-500 text-lg mb-6">{liffError}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-orange-500 text-white rounded-full font-bold">
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen pt-26 pb-10">
        <div className="max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="bg-orange-500 rounded-full px-5 py-2 w-fit">
              <h2 className="font-bold text-lg text-white">Member Card</h2>
            </div>
          </div>

          {/* Member Card */}
          <div className="relative overflow-hidden mb-8">
            <div ref={memberCardRef} className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4">
              {TIER_CONFIG.map((tier) => {
                const isCurrent = tier.name === currentTierName;
                const isAchieved = currentPoints >= tier.max && tier.max !== Infinity;

                return (
                  <div
                    key={tier.name}
                    className={`flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl p-6 shadow-lg border ${
                      isCurrent ? 'border-4 border-orange-500 scale-105' : 'border-gray-200'
                    }`}
                  >
                    <div className={`w-full h-14 rounded-xl flex items-center justify-center mb-6 ${tier.color} ${tier.text}`}>
                      <span className="font-bold text-xl">{tier.name} Tier</span>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-gray-600 text-sm">ชื่อ-นามสกุล</p>
                      <p className="text-xl font-bold text-orange-600">{fullName}</p>
                    </div>

                    <button onClick={() => toggleDetails(tier.name)} className="w-full flex justify-center gap-2 py-3 bg-gray-100 rounded-xl mb-4">
                      <span className="text-sm">{showDetails[tier.name] ? 'ซ่อน' : 'ดูข้อมูลส่วนตัว'}</span>
                      <i className={`fas fa-chevron-${showDetails[tier.name] ? 'up' : 'down'} text-orange-500`}></i>
                    </button>

                    {showDetails[tier.name] && (
                      <div className="text-sm space-y-3 border-t pt-3">
                        <div className="flex justify-between"><span className="text-gray-600">อีเมล</span><span>{userProfile?.email || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">เบอร์โทร</span><span>{userProfile?.phoneNumber || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">วันเกิด</span><span>{userProfile?.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span></div>
                      </div>
                    )}

                    <div className="text-center my-6">
                      <p className="text-lg text-gray-700">คะแนนสะสม</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {currentPoints.toLocaleString()} <span className="text-lg">แต้ม</span>
                      </p>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-5 mb-4 overflow-hidden">
                      <div
                        className={`h-full ${tier.color} transition-all duration-1000`}
                        style={{ width: `${isCurrent || isAchieved ? (isAchieved && tier.max !== Infinity ? 100 : progress) : 0}%` }}
                      />
                    </div>

                    <p className="text-center text-sm text-gray-600">
                      {isAchieved
                        ? 'คุณบรรลุ Tier นี้แล้ว'
                        : isCurrent
                          ? tier.max === Infinity
                            ? 'คุณอยู่ใน Tier สูงสุดแล้ว!'
                            : `ซื้ออีก ${(tier.max - currentPoints).toLocaleString()} บาท เพื่อเลื่อน Tier`
                          : `ขาดอีก ${(tier.min - currentPoints > 0 ? tier.min - currentPoints : 0).toLocaleString()} บาท`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            {[
              { icon: 'fa-ticket-alt', label: 'คูปองของฉัน', href: '/coupons' },
              { icon: 'fa-clipboard-list', label: 'ประวัติการสั่งซื้อ', href: '/orders' },
              { icon: 'fa-map-marker-alt', label: 'ที่อยู่', href: '/addresses' },
              { icon: 'fa-comment-dots', label: 'รีวิว', href: '/reviews' },
              { icon: 'fa-receipt', label: 'อัปโหลดใบเสร็จ', href: '/receiptupload' },
              { icon: 'fa-question-circle', label: 'ช่วยเหลือ', href: '/help' },
              { icon: 'fa-exchange', label: 'แลกของรางวัล', href: '/rewardstore' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200 mb-2 group-hover:bg-orange-200 group-hover:scale-110 transition-all">
                  <i className={`fas ${item.icon} text-2xl text-orange-600`}></i>
                </div>
                <span className="text-xs text-center text-gray-700 group-hover:text-orange-600">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* สินค้าแนะนำ */}
          <h3 className="font-bold text-lg mb-4">สินค้าแนะนำสำหรับคุณ</h3>
          <div className="relative">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 transition-all ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-400'}`}
            >
              <i className="fas fa-chevron-left text-orange-500 text-xl"></i>
            </button>

            <div
              ref={carouselRef}
              className="flex space-x-4 overflow-x-auto pb-6 px-12 scrollbar-hide snap-x snap-mandatory"
            >
              {[
                { name: 'แอมเซลกลูต้า พลัส', img: '/gluta.png' },
                { name: 'แอมเซลซิงค์พลัส', img: '/zinc.png' },
                { name: 'วิตามินซี 500 มก.', img: '/Vitamin-C.png' },
                { name: 'มัลติวิต พลัส', img: '/Amsel-Multi-Vit-Plus.png' },
                { name: 'แคลเซียม แอลทรีโอเนต', img: '/Calcium.png' },
                { name: 'อะมิโนบิลเบอร์รี่', img: '/amsel-amino-bilberry.png' },
              ].map((p, i) => (
                <div key={i} className="flex-shrink-0 w-40 snap-start bg-white rounded-2xl border-2 border-orange-100 shadowLg p-4 flex flex-col items-center hover:scale-105 transition-transform">
                  <div className="w-full h-32 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                    <img src={p.img} alt={p.name} className="w-20 h-20 object-contain" />
                  </div>
                  <h4 className="text-sm text-center line-clamp-2">{p.name}</h4>
                  <button className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2.5 rounded-full">
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= 2}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 transition-all ${currentPage >= 2 ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-400'}`}
            >
              <i className="fas fa-chevron-right text-orange-500 text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}