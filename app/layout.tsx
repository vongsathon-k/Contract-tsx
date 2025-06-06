import Navbar from "@/components/Navbar";
import "./globals.css";
import Link from "next/link"
import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"


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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Navbar />
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
