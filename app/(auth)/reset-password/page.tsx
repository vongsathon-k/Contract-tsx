"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, KeyRound, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showErrorAlert, showSuccessAlert } from "@/lib/swal-config";

// Define schema for validation
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: "รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข",
      }),
    confirmPassword: z.string().min(1, { message: "กรุณายืนยันรหัสผ่าน" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState("");

  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setTokenError("ไม่พบโทเค็นรีเซ็ตรหัสผ่าน");
        return;
      }

      try {
        const response = await fetch("/api/verify-reset-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (response.ok) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          setTokenError(result.error || "โทเค็นไม่ถูกต้องหรือหมดอายุ");
        }
      } catch (error) {
        setIsValidToken(false);
        setTokenError("เกิดข้อผิดพลาดในการตรวจสอบโทเค็น");
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (values: ResetPasswordFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        await showSuccessAlert(
          "รีเซ็ตรหัสผ่านสำเร็จ!",
          "รหัสผ่านของคุณได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว",
          3000
        );
        // Redirect to login after success
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      await showErrorAlert(
        "เกิดข้อผิดพลาด!",
        error instanceof Error ? error.message : "ไม่สามารถรีเซ็ตรหัสผ่านได้"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังตรวจสอบโทเค็น...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-400 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              โทเค็นไม่ถูกต้อง
            </h1>
            <p className="text-gray-600 mb-6">{tokenError}</p>
            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full bg-orange-400 hover:bg-orange-500">
                  ขอลิงก์รีเซ็ตใหม่
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              รีเซ็ตรหัสผ่านสำเร็จ!
            </h1>
            <p className="text-gray-600 mb-6">
              รหัสผ่านของคุณได้รับการเปลี่ยนแปลงเรียบร้อยแล้ว
              กำลังนำคุณไปหน้าเข้าสู่ระบบ...
            </p>
            <Link href="/login">
              <Button className="w-full bg-orange-400 hover:bg-orange-500">
                ไปหน้าเข้าสู่ระบบ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              ตั้งรหัสผ่านใหม่
            </h1>
            <p className="text-gray-600 mt-2">กรอกรหัสผ่านใหม่ของคุณ</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      รหัสผ่านใหม่
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="กรอกรหัสผ่านใหม่"
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

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      ยืนยันรหัสผ่านใหม่
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="ยืนยันรหัสผ่านใหม่"
                          className="pr-10 h-12 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
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

              {/* Password Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">รหัสผ่านต้องมี:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• อย่างน้อย 8 ตัวอักษร</li>
                  <li>• ตัวพิมพ์เล็กและตัวพิมพ์ใหญ่</li>
                  <li>• ตัวเลขอย่างน้อย 1 ตัว</li>
                </ul>
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
                    <span>กำลังบันทึก...</span>
                  </div>
                ) : (
                  "บันทึกรหัสผ่านใหม่"
                )}
              </Button>
            </form>
          </Form>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/login"
              className="text-orange-400 hover:text-orange-500 font-medium transition-colors"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
