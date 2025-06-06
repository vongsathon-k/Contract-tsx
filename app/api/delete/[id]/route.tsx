import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '../../../../lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    const connection = await createConnection();
    
    const [result] = await connection.execute(
      'UPDATE contract SET isdelete = 1 WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contract deleted successfully'
    });

  } catch (error) {
    console.error('Database delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contract', details: error.message },
      { status: 500 }
    );
  }
}