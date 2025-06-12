"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Settings, BarChart3, Shield } from "lucide-react";
import { isCurrentUserAdmin } from "@/lib/auth-utils";
import { useEffect, useState } from "react";

export default function AdminNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isCurrentUserAdmin());
  }, []);

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  const navItems = [
    {
      href: "/admin/users",
      label: "จัดการผู้ใช้",
      icon: Users,
    },
    {
      href: "/contract",
      label: "จัดการสัญญา",
      icon: BarChart3,
    },
    // {
    //   href: "/admin/settings",
    //   label: "ตั้งค่าระบบ",
    //   icon: Settings,
    // },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <Shield className="w-5 h-5 text-orange-500 mr-2" />
        <span className="text-sm font-medium text-gray-600">
          โหมดผู้ดูแลระบบ
        </span>
      </div>

      <nav className="flex space-x-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "outline"}
                className={isActive ? "bg-orange-400 hover:bg-orange-500" : ""}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
