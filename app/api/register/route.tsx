import { createConnection } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  let connection;

  try {
    const formData = await request.formData();

    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstname = formData.get("firstname") as string;
    const surname = formData.get("surname") as string;
    const position = formData.get("position") as string;
    const picture = formData.get("picture") as File | null;

    // Validate required fields
    if (
      !username ||
      !password ||
      !firstname ||
      !surname ||
      !position ||
      !email
    ) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // Basic username validation
    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    connection = await createConnection();

    // Check if username already exists
    const [existingUser] = await connection.execute(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: "Username already exists" },
        { status: 409 }
      );
    }
    const [existingEmail] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (Array.isArray(existingEmail) && existingEmail.length > 0) {
      return NextResponse.json(
        { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }

    let picturePath = null;

    // Handle file upload if picture exists
    if (picture && picture.size > 0) {
      const bytes = await picture.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads", "profiles");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const originalName = picture.name;
      const extension = originalName.split(".").pop();
      const filename = `${username}_${timestamp}.${extension}`;
      const filepath = join(uploadsDir, filename);

      // Save file
      await writeFile(filepath, buffer);

      // Store relative path for database
      picturePath = `/uploads/profiles/${filename}`;
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await connection.execute(
      "INSERT INTO users (`username`, `password`, `firstname`, `surname`, `email`, `position`, `picture`, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')",
      [
        username,
        hashedPassword,
        firstname,
        surname,
        email,
        position,
        picturePath,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ",
      id: (result as any).insertId,
    });
  } catch (error) {
    console.error("Database insert error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    );
  } finally {
    // Ensure connection is closed
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
}
