import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกอีเมล" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    // Check if user exists
    const [users] = await connection.execute(
      "SELECT id, username, firstname, surname FROM users WHERE email = ?",
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่พบผู้ใช้งานที่มีอีเมลนี้" },
        { status: 404 }
      );
    }

    const user = users[0] as any;

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await connection.execute(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
      [resetToken, resetTokenExpiry, user.id]
    );

    // Create reset URL
    const resetUrl = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    // ✅ CORRECT: Use createTransport (not createTransporter)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // May help with some SMTP servers
      },
    });

    // Verify connection before sending
    try {
      await transporter.verify();
      console.log("✅ SMTP connection verified");
    } catch (verifyError) {
      console.error("❌ SMTP verification failed:", verifyError);
      return NextResponse.json(
        { success: false, error: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์อีเมลได้" },
        { status: 500 }
      );
    }

    // Send email
    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        `"ระบบทะเบียนคุมสัญญา OAG" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "รีเซ็ตรหัสผ่าน - ระบบทะเบียนคุมสัญญา OAG",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f97316; margin: 0;">ระบบทะเบียนคุมสัญญา OAG</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333; margin-top: 0;">รีเซ็ตรหัสผ่าน</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              สวัสดี <strong>${user.firstname} ${user.surname}</strong>,
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              คุณได้ขอรีเซ็ตรหัสผ่านสำหรับระบบทะเบียนคุมสัญญา OAG
              กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #f97316; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; display: inline-block;
                        font-weight: bold; font-size: 16px;">
                รีเซ็ตรหัสผ่าน
              </a>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ หมายเหตุ:</strong><br>
                • ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง<br>
                • หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้<br>
                • อย่าแชร์ลิงก์นี้กับผู้อื่น
              </p>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-bottom: 0;">
              หากปุ่มไม่ทำงาน กรุณาคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:<br>
              <a href="${resetUrl}" style="color: #f97316; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              สำนักงานอัยการจังหวัดปราจีนบุรี<br>
              ระบบทะเบียนคุมสัญญา
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการส่งอีเมล" },
      { status: 500 }
    );
  }
}
