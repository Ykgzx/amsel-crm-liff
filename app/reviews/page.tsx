'use client';

import Navbar from "../components/Navbar";
import { Star, Gift, Camera } from "lucide-react";

export default function ReviewsPage() {
  // สมมติว่ามีพอยต์เหมือนหน้ารางวัล (เอามาโชว์ให้เข้ากัน)
  const currentPoints = 1250;

  // ข้อมูลรีวิวตัวอย่าง
  const reviews = [
    {
      id: 1,
      username: "นานา สวยมาก",
      avatar: "น",
      rating: 4,
      content: "สินค้าตรงปกมากกก! สีสวย เนื้อผ้านุ่มลื่น ใส่แล้วดูแพงสุด ๆ การตัดเย็บดีมาก ไม่มีด้ายหลุดเลย แนะนำเลยค่ะ",
      date: "2 วันที่แล้ว",
      productImage: true,
    },
    {
      id: 2,
      username: "พี่พีชซ่า",
      avatar: "พ",
      rating: 5,
      content: "แพ็คเกจดีมาก มาถึงไว ของแถมเพียบ กลูต้าตัวนี้กินแล้วผิวเด้งจริง ๆ นะ ซื้อซ้ำแน่นอนค่ะ",
      date: "5 วันที่แล้ว",
      productImage: true,
    },
    {
      id: 3,
      username: "มิ้นต์ มินิ",
      avatar: "ม",
      rating: 5,
      content: "วิตามินซีตัวนี้ช่วยเรื่องผิวใส+ภูมิคุ้มกันดีมาก กินต่อเนื่อง 1 เดือน ผิวโกลว์เลย แนะนำมากๆ",
      date: "1 สัปดาห์ที่แล้ว",
      productImage: false,
    },
  ];

  return (
    <>
      <Navbar />

      <div className="bg-white min-h-screen pt-32 pb-16">
        <div className="max-w-md mx-auto px-6">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="bg-orange-500 rounded-full px-6 py-2 w-fit mx-auto mb-4">
              <h1 className="text-xl font-bold text-white">รีวิวจากลูกค้า</h1>
            </div>

            {/* ปุ่มเขียนรีวิว */}
            <button className="w-full bg-orange-500 text-white py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-md flex items-center justify-center gap-2">
              <Star className="w-6 h-6" />
              เขียนรีวิวของคุณ
            </button>
          </div>

          {/* รายการรีวิว */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl border-2 border-orange-100 shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* ข้อมูลผู้รีวิว */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {review.avatar}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{review.username}</h3>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>

                      {/* ดาว */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < review.rating
                              ? "fill-orange-500 text-orange-500"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-bold text-orange-600">
                          {review.rating}.0
                        </span>
                      </div>

                      {/* เนื้อหารีวิว */}
                      <p className="text-gray-700 leading-relaxed">
                        {review.content}
                      </p>
                    </div>

                    {/* รูปสินค้า (ถ้ามี) */}
                    {review.productImage && (
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-orange-50 border-2 border-dashed border-orange-200 rounded-xl flex items-center justify-center">
                          <Camera className="w-10 h-10 text-orange-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}