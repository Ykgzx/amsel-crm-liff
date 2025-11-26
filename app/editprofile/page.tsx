import { useState } from "react";
import Navbar from "../components/Navbar";
import { Camera, Mail, Phone, Calendar, User, Save, Gift, Star } from "lucide-react";

export default function EditprofilePage() {
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
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
          <div className="mb-8 text-center">
            <div className="bg-orange-500 rounded-full px-8 py-3 w-fit mx-auto mb-6 shadow-lg">
              <h1 className="text-2xl font-bold text-white">แก้ไขโปรไฟล์</h1>
            </div>

            {/* Profile Picture + Points */}
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-orange-100 rounded-full border-4 border-white shadow-xl overflow-hidden mx-auto">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-orange-300" />
                  </div>
                )}
              </div>

              <label className="absolute bottom-1 right-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 cursor-pointer shadow-xl transition-all">
                <Camera className="w-6 h-6" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Points Card (เหมือนหน้า Reward) */}
            <div className="mt-8 inline-flex items-center gap-3 bg-orange-50 border-2 border-orange-200 rounded-2xl px-8 py-4 shadow-md">
              <Gift className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-gray-600 text-sm">พอยต์ของคุณ</p>
                <p className="text-3xl font-bold text-orange-600">
                  1,250 <span className="text-lg">Pts</span>
                </p>
              </div>
              <Star className="w-8 h-8 text-orange-500 fill-orange-500" />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl border-2 border-orange-100 shadow-xl p-6 space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">คำนำหน้าชื่อ</label>
              <input
                type="text"
                placeholder="นาย / นาง / นางสาว"
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 text-gray-800 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ</label>
              <input
                type="text"
                placeholder="ชื่อจริง"
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">นามสกุล</label>
              <input
                type="text"
                placeholder="นามสกุล"
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline w-5 h-5 mr-1 text-orange-600" /> อีเมล
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="inline w-5 h-5 mr-1 text-orange-600" /> เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                placeholder="08x xxx xxxx"
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline w-5 h-5 mr-1 text-orange-600" /> วันเกิด
              </label>
              <input
                type="date"
                className="w-full px-5 py-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-300 text-gray-800"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button className="flex-1 py-4 border-2 border-orange-200 text-gray-700 font-bold rounded-2xl hover:bg-orange-50 transition">
                ยกเลิก
              </button>
              <button className="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-105">
                <Save className="w-5 h-5" />
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}