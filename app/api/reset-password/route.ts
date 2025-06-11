import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    // Check if token exists and is not expired
    const [users] = await connection.execute(
      `SELECT id, username, firstname, surname 
       FROM users 
       WHERE reset_token = ? AND reset_token_expiry > NOW()`,
      [token]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "โทเค็นไม่ถูกต้องหรือหมดอายุแล้ว" },
        { status: 400 }
      );
    }

    const user = users[0] as any;

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await connection.execute(
      `UPDATE users 
       SET password = ?, reset_token = NULL, reset_token_expiry = NULL 
       WHERE id = ?`,
      [hashedPassword, user.id]
    );

    return NextResponse.json({
      success: true,
      message: "รีเซ็ตรหัสผ่านสำเร็จ",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" },
      { status: 500 }
    );
  }
}
