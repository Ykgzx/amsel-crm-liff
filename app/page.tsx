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

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const memberCardRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);

  // Mock data — คะแนนปัจจุบัน: 3,000 → อยู่ใน Gold Tier
  const currentPoints = 3000;

  const products = [
    { id: 1, name: 'แอมเซลกลูต้า พลัส เรด ออเร้นจ์ เอ็กซ์แทร็คซ์', img: '/gluta.png', alt: 'กลูต้า' },
    { id: 2, name: 'แอมเซลซิงค์พลัส วิตามิน พรีมิกซ์', img: '/zinc.png', alt: 'ซิงค์พลัส' },
    { id: 3, name: 'แอมเซลวิตามินซี 500 มก.', img: '/Vitamin-C.png', alt: 'วิตามินซี' },
    { id: 4, name: 'แอมเซลมัลติวิต พลัส', img: '/Amsel-Multi-Vit-Plus.png', alt: 'มัลติวิต' },
    { id: 5, name: 'แอมเซลแคลเซียม แอลทรีโอเนต พลัส คอลลาเจนไทพ์ทู', img: '/Calcium.png', alt: 'แคลเซียม' },
    { id: 6, name: 'แอมเซลอะมิโนบิลเบอร์รี่ สกัด พลัส', img: '/amsel-amino-bilberry.png', alt: 'บิลเบอร์รี่' },
  ];

  const totalPages = Math.ceil(products.length / 2);

  // Tier data — แสดงทั้ง 3 Tier
  const tiers = [
    {
      name: 'Silver',
      minPoints: 0,
      maxPoints: 2000,
      color: 'bg-gray-300',
      textColor: 'text-gray-800',
      nextTier: 'Gold',
      nextAmount: 0,
    },
    {
      name: 'Gold',
      minPoints: 2000,
      maxPoints: 5000,
      color: 'bg-yellow-500',
      textColor: 'text-white',
      nextTier: 'Platinum',
      nextAmount: 5000 - currentPoints, // 2000
    },
    {
      name: 'Platinum',
      minPoints: 5000,
      maxPoints: Infinity,
      color: 'bg-blue-600',
      textColor: 'text-white',
      nextTier: '',
      nextAmount: 5000 - currentPoints, // 2000
    },
  ];

  // หา Tier ปัจจุบัน
  const currentTierIndex = tiers.findIndex(
    (tier) => currentPoints >= tier.minPoints && currentPoints < tier.maxPoints
  );
  const currentTier = tiers[currentTierIndex] || tiers[tiers.length - 1];

  const progressPercent =
    currentTier.maxPoints === Infinity
      ? 100
      : Math.min(100, ((currentPoints - currentTier.minPoints) / (currentTier.maxPoints - currentTier.minPoints)) * 100);

  // === เริ่มต้น LIFF ===
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        console.log(liff.getAccessToken())
        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile();
          setProfile(userProfile);
        } else {
          liff.login();
          return;
        }
        setIsLiffReady(true);
      } catch (error) {
        console.error('LIFF init error:', error);
        setLiffError('กรุณาเปิดผ่านแอป LINE');
        setIsLiffReady(true);
      }
    };

    initLiff();
  }, []);

  // === เลื่อนไปยัง Tier ปัจจุบันทันทีเมื่อโหลดเสร็จ ===
  useEffect(() => {
    if (isLiffReady && memberCardRef.current) {
      const scrollActiveTier = () => {
        const cards = Array.from(memberCardRef.current?.children || []);
        const activeCard = cards[currentTierIndex] as HTMLElement | undefined;
        if (activeCard) {
          activeCard.scrollIntoView({ behavior: 'auto', inline: 'start' });
        }
      };

      // หน่วงเล็กน้อยเพื่อให้แน่ใจว่า DOM render ครบ
      const timer = setTimeout(scrollActiveTier, 50);
      return () => clearTimeout(timer);
    }
  }, [isLiffReady, currentTierIndex]);

  // === ฟังก์ชันเลื่อนสินค้า ===
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      if (carouselRef.current) {
        carouselRef.current.scrollBy({ left: 220 * 2, behavior: 'smooth' });
      }
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      if (carouselRef.current) {
        carouselRef.current.scrollBy({ left: -220 * 2, behavior: 'smooth' });
      }
    }
  };

  // === แสดงสถานะ loading หรือ error ===
  if (!isLiffReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">{liffError}</div>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            ย้อนกลับ
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
          <div className="mb-4">
            <div className="bg-orange-500 rounded-full px-4 py-2 w-fit">
              <h2 className="font-bold text-lg text-white">Member Card</h2>
            </div>
          </div>

          {/* Tier Carousel - ไม่มีปุ่ม, ใช้ swipe เท่านั้น */}
          <div className="relative overflow-hidden">
            <div
              ref={memberCardRef}
              className="flex space-x-4 overflow-x-auto pb-4 px-4 scrollbar-hide snap-x snap-mandatory"
              style={{
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
              }}
            >
              {tiers.map((tier, index) => {
                const isCurrent = index === currentTierIndex;
                const displayPoints =
                  index === currentTierIndex
                    ? currentPoints
                    : index < currentTierIndex
                    ? tier.maxPoints - 1
                    : tier.minPoints;

                const progressWidth =
                  index === currentTierIndex
                    ? progressPercent
                    : index < currentTierIndex
                    ? 100
                    : 0;

                let message = '';
                if (index < currentTierIndex) {
                  message = 'คุณบรรลุ Tier นี้แล้ว';
                } else if (index === currentTierIndex) {
                  message = `ซื้ออีก ${tier.nextAmount.toLocaleString()} บาท เพื่อเลื่อนเป็น ${tier.nextTier} Tier`;
                } else {
                  message = `ขาดอีก ${tier.nextAmount.toLocaleString()} บาท เพื่อเลื่อนเป็น ${tier.name} Tier`;
                }

                return (
                  <div
                    key={tier.name}
                    className={`flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl ${
                      isCurrent ? 'border border-gray-200' : 'border border-transparent'
                    } p-4 transition-transform`}
                    style={{
                      scrollSnapAlign: 'start',
                    }}
                  >
                    <div className={`w-full h-12 rounded-xl flex items-center justify-center mb-3 ${tier.color} ${tier.textColor}`}>
                      <span className="font-bold text-lg">{tier.name} Tier</span>
                    </div>

                    <p className="text-gray-800 mb-2">
                      ยินดีต้อนรับ, <span className="font-bold">{profile?.displayName || 'สมาชิก'}</span>
                    </p>

                    <p className="text-gray-700 mb-3">
                      คะแนนปัจจุบัน: <span className="font-bold text-orange-600">{currentPoints}</span>
                    </p>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all ${tier.color}`}
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                    </div>

                    <p className="text-sm text-gray-600">{message}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {[
              { icon: 'fa-ticket-alt', label: 'คูปองของฉัน' },
              { icon: 'fa-clipboard-list', label: 'ประวัติการสั่งซื้อ' },
              { icon: 'fa-map-marker-alt', label: 'ที่อยู่' },
              { icon: 'fa-comment-dots', label: 'รีวิว' },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center border border-orange-200 mb-2">
                  <i className={`fas ${item.icon} text-xl text-orange-600`}></i>
                </div>
                <span className="text-xs text-center text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Recommended Section */}
          <h3 className="font-bold text-lg mb-4 text-gray-800">สินค้าแนะนำสำหรับคุณ</h3>

          <div className="relative">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md border border-orange-200 transition-all ${
                currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:border-orange-400'
              }`}
            >
              <i className="fas fa-chevron-left text-orange-500 text-lg"></i>
            </button>

            <div
              ref={carouselRef}
              className="flex space-x-4 overflow-x-auto pb-4 px-12 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-40 snap-start bg-white rounded-2xl border border-orange-100 shadow-md p-3 flex flex-col items-center transition-transform hover:scale-105"
                >
                  <div className="w-full h-32 bg-orange-50 rounded-xl flex items-center justify-center mb-2">
                    <img
                      src={product.img}
                      alt={product.alt}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-center line-clamp-1 w-full text-gray-800">
                    {product.name}
                  </h4>
                  <button className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-2 rounded-full font-medium transition-colors shadow-sm">
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md border border-orange-200 transition-all ${
                currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:border-orange-400'
              }`}
            >
              <i className="fas fa-chevron-right text-orange-500 text-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}