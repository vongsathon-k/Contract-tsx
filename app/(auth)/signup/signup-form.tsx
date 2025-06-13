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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  Upload,
  X,
  User,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Lock,
  IdCard,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define schema for validation
const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, {
        message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร",
      })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _",
      }),
    email: z.string().email({
      message: "อีเมลไม่ถูกต้อง",
    }),
    password: z.string().min(6, {
      message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    }),
    confirmPassword: z.string(),
    firstname: z.string().min(2, {
      message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร",
    }),
    surname: z.string().min(2, {
      message: "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร",
    }),
    position: z.string().min(1, {
      message: "กรุณาเลือกตำแหน่ง",
    }),
    picture: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstname: "",
      surname: "",
      position: "",
      picture: null,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        const showAlert = async () => {
          const Swal = (await import("sweetalert2")).default;
          await Swal.fire({
            title: "ไฟล์ไม่ถูกต้อง!",
            text: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
            icon: "error",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#f97316",
          });
        };
        showAlert();
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        const showAlert = async () => {
          const Swal = (await import("sweetalert2")).default;
          await Swal.fire({
            title: "ไฟล์ใหญ่เกินไป!",
            text: "ขนาดไฟล์ต้องไม่เกิน 5MB",
            icon: "error",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#f97316",
          });
        };
        showAlert();
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    form.setValue("picture", null);
  };

  const onSubmit = async (values: SignupFormData) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("firstname", values.firstname);
      formData.append("surname", values.surname);
      formData.append("position", values.position);

      if (selectedFile) {
        formData.append("picture", selectedFile);
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const Swal = (await import("sweetalert2")).default;
        await Swal.fire({
          title: "สำเร็จ!",
          text: "สมัครสมาชิกเรียบร้อยแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ",
          icon: "success",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#f97316",
          timer: 3000,
          timerProgressBar: true,
        });

        form.reset();
        setPreviewImage(null);
        setSelectedFile(null);
        router.push("/login");
      } else {
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const Swal = (await import("sweetalert2")).default;
      await Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการสมัครสมาชิก",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 py-4">
      <div className="max-w-4xl w-full mx-4">
        <div className="bg-white shadow-2xl rounded-2xl p-6">
          {/* Compact Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center mb-3">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">สมัครสมาชิก</h1>
            <p className="text-sm text-gray-600 mt-1">
              ระบบทะเบียนคุมสัญญา - OAG
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Compact Profile Picture */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="relative">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-orange-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                      <User size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="picture-upload"
                  />
                  <label
                    htmlFor="picture-upload"
                    className="cursor-pointer bg-orange-400 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                  >
                    <Upload size={14} />
                    <span>เลือกรูปภาพ</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG ไม่เกิน 5MB
                  </p>
                </div>
              </div>

              {/* Form Fields in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm">
                        ชื่อ
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="ชื่อ"
                            className="pl-9 h-10 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm">
                        นามสกุล
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="นามสกุล"
                            className="pl-9 h-10 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Position */}
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm">
                        ตำแหน่ง
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="เลือกตำแหน่ง" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="อัยการจังหวัด">
                            อัยการจังหวัด
                          </SelectItem>
                          <SelectItem value="รองอัยการจังหวัด">
                            รองอัยการจังหวัด
                          </SelectItem>
                          <SelectItem value="อัยการผู้เชี่ยวชาญ">
                            อัยการผู้เชี่ยวชาญ
                          </SelectItem>
                          <SelectItem value="อัยการอาวุโส">
                            อัยการอาวุโส
                          </SelectItem>
                          <SelectItem value="อัยการ">อัยการ</SelectItem>
                          <SelectItem value="เจ้าหน้าที่">
                            เจ้าหน้าที่
                          </SelectItem>
                          <SelectItem value="เจ้าหน้าที่ธุรการ">
                            เจ้าหน้าที่ธุรการ
                          </SelectItem>
                          <SelectItem value="เจ้าหน้าที่การเงิน">
                            เจ้าหน้าที่การเงิน
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm">
                        ชื่อผู้ใช้
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="ชื่อผู้ใช้"
                            className="pl-9 h-10 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 text-sm">
                        อีเมล
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="email"
                            placeholder="example@gmail.com"
                            className="pl-9 h-10 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">รหัสผ่าน</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="รหัสผ่าน"
                            className="pl-10 pr-10 h-12 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        ยืนยันรหัสผ่าน
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="ยืนยันรหัสผ่าน"
                            className="pl-10 pr-10 h-12 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3"
              >
                {isLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
