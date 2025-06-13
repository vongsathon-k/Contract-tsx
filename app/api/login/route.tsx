import { createConnection } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" },
        { status: 400 }
      );
    }

    connection = await createConnection();

    const [users] = await connection.execute(
      `SELECT u.id, u.username, u.password, u.firstname, u.surname, u.position, 
              u.picture, u.email, u.status, u.role, u.division_id, d.name as division_name
       FROM users u 
       LEFT JOIN divisions d ON u.division_id = d.id 
       WHERE u.username = ?`,
      [username]
    );

    const userArray = users as any[];

    if (userArray.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่พบผู้ใช้งานในระบบ" },
        { status: 401 }
      );
    }

    const user = userArray[0];
    if (user.status !== "approved") {
      let statusMessage = "";
      switch (user.status) {
        case "pending":
          statusMessage =
            "บัญชีของคุณรอการอนุมัติจากผู้ดูแลระบบ กรุณารอการติดต่อกลับ";
          break;
        case "rejected":
          statusMessage = "บัญชีของคุณถูกปฏิเสธ กรุณาติดต่อผู้ดูแลระบบ";
          break;
        case "suspended":
          statusMessage = "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ";
          break;
        case "inactive":
          statusMessage = "บัญชีของคุณไม่ได้ใช้งาน กรุณาติดต่อผู้ดูแลระบบ";
          break;
        default:
          statusMessage = "สถานะบัญชีของคุณไม่อนุญาตให้เข้าสู่ระบบ";
      }

      return NextResponse.json(
        {
          success: false,
          message: statusMessage,
          status: user.status,
        },
        { status: 403 } // Forbidden
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      email: user.email,
      position: user.position,
      divisionId: user.division_id,
      role: user.role || "user",
      fullname: user.firstname + " " + user.lastname,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(secret);
    console.log("🎫 Token created for user:", {
      userId: user.id,
      role: user.role,
      divisionId: user.division_id,
    });

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 28800, // 24 hours
    });

    await connection.execute(
      "UPDATE users SET updatedate = NOW() WHERE id = ?",
      [user.id]
    );
    return NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
}
