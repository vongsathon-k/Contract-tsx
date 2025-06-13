import { pool } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    // ✅ Get user info from headers (set by middleware)
    const userId = request.headers.get("x-user-id");
    const userRole = request.headers.get("x-user-role");
    const userDivision = request.headers.get("x-user-division");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let query = "SELECT * FROM contract WHERE isdelete = 0";
    let params: any[] = [];

    // ✅ If user is not admin, filter by their division
    if (userRole !== "admin" && userRole !== "super_admin" && userDivision) {
      query += " AND division_id = ?";
      params.push(parseInt(userDivision));
    }

    query += " ORDER BY id DESC";
    const [rows] = await pool.execute(query, params);
    const contracts = rows as any[];

    // Status mapping object
    const statusMap: { [key: number]: string } = {
      1: "ทดสอบ",
      2: "อนุมัติ",
      3: "ปิด",
    };

    // Thai date formatting function
    const formatThaiDate = (dateString: string): string => {
      if (!dateString) return "ไม่ระบุวันที่";

      const date = new Date(dateString);
      const thaiMonths = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ];

      const day = date.getDate();
      const month = thaiMonths[date.getMonth()];
      const year = date.getFullYear() + 543;

      return `${day} ${month} ${year}`;
    };

    const divisionMap: { [key: number]: string } = {
      1: "สำนักงานอัยการจังหวัดปราจีนบุรี",
      2: "สำนักงานอัยการคดีเยาวชนและครอบครัวจังหวัดปราจีนบุรี",
      3: "สำนักงานอัยการคุ้มครองสิทธิและช่วยเหลือทางกฎหมายและการบังคับคดีจังหวัดปราจีนบุรี",
      4: "สำนักงานอัยการคุ้มครองสิทธิและช่วยเหลือทางกฎหมายและการบังคับคดีจังหวัดปราจีนบุรี สาขากบินทร์บุรี",
    };

    const formattedContracts = contracts.map((contract) => ({
      id: contract.id,
      recorder: contract.recorder,
      end_date: formatThaiDate(contract.end_date),
      division_name:
        divisionMap[contract.division_id || contract.division_name] ||
        "ไม่ระบุ",
      project_name: contract.project_name,
      contract_no: contract.contract_no,
      contract_file_path: contract.contract_file_path,
      attachment_file_path: contract.attachment_file_path,
      contract_file_name: contract.contract_file_name,
      attachment_file_name: contract.attachment_file_name,
      upload_date: contract.upload_date,
      status: statusMap[contract.status || 0],
    }));

    revalidatePath("/contracts");

    return NextResponse.json(formattedContracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contract_no,
      // division,
      project_name,
      way_type,
      fund_source,
      budget,
      contract_budget,
      partner_name,
      deposit_type,
      deposit_amount,
      waranty,
      end_date,
    } = body;
    // ✅ Get user info from headers (set by middleware)
    const userId = request.headers.get("x-user-id");
    const userDivision = request.headers.get("x-user-division");
    const userFullname = request.headers.get("x-fullname") || "";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = [
      userFullname,
      parseInt(userDivision || "0"),
      project_name || null,
      parseInt(way_type) || null,
      fund_source || null,
      budget || null,
      contract_budget || null,
      partner_name || null,
      parseInt(deposit_type) || null,
      deposit_amount || null,
      end_date || null,
      waranty || null,
      parseInt(userId),
      contract_no || null,
    ];

    const [result] = await pool.execute(
      `INSERT INTO contract (
        recorder, division_id, project_name, way_type, fund_source, 
        budget, contract_budg, partner_name, deposit_type, 
        deposit_amount, end_date, waranty, created_by, contract_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    return NextResponse.json({
      success: true,
      message: "Contract created successfully",
      id: (result as any).insertId,
    });
  } catch (error) {
    console.error("Database insert error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
