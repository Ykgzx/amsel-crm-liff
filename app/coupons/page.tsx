// app/coupons/page.tsx — รองรับ FREE_SHIPPING + FIXED_AMOUNT + PERCENTAGE

'use client';

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import liff from "@line/liff";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.amsel-crm.com";

interface Coupon {
  id: number;
  title: string;
  code: string;
  discount: string; // เช่น "100", "20", หรือไม่ใช้ใน FREE_SHIPPING
  type: "FIXED_AMOUNT" | "PERCENTAGE" | "FREE_SHIPPING";
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

  // แสดงส่วนลดให้ถูกต้องตาม type
  const formatDiscount = (coupon: Coupon) => {
    switch (coupon.type) {
      case "FREE_SHIPPING":
        return "ฟรีค่าส่ง";
      case "PERCENTAGE":
        return `ลด ${coupon.discount}%`;
      case "FIXED_AMOUNT":
      default:
        return `ลด ${parseInt(coupon.discount).toLocaleString()} บาท`;
    }
  };

  // เงื่อนไขการใช้
  const getCondition = (coupon: Coupon) => {
    if (coupon.type === "FREE_SHIPPING") {
      return coupon.minPurchaseAmount
        ? `เมื่อซื้อครบ ${parseInt(coupon.minPurchaseAmount).toLocaleString()} บาท`
        : "ทุกออเดอร์";
    }
    if (!coupon.minPurchaseAmount) return "ไม่มีขั้นต่ำ";
    return `เมื่อซื้อครบ ${parseInt(coupon.minPurchaseAmount).toLocaleString()} บาท`;
  };

  // สีและไอคอนพิเศษสำหรับ FREE_SHIPPING
  const getCardStyle = (coupon: Coupon) => {
    if (coupon.type === "FREE_SHIPPING") {
      return "border-green-300 shadow-green-100 hover:shadow-green-200";
    }
    return "border-orange-100 hover:shadow-xl";
  };

  const getGradient = (coupon: Coupon) => {
    if (coupon.type === "FREE_SHIPPING") {
      return "from-green-400 via-emerald-500 to-teal-600";
    }
    return "from-orange-400 via-orange-500 to-orange-600";
  };

  // Badge พิเศษ
  const getBadge = (coupon: Coupon) => {
    const now = new Date();
    const until = new Date(coupon.validUntil);
    const daysLeft = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (coupon.type === "FREE_SHIPPING") return "ฟรีค่าส่ง!";
    if (daysLeft <= 3) return "หมดเร็ว!";
    if (coupon.type === "PERCENTAGE" && parseInt(coupon.discount) >= 20) return "HOT!";
    return null;
  };

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

  // Loading, Error, Empty → เหมือนเดิม (ย่อเพื่อความกระชับ)
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen pt-24 pb-12">
          <div className="max-w-md mx-auto px-6 pt-10 text-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
            <div className="space-y-5 mt-8">
              {[1, 2, 3].map(i => <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || coupons.length === 0) {
    return (
      <>
        <Navbar />
        <div className="bg-white min-h-screen pt-24 flex items-center justify-center px-6 text-center">
          <div>
            <div className="text-6xl mb-4">{error ? "Error" : "No coupons"}</div>
            <p className="text-lg text-gray-600 mb-6">
              {error || "ยังไม่มีคูปองในตอนนี้\nกรุณารอโปรโมชั่นใหม่เร็วๆ นี้!"}
            </p>
            {error && (
              <button onClick={() => window.location.reload()} className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold">
                ลองใหม่
              </button>
            )}
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

          <div className="space-y-5">
            {coupons.map((coupon, index) => {
              const badge = getBadge(coupon);
              const isFreeShipping = coupon.type === "FREE_SHIPPING";

              return (
                <div
                  key={coupon.id}
                  className={`bg-white border-2 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 relative ${getCardStyle(coupon)}`}
                >
                  {badge && (
                    <div className={`absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 animate-pulse ${isFreeShipping ? "bg-green-500" : "bg-red-500"}`}>
                      {badge}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className={`text-3xl font-extrabold ${isFreeShipping ? "text-green-600" : "text-orange-600"}`}>
                          {formatDiscount(coupon)}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mt-1">{coupon.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{getCondition(coupon)}</p>
                      </div>

                      <div className="text-right ml-4">
                        <div className={`px-4 py-2 rounded-xl font-bold text-lg tracking-wider text-white ${isFreeShipping ? "bg-green-500" : "bg-orange-500"}`}>
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
                            : isFreeShipping
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        {copiedIndex === index ? (
                          <>คัดลอกแล้ว!</>
                        ) : (
                          <>คัดลอกคูปอง</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={`h-2 bg-gradient-to-r ${getGradient(coupon)}`}></div>
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