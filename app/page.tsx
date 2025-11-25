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

  // Mock data
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

  const tiers = [
    { name: 'Silver', minPoints: 0, maxPoints: 2000, color: 'bg-gray-300', textColor: 'text-gray-800', nextTier: 'Gold', nextAmount: 0 },
    { name: 'Gold', minPoints: 2000, maxPoints: 5000, color: 'bg-yellow-500', textColor: 'text-white', nextTier: 'Platinum', nextAmount: 5000 - currentPoints },
    { name: 'Platinum', minPoints: 5000, maxPoints: Infinity, color: 'bg-blue-600', textColor: 'text-white', nextTier: '', nextAmount: 0 },
  ];

  const currentTierIndex = tiers.findIndex(tier => currentPoints >= tier.minPoints && currentPoints < tier.maxPoints);
  const currentTier = tiers[currentTierIndex] || tiers[tiers.length - 1];

  const progressPercent = currentTier.maxPoints === Infinity
    ? 100
    : Math.min(100, ((currentPoints - currentTier.minPoints) / (currentTier.maxPoints - currentTier.minPoints)) * 100);

  // === LIFF Initialization + แก้ปัญหาเลื่อนลงกลางหน้า ===
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

        // ใช้ liff.ready เพื่อให้แน่ใจว่า LIFF + DOM พร้อมจริง ๆ
        liff.ready.then(() => {
          setIsLiffReady(true);

          // 1. เลื่อนขึ้นด้านบนสุดทันที (แก้ปัญหาเปิดจาก LINE)
          window.scrollTo(0, 0);

          // 2. รอ 800ms ให้ผู้ใช้เห็นโลโก้ก่อน แล้วค่อยเลื่อนไป Tier ปัจจุบัน (สวยมาก)
          setTimeout(() => {
            const activeCard = memberCardRef.current?.children[currentTierIndex] as HTMLElement;
            if (activeCard) {
              activeCard.scrollIntoView({
                behavior: 'smooth',
                inline: 'start',
              });
            }
          }, 800);
        });

      } catch (error) {
        console.error('LIFF init error:', error);
        setLiffError('กรุณาเปิดผ่านแอป LINE เท่านั้น');
        setIsLiffReady(true);
      }
    };

    initLiff();
  }, [currentTierIndex]);

  // === ฟังก์ชันเลื่อนสินค้า ===
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      carouselRef.current?.scrollBy({ left: 220 * 2, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      carouselRef.current?.scrollBy({ left: -220 * 2, behavior: 'smooth' });
    }
  };

  // === Loading & Error ===
  if (!isLiffReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  if (liffError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-lg">{liffError}</div>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600"
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
        <div className="max-w-md mx-auto px-6">

          {/* Member Card Header */}
          <div className="mb-6 text-center">
            <div className="bg-orange-500 rounded-full px-6 py-2 w-fit mx-auto">
              <h2 className="font-bold text-xl text-white">Member Card</h2>
            </div>
          </div>

          {/* Tier Carousel */}
          <div className="relative overflow-hidden mb-8">
            <div
              ref={memberCardRef}
              className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {tiers.map((tier, index) => {
                const isCurrent = index === currentTierIndex;
                const displayPoints = isCurrent ? currentPoints : index < currentTierIndex ? tier.maxPoints - 1 : tier.minPoints;
                const progressWidth = isCurrent ? progressPercent : index < currentTierIndex ? 100 : 0;

                const message = index < currentTierIndex
                  ? 'คุณบรรลุ Tier นี้แล้ว'
                  : index === currentTierIndex
                  ? `ซื้ออีก ${tier.nextAmount.toLocaleString()} บาท เพื่อเลื่อนเป็น ${tier.nextTier} Tier`
                  : `ขาดอีก ${tier.nextAmount.toLocaleString()} บาท เพื่อเลื่อนเป็น ${tier.name} Tier`;

                return (
                  <div
                    key={tier.name}
                    className={`flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl border p-5 transition-all ${
                      isCurrent ? 'border-orange-300 shadow-lg' : 'border-transparent'
                    }`}
                  >
                    <div className={`w-full h-14 rounded-xl flex items-center justify-center mb-4 ${tier.color} ${tier.textColor}`}>
                      <span className="font-bold text-xl">{tier.name} Tier</span>
                    </div>
                    <p className="text-gray-800 mb-2">
                      ยินดีต้อนรับ, <span className="font-bold">{profile?.displayName || 'สมาชิก'}</span>
                    </p>
                    <p className="text-gray-700 mb-4">
                      คะแนนปัจจุบัน: <span className="font-bold text-orange-600 text-xl">{displayPoints.toLocaleString()}</span>
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div className={`h-3 rounded-full transition-all ${tier.color}`} style={{ width: `${progressWidth}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-600">{message}</p>
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
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200 mb-2">
                  <i className={`fas ${item.icon} text-2xl text-orange-600`}></i>
                </div>
                <span className="text-sm text-gray-700 text-center">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Recommended Products */}
          <h3 className="font-bold text-xl mb-5 text-gray-800">สินค้าแนะนำสำหรับคุณ</h3>

          <div className="relative">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 transition-all ${
                currentPage === 0 ? 'opacity-50' : 'hover:border-orange-400'
              }`}
            >
              <i className="fas fa-chevron-left text-orange-500 text-xl"></i>
            </button>

            <div
              ref={carouselRef}
              className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-10"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-40 snap-start bg-white rounded-2xl border-2 border-orange-100 shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-all"
                >
                  <div className="w-full h-32 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                    <img src={product.img} alt={product.alt} className="w-20 h-20 object-contain" />
                  </div>
                  <h4 className="text-sm font-medium text-center line-clamp-2 text-gray-800 mb-3">
                    {product.name}
                  </h4>
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-full text-sm transition-colors">
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg border-2 border-orange-200 transition-all ${
                currentPage >= totalPages - 1 ? 'opacity-50' : 'hover:border-orange-400'
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