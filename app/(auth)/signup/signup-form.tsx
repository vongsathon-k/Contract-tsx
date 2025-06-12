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
import { Upload, X, User } from "lucide-react";
import { showErrorAlert, showSuccessAlert } from "@/lib/swal-config";

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
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview
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

      // Create FormData for file upload
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
        body: formData, // Send FormData instead of JSON
      });

      const result = await response.json();

      if (response.ok) {
        await showSuccessAlert("สำเร็จ!", "สมัครสมาชิกเรียบร้อยแล้ว");

        // Reset form
        form.reset();
        setPreviewImage(null);
        setSelectedFile(null);
      } else {
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Signup error:", error);
      await showErrorAlert(
        "เกิดข้อผิดพลาด!",
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการสมัครสมาชิก"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          สมัครสมาชิก
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                    <User size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="picture-upload"
                />
                <label
                  htmlFor="picture-upload"
                  className="cursor-pointer bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                >
                  <Upload size={16} />
                  <span>เลือกรูปภาพ</span>
                </label>
              </div>
              <p className="text-sm text-gray-500">
                รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
              </p>
            </div>

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อผู้ใช้</FormLabel>
                  <FormControl>
                    <Input placeholder="ชื่อผู้ใช้" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>อีเมล</FormLabel>
                  <FormControl>
                    <Input placeholder="example@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="รหัสผ่าน"
                        {...field}
                      />
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
                    <FormLabel>ยืนยันรหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="ยืนยันรหัสผ่าน"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อ</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>นามสกุล</FormLabel>
                    <FormControl>
                      <Input placeholder="นามสกุล" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Position */}
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ตำแหน่ง</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                      <SelectItem value="อัยการอาวุโส">อัยการอาวุโส</SelectItem>
                      <SelectItem value="อัยการ">อัยการ</SelectItem>
                      <SelectItem value="เจ้าหน้าที่">เจ้าหน้าที่</SelectItem>
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
  );
}
