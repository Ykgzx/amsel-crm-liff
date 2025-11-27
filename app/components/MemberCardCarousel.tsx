// components/MemberCardCarousel.tsx
'use client';

import { useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

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
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export default function MemberCardCarousel({
  fullName,
  currentPoints,
  accumulatedPoints,
  currentTier,
  userProfile,
  showDetails,
  onToggleDetails,
  onRefresh,
  isRefreshing = false,
}: MemberCardCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll ไป Tier ปัจจุบัน
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
      {/* ปุ่ม Refresh มุมขวาบน */}
      {onRefresh && (
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-3.5 rounded-full shadow-xl border-2 transition-all duration-300 flex items-center justify-center ${
              isRefreshing
                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-500 hover:scale-110 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 pt-16"
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
              className={`flex-shrink-0 w-[calc(100%-2rem)] snap-start rounded-2xl p-6 shadow-xl border-4 transition-all ${
                isCurrent
                  ? 'border-orange-500 scale-105 shadow-2xl'
                  : 'border-transparent shadow-lg'
              } bg-white relative`}
            >
              {/* Tier Header */}
              <div className={`w-full h-16 rounded-2xl flex items-center justify-center mb-6 ${tier.color} ${tier.text} shadow-md`}>
                <span className="text-2xl font-bold">{tier.display} Tier</span>
              </div>

              {/* ชื่อ-นามสกุล */}
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm">ชื่อ-นามสกุล</p>
                <p className="text-2xl font-bold text-orange-600">{fullName}</p>
              </div>

              {/* ปุ่มดูข้อมูล */}
              <button
                onClick={() => onToggleDetails(tier.name)}
                className="w-full flex justify-center items-center gap-3 py-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl mb-5 hover:from-gray-200 transition font-medium"
              >
                <span>{showDetails[tier.name] ? 'ซ่อน' : 'ดูข้อมูลส่วนตัว'}</span>
                <i className={`fas fa-chevron-${showDetails[tier.name] ? 'up' : 'down'} text-orange-600 text-lg`} />
              </button>

              {/* ข้อมูลส่วนตัว */}
              {showDetails[tier.name] && (
                <div className="text-sm space-y-4 border-t-2 border-orange-100 pt-4 mb-6 bg-orange-50/50 rounded-xl p-4">
                  <div className="flex justify-between"><span className="text-gray-600">อีเมล</span><span className="font-medium">{userProfile?.email || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">เบอร์โทร</span><span className="font-medium">{userProfile?.phoneNumber || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">วันเกิด</span><span className="font-medium">
                    {userProfile?.birthDate
                      ? new Date(userProfile.birthDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </span></div>
                </div>
              )}

              {/* คะแนนแลกได้ */}
              <div className="text-center my-8">
                <p className="text-lg text-gray-700 mb-2">คะแนนที่ใช้แลกได้</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-5xl font-bold text-orange-600">
                    {currentPoints.toLocaleString()}
                  </p>
                  <span className="text-2xl text-orange-500 font-medium">แต้ม</span>
                  {isRefreshing && <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-6 mb-5 overflow-hidden shadow-inner">
                <div
                  className={`h-full ${tier.color} transition-all duration-1000 ease-out relative overflow-hidden`}
                  style={{ width: `${isCurrent || isAchieved ? (isAchieved ? 100 : progress) : 0}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                </div>
              </div>

              {/* ข้อความสถานะ */}
              <p className="text-center text-sm font-semibold text-gray-700 bg-orange-50 py-3 rounded-xl">
                {isAchieved
                  ? 'คุณบรรลุ Tier นี้แล้ว!'
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