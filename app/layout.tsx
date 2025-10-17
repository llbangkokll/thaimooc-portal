import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
});

export const metadata = {
  title: "Thai MOOC - แพลตฟอร์มการเรียนรู้ออนไลน์",
  description: "แพลตฟอร์มการเรียนรู้ออนไลน์สำหรับคนไทย",
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
