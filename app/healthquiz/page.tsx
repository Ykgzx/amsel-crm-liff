'use client';

import { useState } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation"; // ถ้าใช้ App Router

export default function HealthQuizPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const router = useRouter(); // สำหรับ Next.js App Router
  const totalSteps = 3;

  const questions = [
    {
      step: 1,
      title: "เป้าหมายหลักของคุณคืออะไร?",
      options: [
        "ลดน้ำหนักอย่างปลอดภัย",
        "มีผิวใส กระจ่างใส",
        "เสริมภูมิคุ้มกันให้แข็งแรง",
        "นอนหลับดีขึ้น สดชื่นทุกวัน",
        "บำรุงข้อเข่าและกระดูก",
        "ดูแลสายตา ลดอาการตาล้า",
      ],
    },
    {
      step: 2,
      title: "คุณมีปัญหาสุขภาพแบบนี้บ่อยไหม?",
      options: [
        "ท้องอืด ย่อยยาก",
        "ผิวหมองคล้ำ ไม่กระจ่างใส",
        "เหนื่อยง่าย ภูมิต่ำ",
        "นอนไม่หลับ ตื่นมาไม่สดชื่น",
        "ปวดเข่า ข้อต่อ",
        "ตาแห้ง ตาล้า จากหน้าจอ",
      ],
    },
    {
      step: 3,
      title: "คุณให้ความสำคัญกับเรื่องนี้มากแค่ไหน?",
      options: [
        "สำคัญมาก อยากเห็นผลเร็ว",
        "สำคัญปานกลาง ค่อยเป็นค่อยไปได้",
        "แค่ลองดู ไม่กดดันตัวเอง",
      ],
    },
  ];

  const currentQuestion = questions[currentStep - 1];
  const progressPercent = (answers.length / totalSteps) * 100;

  const handleSelect = (option: string) => {
    if (answers.length === currentStep - 1) {
      const newAnswers = [...answers, option];
      setAnswers(newAnswers);

      if (currentStep < totalSteps) {
        setTimeout(() => setCurrentStep(currentStep + 1), 350);
      } else {
        setTimeout(() => setShowResult(true), 600);
      }
    }
  };

  const handleCloseAndGoHome = () => {
    setShowResult(false);
    
    // เลือกใช้อย่างใดอย่างหนึ่ง
    router.push('/');                    // วิธีที่แนะนำ (Next.js App Router)
    // หรือ
    // window.location.href = '/';         // วิธีธรรมดา ใช้ได้ทุกกรณี
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white pt-20 pb-12">
        <div className="max-w-md mx-auto px-6">

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600 font-medium">
                ตอบแล้ว {answers.length} จาก {totalSteps} ข้อ
              </span>
              <span className="text-orange-600 font-bold text-lg">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 skew-x-12 translate-x-[-100%] animate-shine"></div>
              </div>
            </div>
          </div>

          {/* คำถาม + ตัวเลือก */}
          <div className="text-center mb-10">
            <div className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              คำถามที่ {currentStep}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 leading-tight">
              {currentQuestion.title}
            </h1>
            <p className="text-gray-600 mt-4 text-lg">
              {currentStep === 1 && "เริ่มต้นด้วยเป้าหมายของคุณก่อนเลย"}
              {currentStep === 2 && "เพื่อให้คำแนะนำตรงจุดมากขึ้น"}
              {currentStep === 3 && "อีกนิดเดียวเอง ขอบคุณที่มาตอบนะคะ"}
            </p>
          </div>

          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(option)}
                disabled={answers.length >= currentStep}
                className="w-full p-6 bg-white border-2 border-orange-100 rounded-2xl text-left hover:border-orange-400 hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 group active:scale-98 disabled:opacity-60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium text-lg pr-4">{option}</span>
                  <div className="w-9 h-9 rounded-full border-3 border-orange-300 bg-orange-50 group-hover:bg-orange-500 group-hover:border-orange-600 transition-all duration-300 flex items-center justify-center">
                    <svg className={`w-6 h-6 text-white ${answers[currentStep - 1] === option ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-gray-500">
            ใช้เวลาไม่ถึง 1 นาที • ข้อมูลเป็นความลับ 100%
          </div>
        </div>
      </div>

      {/* Popup ผลลัพธ์แบบมินิมอล - ปุ่มเดียว “ตกลง” */}
      {showResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-400">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-10 text-center text-white">
              <div className="w-20 h-20 bg-white/25 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">ขอบคุณที่ทำแบบทดสอบ!</h2>
              <p className="mt-3 text-orange-50">
                ทีมงานจะนำข้อมูลไปวิเคราะห์<br />และแนะนำผลิตภัณฑ์ที่เหมาะกับคุณโดยเร็วที่สุดค่ะ
              </p>
            </div>

            <div className="p-6">
              <button
                onClick={handleCloseAndGoHome}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold rounded-2xl shadow-lg transition transform hover:scale-105 active:scale-100"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shine {
          animation: shine 3s infinite linear;
        }
      `}</style>
    </>
  );
}