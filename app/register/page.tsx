'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { XCircle } from 'lucide-react';

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID!;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

interface FormData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
}

interface Errors {
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
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

  const [errors, setErrors] = useState<Errors>({});
  const today = new Date().toISOString().split('T')[0]; // วันปัจจุบัน

  useEffect(() => {
    const initLiff = async () => {
      if (!LIFF_ID || !BACKEND_URL) {
        alert('กรุณาตั้งค่า LIFF_ID และ BACKEND_URL ใน .env.local');
        setLoading(false);
        return;
      }

      try {
        await liff.init({ liffId: LIFF_ID });

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const lineProfile = await liff.getProfile();
        setProfile(lineProfile);

        const token = liff.getIDToken();
        if (!token) {
          alert('ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่');
          setLoading(false);
          return;
        }
        setIdToken(token);

        // ดึง email จาก ID Token
        const decoded = liff.getDecodedIDToken();
        if (decoded?.email) {
          setFormData(prev => ({ ...prev, email: decoded.email as string }));
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

  useEffect(() => {
    if (isRegistered === true) {
      window.location.href = '/';
    }
  }, [isRegistered]);

  // Validation ฟังก์ชัน
  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.title) {
      newErrors.title = "กรุณาเลือกคำนำหน้า";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "กรุณากรอกชื่อจริง";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "กรุณากรอกนามสกุล";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
    if (formData.phoneNumber && cleanPhone.length > 0) {
      if (cleanPhone.length !== 10 || !/^0[6-9]/.test(cleanPhone)) {
        newErrors.phoneNumber = "เบอร์โทรศัพท์ต้องเป็น 10 หลัก เริ่มต้นด้วย 06-09";
      }
    }

    if (formData.birthDate && formData.birthDate > today) {
      newErrors.birthDate = "วันเกิดต้องไม่เกินวันปัจจุบัน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // หยุดถ้ามี error
    }

    if (!idToken) {
      alert('ไม่สามารถยืนยันตัวตนได้');
      return;
    }

    const payload = {
      title: formData.title,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email || null,
      phoneNumber: formData.phoneNumber ? formData.phoneNumber.replace(/\D/g, "") : null,
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

  // Loading UI
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

            {/* คำนำหน้า */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คำนำหน้า <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 ${errors.title ? "border-red-500" : "border-orange-200"}`}
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              >
                <option value="">เลือกคำนำหน้า</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> {errors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 ${errors.firstName ? "border-red-500" : "border-orange-200"}`}
                  value={formData.firstName}
                  onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 ${errors.lastName ? "border-red-500" : "border-orange-200"}`}
                  value={formData.lastName}
                  onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* อีเมล (optional แต่ถ้ากรอกต้องถูก) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล (ไม่บังคับ)</label>
              <input
                type="email"
                className={`w-full px-4 py-3 border rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-500 ${errors.email ? "border-red-500" : "border-orange-200"}`}
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="กรอกอีเมลเพิ่มเติม"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> {errors.email}
                </p>
              )}
            </div>

            {/* เบอร์โทร (optional แต่ถ้ากรอกต้อง 10 หลัก) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์ (ไม่บังคับ)</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 ${errors.phoneNumber ? "border-red-500" : "border-orange-200"}`}
                value={formData.phoneNumber}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setFormData(prev => ({ ...prev, phoneNumber: value }));
                  }
                }}
                placeholder="0812345678"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* วันเกิด (optional แต่ห้ามเกินวันนี้) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันเกิด (ไม่บังคับ)</label>
              <input
                type="date"
                max={today}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 ${errors.birthDate ? "border-red-500" : "border-orange-200"}`}
                value={formData.birthDate}
                onChange={e => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> {errors.birthDate}
                </p>
              )}
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