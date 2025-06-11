"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Eye, EyeOff, LogIn, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showSuccessAlert, showErrorAlert } from "@/lib/swal-config";

// Define schema for validation
const loginSchema = z.object({
  username: z.string().min(1, {
    message: "กรุณากรอกชื่อผู้ใช้",
  }),
  password: z.string().min(1, {
    message: "กรุณากรอกรหัสผ่าน",
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        await showSuccessAlert(
          "เข้าสู่ระบบสำเร็จ!",
          `ยินดีต้อนรับ ${result.user.firstname} ${result.user.surname}`,
          2000
        );

        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token", result.token);

        document.cookie = `token=${
          result.token
        }; path=/; max-age=86400; SameSite=Lax; Secure=${
          process.env.NODE_ENV === "production"
        }`;
        router.push("/contract");
      } else {
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Login error:", error);
      await showErrorAlert(
        "เข้าสู่ระบบไม่สำเร็จ!",
        "ตรวจสอบชื่อผู้ใช้หรือรหัสผ่านอีกครั้ง"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบ</h1>
            <p className="text-gray-600 mt-2">ระบบทะเบียนคุมสัญญา - OAG</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">ชื่อผู้ใช้</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          placeholder="กรอกชื่อผู้ใช้"
                          className="pl-10 h-12 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">รหัสผ่าน</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="กรอกรหัสผ่าน"
                          className="pr-10 h-12 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-orange-400 focus:ring-orange-400"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    จดจำการเข้าสู่ระบบ
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-orange-400 hover:text-orange-500"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </div>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              ยังไม่มีบัญชี?{" "}
              <Link
                href="/signup"
                className="text-orange-400 hover:text-orange-500 font-medium"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
