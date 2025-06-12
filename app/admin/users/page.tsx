"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/lib/swal-config";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getData, updateStatus } from "@/app/action/user";

interface User {
  picture: string | Blob | undefined;
  id: number;
  username: string;
  email: string;
  firstname: string;
  surname: string;
  position: string;
  status: "pending" | "approved" | "rejected" | "suspended" | "inactive";
  dateadd: string;
  updatedate: string;
}

interface UserStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const {
    data: data1,
    isLoading,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getData,
  });

  const queryclient = useQueryClient();

  useEffect(() => {
    if (isSuccess) {
      setUsers(data1.users);
      setStats(data1.stats);
    }
  }, [data1, isSuccess]);

  const mutation = useMutation({
    mutationFn: (variables: { userId: number; status: string }) =>
      updateStatus(variables.userId, variables.status),
    onSuccess: async (data) => {
      const response = data;
      if (response.status === 200) {
        queryclient.invalidateQueries({ queryKey: ["users"] });
        await showSuccessAlert(
          "สำเร็จ!",
          "อัปเดตสถานะผู้ใช้เรียบร้อยแล้ว",
          2000
        );
      } else {
        throw new Error("Failed to update user status");
      }
    },
  });
  const updateUserStatus = async (
    userId: number,
    status: string,
    action: string
  ) => {
    try {
      setActionLoading(userId);
      mutation.mutate({ userId, status });
    } catch (error) {
      console.error(`Error ${action.toLowerCase()} user:`, error);
      await showErrorAlert("เกิดข้อผิดพลาด!", `ไม่สามารถ${action}ผู้ใช้ได้`);
    } finally {
      setActionLoading(null);
    }
  };
  const approveUser = async (userId: number) => {
    const Swal = (await import("sweetalert2")).default;
    const result = await showConfirmAlert(
      "ยืนยันการอนุมัติ",
      "คุณต้องการอนุมัติผู้ใช้นี้หรือไม่",
      "question"
    );
    if (result.isConfirmed) {
      await updateUserStatus(userId, "approved", "อนุมัติ");
    }
  };

  const rejectUser = async (userId: number) => {
    const result = await showConfirmAlert(
      "ยืนยันการปฏิเสธ",
      "คุณต้องการปฏิเสธผู้ใช้นี้หรือไม่"
    );
    if (result.isConfirmed) {
      await updateUserStatus(userId, "rejected", "ปฏิเสธ");
    }
  };

  const suspendUser = async (userId: number) => {
    const result = await showConfirmAlert(
      "ยืนยันการระงับ",
      "คุณต้องการระงับผู้ใช้นี้หรือไม่"
    );

    if (result.isConfirmed) {
      await updateUserStatus(userId, "suspended", "ระงับ");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            <Clock className="w-3 h-3 mr-1" />
            รอการอนุมัติ
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            อนุมัติแล้ว
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            ปฏิเสธ
          </Badge>
        );
      case "suspended":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-600"
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            ระงับ
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (firstname: string, surname: string) => {
    return `${firstname.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const filteredUsers = users
    ? users.filter((user: any) => {
        if (filter === "all") return true;
        return user.status === filter;
      })
    : [];

  const formatThaiDate = (dateString: string): string => {
    if (!dateString) return "ไม่ระบุวันที่";

    const date = new Date(dateString);
    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;

    return `${day} ${month} ${year}`;
  };

  return (
    <>
      {isLoading && (
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      )}
      {!isLoading && (
        <div className="container mx-auto py-8 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                จัดการผู้ใช้งาน
              </h1>
              <p className="text-gray-600 mt-1">
                อนุมัติ ปฏิเสธ หรือจัดการสถานะผู้ใช้งาน
              </p>
            </div>
            <Button
              onClick={() =>
                queryclient.invalidateQueries({ queryKey: ["users"] })
              }
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              รีเฟรช
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      ผู้ใช้ทั้งหมด
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.total}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      รอการอนุมัติ
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats?.pending}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      อนุมัติแล้ว
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats?.approved}
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ปฏิเสธ</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats?.rejected}
                    </p>
                  </div>
                  <UserX className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={
                filter === "all" ? "bg-orange-400 hover:bg-orange-500" : ""
              }
            >
              ทั้งหมด ({stats?.total})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              className={
                filter === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""
              }
            >
              รอการอนุมัติ ({stats?.pending})
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              onClick={() => setFilter("approved")}
              className={
                filter === "approved" ? "bg-green-500 hover:bg-green-600" : ""
              }
            >
              อนุมัติแล้ว ({stats?.approved})
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              onClick={() => setFilter("rejected")}
              className={
                filter === "rejected" ? "bg-red-500 hover:bg-red-600" : ""
              }
            >
              ปฏิเสธ ({stats?.rejected})
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>รายชื่อผู้ใช้งาน</CardTitle>
              <CardDescription>
                แสดงผู้ใช้ {filteredUsers.length} คน จากทั้งหมด {users.length}{" "}
                คน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ผู้ใช้</TableHead>
                      <TableHead>อีเมล</TableHead>
                      <TableHead>ตำแหน่ง</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>วันที่สมัคร</TableHead>
                      <TableHead>การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          ไม่พบข้อมูลผู้ใช้
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={user.picture} />
                                <AvatarFallback className="bg-orange-400 text-white">
                                  {getInitials(user.firstname, user.surname)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {user.firstname} {user.surname}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.position}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{formatThaiDate(user.dateadd)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center space-x-4">
                              {user.status === "pending" && (
                                <Button
                                  variant="outline"
                                  onClick={() => approveUser(user.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {user.status === "approved" && (
                                <Button
                                  variant="outline"
                                  onClick={() => suspendUser(user.id)}
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {user.status === "suspended" && (
                                <Button
                                  variant="outline"
                                  onClick={() => approveUser(user.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {user.status !== "rejected" && (
                                <Button
                                  variant="outline"
                                  onClick={() => rejectUser(user.id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
