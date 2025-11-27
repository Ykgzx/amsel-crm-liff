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
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cachedData = useHomeCache();

  // โหลดจาก Cache ทันที
  useEffect(() => {
    if (cachedData && !liffProfile && !userProfile) {
      setLiffProfile(cachedData.liffProfile);
      setUserProfile(cachedData.userProfile);
      setIsLiffReady(true);
    }
  }, [cachedData, liffProfile, userProfile]);

  const saveToCache = (liffData: LiffProfile, userData: UserFullProfile) => {
    localStorage.setItem('amsel_home_cache_v4', JSON.stringify({
      liffProfile: liffData,
      userProfile: userData,
      cachedAt: Date.now(),
    }));
  };

  const fetchUserFullProfile = async (lineUserId: string) => {
    await liff.ready;
    const accessToken = liff.getAccessToken();
    if (!accessToken) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Line-UserId': lineUserId,
        },
      });

      if (!response.ok) throw new Error(`Backend error: ${response.status}`);

      const data = await response.json();

      const profileData: UserFullProfile = {
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

      setUserProfile(profileData);
      if (liffProfile) saveToCache(liffProfile, profileData);
    } catch (err: any) {
      console.error('ดึงข้อมูลจาก backend ไม่ได้:', err.message);
    }
  };

  // LIFF Init
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
      } catch (error: any) {
        setLiffError('กรุณาเปิดผ่านแอป LINE เท่านั้น');
        setIsLiffReady(true);
      }
    };
    init();
  }, []);

  // รีเฟรชเมื่อหน้าตื่น
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && liffProfile) {
        const cached = localStorage.getItem('amsel_home_cache_v4');
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

  // ปุ่ม Refresh ด้วยมือ
  const handleRefresh = async () => {
    if (!liffProfile || isRefreshing) return;
    setIsRefreshing(true);
    await fetchUserFullProfile(liffProfile.userId);
    setIsRefreshing(false);
  };

  const toggleDetails = (tierName: string) => {
    setShowDetails(prev => ({ ...prev, [tierName]: !prev[tierName] }));
  };

  const fullName = userProfile?.title
    ? `${userProfile.title} ${userProfile.firstName} ${userProfile.lastName}`
    : `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || liffProfile?.displayName || 'สมาชิก';

  const goToNextPage = () => {
    if (currentPage < 2 && carouselRef.current) {
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

  // Loading Skeleton
  if (!isLiffReady) {
    return (
      <>
        <Navbar />
        <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen pt-26 pb-10">
          <div className="max-w-md mx-auto p-6">
            <div className="mb-6">
              <div className="bg-orange-500 rounded-full px-6 py-3 w-48 h-10 animate-pulse" />
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl p-6 bg-gray-100 border border-gray-200 shadow-lg">
                  <div className="w-full h-16 rounded-2xl bg-gray-300 mb-6 animate-pulse" />
                  <div className="space-y-5">
                    <div className="h-8 bg-orange-200 rounded w-56 mx-auto animate-pulse" />
                    <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
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
          <button onClick={() => window.location.reload()} className="px-10 py-4 bg-orange-500 text-white rounded-full font-bold text-lg">
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen pt-26 pb-20">
        <div className="max-w-md mx-auto p-6">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-8 py-4 w-fit mx-auto shadow-2xl">
              <h2 className="text-2xl font-bold text-white">Member Card</h2>
            </div>
          </div>

          {/* Member Card + ปุ่ม Refresh */}
          <MemberCardCarousel
            fullName={fullName}
            currentPoints={userProfile?.points || 0}
            accumulatedPoints={userProfile?.accumulatedPoints || 0}
            currentTier={userProfile?.tier || 'SILVER'}
            userProfile={userProfile}
            showDetails={showDetails}
            onToggleDetails={toggleDetails}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {[
              { icon: 'fa-ticket-alt', label: 'คูปองของฉัน', href: '/coupons' },
              { icon: 'fa-clipboard-list', label: 'ประวัติการสั่งซื้อ', href: '/history' },
              { icon: 'fa-map-marker-alt', label: 'ที่อยู่', href: '/addresses' },
              { icon: 'fa-comment-dots', label: 'รีวิว', href: '/reviews' },
              { icon: 'fa-receipt', label: 'อัปโหลดใบเสร็จ', href: '/receiptupload' },
              { icon: 'fa-question-circle', label: 'ช่วยเหลือ', href: '/help' },
              { icon: 'fa-gift', label: 'แลกของรางวัล', href: '/rewardstore' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="group">
                <div className="flex flex-col items-center p-6 bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-orange-100 hover:border-orange-400">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-3 group-hover:from-orange-200 group-hover:to-orange-300">
                    <i className={`fas ${item.icon} text-3xl text-orange-600`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* สินค้าแนะนำ */}
          <h3 className="text-2xl font-bold mb-6 text-center">สินค้าแนะนำสำหรับคุณ</h3>
          <div className="relative">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-4 shadow-2xl border-4 border-orange-200 transition-all ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-500 hover:scale-110'}`}
            >
              <i className="fas fa-chevron-left text-orange-600 text-2xl" />
            </button>

            <div
              ref={carouselRef}
              className="flex space-x-6 overflow-x-auto pb-8 px-16 scrollbar-hide snap-x snap-mandatory"
            >
              {[
                { name: 'แอมเซลกลูต้า พลัส', img: '/gluta.png' },
                { name: 'แอมเซลซิงค์พลัส', img: '/zinc.png' },
                { name: 'วิตามินซี 500 มก.', img: '/Vitamin-C.png' },
                { name: 'มัลติวิต พลัส', img: '/Amsel-Multi-Vit-Plus.png' },
                { name: 'แคลเซียม แอลทรีโอเนต', img: '/Calcium.png' },
                { name: 'อะมิโนบิลเบอร์รี่', img: '/amsel-amino-bilberry.png' },
              ].map((p, i) => (
                <div key={i} className="flex-shrink-0 w-48 snap-start bg-white rounded-3xl border-4 border-orange-100 shadow-2xl overflow-hidden hover:scale-105 transition-all duration-300">
                  <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                    <img src={p.img} alt={p.name} className="w-32 h-32 object-contain" />
                  </div>
                  <div className="p-5 text-center">
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-4">{p.name}</h4>
                    <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl hover:from-orange-600 hover:to-red-600 transition">
                      เพิ่มลงตะกร้า
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= 2}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-4 shadow-2xl border-4 border-orange-200 transition-all ${currentPage >= 2 ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-500 hover:scale-110'}`}
            >
              <i className="fas fa-chevron-right text-orange-600 text-2xl" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
}