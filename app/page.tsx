'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import liff from '@line/liff';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import MemberCardCarousel from './components/MemberCardCarousel';

// --- Interfaces ---
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
  role: 'user' | 'admin'; // เราจะแปลงให้เป็น lowercase เสมอ
}

// --- Constants ---
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.amsel-crm.com';
const CACHE_KEY = 'amsel_home_cache_v6'; // เปลี่ยน version เพราะแก้ logic role
const CACHE_LIFETIME = 5 * 60 * 1000; // 5 นาที

export default function Home() {
  const router = useRouter();
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
  const [hasMounted, setHasMounted] = useState(false);

  // ป้องกัน Hydration + Scroll to top
  useEffect(() => {
    setHasMounted(true);
    window.scrollTo(0, 0);
  }, []);

  // --- Cache ---
  const saveToCache = useCallback((l: LiffProfile, u: UserFullProfile) => {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        liffProfile: l,
        userProfile: u,
        cachedAt: Date.now(),
      })
    );
  }, []);

  // โหลดจาก Cache (ถ้าเป็น admin จาก cache → redirect ทันที)
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { liffProfile: l, userProfile: u } = JSON.parse(cached);
        setLiffProfile(l);
        setUserProfile(u);
        setIsLiffReady(true);

        if (u.role === 'admin') {
          router.replace('/admin');
        }
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }, [router]);

  // --- ดึง Profile + ตรวจ Role + Redirect ---
  const fetchUserFullProfile = useCallback(
    async (lineUserId: string, liffProf: LiffProfile) => {
      await liff.ready;
      const token = liff.getAccessToken();
      if (!token) return;
      console.log(token);
      console.log(liff.getIDToken());
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');

        const data = await res.json();

        // สำคัญ: แปลง role ให้เป็น lowercase แล้วเช็ค
        const normalizedRole = (data.role || 'USER').toString().toLowerCase();
        const isAdmin = normalizedRole === 'admin';

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
          role: isAdmin ? 'admin' : 'user', // ส่งออกเป็น lowercase เสมอ
        };

        // ถ้าเป็น admin → redirect ไปหน้า admin ทันที
        if (isAdmin) {
          localStorage.removeItem(CACHE_KEY); // ล้าง cache เก่า
          router.replace('/admin');
          return;
        }

        setUserProfile(profile);
        saveToCache(liffProf, profile);
      } catch (err) {
        console.error('Fetch profile failed:', err);
      }
    },
    [saveToCache, router]
  );

  // --- LIFF Init ---
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

        await fetchUserFullProfile(profile.userId, profile);
      } catch (err) {
        console.error('LIFF init error:', err);
        setLiffError('กรุณาเปิดผ่านแอป LINE เท่านั้น');
        setIsLiffReady(true);
      }
    };

    init();
  }, [fetchUserFullProfile]);

  // Auto refresh
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && liffProfile && userProfile?.role !== 'admin') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { cachedAt } = JSON.parse(cached);
            if (Date.now() - cachedAt > CACHE_LIFETIME) {
              fetchUserFullProfile(liffProfile.userId, liffProfile);
            }
          } catch {}
        }
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [liffProfile, userProfile, fetchUserFullProfile]);

  // Handlers
  const handleRefresh = async () => {
    if (!liffProfile || isRefreshing) return;
    setIsRefreshing(true);
    await fetchUserFullProfile(liffProfile.userId, liffProfile);
    setIsRefreshing(false);
  };

  const toggleDetails = (tier: string) => {
    setShowDetails((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

  const goToNextPage = () => {
    if (currentPage < 2 && carouselRef.current) {
      setCurrentPage((p) => p + 1);
      carouselRef.current.scrollLeft += 440;
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0 && carouselRef.current) {
      setCurrentPage((p) => p - 1);
      carouselRef.current.scrollLeft -= 440;
    }
  };

  const displayName = hasMounted
    ? userProfile?.title
      ? `${userProfile.title} ${userProfile.firstName} ${userProfile.lastName}`
      : `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || liffProfile?.displayName || 'สมาชิก'
    : 'สมาชิก';

  // ถ้ายังโหลดอยู่
  if (!isLiffReady || !hasMounted) {
    return (
      <>
        <Navbar />
        <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen pt-26 pb-10">
          <div className="max-w-md mx-auto p-6 text-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-8 py-4 w-fit mx-auto shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white">Member Card</h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl p-6 bg-gray-100 border border-gray-200 shadow-lg animate-pulse">
                  <div className="h-16 bg-gray-300 rounded-2xl mb-6" />
                  <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4" />
                  <div className="h-32 bg-gray-200 rounded-xl" />
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

  // สำคัญ: ถ้าเป็น admin แล้วยังไม่ redirect (กรณี cache เก่า)
  if (userProfile?.role === 'admin') {
    return null; // หรือใส่ Loading ก็ได้
  }

  // หน้า Home ปกติ (เฉพาะ user)
  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-orange-50 to-white min-h-screen pt-26 pb-20">
        <div className="max-w-md mx-auto p-6">
          <div className="mb-8 text-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full px-8 py-4 w-fit mx-auto shadow-2xl">
              <h2 className="text-2xl font-bold text-white">Member Card</h2>
            </div>
          </div>

          <MemberCardCarousel
            fullName={displayName}
            currentPoints={userProfile?.points || 0}
            accumulatedPoints={userProfile?.accumulatedPoints || 0}
            currentTier={userProfile?.tier || 'SILVER'}
            userProfile={userProfile}
            showDetails={showDetails}
            onToggleDetails={toggleDetails}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          {/* Menu Links */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {[
              { icon: 'fa-ticket-alt', label: 'คูปองของฉัน', href: '/coupons' },
              { icon: 'fa-clipboard-list', label: 'ประวัติการสั่งซื้อ', href: '/history' },
              { icon: 'fa-map-marker-alt', label: 'ที่อยู่', href: '/addresses' },
              { icon: 'fa-comment-dots', label: 'รีวิว', href: '/reviews' },
              { icon: 'fa-receipt', label: 'อัปโหลดใบเสร็จ', href: '/receiptupload' },
              { icon: 'fa-question-circle', label: 'ช่วยเหลือ', href: '/help' },
              { icon: 'fa-gift', label: 'แลกของรางวัล', href: '/rewardstore' },
            ].map((item) => (
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

          {/* Recommended Products */}
          <h3 className="text-2xl font-bold mb-6 text-center">สินค้าแนะนำสำหรับคุณ</h3>
          <div className="relative">
            <button onClick={goToPrevPage} disabled={currentPage === 0} className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-4 shadow-2xl border-4 border-orange-200 transition-all ${currentPage === 0 ? 'opacity-50' : 'hover:border-orange-500 hover:scale-110'}`}>
              <i className="fas fa-chevron-left text-orange-600 text-2xl" />
            </button>

            <div ref={carouselRef} className="flex space-x-6 overflow-x-auto pb-8 px-16 scrollbar-hide snap-x snap-mandatory">
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

            <button onClick={goToNextPage} disabled={currentPage >= 2} className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-4 shadow-2xl border-4 border-orange-200 transition-all ${currentPage >= 2 ? 'opacity-50' : 'hover:border-orange-500 hover:scale-110'}`}>
              <i className="fas fa-chevron-right text-orange-600 text-2xl" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}