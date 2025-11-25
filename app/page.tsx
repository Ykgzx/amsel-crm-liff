// app/page.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import liff from '@line/liff';
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.amsel-crm.com';

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const memberCardRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [liffProfile, setLiffProfile] = useState<LiffProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserFullProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
  ];

  const currentPoints = userProfile?.points || 0;

  const currentTierIndex = baseTiers.findIndex(
    (tier) => currentPoints >= tier.minPoints && (tier.maxPoints === Infinity || currentPoints < tier.maxPoints)
  );

  const currentTier = baseTiers[currentTierIndex] || baseTiers[baseTiers.length - 1];

  const progressPercent =
    currentTier.maxPoints === Infinity
      ? 100
      : Math.min(100, ((currentPoints - currentTier.minPoints) / (currentTier.maxPoints - currentTier.minPoints)) * 100);

  const formatBirthDate = (isoString: string | null | undefined) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('th-TH', options);
  };

  const fetchUserFullProfile = async (lineUserId: string) => {
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

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data: UserFullProfile = await response.json();

      setUserProfile({
        points: data.points || 0,
        title: data.title,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        birthDate: data.birthDate,
      });

    } catch (err) {
      console.warn('ใช้ข้อมูลสำรอง (Backend ไม่ตอบสนอง)', err);
      setUserProfile({
        points: 3000,
        firstName: liffProfile?.displayName?.split(' ')[0] || 'สมาชิก',
        lastName: liffProfile?.displayName?.split(' ').slice(1).join(' ') || '',
        email: 'example@email.com',
        phoneNumber: '081-234-5678',
        birthDate: '1990-01-01T00:00:00.000Z',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setLiffProfile(profile);
        await fetchUserFullProfile(profile.userId);
        setIsLiffReady(true);

      } catch (error: any) {
        setLiffError('กรุณาเปิดผ่านแอป LINE เท่านั้น');
        setIsLiffReady(true);
      }
    };

    initLiff();
  }, []);

  useEffect(() => {
    if (isLiffReady && memberCardRef.current && !loading && currentTierIndex >= 0) {
      setTimeout(() => {
        const card = memberCardRef.current?.children[currentTierIndex] as HTMLElement;
        card?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
      }, 500);
    }
  }, [isLiffReady, currentTierIndex, loading]);

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

  if (!isLiffReady || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-6 text-lg">กำลังโหลดข้อมูลสมาชิก...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 mx-auto"></div>
        </div>
      </div>
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

          <div className="mb-6">
            <div className="bg-orange-500 rounded-full px-5 py-2 w-fit">
              <h2 className="font-bold text-lg text-white">Member Card</h2>
            </div>
          </div>

          <div className="relative overflow-hidden mb-8">
            <div
              ref={memberCardRef}
              className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {baseTiers.map((tier, index) => {
                const isCurrent = index === currentTierIndex;
                const isAchieved = index < currentTierIndex;
                const isFuture = index > currentTierIndex;

                const pointsToNext = isCurrent && tier.maxPoints !== Infinity
                  ? tier.maxPoints - currentPoints
                  : isFuture ? tier.minPoints - currentPoints : 0;

                let message = '';
                if (isAchieved) message = 'คุณบรรลุ Tier นี้แล้ว';
                else if (isCurrent && tier.nextTier) message = `ซื้ออีก ${pointsToNext.toLocaleString()} บาท เพื่อเลื่อนเป็น ${tier.nextTier} Tier`;
                else if (isCurrent) message = 'ยินดีด้วย! คุณอยู่ระดับสูงสุดแล้ว';
                else message = `ขาดอีก ${pointsToNext.toLocaleString()} บาท เพื่อไป ${tier.name} Tier`;

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

                    <div className="space-y-4 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">อีเมล</span>
                        <span className="font-medium text-gray-800">{userProfile?.email || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">เบอร์โทร</span>
                        <span className="font-medium text-gray-800">{userProfile?.phoneNumber || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">วันเกิด</span>
                        <span className="font-medium text-gray-800">{formatBirthDate(userProfile?.birthDate)}</span>
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <p className="text-lg text-gray-700">คะแนนสะสม</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {currentPoints.toLocaleString()} <span className="text-lg">บาท</span>
                      </p>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-5 mb-5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${tier.color}`}
                        style={{ width: `${isCurrent ? progressPercent : isAchieved ? 100 : 0}%` }}
                      />
                    </div>

                    <p className={`text-center text-sm font-medium ${isCurrent ? 'text-orange-600' : 'text-gray-600'}`}>
                      {message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            {[
              { icon: 'fa-ticket-alt', label: 'คูปองของฉัน' },
              { icon: 'fa-clipboard-list', label: 'ประวัติการสั่งซื้อ' },
              { icon: 'fa-map-marker-alt', label: 'ที่อยู่' },
              { icon: 'fa-comment-dots', label: 'รีวิว' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200 mb-2">
                  <i className={`fas ${item.icon} text-2xl text-orange-600`}></i>
                </div>
                <span className="text-xs text-center text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>

          <h3 className="font-bold text-lg mb-4 text-gray-800">สินค้าแนะนำสำหรับคุณ</h3>
          <div className="relative">
            <button onClick={goToPrevPage} disabled={currentPage === 0}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 transition-all ${currentPage === 0 ? 'opacity-50' : 'hover:border-orange-400'}`}>
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

            <button onClick={goToNextPage} disabled={currentPage >= totalPages - 1}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 transition-all ${currentPage >= totalPages - 1 ? 'opacity-50' : 'hover:border-orange-400'}`}>
              <i className="fas fa-chevron-right text-orange-500 text-xl"></i>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}