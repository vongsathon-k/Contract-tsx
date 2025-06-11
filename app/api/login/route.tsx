import { createConnection } from '../../../lib/db'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    connection = await createConnection()
    
    // Find user by username
    const [users] = await connection.execute(
      'SELECT id, username, password, firstname, surname, position, picture FROM users WHERE username = ?',
      [username]
    )

    const userArray = users as any[]
    
    if (userArray.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    const user = userArray[0]

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        position: user.position 
      },
      process.env.JWT_SECRET || 'JWT_SECRET=9a484589a8f38be8e6fef80a026f48101b3b22af158dbce036868b3b2313e6a7',
      { expiresIn: '24h' }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to login' },
      { status: 500 }
    )
  } finally {
    if (connection) {
      try {
        await connection.end()
      } catch (closeError) {
        console.error('Error closing connection:', closeError)
      }
    }
  }
}