import { createConnection } from '../../../../lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const connection = await createConnection()
    
    const [rows] = await connection.execute(
      'SELECT * FROM contract WHERE id = ? AND isdelete = 0',
      [id]
    )
    
    const contracts = rows as any[]
    
    if (contracts.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(contracts[0])
    
  } catch (error) {
    console.error('Error fetching contract:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const { recorder, division, project_name, end_date, contract_type } = body

    const connection = await createConnection()
    
    const [result] = await connection.execute(
      `UPDATE contract SET 
        recorder = ?, 
        division_name = ?, 
        project_name = ?, 
        end_date = ?, 
        way_type = ?
      WHERE id = ? AND isdelete = 0`,
      [recorder, division, project_name, end_date, contract_type, id]
    )

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Contract updated successfully'
    })

  } catch (error) {
    console.error('Error updating contract:', error)
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    )
}}