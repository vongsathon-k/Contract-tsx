"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Settings,
  Shield,
  LogOut,
  User,
  Menu,
  X,
  Home,
} from "lucide-react";
import { isCurrentUserAdmin, getCurrentUser } from "@/lib/auth-utils";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to check and update user state
  const checkUserState = () => {
    try {
      const currentUser = getCurrentUser();
      const adminStatus = isCurrentUserAdmin();

      setUser(currentUser);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error("Error checking user state:", error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserState();
  }, []);

  // Listen for storage changes (when user logs out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") {
        checkUserState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Listen for pathname changes to recheck user state
  useEffect(() => {
    checkUserState();
  }, [pathname]);

  const handleLogout = async () => {
    const Swal = (await import("sweetalert2")).default;
    const result = await Swal.fire({
      title: "ยืนยันการออกจากระบบ",
      text: "คุณต้องการออกจากระบบหรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        // Clear localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        // Clear cookies
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

        // Clear component state immediately
        setUser(null);
        setIsAdmin(false);
        setIsMobileMenuOpen(false);

        await Swal.fire({
          title: "ออกจากระบบสำเร็จ!",
          text: "ขอบคุณที่ใช้งานระบบ",
          icon: "success",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#f97316",
          timer: 2000,
          timerProgressBar: true,
        });

        // Force a hard redirect to clear any cached state
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout error:", error);
        // Fallback: force reload
        window.location.reload();
      }
    }
  };

  const navItems = [
    {
      href: "/contract",
      label: "จัดการสัญญา",
      icon: FileText,
      show: true,
    },
    {
      href: "/admin/users",
      label: "จัดการผู้ใช้",
      icon: Users,
      show: isAdmin,
      adminOnly: true,
    },
    // {
    //   href: "/admin/settings",
    //   label: "ตั้งค่าระบบ",
    //   icon: Settings,
    //   show: isAdmin,
    //   adminOnly: true,
    // },
  ];

  const getInitials = (firstname: string, surname: string) => {
    if (!firstname || !surname) return "U";
    return `${firstname.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  // Don't render navbar on auth pages
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    return null;
  }

  // Show loading state briefly to prevent flash
  if (isLoading) {
    return (
      <nav className="bg-orange-400 shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-white flex items-center justify-center rounded-full shadow-md">
                <Image
                  src="/OAG_Logo.png"
                  alt="สำนักงานอัยการจังหวัดปราจีนบุรี"
                  width={20}
                  height={20}
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-300 rounded-full h-10 w-10"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-orange-400 shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/contract" className="flex items-center space-x-3">
              <div className="bg-white flex items-center justify-center rounded-full shadow-md">
                <Image
                  src="/OAG_Logo.png"
                  alt="สำนักงานอัยการจังหวัดปราจีนบุรี"
                  width={20}
                  height={20}
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div className="hidden sm:block text-white">
                <h1 className="text-xl font-bold ">ระบบทะเบียนคุมสัญญา</h1>
                <p className="text-xs opacity-90">
                  สำนักงานอัยการจังหวัดปราจีนบุรี
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.adminOnly && pathname.startsWith("/admin"));

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center space-x-2 ${
                        isActive
                          ? "bg-white hover:bg-orange-500 text-gray-900"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.adminOnly && (
                        <Shield className="w-3 h-3 text-orange-300" />
                      )}
                    </Button>
                  </Link>
                );
              })}
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Badge
                variant="outline"
                className="hidden sm:flex text-orange-600 border-orange-600"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.picture}
                      alt={user ? `${user.firstname} ${user.surname}` : "User"}
                    />
                    <AvatarFallback className="bg-orange-600 text-white">
                      {user ? getInitials(user.firstname, user.surname) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user ? `${user.firstname} ${user.surname}` : "ผู้ใช้งาน"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || user?.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.position}
                    </p>
                    {isAdmin && (
                      <Badge
                        variant="outline"
                        className="w-fit text-orange-600 border-orange-600 mt-1"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        ผู้ดูแลระบบ
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>โปรไฟล์</span>
                  </Link>
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-orange-600 font-semibold">
                      เมนูผู้ดูแลระบบ
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        <span>จัดการผู้ใช้</span>
                      </Link>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>ตั้งค่าระบบ</span>
                      </Link>
                    </DropdownMenuItem> */}
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navItems
                .filter((item) => item.show)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.adminOnly && pathname.startsWith("/admin"));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          isActive
                            ? "bg-orange-600 hover:bg-orange-700 text-white"
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        <span>{item.label}</span>
                        {item.adminOnly && (
                          <Shield className="w-3 h-3 ml-auto text-orange-300" />
                        )}
                      </Button>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
