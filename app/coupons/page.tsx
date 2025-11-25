'use client';

import Navbar from "../components/Navbar";
import { useState } from "react";

export default function CouponsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null); // ชื่อตัวแปรนี้สำคัญ

  const coupons = [
    { id: 1, code: "WELCOME50", discount: "ลด 50%", desc: "สำหรับสมาชิกใหม่", expires: "30 พ.ย. 2568" },
    { id: 2, code: "FREESHIP100", discount: "ฟรีค่าส่ง", desc: "เมื่อซื้อครบ 500 บาท", expires: "31 ธ.ค. 2568" },
    { id: 3, code: "SAVE200", discount: "ลด 200 บาท", desc: "เมื่อซื้อครบ 1,500 บาท", expires: "15 ธ.ค. 2568" },
    { id: 4, code: "GOLD25", discount: "ลดเพิ่ม 25%", desc: "สำหรับ Gold Tier ขึ้นไป", expires: "31 ม.ค. 2569", badge: "พิเศษ!" },
    { id: 5, code: "FLASH300", discount: "ลดทันที 300 บาท", desc: "วันนี้วันเดียว!", expires: "หมดเขตวันนี้", badge: "HOT!" },
  ];

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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
            {coupons.map((coupon, index) => (
              <div
                key={coupon.id}
                className="bg-white border-2 border-orange-100 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 relative"
              >
                {coupon.badge && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                    {coupon.badge}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-3xl font-extrabold text-orange-600">
                        {coupon.discount}
                      </div>
                      <p className="text-gray-700 font-medium mt-1">{coupon.desc}</p>
                    </div>

                    <div className="text-right">
                      <div className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-lg tracking-wider">
                        {coupon.code}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      หมดอายุ: <span className="font-medium text-gray-700">{coupon.expires}</span>
                    </p>

                    <button
                      onClick={() => handleCopy(coupon.code, index)}
                      className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                        copiedIndex === index
                          ? "bg-green-500 text-white"
                          : "bg-orange-500 text-white hover:bg-orange-600 shadow-md"
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
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              * คูปอง 1 ท่าน ใช้ได้ 1 ครั้งต่อการสั่งซื้อ<br />
              * ไม่สามารถใช้ร่วมกับโปรโมชั่นอื่นได้<br />
              * กรุณากรอกคูปองที่หน้าเช็คเอาท์
            </p>
          </div>

        </div>
      </div>
    </>
  );
}