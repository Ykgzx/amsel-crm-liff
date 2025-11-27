// app/components/Navbar.tsx

'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import Link from 'next/link';
import Image from 'next/image';

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
    <div role="navigation" className="fixed top-0 left-0 right-0 z-50 h-20 bg-gradient-to-r from-amber-500 via-white to-orange-500 flex items-center justify-center px-6 md:px-14 shadow-lg">
      
      {/* Logo AMSel */}
      <Link href="/" className="flex items-center">
        <Image 
          src="/logo-amsel.png" 
          alt="AMSEL" 
          width={160} 
          height={60} 
          className="w-36 md:w-40 h-auto object-contain"
          priority
        />
      </Link>

      {/* Profile Picture - จัดให้อยู่กึ่งกลางแนวตั้งอย่างสมบูรณ์ */}
      <Link href="/editprofile">
        <div 
        data-testid="profile-avatar"
        className="
          absolute right-5 md:right-12 
          w-12 h-12 
          rounded-full overflow-hidden 
          border-4 border-white 
          shadow-xl 
          cursor-pointer 
          top-1/2 -translate-y-1/2 
          transition-all duration-200 
          hover:scale-110 hover:shadow-2xl
          ring-4 ring-white/30
        ">
          {loading ? (
            <div className="w-full h-full bg-white/40 animate-pulse rounded-full" />
          ) : error || !profile?.pictureUrl ? (
            <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center rounded-full">
              <i className="fas fa-user text-white text-2xl" />
            </div>
          ) : (
            <img
              src={profile.pictureUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={() => setError(true)}
            />
          )}
        </div>
      </Link>
    </div>
  );
}