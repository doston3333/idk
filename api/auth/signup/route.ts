import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          phone ? { phone } : undefined,
        ].filter(Boolean),
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      )
    }

    // Create user (password should be hashed in production)
    const user = await db.user.create({
      data: {
        email,
        name,
        phone,
        password, // Add password field
        // In production, hash the password before storing
        // For now, we'll store it as is (NOT RECOMMENDED FOR PRODUCTION)
      },
    })

    // Skip email verification for now - go directly to onboarding
    return NextResponse.json({
      message: 'Account created successfully! Let\'s set up your preferences.',
      userId: user.id,
      email: user.email,
      skipVerification: true,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}