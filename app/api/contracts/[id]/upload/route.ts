import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractId } = await params;
    const formData = await request.formData();

    // Get files from form data
    const contractFile = formData.get("contract_file") as File;
    const attachmentFile = formData.get("attachment_file") as File;

    if (!contractFile || !attachmentFile) {
      return NextResponse.json(
        { success: false, error: "กรุณาเลือกไฟล์ทั้งสองไฟล์" },
        { status: 400 }
      );
    }

    // Validate file types
    if (
      contractFile.type !== "application/pdf" ||
      attachmentFile.type !== "application/pdf"
    ) {
      return NextResponse.json(
        { success: false, error: "กรุณาเลือกไฟล์ PDF เท่านั้น" },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "contracts",
      contractId
    );
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Generate unique filenames with timestamp
    const timestamp = Date.now();
    const contractFileName = `contract_${timestamp}_${contractFile.name}`;
    const attachmentFileName = `attachment_${timestamp}_${attachmentFile.name}`;

    // Save files to disk
    const contractBuffer = Buffer.from(await contractFile.arrayBuffer());
    const attachmentBuffer = Buffer.from(await attachmentFile.arrayBuffer());

    const contractPath = path.join(uploadDir, contractFileName);
    const attachmentPath = path.join(uploadDir, attachmentFileName);

    await writeFile(contractPath, contractBuffer);
    await writeFile(attachmentPath, attachmentBuffer);

    // Get other form data

    // Update database with file paths and contract data
    const connection = await createConnection();

    const [result] = await connection.execute(
      `UPDATE contract SET 
       
        contract_file_path = ?,
        attachment_file_path = ?,
        contract_file_name = ?,
        attachment_file_name = ?,
        upload_date = NOW(),
        status = 2
      WHERE id = ? AND isdelete = 0`,
      [
        `/uploads/contracts/${contractId}/${contractFileName}`,
        `/uploads/contracts/${contractId}/${attachmentFileName}`,
        contractFile.name,
        attachmentFile.name,
        contractId,
      ]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "อัพโหลดไฟล์สำเร็จ",
      data: {
        contractFile: contractFileName,
        attachmentFile: attachmentFileName,
        contractPath: `/uploads/contracts/${contractId}/${contractFileName}`,
        attachmentPath: `/uploads/contracts/${contractId}/${attachmentFileName}`,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์" },
      { status: 500 }
    );
  }
}
