import { Sarabun } from "next/font/google";
import "./globals.css";
import type { Metadata, Viewport } from "next";

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "Thai MOOC - แพลตฟอร์มการเรียนรู้ออนไลน์",
  description: "แพลตฟอร์มการเรียนรู้ออนไลน์สำหรับคนไทย",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${sarabun.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
