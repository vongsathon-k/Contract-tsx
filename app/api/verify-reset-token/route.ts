import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "ไม่พบโทเค็น" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    // Check if token exists and is not expired
    const [users] = await connection.execute(
      `SELECT id, username, firstname, surname, reset_token_expiry 
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

    return NextResponse.json({
      success: true,
      message: "โทเค็นถูกต้อง",
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        surname: user.surname,
      },
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบโทเค็น" },
      { status: 500 }
    );
  }
}
