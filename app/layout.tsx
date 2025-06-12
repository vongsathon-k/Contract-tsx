"use client";

import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import MainNav from "@/components/main-nav";
import Navbar from "@/components/Navbar";

const queryClient = new QueryClient();

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});

// export const metadata: Metadata = {
//   title: "ระบบทะเบียนคุมสัญญา - OAG",
//   description: "สำนักงานอัยการจังหวัดปราจีนบุรี",
//   icons: {
//     icon: "/favicon-32x32.png",
//     shortcut: "/logo_ago.png",
//     apple: "/apple-touch-icon.png",
//   },
// };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check auth on client side and not on auth pages
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/unauthorized");

      if (!user && !isAuthPage) {
        router.push("/login");
      } else if (user && pathname === "/") {
        router.push("/contract");
      }
    }
  }, [pathname, router]);

  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <title>ระบบทะเบียนคุมสัญญา - OAG</title>
        <meta name="description" content="สำนักงานอัยการจังหวัดปราจีนบุรี" />
        <link rel="icon" href="/favicon-32x32.png" />
      </head>
      <body
        className={`${kanit.variable} min-h-screen bg-gray-50`}
        suppressHydrationWarning
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <MainNav />
            {/* <Navbar /> */}
            <main className="flex-1">{children}</main>
            <div className="fixed bottom-4 right-4 z-50">
              <ModeToggle />
            </div>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
