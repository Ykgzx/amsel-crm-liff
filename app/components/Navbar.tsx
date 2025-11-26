// app/components/Navbar.tsx

'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import Link from 'next/link';   // เพิ่มแค่บรรทัดนี้

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
      <img src="/logo-amsel.png" className='w-40' alt="" />
      
      {/* แค่ห่อ div เดิมด้วย Link เท่านั้น */}
      <Link href="/editprofile">
        <div className="absolute right-6 md:right-14 w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer">
          {loading ? (
            <div className="w-full h-full bg-white/20 animate-pulse"></div>
          ) : profile?.pictureUrl ? (
            <img
              src={profile.pictureUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={() => setError(true)}
            />
          ) : (
            <div className="w-full h-full bg-white/20 flex items-center justify-center">
              <i className="fas fa-user text-white text-lg"></i>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}