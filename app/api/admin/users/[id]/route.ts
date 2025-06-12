import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import { jwtVerify } from "jose";
import { pool } from "@/lib/db";

const verifyToken = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

const isAdmin = (payload: any) => {
  return (
    payload && (payload.role === "admin" || payload.role === "super_admin")
  );
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "ไม่พบ token การยืนยันตัวตน" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Token ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    if (!isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, error: "ไม่มีสิทธิ์ดำเนินการนี้" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;
    const { id: userId } = await params;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุสถานะ" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "suspended",
      "inactive",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "สถานะไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    // Check if user exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, error: "ไม่พบผู้ใช้ที่ต้องการอัพเดท" },
        { status: 404 }
      );
    }

    // Update user status
    const [result] = await connection.execute(
      `UPDATE users SET status = ?, updatedate = NOW() WHERE id = ?`,
      [status, userId]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "อัพเดทสถานะผู้ใช้เรียบร้อยแล้ว",
      ok: true,
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "ไม่พบ token การยืนยันตัวตน" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Token ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    if (!isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 }
      );
    }

    const userId = params.id;
    const connection = await createConnection();

    const [users] = await pool.execute(
      `SELECT id, username, email, firstname, surname, position, picture, status, role, dateadd, updatedate 
       FROM users WHERE id = ?`,
      [userId]
    );

    await connection.end();

    const userArray = users as any[];
    if (userArray.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่พบผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userArray[0],
    });
  } catch (error) {
    console.error("Admin user fetch error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "ไม่พบ token การยืนยันตัวตน" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Token ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    if (!isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, error: "ไม่มีสิทธิ์ดำเนินการนี้" },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Prevent admin from deleting themselves
    if (decoded.userId === parseInt(userId)) {
      return NextResponse.json(
        { success: false, error: "ไม่สามารถลบบัญชีของตัวเองได้" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    // Check if user exists
    const [existingUsers] = await connection.execute(
      "SELECT id, role FROM users WHERE id = ?",
      [userId]
    );

    if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, error: "ไม่พบผู้ใช้ที่ต้องการลบ" },
        { status: 404 }
      );
    }

    // Prevent deleting super admin (optional security measure)
    const targetUser = existingUsers[0] as any;
    if (targetUser.role === "super_admin" && decoded.role !== "super_admin") {
      await connection.end();
      return NextResponse.json(
        { success: false, error: "ไม่สามารถลบผู้ดูแลระบบสูงสุดได้" },
        { status: 403 }
      );
    }

    // Soft delete - set status to inactive instead of actually deleting
    const [result] = await connection.execute(
      `UPDATE users SET status = 'inactive', updatedate = NOW() WHERE id = ?`,
      [userId]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "ลบผู้ใช้เรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการลบผู้ใช้" },
      { status: 500 }
    );
  }
}
