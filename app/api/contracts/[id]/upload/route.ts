import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let connection;

  try {
    const contractId = params.id;
    const formData = await request.formData();

    // Get files from form data
    const contractFile = formData.get("contract_file") as File;
    const attachmentFile = formData.get("attachment_file") as File | null;

    console.log("Contract file:", contractFile?.name || "Not provided");
    console.log("Attachment file:", attachmentFile?.name || "Not provided");

    // ✅ Only validate contract file as required
    if (!contractFile || contractFile.size === 0) {
      return NextResponse.json(
        { success: false, error: "กรุณาเลือกไฟล์สัญญา" },
        { status: 400 }
      );
    }

    // Validate contract file type
    if (contractFile.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "ไฟล์สัญญาต้องเป็น PDF เท่านั้น" },
        { status: 400 }
      );
    }

    // Validate contract file size
    if (contractFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "ขนาดไฟล์สัญญาต้องไม่เกิน 10MB" },
        { status: 400 }
      );
    }

    // ✅ Validate attachment file only if provided (optional)
    if (attachmentFile && attachmentFile.size > 0) {
      if (attachmentFile.type !== "application/pdf") {
        return NextResponse.json(
          { success: false, error: "ไฟล์แนบต้องเป็น PDF เท่านั้น" },
          { status: 400 }
        );
      }

      if (attachmentFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "ขนาดไฟล์แนบต้องไม่เกิน 10MB" },
          { status: 400 }
        );
      }
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "contracts"
    );

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.log("Directory already exists or created successfully");
    }

    // ✅ Generate Thailand timestamp
    const getThailandTimestamp = () => {
      return new Date()
        .toLocaleString("en-CA", {
          timeZone: "Asia/Bangkok",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(/[^\d]/g, "");
    };

    const timestamp = getThailandTimestamp();

    // Save contract file (required)
    const contractFileName = `contract_${timestamp}_${contractFile.name}`;
    const contractFilePath = path.join(uploadDir, contractFileName);
    const contractBuffer = Buffer.from(await contractFile.arrayBuffer());
    await writeFile(contractFilePath, contractBuffer);

    console.log("Contract file saved:", contractFileName);

    // ✅ Save attachment file only if provided (optional)
    let attachmentFileName = null;
    let attachmentFilePath = null;
    let attachmentFileUrl = null;

    if (attachmentFile && attachmentFile.size > 0) {
      attachmentFileName = `attachment_${timestamp}_${attachmentFile.name}`;
      attachmentFilePath = path.join(uploadDir, attachmentFileName);
      attachmentFileUrl = `/uploads/contracts/${attachmentFileName}`;

      const attachmentBuffer = Buffer.from(await attachmentFile.arrayBuffer());
      await writeFile(attachmentFilePath, attachmentBuffer);

      console.log("Attachment file saved:", attachmentFileName);
    } else {
      console.log("No attachment file provided - skipping");
    }

    // Update database with file paths and contract data
    connection = await createConnection();

    // ✅ Updated query to handle optional attachment file
    const [result] = await connection.execute(
      `UPDATE contract SET 
        contract_file_path = ?,
        contract_file_name = ?,
        attachment_file_path = ?,
        attachment_file_name = ?,
        upload_date = CONVERT_TZ(NOW(), "UTC", "Asia/Bangkok"),
        status = 2
      WHERE id = ?`,
      [
        `/uploads/contracts/${contractFileName}`,
        contractFile.name,
        attachmentFileUrl, // ✅ Will be null if no attachment
        attachmentFile ? attachmentFile.name : null, // ✅ Will be null if no attachment
        contractId,
      ]
    );

    console.log("Database updated successfully");

    // ✅ Updated response to handle optional attachment
    const responseData = {
      success: true,
      message: attachmentFile
        ? "อัพโหลดไฟล์สัญญาและไฟล์แนบสำเร็จ"
        : "อัพโหลดไฟล์สัญญาสำเร็จ",
      data: {
        contractFile: contractFileName,
        contractPath: `/uploads/contracts/${contractFileName}`,
        ...(attachmentFileName && {
          attachmentFile: attachmentFileName,
          attachmentPath: attachmentFileUrl,
        }),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "เกิดข้อผิดพลาดในการอัพโหลดไฟล์: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  } finally {
    // ✅ Ensure database connection is closed
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
}
