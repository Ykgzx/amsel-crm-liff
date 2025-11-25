// app/layout.tsx
import type { Metadata } from 'next';
import { Kanit } from 'next/font/google';
import './globals.css';

// ฟอนต์ Kanit (ภาษาไทยสวย ๆ)
const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});



export const metadata: Metadata = {
  title: 'Amsel Member',
  description: 'สะสมพอยต์ แลกของรางวัลกับแอมเซล',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        {/* ถ้าอยากใช้ CDN แทน npm ก็ใส่ตรงนี้ได้ (แต่ npm เร็วกว่า) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className={`${kanit.className} antialiased bg-orange-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}