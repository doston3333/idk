import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['customer', 'restaurant_owner']).default('customer'),
  phone: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, phone } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        emailVerified: false, // Will be verified later
        phoneVerified: !!phone, // Auto-verify if provided
        onboardingCompleted: role === 'restaurant_owner', // Skip onboarding for restaurant owners
        subscriptionTier: role === 'restaurant_owner' ? 'plus' : 'free', // Give restaurant owners plus tier
        role: role === 'customer' ? 'user' : role // Map 'customer' to 'user' for database
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        phoneVerified: true,
        emailVerified: true,
        onboardingCompleted: true,
        subscriptionTier: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      user,
      message: 'Account created successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}