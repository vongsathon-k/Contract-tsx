import { createConnection } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = params.id;
    const connection = await createConnection();

    const [rows] = await connection.execute(
      "SELECT * FROM contract WHERE id = ? AND isdelete = 0",
      [id]
    );

    const contracts = rows as any[];

    if (contracts.length === 0) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(contracts[0]);
  } catch (error) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = params.id;
    const body = await request.json();
    const {
      recorder,
      division,
      project_name,
      way_type,
      fund_source,
      budget,
      contract_budget,
      partner_name,
      deposit_type,
      deposit_amount,
      end_date,
      waranty,
    } = body;
    console.log("body", body);

    const connection = await createConnection();

    const updateQuery = `
      UPDATE contract SET 
        recorder = ?,
        division_name = ?,
        project_name = ?,
        way_type = ?,
        fund_source = ?,
        budget = ?,
        contract_budg = ?,
        partner_name = ?,
        deposit_type = ?,
        deposit_amount = ?,
        end_date = ?,
        waranty = ?
      WHERE id = ? AND isdelete = 0
    `;
    const [result] = await connection.execute(updateQuery, [
      recorder,
      division,
      project_name,
      way_type,
      fund_source,
      budget,
      contract_budget,
      partner_name,
      deposit_type,
      deposit_amount,
      end_date,
      waranty,
      id,
    ]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contract updated successfully",
      ok: true,
    });
  } catch (error) {
    console.error("Error updating contract:", error);
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const id = params.id;
    const connection = await createConnection();

    const [result] = await connection.execute(
      `UPDATE contract SET 
       isdelete = 1
      WHERE id = ? `,
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contract updated successfully",
    });
  } catch (error) {
    console.error("Error updating contract:", error);
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
    );
  }
}
