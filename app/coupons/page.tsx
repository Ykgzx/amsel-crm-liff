// app/coupons/page.tsx — รองรับโครงสร้างจริง 100%
'use client';

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import liff from "@line/liff";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.amsel-crm.com";

interface Coupon {
  id: number;
  title: string;
  code: string;
  discount: string; // string เพราะบางทีเป็น "20%" หรือ "100"
  type: "FIXED_AMOUNT" | "PERCENTAGE";
  minPurchaseAmount?: string | null;
  maxDiscount?: string | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

interface ApiResponse {
  coupons: Coupon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        await liff.ready;
        const accessToken = liff.getAccessToken();
        const profile = liff.isLoggedIn() ? await liff.getProfile() : null;

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (accessToken && profile) {
          headers["Authorization"] = `Bearer ${accessToken}`;
          headers["X-Line-UserId"] = profile.userId;
        }

        const res = await fetch(`${BACKEND_URL}/api/coupons`, { headers });
        if (!res.ok) throw new Error("ไม่สามารถดึงคูปองได้");

        const data: ApiResponse = await res.json();
        const activeCoupons = data.coupons.filter(c => c.isActive);
        setCoupons(activeCoupons);
      } catch (err) {
        console.error("Fetch coupons error:", err);
        setError("โหลดคูปองไม่สำเร็จ กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // แปลงประเภทส่วนลดให้อ่านง่าย
  const formatDiscount = (coupon: Coupon) => {
    if (coupon.type === "PERCENTAGE") {
      return `ลด ${coupon.discount}%`;
    }
    return `ลด ${parseInt(coupon.discount).toLocaleString()} บาท`;
  };

  // เงื่อนไขการใช้
  const getCondition = (coupon: Coupon) => {
    if (!coupon.minPurchaseAmount) return "ไม่มีขั้นต่ำ";
    return `เมื่อซื้อครบ ${parseInt(coupon.minPurchaseAmount).toLocaleString()} บาท`;
  };

  // แปลงวันที่
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return "หมดเขตวันนี้";
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Badge พิเศษ
  const getBadge = (coupon: Coupon) => {
    const now = new Date();
    const until = new Date(coupon.validUntil);
    const daysLeft = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) return "หมดเร็ว!";
    if (coupon.type === "PERCENTAGE" && parseInt(coupon.discount) >= 20) return "HOT!";
    return null;
  };

  // Loading
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen pt-24 pb-12">
          <div className="max-w-md mx-auto px-6 pt-10">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
            </div>
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error
  if (error) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen pt-24 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-6xl mb-4">Error</div>
            <p className="text-red-600 text-lg mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold">
              ลองใหม่
            </button>
          </div>
        </div>
      </>
    );
  }

  // Empty
  if (coupons.length === 0) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen pt-24 pb-12">
          <div className="max-w-md mx-auto px-6 pt-10 text-center">
            <div className="text-6xl mb-6">No coupons</div>
            <p className="text-xl text-gray-600">ยังไม่มีคูปองในตอนนี้<br />กรุณารอโปรโมชั่นใหม่เร็วๆ นี้!</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-white min-h-screen pt-24 pb-12">
        <div className="max-w-md mx-auto px-6 pt-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full border-4 border-orange-200 mb-4">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10v10H7V7z M12 2v20 M2 12h20" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v8" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">คูปองของฉัน</h1>
            <p className="text-gray-600 mt-2">กดคัดลอกแล้วนำไปใช้ตอนชำระเงินได้เลย!</p>
          </div>

          {/* Coupons List */}
          <div className="space-y-5">
            {coupons.map((coupon, index) => {
              const badge = getBadge(coupon);

              return (
                <div
                  key={coupon.id}
                  className="bg-white border-2 border-orange-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative"
                >
                  {badge && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 animate-pulse">
                      {badge}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-3xl font-extrabold text-orange-600">
                          {formatDiscount(coupon)}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mt-1">{coupon.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{getCondition(coupon)}</p>
                      </div>

                      <div className="text-right ml-4">
                        <div className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-lg tracking-wider">
                          {coupon.code}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <p className="text-gray-500">
                        ใช้ได้ถึง: <span className="font-medium text-gray-700">{formatDate(coupon.validUntil)}</span>
                      </p>

                      <button
                        onClick={() => handleCopy(coupon.code, index)}
                        className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-md ${
                          copiedIndex === index
                            ? "bg-green-500 text-white"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        {copiedIndex === index ? (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            คัดลอกแล้ว!
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            คัดลอกคูปอง
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              * คูปอง 1 ท่าน ใช้ได้ 1 ครั้งต่อการสั่งซื้อ<br />
              * กรุณากรอกคูปองที่หน้าเช็คเอาท์
            </p>
          </div>

        </div>
      </div>
    </>
  );
}