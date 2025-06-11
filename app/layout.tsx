"use client";

import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

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
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${kanit.variable} `} suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <div className="fixed bottom-4 right-4 z-50">
              <ModeToggle />
            </div>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
