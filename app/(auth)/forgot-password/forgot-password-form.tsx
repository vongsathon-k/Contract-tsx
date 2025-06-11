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
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showSuccessAlert, showErrorAlert } from "@/lib/swal-config";

// Instead of the full Swal.fire config

// Define schema for validation
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email({
      message: "กรุณากรอกอีเมลให้ถูกต้อง",
    })
    .min(1, {
      message: "กรุณากรอกอีเมล",
    }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        await showSuccessAlert(
          "ส่งลิงก์เรียบร้อย!",
          "กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน"
        );
      } else {
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      await showErrorAlert(
        "เกิดข้อผิดพลาด!",
        "ตรวจจสอบที่อยู่อีเมลของคุณอีกครั้ง"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              ตรวจสอบอีเมลของคุณ
            </h1>
            <p className="text-gray-600 mb-6">
              เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว
              กรุณาตรวจสอบกล่องจดหมายและทำตามขั้นตอนที่ระบุ
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => setIsSuccess(false)}
                variant="outline"
                className="w-full"
              >
                ส่งอีเมลอีกครั้ง
              </Button>
              <Link href="/login">
                <Button className="w-full bg-orange-400 hover:bg-orange-500">
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">ลืมรหัสผ่าน</h1>
            <p className="text-gray-600 mt-2">
              กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">อีเมล</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="email"
                          placeholder="กรอกอีเมลของคุณ"
                          className="pl-10 h-12 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>กำลังส่งลิงก์...</span>
                  </div>
                ) : (
                  "ส่งลิงก์รีเซ็ตรหัสผ่าน"
                )}
              </Button>
            </form>
          </Form>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/login"
              className="flex items-center justify-center space-x-2 text-orange-400 hover:text-orange-500 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับไปหน้าเข้าสู่ระบบ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
