'use client';

import Navbar from "../components/Navbar";
import { Upload, Store, Camera, Hash, DollarSign, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ReceiptuploadPage() {
  const [selectedShop, setSelectedShop] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptNo, setReceiptNo] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  // ร้านที่รองรับ (สมมติ)
  const shops = [
    "Amsel Official Store - Shopee",
    "Amsel Official Store - Lazada",
    "Amsel Flagship Store",
    "ร้านขายยา Fascino",
    "ร้าน Boots",
    "ร้าน Watson",
    "อื่นๆ (ระบุ)",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Navbar />

      <div className="bg-white min-h-screen pt-32 pb-16">
        <div className="max-w-md mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-orange-500 rounded-full px-6 py-2 w-fit mx-auto mb-4">
              <h1 className="text-xl font-bold text-white">อัปโหลดใบเสร็จ</h1>
            </div>
            <p className="text-gray-600">ซื้อสินค้าแอมเซลแล้ว? อัปโหลดใบเสร็จเพื่อรับพอยต์ทันที!</p>
          </div>

          <div className="space-y-6">

            {/* 1. เลือกร้านค้า */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <Store className="w-5 h-5 text-orange-600" />
                เลือกร้านที่ซื้อ
              </label>
              <select
                value={selectedShop}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border border-orange-200 focus:border-orange-400 focus:outline-none text-gray-700"
              >
                <option value="">กรุณาเลือกร้านค้า</option>
                {shops.map((shop) => (
                  <option key={shop} value={shop}>{shop}</option>
                ))}
              </select>
            </div>

            {/* 2. อัปโหลดรูปใบเสร็จ */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <Camera className="w-5 h-5 text-orange-600" />
                ถ่ายหรืออัปโหลดรูปใบเสร็จ
              </label>
              <label htmlFor="receipt-upload" className="block">
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  receiptImage ? "border-orange-300" : "border-orange-200 hover:border-orange-400"
                }`}>
                  {receiptImage ? (
                    <img src={receiptImage} alt="ใบเสร็จ" className="w-full rounded-xl" />
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto text-orange-500 mb-3" />
                      <p className="text-orange-600 font-medium">แตะเพื่อถ่ายรูปหรือเลือกภาพ</p>
                      <p className="text-xs text-gray-500 mt-1">รองรับ JPG, PNG</p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* 3. เลขใบเสร็จ */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <Hash className="w-5 h-5 text-orange-600" />
                เลขที่ใบเสร็จ
              </label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="เช่น A123456789"
                className="w-full px-4 py-4 rounded-2xl border border-orange-200 focus:border-orange-400 focus:outline-none"
              />
            </div>

            {/* 4. ยอดรวม */}
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                ยอดซื้อทั้งหมด (บาท)
              </label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="เช่น 1290"
                className="w-full px-4 py-4 rounded-2xl border border-orange-200 focus:border-orange-400 focus:outline-none"
              />
            </div>

            {/* คำเตือน */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <strong>สำคัญ:</strong> ใบเสร็จซ้ำ, ปลอม, หรือไม่ชัดเจน จะถูกปฏิเสธและอาจถูกระงับการรับพอยต์
              </div>
            </div>

            {/* ปุ่มส่ง */}
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-5 rounded-2xl shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!selectedShop || !receiptImage || !receiptNo || !totalAmount}
            >
              ส่งใบเสร็จเพื่อรับพอยต์
            </button>

            {/* ข้อความเพิ่มเติม */}
            <p className="text-center text-xs text-gray-500">
              พอยต์จะเข้าภายใน 1-3 วันทำการหลังตรวจสอบสำเร็จ
            </p>

          </div>
        </div>
      </div>
    </>
  );
}