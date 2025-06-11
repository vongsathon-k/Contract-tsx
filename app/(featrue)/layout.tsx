import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Kanit } from "next/font/google";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบทะเบียนคุมสัญญา - OAG",
  description: "สำนักงานอัยการจังหวัดปราจีนบุรี",
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/logo_ago.png",
    apple: "/apple-touch-icon.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
