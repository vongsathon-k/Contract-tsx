import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ระบบจัดการสัญญา",
  description: "สำนักงานอัยการจังหวัดปราจีนบุรี",
  icons: {
    icon: "/OAG_Logo.png",
    shortcut: "/OAG_Logo.png",
    apple: "/OAG_Logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${kanit.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Navbar />
        {children}
        <div className="fixed bottom-4 right-4 z-50">
          <ModeToggle />
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}