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

interface UserProfileResponse {
  points: number;
  // สามารถเพิ่ม field อื่น ๆ ได้ เช่น name, email, tier เป็นต้น
}

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const memberCardRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);

  // สถานะคะแนนจริงจาก backend
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [loadingPoints, setLoadingPoints] = useState(true);

  const products = [
    { id: 1, name: 'แอมเซลกลูต้า พลัส เรด ออเร้นจ์ เอ็กซ์แทร็คซ์', img: '/gluta.png', alt: 'กลูต้า' },
    { id: 2, name: 'แอมเซลซิงค์พลัส วิตามิน พรีมิกซ์', img: '/zinc.png', alt: 'ซิงค์พลัส' },
    { id: 3, name: 'แอมเซลวิตามินซี 500 มก.', img: '/Vitamin-C.png', alt: 'วิตามินซี' },
    { id: 4, name: 'แอมเซลมัลติวิต พลัส', img: '/Amsel-Multi-Vit-Plus.png', alt: 'มัลติวิต' },
    { id: 5, name: 'แอมเซลแคลเซียม แอลทรีโอเนต พลัส คอลลาเจนไทพ์ทู', img: '/Calcium.png', alt: 'แคลเซียม' },
    { id: 6, name: 'แอมเซลอะมิโนบิลเบอร์รี่ สกัด พลัส', img: '/amsel-amino-bilberry.png', alt: 'บิลเบอร์รี่' },
  ];

  const totalPages = Math.ceil(products.length / 2);

  // Tier ทั้งหมด
  const baseTiers = [
    { name: 'Silver', minPoints: 0, maxPoints: 2000, color: 'bg-gray-300', textColor: 'text-gray-800', nextTier: 'Gold' },
    { name: 'Gold', minPoints: 2000, maxPoints: 5000, color: 'bg-yellow-500', textColor: 'text-white', nextTier: 'Platinum' },
    { name: 'Platinum', minPoints: 5000, maxPoints: Infinity, color: 'bg-blue-600', textColor: 'text-white', nextTier: '' },
  ];

  // คำนวณ Tier ปัจจุบัน
  const currentTierIndex = baseTiers.findIndex(
    (tier) => currentPoints >= tier.minPoints && (tier.maxPoints === Infinity || currentPoints < tier.maxPoints)
  );
  const currentTier = baseTiers[currentTierIndex] || baseTiers[baseTiers.length - 1];

  const progressPercent =
    currentTier.maxPoints === Infinity
      ? 100
      : Math.min(100, ((currentPoints - currentTier.minPoints) / (currentTier.maxPoints - currentTier.minPoints)) * 100);

  // ดึงคะแนนจาก Backend
  const fetchUserPoints = async (lineUserId: string) => {
    try {
      const accessToken = liff.getAccessToken();
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Line-UserId': lineUserId,
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: UserProfileResponse = await response.json();
      setCurrentPoints(data.points || 0);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Fallback ใช้ mock data ถ้าเรียก API ไม่ได้
      setCurrentPoints(3000);
      alert('ไม่สามารถดึงข้อมูลคะแนนได้ ขณะนี้ใช้ข้อมูลตัวอย่าง');
    } finally {
      setLoadingPoints(false);
    }
  };

  // LIFF Initialization + ดึงคะแนน
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const userProfile = await liff.getProfile();
        setProfile(userProfile);

        // ดึงคะแนนหลังจากได้ profile
        await fetchUserPoints(userProfile.userId);

        setIsLiffReady(true);
      } catch (error: any) {
        console.error('LIFF init error:', error);
        setLiffError('กรุณาเปิดผ่านแอป LINE เท่านั้น');
        setIsLiffReady(true);
      }
    };

    initLiff();
  }, []);

  // Auto scroll ไปยัง Tier ปัจจุบัน
  useEffect(() => {
    if (isLiffReady && memberCardRef.current && !loadingPoints) {
      const timer = setTimeout(() => {
        const cards = memberCardRef.current?.children;
        if (cards && cards[currentTierIndex]) {
          (cards[currentTierIndex] as HTMLElement).scrollIntoView({
            behavior: 'smooth',
            inline: 'start',
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLiffReady, currentTierIndex, loadingPoints]);

  // Carousel Controls
  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && carouselRef.current) {
      setCurrentPage(currentPage + 1);
      carouselRef.current.scrollBy({ left: 220 * 2, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0 && carouselRef.current) {
      setCurrentPage(currentPage - 1);
      carouselRef.current.scrollBy({ left: -220 * 2, behavior: 'smooth' });
    }
  };

  // Loading States
  if (!isLiffReady || loadingPoints) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">กำลังโหลดข้อมูลสมาชิก...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{liffError}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
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

          {/* Member Card Header */}
          <div className="mb-6">
            <div className="bg-orange-500 rounded-full px-5 py-2 w-fit">
              <h2 className="font-bold text-lg text-white">Member Card</h2>
            </div>
          </div>

          {/* Tier Carousel */}
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

                const displayPoints = isCurrent
                  ? currentPoints
                  : isAchieved
                  ? tier.maxPoints === Infinity ? currentPoints : tier.maxPoints - 1
                  : tier.minPoints;

                const progressWidth = isCurrent
                  ? progressPercent
                  : isAchieved
                  ? 100
                  : 0;

                const pointsToNext = isCurrent && tier.maxPoints !== Infinity
                  ? tier.maxPoints - currentPoints
                  : isFuture
                  ? tier.minPoints - currentPoints
                  : 0;

                let message = '';
                if (isAchieved) {
                  message = 'คุณบรรลุ Tier นี้แล้ว';
                } else if (isCurrent && tier.nextTier) {
                  message = `ซื้ออีก ${pointsToNext.toLocaleString()} บาท เพื่อเลื่อนเป็น ${tier.nextTier} Tier`;
                } else if (isCurrent) {
                  message = 'ยินดีด้วย! คุณอยู่ระดับสูงสุดแล้ว';
                } else {
                  message = `ขาดอีก ${pointsToNext.toLocaleString()} บาท เพื่อไป ${tier.name} Tier`;
                }

                return (
                  <div
                    key={tier.name}
                    className={`flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl p-5 transition-all ${
                      isCurrent ? 'border-4 border-orange-500 shadow-xl scale-105' : 'border border-gray-200'
                    }`}
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className={`w-full h-14 rounded-xl flex items-center justify-center mb-4 ${tier.color} ${tier.textColor}`}>
                      <span className="font-bold text-xl">{tier.name} Tier</span>
                    </div>

                    <p className="text-gray-800 mb-2">
                      ยินดีต้อนรับ, <span className="font-bold">{profile?.displayName || 'สมาชิก'}</span>
                    </p>

                    <p className="text-gray-700 mb-4 text-lg">
                      คะแนนสะสม: <span className="font-bold text-orange-600">{currentPoints.toLocaleString()}</span> บาท
                    </p>

                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${tier.color}`}
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>

                    <p className={`text-sm font-medium ${isCurrent ? 'text-orange-600' : 'text-gray-600'}`}>
                      {message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
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

          {/* Recommended Products */}
          <h3 className="font-bold text-lg mb-4 text-gray-800">สินค้าแนะนำสำหรับคุณ</h3>

          <div className="relative">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 transition-all ${
                currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-400'
              }`}
            >
              <i className="fas fa-chevron-left text-orange-500 text-xl"></i>
            </button>

            <div
              ref={carouselRef}
              className="flex space-x-4 overflow-x-auto pb-6 px-12 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-40 snap-start bg-white rounded-2xl border-2 border-orange-100 shadow-lg p-4 flex flex-col items-center transition-transform hover:scale-105"
                >
                  <div className="w-full h-32 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                    <img src={product.img} alt={product.alt} className="w-20 h-20 object-contain" />
                  </div>
                  <h4 className="text-sm font-medium text-center line-clamp-2 text-gray-800">
                    {product.name}
                  </h4>
                  <button className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2.5 rounded-full font-medium transition-colors">
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 transition-all ${
                currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange-400'
              }`}
            >
              <i className="fas fa-chevron-right text-orange-500 text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}