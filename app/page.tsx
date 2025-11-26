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

  const toggleDetails = (tierName: string) => {
    setShowDetails(prev => ({
      ...prev,
      [tierName]: !prev[tierName]
    }));
  };

  const products = [
    { id: 1, name: 'แอมเซลกลูต้า พลัส เรด ออเร้นจ์ เอ็กซ์แทร็คซ์', img: '/gluta.png', alt: 'กลูต้า' },
    { id: 2, name: 'แอมเซลซิงค์พลัส วิตามิน พรีมิกซ์', img: '/zinc.png', alt: 'ซิงค์พลัส' },
    { id: 3, name: 'แอมเซลวิตามินซี 500 มก.', img: '/Vitamin-C.png', alt: 'วิตามินซี' },
    { id: 4, name: 'แอมเซลมัลติวิต พลัส', img: '/Amsel-Multi-Vit-Plus.png', alt: 'มัลติวิต' },
    { id: 5, name: 'แอมเซลแคลเซียม แอลทรีโอเนต พลัส คอลลาเจนไทพ์ทู', img: '/Calcium.png', alt: 'แคลเซียม' },
    { id: 6, name: 'แอมเซลอะมิโนบิลเบอร์รี่ สกัด พลัส', img: '/amsel-amino-bilberry.png', alt: 'บิลเบอร์รี่' },
  ];

  const totalPages = Math.ceil(products.length / 2);

  const baseTiers = [
    { name: 'Silver',   minPoints: 0,     maxPoints: 2000,  color: 'bg-gray-300',   textColor: 'text-gray-800',   nextTier: 'Gold' },
    { name: 'Gold',     minPoints: 2000,  maxPoints: 5000,  color: 'bg-yellow-500', textColor: 'text-white',      nextTier: 'Platinum' },
    { name: 'Platinum', minPoints: 5000,  maxPoints: Infinity, color: 'bg-blue-600', textColor: 'text-white',      nextTier: '' },
  ] as const;

  const currentPoints = userProfile?.points || 0;
  const currentTierIndex = baseTiers.findIndex(
    (tier) => currentPoints >= tier.minPoints && (tier.maxPoints === Infinity || currentPoints < tier.maxPoints)
  );

  const progressPercent = currentTierIndex === -1 || baseTiers[currentTierIndex]?.maxPoints === Infinity
    ? 100
    : Math.min(100, ((currentPoints - baseTiers[currentTierIndex].minPoints) / (baseTiers[currentTierIndex].maxPoints - baseTiers[currentTierIndex].minPoints)) * 100);

  const formatBirthDate = (isoString: string | null | undefined): string => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const cachedData = useHomeCache();

  // ใช้ cache ทันทีถ้ามี
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
    if (!liffProfile) return;

    try {
      const accessToken = liff.getAccessToken();
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Line-UserId': lineUserId,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json() as UserFullProfile;
      const profileData: UserFullProfile = {
        points: data.points || 0,
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        birthDate: data.birthDate,
      };

      setUserProfile(profileData);
      saveToCache(liffProfile, profileData);

    } catch (err) {
      const fallback: UserFullProfile = {
        points: 3000,
        firstName: liffProfile.displayName?.split(' ')[0] || 'สมาชิก',
        lastName: liffProfile.displayName?.split(' ').slice(1).join(' ') || '',
        email: 'example@email.com',
        phoneNumber: '081-234-5678',
        birthDate: '1990-01-01T00:00:00.000Z',
      };
      setUserProfile(fallback);
      saveToCache(liffProfile, fallback);
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

        const profile = await liff.getProfile();
        setLiffProfile(profile);
        setIsLiffReady(true);

        const now = Date.now();
        const shouldRefresh = !cachedData || (now - cachedData.cachedAt > 10 * 60 * 1000);

        if (shouldRefresh) {
          await fetchUserFullProfile(profile.userId);
        } else {
          setUserProfile(cachedData.userProfile);
          fetchUserFullProfile(profile.userId); // refresh quietly
        }
      } catch (error) {
        setLiffError('กรุณาเปิดผ่านแอป LINE เท่านั้น');
        setIsLiffReady(true);
      }
    };

    init();
  }, []);

  // Refresh when tab becomes visible (after 5 mins)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && liffProfile) {
        const cached = localStorage.getItem('amsel_home_cache_v3');
        if (cached) {
          const { cachedAt } = JSON.parse(cached) as CachedHomeData;
          if (Date.now() - cachedAt > 5 * 60 * 1000) {
            fetchUserFullProfile(liffProfile.userId);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [liffProfile]);

  // Auto scroll to current tier
  useEffect(() => {
    if (isLiffReady && memberCardRef.current && currentTierIndex >= 0) {
      setTimeout(() => {
        memberCardRef.current?.children[currentTierIndex]?.scrollIntoView({
          behavior: 'smooth',
          inline: 'start'
        });
      }, 300);
    }
  }, [isLiffReady, currentTierIndex]);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && carouselRef.current) {
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

  const fullName = userProfile?.title
    ? `${userProfile.title} ${userProfile.firstName} ${userProfile.lastName}`
    : `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || liffProfile?.displayName || 'สมาชิก';

  // Skeleton UI - แสดงทันทีแม้ LIFF ยังไม่ ready
  if (!isLiffReady) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen pt-26 pb-10">
          <div className="max-w-md mx-auto p-6">
            <div className="mb-6">
              <div className="bg-orange-500 rounded-full px-5 py-2 w-32 h-10 animate-pulse" />
            </div>

            <div className="relative overflow-hidden mb-8">
              <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl p-6 bg-gray-50 border border-gray-200">
                    <div className="w-full h-14 rounded-xl bg-gray-300 mb-6 animate-pulse" />
                    <div className="space-y-4">
                      <div className="h-5 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
                      <div className="h-8 bg-orange-200 rounded w-48 mx-auto animate-pulse" />
                      <div className="h-10 bg-gray-200 rounded-xl animate-pulse" />
                      <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
              ))}
            </div>

            <div className="h-8 bg-gray-300 rounded w-48 mb-4 animate-pulse" />
            <div className="flex space-x-4 overflow-x-auto px-12 pb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 bg-gray-50 rounded-2xl border border-gray-200 p-4">
                  <div className="w-full h-32 bg-gray-200 rounded-xl mb-3 animate-pulse" />
                  <div className="h-12 bg-gray-200 rounded animate-pulse" />
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
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600">
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
          {/* Member Card Section */}
          <div className="mb-6">
            <div className="bg-orange-500 rounded-full px-5 py-2 w-fit">
              <h2 className="font-bold text-lg text-white">Member Card</h2>
            </div>
          </div>

          <div className="relative overflow-hidden mb-8">
            <div ref={memberCardRef} className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4" style={{ scrollSnapType: 'x mandatory' }}>
              {baseTiers.map((tier, index) => {
                const isCurrent = index === currentTierIndex;
                const isAchieved = index < currentTierIndex;
                const pointsToNext = isCurrent && tier.maxPoints !== Infinity
                  ? tier.maxPoints - currentPoints
                  : index > currentTierIndex ? tier.minPoints - currentPoints : 0;

                let message = '';
                if (isAchieved) message = 'คุณบรรลุ Tier นี้แล้ว';
                else if (isCurrent && tier.nextTier) message = `ซื้ออีก ${pointsToNext.toLocaleString()} บาท เพื่อเลื่อนเป็น ${tier.nextTier} Tier`;
                else if (isCurrent) message = 'ยินดีด้วย! คุณอยู่ระดับสูงสุดแล้ว';
                else message = `ขาดอีก ${pointsToNext.toLocaleString()} บาท เพื่อไป ${tier.name} Tier`;

                const isExpanded = showDetails[tier.name];

                return (
                  <div
                    key={tier.name}
                    className={`flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl p-6 transition-all shadow-lg ${
                      isCurrent ? 'border-4 border-orange-500 shadow-2xl scale-105' : 'border border-gray-200'
                    }`}
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className={`w-full h-14 rounded-xl flex items-center justify-center mb-6 ${tier.color} ${tier.textColor}`}>
                      <span className="font-bold text-xl">{tier.name} Tier</span>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-gray-600 text-sm">ชื่อ-นามสกุล</p>
                      <p className="text-xl font-bold text-orange-600">{fullName}</p>
                    </div>

                    <div className="mb-4">
                      <button onClick={() => toggleDetails(tier.name)} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                        <span className="text-sm font-medium text-gray-700">{isExpanded ? 'ซ่อน' : 'ดูข้อมูลส่วนตัว'}</span>
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-orange-500`}></i>
                      </button>
                    </div>

                    <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-4 py-4 text-sm border-t border-gray-200 mt-2">
                        <div className="flex justify-between"><span className="text-gray-600">อีเมล</span><span className="font-medium text-gray-800">{userProfile?.email || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">เบอร์โทร</span><span className="font-medium text-gray-800">{userProfile?.phoneNumber || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">วันเกิด</span><span className="font-medium text-gray-800">{formatBirthDate(userProfile?.birthDate)}</span></div>
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-lg text-gray-700">คะแนนสะสม</p>
                      <p className="text-3xl font-bold text-orange-600">{currentPoints.toLocaleString()} <span className="text-lg">แต้ม</span></p>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-5 mb-5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${tier.color}`} style={{ width: `${isCurrent ? progressPercent : isAchieved ? 100 : 0}%` }} />
                    </div>

                    <p className={`text-center text-sm font-medium ${isCurrent ? 'text-orange-600' : 'text-gray-600'}`}>{message}</p>
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
            ].map((item) => (
              <Link key={item.href} href={item.href} className="flex flex-col items-center group transition-all duration-200">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200 mb-2 group-hover:bg-orange-200 group-hover:border-orange-400 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <i className={`fas ${item.icon} text-2xl text-orange-600 group-hover:text-orange-700`}></i>
                </div>
                <span className="text-xs text-center text-gray-700 group-hover:text-orange-600 font-medium transition-colors">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Recommended Products */}
          <h3 className="font-bold text-lg mb-4 text-gray-800">สินค้าแนะนำสำหรับคุณ</h3>
          <div className="relative">
            <button onClick={goToPrevPage} disabled={currentPage === 0} className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 transition-all ${currentPage === 0 ? 'opacity-50' : 'hover:border-orange-400'}`}>
              <i className="fas fa-chevron-left text-orange-500 text-xl"></i>
            </button>

            <div ref={carouselRef} className="flex space-x-4 overflow-x-auto pb-6 px-12 scrollbar-hide snap-x snap-mandatory" style={{ scrollSnapType: 'x mandatory' }}>
              {products.map(p => (
                <div key={p.id} className="flex-shrink-0 w-40 snap-start bg-white rounded-2xl border-2 border-orange-100 shadow-lg p-4 flex flex-col items-center hover:scale-105 transition-transform">
                  <div className="w-full h-32 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                    <img src={p.img} alt={p.alt} className="w-20 h-20 object-contain" />
                  </div>
                  <h4 className="text-sm font-medium text-center line-clamp-2 text-gray-800">{p.name}</h4>
                  <button className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2.5 rounded-full font-medium">
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              ))}
            </div>

            <button onClick={goToNextPage} disabled={currentPage >= totalPages - 1} className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 transition-all ${currentPage >= totalPages - 1 ? 'opacity-50' : 'hover:border-orange-400'}`}>
              <i className="fas fa-chevron-right text-orange-500 text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}