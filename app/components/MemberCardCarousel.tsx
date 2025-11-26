// components/MemberCardCarousel.tsx
'use client';

import { useRef, useEffect } from 'react';

const TIER_CONFIG = [
  { name: 'SILVER' as const,    min: 0,     max: 2000,   color: 'bg-gray-300',   text: 'text-gray-800',   display: 'Silver' },
  { name: 'GOLD' as const,      min: 2000,  max: 5000,   color: 'bg-yellow-500', text: 'text-white',      display: 'Gold' },
  { name: 'PLATINUM' as const,  min: 5000,  max: Infinity, color: 'bg-blue-600', text: 'text-white',      display: 'Platinum' },
] as const;

interface MemberCardCarouselProps {
  fullName: string;
  currentPoints: number;
  accumulatedPoints: number;
  currentTier: 'SILVER' | 'GOLD' | 'PLATINUM';
  userProfile: {
    email?: string | null;
    phoneNumber?: string | null;
    birthDate?: string | null;
  } | null;
  showDetails: Record<string, boolean>;
  onToggleDetails: (tierName: string) => void;
}

export default function MemberCardCarousel({
  fullName,
  currentPoints,
  accumulatedPoints,
  currentTier,
  userProfile,
  showDetails,
  onToggleDetails,
}: MemberCardCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll ไปที่ Tier ปัจจุบัน
  useEffect(() => {
    if (!containerRef.current) return;
    const index = TIER_CONFIG.findIndex(t => t.name === currentTier);
    if (index >= 0) {
      setTimeout(() => {
        containerRef.current?.children[index]?.scrollIntoView({
          behavior: 'smooth',
          inline: 'start',
        });
      }, 300);
    }
  }, [currentTier]);

  return (
    <div className="relative overflow-hidden mb-8">
      <div
        ref={containerRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
      >
        {TIER_CONFIG.map((tier) => {
          const isCurrent = tier.name === currentTier;
          const isAchieved = accumulatedPoints >= tier.max && tier.max !== Infinity;

          const progress = tier.max === Infinity
            ? 100
            : Math.min(100, ((accumulatedPoints - tier.min) / (tier.max - tier.min)) * 100);

          const remaining = tier.max === Infinity ? 0 : Math.max(0, tier.max - accumulatedPoints);

          return (
            <div
              key={tier.name}
              className={`flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl p-6 shadow-lg border ${
                isCurrent ? 'border-4 border-orange-500 scale-105' : 'border-gray-200'
              }`}
            >
              {/* Tier Header */}
              <div className={`w-full h-14 rounded-xl flex items-center justify-center mb-6 ${tier.color} ${tier.text}`}>
                <span className="font-bold text-xl">{tier.display} Tier</span>
              </div>

              {/* ชื่อ-นามสกุล */}
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm">ชื่อ-นามสกุล</p>
                <p className="text-xl font-bold text-orange-600">{fullName}</p>
              </div>

              {/* ปุ่มดูข้อมูล */}
              <button
                onClick={() => onToggleDetails(tier.name)}
                className="w-full flex justify-center gap-2 py-3 bg-gray-100 rounded-xl mb-4"
              >
                <span className="text-sm">
                  {showDetails[tier.name] ? 'ซ่อน' : 'ดูข้อมูลส่วนตัว'}
                </span>
                <i className={`fas fa-chevron-${showDetails[tier.name] ? 'up' : 'down'} text-orange-500`} />
              </button>

              {/* ข้อมูลส่วนตัว */}
              {showDetails[tier.name] && (
                <div className="text-sm space-y-3 border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">อีเมล</span>
                    <span>{userProfile?.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">เบอร์โทร</span>
                    <span>{userProfile?.phoneNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">วันเกิด</span>
                    <span>
                      {userProfile?.birthDate
                        ? new Date(userProfile.birthDate).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : '-'}
                    </span>
                  </div>
                </div>
              )}

              {/* คะแนนแลกได้ */}
              <div className="text-center my-6">
                <p className="text-lg text-gray-700">คะแนนที่ใช้แลกได้</p>
                <p className="text-3xl font-bold text-orange-600">
                  {currentPoints.toLocaleString()} <span className="text-lg">แต้ม</span>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-5 mb-4 overflow-hidden">
                <div
                  className={`h-full ${tier.color} transition-all duration-1000`}
                  style={{ width: `${isCurrent || isAchieved ? (isAchieved ? 100 : progress) : 0}%` }}
                />
              </div>

              {/* ข้อความสถานะ */}
              <p className="text-center text-sm text-gray-600">
                {isAchieved
                  ? 'คุณบรรลุ Tier นี้แล้ว'
                  : isCurrent
                    ? tier.max === Infinity
                      ? 'ยินดีด้วย! คุณอยู่ Tier สูงสุด'
                      : `ซื้ออีก ${remaining.toLocaleString()} บาท เพื่อไป Platinum`
                    : `ขาดอีก ${Math.max(0, tier.min - accumulatedPoints).toLocaleString()} บาท`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}