// app/components/Navbar.tsx

'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import Link from 'next/link';
import Image from 'next/image'; // ใช้ Next/Image ดีกว่า <img> ธรรมดา (optional แต่แนะนำ)

export default function Navbar() {
  const [profile, setProfile] = useState<{ pictureUrl?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile();
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Failed to fetch LIFF profile:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-20 bg-gradient-to-r from-amber-500 via-white to-orange-500 flex items-center justify-center px-6 md:px-14">
      <img src="/logo-amsel.png" alt="Amsel Logo" className="w-40" />

      {/* รูปโปรไฟล์ที่คลิกแล้วไปหน้า Edit Profile */}
      <Link
        href="/editprofile"
        className="absolute right-6 md:right-14 w-12 h-12 rounded-full overflow-hidden border-4 border-white shadow-lg transition-transform hover:scale-110 focus:outline-none ring-4 ring-white/30"
        aria-label="แก้ไขโปรไฟล์"
        prefetch={true} // prefetch ทันทีที่โหลด Navbar (เร็วสุด!)
      >
        {loading ? (
          <div className="w-full h-full bg-white/30 animate-pulse" />
        ) : profile?.pictureUrl && !error ? (
          // ใช้ Next/Image จะดีที่สุด (optional)
          <Image
            src={profile.pictureUrl}
            alt="รูปโปรไฟล์"
            width={48}
            height={48}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
            <i className="fas fa-user text-white text-2xl" />
          </div>
        )}
      </Link>
    </div>
  );
}