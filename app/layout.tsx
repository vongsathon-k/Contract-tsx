import Navbar from "@/components/Navbar";
import "./globals.css";
import Link from "next/link"
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "ระบบคุมสัญญา",
  description: "ระบบคุมสัญญาของสำนักงานอัยการสูงสุด",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
