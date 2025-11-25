'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID!;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

interface FormData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;        // ยังคงเป็น string
  phoneNumber: string;
  birthDate: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
  });

  useEffect(() => {
    const initLiff = async () => {
      if (!LIFF_ID || !BACKEND_URL) {
        alert('กรุณาตั้งค่า LIFF_ID และ BACKEND_URL ใน .env.local');
        setLoading(false);
        return;
      }

      try {
        await liff.init({ liffId: LIFF_ID });
        console.log(liff.getAccessToken())
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const lineProfile = await liff.getProfile();
        setProfile(lineProfile);

        const token = liff.getIDToken();
        console.log(token);
        if (!token) {
          alert('ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่');
          setLoading(false);
          return;
        }

        setIdToken(token);

        // ดึง email จาก ID Token (ปลอดภัยต่อ TypeScript)
        const decoded = liff.getDecodedIDToken();
        if (decoded?.email) {
          setFormData(prev => ({
            ...prev,
            email: decoded.email as string, // บังคับ type ว่า "มีแน่นอน"
            // หรือใช้: email: decoded.email ?? ''
          }));
        }

        // เช็คว่าสมัครแล้วหรือยัง
        const checkRes = await fetch(`${BACKEND_URL}/api/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (checkRes.ok) {
          setIsRegistered(true);
        } else {
          setIsRegistered(false);
        }
      } catch (err: any) {
        console.error('LIFF Error:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ LINE: ' + (err.message || 'กรุณาลองใหม่'));
      } finally {
        setLoading(false);
      }
    };

    initLiff();
  }, []);

  // ถ้าสมัครแล้ว → กลับหน้า Home
  useEffect(() => {
    if (isRegistered === true) {
      window.location.href = '/';
    }
  }, [isRegistered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idToken) {
      alert('ไม่สามารถยืนยันตัวตนได้');
      return;
    }

    const payload = {
      title: formData.title,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || null,
      phoneNumber: formData.phoneNumber || null,
      birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('สมัครสมาชิกสำเร็จแล้วค่ะ!');
          window.location.href = '/healthquiz';
      } else {
        let errorMsg = 'สมัครไม่สำเร็จ';
        try {
          const errData = await res.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch {
          errorMsg = await res.text();
        }
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Register error:', err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
  };

  // ====================== UI ======================
  if (loading || isRegistered === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">กำลังตรวจสอบข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (isRegistered === false) {
    return (
      <div className="min-h-screen bg-white pt-10 pb-20">
        <div className="max-w-md mx-auto px-6">

          <div className="bg-orange-500 rounded-xl px-6 py-4 mb-8 shadow-md">
            <h1 className="text-2xl font-bold text-white text-center">สมัครสมาชิก</h1>
          </div>

          {profile && (
            <div className="bg-orange-50 rounded-2xl p-6 mb-8 shadow-sm border border-orange-200 text-center">
              <img
                src={profile.pictureUrl || '/default-avatar.png'}
                alt="Profile"
                className="w-28 h-28 rounded-full mx-auto border-4 border-orange-400 object-cover mb-4"
              />
              <p className="text-lg font-bold text-gray-800">ยินดีต้อนรับ</p>
              <p className="text-xl font-bold text-orange-600">{profile.displayName}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">คำนำหน้า</label>
              <select
                required
                className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              >
                <option value="">เลือกคำนำหน้า</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  value={formData.firstName}
                  onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  value={formData.lastName}
                  onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล {formData.email && <span className="text-orange-600 text-xs">จาก LINE</span>}
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-orange-200 rounded-xl bg-orange-50"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder={formData.email ? undefined : 'กรอกอีเมลเพิ่มเติม'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-orange-200 rounded-xl"
                value={formData.phoneNumber}
                onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันเกิด</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-orange-200 rounded-xl"
                value={formData.birthDate}
                onChange={e => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl shadow-md transition transform hover:scale-105 active:scale-100 mt-10"
            >
              ยืนยันสมัครสมาชิก
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}