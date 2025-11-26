// app/page.tsx
'use client';

import { useRef, useState, useEffect, useSyncExternalStore } from 'react';
import liff from '@line/liff';
import Link from 'next/link';
import Navbar from './components/Navbar';
import MemberCardCarousel from './components/MemberCardCarousel';

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

interface UserFullProfile {
  points: number;
  accumulatedPoints: number;
  tier: 'SILVER' | 'GOLD' | 'PLATINUM';
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
    (cb) => {
      window.addEventListener('storage', cb);
      return () => window.removeEventListener('storage', cb);
    },
    () => {
      try {
        const data = localStorage.getItem('amsel_home_cache_v4');
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    },
    () => null
  );
}

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [liffProfile, setLiffProfile] = useState<LiffProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserFullProfile | null>(null);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({
    SILVER: false,
    GOLD: false,
    PLATINUM: false,
  });

  const cachedData = useHomeCache();

  useEffect(() => {
    if (cachedData && !liffProfile && !userProfile) {
      setLiffProfile(cachedData.liffProfile);
      setUserProfile(cachedData.userProfile);
      setIsLiffReady(true);
    }
  }, [cachedData, liffProfile, userProfile]);

  const saveToCache = (l: LiffProfile, u: UserFullProfile) => {
    localStorage.setItem('amsel_home_cache_v4', JSON.stringify({
      liffProfile: l,
      userProfile: u,
      cachedAt: Date.now(),
    }));
  };

  const fetchUserFullProfile = async (lineUserId: string) => {
    await liff.ready;
    const token = liff.getAccessToken();
    if (!token) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Line-UserId': lineUserId,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch profile');

      const data = await res.json();
      const profile: UserFullProfile = {
        points: data.points || 0,
        accumulatedPoints: data.accumulatedPoints || 0,
        tier: data.tier || 'SILVER',
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        birthDate: data.birthDate,
      };

      setUserProfile(profile);
      if (liffProfile) saveToCache(liffProfile, profile);
    } catch (err) {
      console.error('ดึงข้อมูลจาก backend ไม่ได้:', err);
    }
  };

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

        if (cachedData && Date.now() - cachedData.cachedAt < 10 * 60 * 1000) {
          setUserProfile(cachedData.userProfile);
        }
        fetchUserFullProfile(profile.userId);
      } catch {
        setLiffError('กรุณาเปิดผ่านแอป LINE เท่านั้น');
        setIsLiffReady(true);
      }
    };
    init();
  }, []);

  // Refresh เมื่อกลับมา
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && liffProfile) {
        const cached = localStorage.getItem('amsel_home_cache_v4');
        if (cached && Date.now() - JSON.parse(cached).cachedAt > 5 * 60 * 1000) {
          fetchUserFullProfile(liffProfile.userId);
        }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [liffProfile]);

  const toggleDetails = (tier: string) => {
    setShowDetails(prev => ({ ...prev, [tier]: !prev[tier] }));
  };

  const fullName = userProfile?.title
    ? `${userProfile.title} ${userProfile.firstName} ${userProfile.lastName}`
    : `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || liffProfile?.displayName || 'สมาชิก';

  const goToNextPage = () => {
    if (currentPage < 2 && carouselRef.current) {
      setCurrentPage(p => p + 1);
      carouselRef.current.scrollBy({ left: 440, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0 && carouselRef.current) {
      setCurrentPage(p => p - 1);
      carouselRef.current.scrollBy({ left: -440, behavior: 'smooth' });
    }
  };

  if (!isLiffReady) {
    return (
      <> {/* Skeleton UI เดิมของคุณ */} </>
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

          {/* ใช้ Component แยก */}
          <MemberCardCarousel
            fullName={fullName}
            currentPoints={userProfile?.points || 0}
            accumulatedPoints={userProfile?.accumulatedPoints || 0}
            currentTier={userProfile?.tier || 'SILVER'}
            userProfile={userProfile}
            showDetails={showDetails}
            onToggleDetails={toggleDetails}
          />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            {[
              { icon: 'fa-ticket-alt', label: 'คูปองของฉัน', href: '/coupons' },
              { icon: 'fa-clipboard-list', label: 'ประวัติการสั่งซื้อ', href: '/history' },
              { icon: 'fa-map-marker-alt', label: 'ที่อยู่', href: '/addresses' },
              { icon: 'fa-comment-dots', label: 'รีวิว', href: '/reviews' },
              { icon: 'fa-receipt', label: 'อัปโหลดใบเสร็จ', href: '/receiptupload' },
              { icon: 'fa-question-circle', label: 'ช่วยเหลือ', href: '/help' },
              { icon: 'fa-exchange', label: 'แลกของรางวัล', href: '/rewardstore' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200 mb-2 group-hover:bg-orange-200 group-hover:scale-110 transition-all">
                  <i className={`fas ${item.icon} text-2xl text-orange-600`} />
                </div>
                <span className="text-xs text-center text-gray-700 group-hover:text-orange-600">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* สินค้าแนะนำ */}
          <h3 className="font-bold text-lg mb-4">สินค้าแนะนำสำหรับคุณ</h3>
          <div className="relative">
            <button onClick={goToPrevPage} disabled={currentPage === 0}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 ${currentPage === 0 ? 'opacity-50' : 'hover:border-orange-400'}`}>
              <i className="fas fa-chevron-left text-orange-500 text-xl" />
            </button>

            <div ref={carouselRef} className="flex space-x-4 overflow-x-auto pb-6 px-12 scrollbar-hide snap-x snap-mandatory">
              {[
                { name: 'แอมเซลกลูต้า พลัส', img: '/gluta.png' },
                { name: 'แอมเซลซิงค์พลัส', img: '/zinc.png' },
                { name: 'วิตามินซี 500 มก.', img: '/Vitamin-C.png' },
                { name: 'มัลติวิต พลัส', img: '/Amsel-Multi-Vit-Plus.png' },
                { name: 'แคลเซียม แอลทรีโอเนต', img: '/Calcium.png' },
                { name: 'อะมิโนบิลเบอร์รี่', img: '/amsel-amino-bilberry.png' },
              ].map((p, i) => (
                <div key={i} className="flex-shrink-0 w-40 snap-start bg-white rounded-2xl border-2 border-orange-100 shadow-lg p-4 flex flex-col items-center hover:scale-105 transition-transform">
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

            <button onClick={goToNextPage} disabled={currentPage >= 2}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 ${currentPage >= 2 ? 'opacity-50' : 'hover:border-orange-400'}`}>
              <i className="fas fa-chevron-right text-orange-500 text-xl" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
}