import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '../../../lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Received body:', body); // Debug log
    
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    const connection = await createConnection();
    
    // Update the contract to mark as deleted (soft delete)
    const [result] = await connection.execute(
      'UPDATE contract SET isdelete = 1 WHERE id = ?',
      [id]
    );

    // Check if any rows were affected
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

  } catch (error : any) {
    console.error('Database delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete contract', details: error.message },
      { status: 500 }
    );
  }
}

// Keep your existing GET method
export async function GET(request: NextRequest) {
  try {
    const connection = await createConnection();
    const [rows] = await connection.execute('SELECT * FROM contract WHERE isdelete = 0');
    
    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contract data' },
      { status: 500 }
    );
  }
}
