import Navbar from "@/components/Navbar";
import "./globals.css";
import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"


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
        <div className="fixed bottom-4 right-4 z-50">
          <ModeToggle />
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
