"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Briefcase,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth-utils";
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

const profileSchema = z.object({
  firstname: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  surname: z.string().min(2, "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  position: z.string().min(2, "ตำแหน่งต้องมีอย่างน้อย 2 ตัวอักษร"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname: "",
      surname: "",
      email: "",
      position: "",
    },
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      form.reset({
        firstname: currentUser.firstname || "",
        surname: currentUser.surname || "",
        email: currentUser.email || "",
        position: currentUser.position || "",
      });
    }
  }, [form]);

  const getInitials = (firstname: string, surname: string) => {
    if (!firstname || !surname) return "U";
    return `${firstname.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            ใช้งานได้
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            รอการอนุมัติ
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            ถูกปฏิเสธ
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
            ถูกระงับ
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
            <Shield className="w-3 h-3 mr-1" />
            ผู้ดูแลระบบ
          </Badge>
        );
      case "super_admin":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-300">
            <Shield className="w-3 h-3 mr-1" />
            ผู้ดูแลระบบสูงสุด
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <User className="w-3 h-3 mr-1" />
            ผู้ใช้งานทั่วไป
          </Badge>
        );
    }
  };

  const onSubmit = async (values: ProfileFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const result = await response.json();

        // Update localStorage with new user data
        const updatedUser = { ...user, ...values };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        const Swal = (await import("sweetalert2")).default;
        await Swal.fire({
          title: "สำเร็จ!",
          text: "อัพเดทข้อมูลโปรไฟล์เรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#f97316",
          timer: 2000,
          timerProgressBar: true,
        });

        setIsEditing(false);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const Swal = (await import("sweetalert2")).default;
      await Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถอัพเดทข้อมูลได้",
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      firstname: user?.firstname || "",
      surname: user?.surname || "",
      email: user?.email || "",
      position: user?.position || "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">โปรไฟล์ผู้ใช้</h1>
            <p className="text-gray-600 mt-1">จัดการข้อมูลส่วนตัวของคุณ</p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-orange-400 hover:bg-orange-500"
            >
              <Edit className="w-4 h-4 mr-2" />
              แก้ไขข้อมูล
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={user.picture}
                      alt={`${user.firstname} ${user.surname}`}
                    />
                    <AvatarFallback className="bg-orange-400 text-white text-2xl">
                      {getInitials(user.firstname, user.surname)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {user.firstname} {user.surname}
                </CardTitle>
                <CardDescription>@{user.username}</CardDescription>
                <div className="flex flex-col items-center space-y-2 mt-4">
                  {getStatusBadge(user.status)}
                  {getRoleBadge(user.role)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm">{user.position}</span>
                </div>
                {user.dateadd && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">สมัครเมื่อ </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                <CardDescription>
                  {isEditing
                    ? "แก้ไขข้อมูลส่วนตัวของคุณ"
                    : "ข้อมูลส่วนตัวของคุณ"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ชื่อ</FormLabel>
                              <FormControl>
                                <Input placeholder="กรอกชื่อ" {...field} />
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
                                <Input placeholder="กรอกนามสกุล" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>อีเมล</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="กรอกอีเมล"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ตำแหน่ง</FormLabel>
                            <FormControl>
                              <Input placeholder="กรอกตำแหน่ง" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-4">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="bg-orange-400 hover:bg-orange-500"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              กำลังบันทึก...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              บันทึกการเปลี่ยนแปลง
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4 mr-2" />
                          ยกเลิก
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          ชื่อ
                        </Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user.firstname}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          นามสกุล
                        </Label>
                        <p className="mt-1 text-sm text-gray-900">
                          {user.surname}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        ชื่อผู้ใช้
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.username}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        อีเมล
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        ตำแหน่ง
                      </Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.position}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        สถานะบัญชี
                      </Label>
                      <div className="mt-1">{getStatusBadge(user.status)}</div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        ระดับสิทธิ์
                      </Label>
                      <div className="mt-1">{getRoleBadge(user.role)}</div>
                    </div>

                    {user.dateadd && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          วันที่สมัครสมาชิก
                        </Label>
                        <p className="mt-1 text-sm text-gray-900"></p>
                      </div>
                    )}

                    {user.updatedate && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          อัพเดทล่าสุด
                        </Label>
                        <p className="mt-1 text-sm text-gray-900"></p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
