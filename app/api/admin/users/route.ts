import { NextRequest, NextResponse } from "next/server";
import { createConnection, pool } from "@/lib/db";
import { jwtVerify } from "jose";

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

export async function GET(request: NextRequest) {
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

    const [users] = await pool.execute(
      `SELECT id, username, email, firstname, surname, position, picture, status, role, dateadd, updatedate 
       FROM users 
       ORDER BY dateadd DESC`
    );

    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
       FROM users`
    );

    // await pool.end();
    // console.log([users]);
    return NextResponse.json({
      success: true,
      users: users,
      stats: (stats as any[])[0],
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ครบถ้วน" },
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

    // Update user status
    const [result] = await pool.execute(
      `UPDATE users SET status = ?, updatedate = NOW() WHERE id = ?`,
      [status, userId]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่พบผู้ใช้ที่ต้องการอัพเดท" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "อัพเดทสถานะผู้ใช้เรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล" },
      { status: 500 }
    );
  }
}
