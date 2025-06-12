import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
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

    const connection = await createConnection();

    const [users] = await connection.execute(
      `SELECT id, username, email, firstname, surname, position, picture, status, role, dateadd, updatedate 
       FROM users WHERE id = ?`,
      [decoded.userId]
    );

    const userArray = users as any[];

    if (userArray.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userArray[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์" },
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

    const body = await request.json();
    const { firstname, surname, email, position } = body;

    if (!firstname || !surname || !email || !position) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, decoded.userId]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 }
      );
    }

    await connection.execute(
      `UPDATE users SET 
        firstname = ?, 
        surname = ?, 
        email = ?, 
        position = ?, 
        updatedate = NOW() 
       WHERE id = ?`,
      [firstname, surname, email, position, decoded.userId]
    );

    const [updatedUsers] = await connection.execute(
      `SELECT id, username, email, firstname, surname, position, picture, status, role, dateadd, updatedate 
       FROM users WHERE id = ?`,
      [decoded.userId]
    );

    return NextResponse.json({
      success: true,
      message: "อัพเดทข้อมูลโปรไฟล์เรียบร้อยแล้ว",
      user: (updatedUsers as any[])[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล" },
      { status: 500 }
    );
  }
}
