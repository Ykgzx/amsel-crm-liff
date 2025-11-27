'use client';

import Navbar from "../components/Navbar";
import { MapPin, LocateFixed } from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// โหลดแผนที่แบบ client-only — ปลอดภัยสำหรับ Vercel
const StoreMap = dynamic(() => import('../components/StoreMap'), { ssr: false });

// ข้อมูลร้านค้า (ในจริงควรดึงจาก API)
const mockStores = [
  { id: 1, name: "สาขาสยามพารากอน", address: "ชั้น 2 โซน Beauty Hall, สยามพารากอน", lat: 13.7465, lng: 100.5347 },
  { id: 2, name: "สาขาเซ็นทรัลเวิลด์", address: "ชั้น G ตรงข้าม Boots, เซ็นทรัลเวิลด์", lat: 13.7458, lng: 100.5393 },
  { id: 3, name: "สาขาเมเจอร์ รังสิต", address: "ชั้น 1 โซน Health & Beauty, เมเจอร์ รังสิต", lat: 13.9605, lng: 100.6073 },
];

export default function AddressesPage() {
  const currentPoints = 1250;
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestStores, setNearestStores] = useState<typeof mockStores>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("เบราว์เซอร์ของคุณไม่รองรับระบบระบุตำแหน่ง");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition) => {
        const { latitude, longitude } = pos.coords;
        const userPos = { lat: latitude, lng: longitude };
        setUserLocation(userPos);

        const storesWithDist = mockStores.map((store) => ({
          ...store,
          distance: calculateDistance(userPos.lat, userPos.lng, store.lat, store.lng),
        }));

        const sorted = storesWithDist.sort((a, b) => a.distance - b.distance);
        setNearestStores(sorted.slice(0, 3));
        setLoading(false);
      },
      (err: GeolocationPositionError) => {
        console.error("Geolocation error:", err);
        setError("ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาเปิดการใช้งานตำแหน่ง");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <>
      <Navbar />

      <div className="bg-white min-h-screen pt-32 pb-16">
        <div className="max-w-md mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="bg-orange-500 rounded-full px-6 py-2 w-fit mx-auto mb-4">
              <h1 className="text-xl font-bold text-white">ร้านค้าใกล้ฉัน</h1>
            </div>

            <div className="inline-flex items-center gap-3 bg-orange-50 border-2 border-orange-200 rounded-2xl px-8 py-4">
              <MapPin className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-gray-600 text-sm">พอยต์ของคุณ</p>
                <p className="text-3xl font-bold text-orange-600">
                  {currentPoints.toLocaleString()} <span className="text-lg">Pts</span>
                </p>
              </div>
              <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>

          {/* แผนที่ */}
          <div className="mb-8">
            {error ? (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 text-center">
                <LocateFixed className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <p className="text-gray-700 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-600"
                >
                  ลองอีกครั้ง
                </button>
              </div>
            ) : loading ? (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mb-2"></div>
                <p className="text-gray-600">กำลังหาร้านค้าใกล้คุณ...</p>
              </div>
            ) : (
              <StoreMap userLocation={userLocation} stores={nearestStores} />
            )}
          </div>

          {/* รายการร้านค้า */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">ร้านค้าใกล้คุณ</h2>
            <div className="space-y-4">
              {nearestStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 flex items-start gap-4"
                >
                  <MapPin className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900">{store.name}</h3>
                    <p className="text-sm text-gray-600">{store.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ข้อความท้ายหน้า */}
          <div className="mt-6 text-center bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
            <p className="text-gray-700 font-medium">ร้านค้าเปิดทุกวัน 09:00 - 21:00 น.</p>
            <p className="text-orange-600 font-bold mt-2 text-lg">ยิ้มได้เสมอเมื่อมีเรา ♡</p>
          </div>

        </div>
      </div>
    </>
  );
}