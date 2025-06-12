import { createConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, firstname, surname, position } = body;

    // Validate required fields
    if (
      !username ||
      !email ||
      !password ||
      !firstname ||
      !surname ||
      !position
    ) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    // Check if username or email already exists
    const [existingUsers] = await connection.execute(
      "SELECT username, email FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      const existing = existingUsers[0] as any;
      if (existing.username === username) {
        return NextResponse.json(
          { success: false, error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" },
          { status: 400 }
        );
      }
      if (existing.email === email) {
        return NextResponse.json(
          { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user with pending status
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password, firstname, surname, position, role, status, dateadd) 
       VALUES (?, ?, ?, ?, ?, ?, 'user', 'pending', NOW())`,
      [username, email, hashedPassword, firstname, surname, position]
    );

    return NextResponse.json({
      success: true,
      message: "สมัครสมาชิกเรียบร้อยแล้ว กรุณารอการอนุมัติจากผู้ดูแลระบบ",
      id: (result as any).insertId,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    );
  }
}
