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
  AlertCircle,
} from "lucide-react";
import liff from "@line/liff";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const TITLE_OPTIONS = ["นาย", "นาง", "นางสาว"];

interface UserProfile {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthdate: string;
}

export default function EditProfilePage() {
  const [linePictureUrl, setLinePictureUrl] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    title: "นาย",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthdate: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ดึงรูปจาก LINE LIFF
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

  // ดึงข้อมูลโปรไฟล์จาก backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setProfile({
            title: data.title || "นาย",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            birthdate: data.birthdate || "",
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

  // บันทึกจริงเมื่อกด "ตกลง" ใน popup
  const confirmSave = async () => {
    setSaving(true);
    setShowConfirm(false);

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        alert("บันทึกข้อมูลสำเร็จแล้วค่ะ");
      } else {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
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

            {/* คำนำหน้าชื่อ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                คำนำหน้าชื่อ
              </label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">นามสกุล</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline w-5 h-5 mr-1 text-orange-600" /> อีเมล
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="inline w-5 h-5 mr-1 text-orange-600" /> เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="08x xxx xxxx"
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline w-5 h-5 mr-1 text-orange-600" /> วันเกิด
              </label>
              <input
                type="date"
                value={profile.birthdate}
                onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300"
              />
            </div>

            <div className="flex gap-4 pt-8">
              <button className="flex-1 py-4 border-2 border-orange-200 text-gray-700 font-bold rounded-2xl hover:bg-orange-50 transition">
                ยกเลิก
              </button>
              <button
                onClick={() => setShowConfirm(true)}
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

      {/* Popup ยืนยัน */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                ยืนยันการบันทึกข้อมูล?
              </h3>
              <p className="text-gray-600 mb-8">
                ระบบจะอัปเดตข้อมูลโปรไฟล์ของคุณ
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmSave}
                className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg transition"
              >
                ตกลง บันทึกเลย
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}