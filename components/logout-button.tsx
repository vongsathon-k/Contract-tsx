"use client";

import { Button } from "@/components/ui/button";
import { showSuccessAlert } from "@/lib/swal-config";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserData {
  id: number;
  username: string;
  firstname: string;
  surname: string;
  position: string;
  picture?: string;
}
export default function LogoutButton() {
  const [user, setUser] = useState<UserData | null>(null);

  const router = useRouter();
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  };
  const handleLogout = async () => {
    const Swal = (await import("sweetalert2")).default;
    const result = await Swal.fire({
      title: "ออกจากระบบ",
      text: "คุณต้องการออกจากระบบหรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      // Show loading
      Swal.fire({
        title: "กำลังออกจากระบบ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Simulate logout delay
      setTimeout(async () => {
        logout();
        await showSuccessAlert("ออกจากระบบสำเร็จ!", "", 2000);
        router.push("/login");
      }, 1000);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
    >
      <LogOut className="w-4 h-4" />
      <span>ออกจากระบบ</span>
    </Button>
  );
}
