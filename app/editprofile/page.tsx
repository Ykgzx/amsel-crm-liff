'use client';

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  Loader2,
  Save,
  XCircle,
} from "lucide-react";
import liff from "@line/liff";
import Swal from "sweetalert2";
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const TITLE_OPTIONS = ["นาย", "นาง", "นางสาว"];

interface UserProfile {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
}

export default function EditProfilePage() {
  const [linePictureUrl, setLinePictureUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    title: "นาย",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // ดึงรูปโปรไฟล์จาก LINE
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
        if (liff.isLoggedIn()) {
          const lineProfile = await liff.getProfile();
          setLinePictureUrl(lineProfile.pictureUrl || null);
        }
      } catch (err) {
        console.error("LIFF Error:", err);
      }
    };
    initLiff();
  }, []);

  // ดึงข้อมูลโปรไฟล์จาก Backend
  useEffect(() => {
    const fetchProfile = async () => {
      await liff.ready;
      const accessToken = liff.getAccessToken();
      if (!accessToken) {
        console.warn("ไม่มี Access Token");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setProfile({
            title: data.title || "นาย",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || data.phone || "",
            birthDate: data.birthDate
              ? data.birthDate.split("T")[0]
              : data.birthdate
              ? data.birthdate.split("T")[0]
              : "",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ตรวจสอบฟอร์ม
  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!profile.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อจริง";
    if (!profile.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";

    if (!profile.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    const cleanPhone = profile.phoneNumber.replace(/\D/g, "");
    if (!cleanPhone) {
      newErrors.phoneNumber = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (cleanPhone.length !== 10 || !/^0[6-9]/.test(cleanPhone)) {
      newErrors.phoneNumber = "เบอร์โทรต้องเป็น 10 หลัก เริ่มต้นด้วย 06-09";
    }

    if (!profile.birthDate) {
      newErrors.birthDate = "กรุณาเลือกวันเกิด";
    } else if (profile.birthDate > today) {
      newErrors.birthDate = "วันเกิดต้องไม่เกินวันปัจจุบัน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // กดปุ่มบันทึก → แสดง SweetAlert ยืนยัน
  const handleSaveClick = () => {
    if (validateForm()) {
      Swal.fire({
        title: "ยืนยันการบันทึกข้อมูล?",
        text: "ระบบจะอัปเดตข้อมูลโปรไฟล์ของคุณ",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "ตกลง บันทึกเลย",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        heightAuto: false,
        backdrop: true, // เปิดใช้ backdrop blur (default ของ SweetAlert2 คือ blur + overlay)
        customClass: {
          popup: "rounded-3xl shadow-2xl border border-gray-100",
          title: "text-xl font-bold text-gray-800 mb-3",
          htmlContainer: "text-gray-600 text-sm mb-6",
          confirmButton: "px-8 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg transition mx-2",
          cancelButton: "px-8 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition mx-2",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          confirmSave();
        }
      });
    }
  };

  // บันทึกข้อมูลจริง
  const confirmSave = async () => {
    setSaving(true);

    await liff.ready;
    const accessToken = liff.getAccessToken();
    if (!accessToken) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่พบ Access Token",
        confirmButtonText: "ตกลง",
        customClass: {
          confirmButton: "px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl",
        },
      });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        title: profile.title,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        email: profile.email.trim(),
        phoneNumber: profile.phoneNumber.replace(/\D/g, ""),
        birthDate: profile.birthDate ? `${profile.birthDate}T00:00:00.000Z` : null,
      };
      console.log(payload);
      const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "บันทึกสำเร็จ!",
          text: "ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl",
          },
        });
      } else {
        const err = await res.text();
        await Swal.fire({
          icon: "error",
          title: "บันทึกไม่สำเร็จ",
          text: err || "กรุณาลองใหม่ภายหลัง",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl",
          },
        });
      }
    } catch (err) {
      console.error("Network error:", err);
      await Swal.fire({
        icon: "error",
        title: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์",
        text: "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        confirmButtonText: "ตกลง",
        customClass: {
          confirmButton: "px-6 py-3 bg-orange-500 text-white font-bold rounded-2xl",
        },
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-white min-h-screen pt-32 pb-16">
        <div className="max-w-md mx-auto px-6">

          {/* Header */}
          <div className="mb-10 text-center">
            <div className="bg-orange-500 rounded-full px-8 py-3 w-fit mx-auto mb-6 shadow-lg">
              <h1 className="text-2xl font-bold text-white">แก้ไขโปรไฟล์</h1>
            </div>

            <div className="w-32 h-32 bg-orange-100 rounded-full border-4 border-white shadow-xl overflow-hidden mx-auto">
              {linePictureUrl ? (
                <img src={linePictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-50">
                  <span className="text-5xl font-bold text-orange-300">
                    {profile.firstName ? profile.firstName[0].toUpperCase() : "?"}
                  </span>
                </div>
              )}
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-800">
              {profile.title} {profile.firstName} {profile.lastName || "(ยังไม่ได้กรอก)"}
            </h2>
          </div>

          {/* ฟอร์ม */}
          <div className="bg-white rounded-3xl border-2 border-orange-100 shadow-xl p-6 space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">คำนำหน้าชื่อ</label>
              <div className="relative">
                <select
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-orange-300 text-gray-800 font-medium"
                >
                  {TITLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-600 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className={`w-full px-5 py-4 bg-orange-50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 ${errors.firstName ? "border-red-500" : "border-orange-200"}`}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4" /> {errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">นามสกุล <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className={`w-full px-5 py-4 bg-orange-50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 ${errors.lastName ? "border-red-500" : "border-orange-200"}`}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4" /> {errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline w-5 h-5 mr-1 text-orange-600" /> อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="you@example.com"
                className={`w-full px-5 py-4 bg-orange-50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 ${errors.email ? "border-red-500" : "border-orange-200"}`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4" /> {errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="inline w-5 h-5 mr-1 text-orange-600" /> เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={profile.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) setProfile({ ...profile, phoneNumber: value });
                }}
                placeholder="0812345678"
                className={`w-full px-5 py-4 bg-orange-50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 ${errors.phoneNumber ? "border-red-500" : "border-orange-200"}`}
              />
              {errors.phoneNumber && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4" /> {errors.phoneNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline w-5 h-5 mr-1 text-orange-600" /> วันเกิด <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                max={today}
                value={profile.birthDate}
                onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                className={`w-full px-5 py-4 bg-orange-50 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 ${errors.birthDate ? "border-red-500" : "border-orange-200"}`}
              />
              {errors.birthDate && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4" /> {errors.birthDate}</p>}
            </div>

            <div className="flex justify-center items-center gap-4 pt-8">
                <Link href="/" className="flex-1">
                    <button className="w-full py-4 border-2 border-orange-200 text-gray-700 font-bold rounded-2xl hover:bg-orange-50 transition">
                        ยกเลิก
                    </button>
                </Link>
                <button
                    onClick={handleSaveClick}
                    disabled={saving}
                    className="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-105 disabled:opacity-70"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}