import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const resendSchema = z.object({
  identifier: z.string(),
  type: z.enum(['email', 'phone']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, type } = resendSchema.parse(body)

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Mark any existing OTPs as used
    await db.oTPVerification.updateMany({
      where: {
        identifier,
        type,
        used: false,
      },
      data: {
        used: true,
      },
    })

    // Create new OTP
    await db.oTPVerification.create({
      data: {
        identifier,
        code: otp,
        type,
        expiresAt,
      },
    })

    // In development, return the OTP
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment) {
      console.log('🔧 Development Mode - New OTP Code:', otp)
      return NextResponse.json({
        message: 'New verification code generated',
        developmentMode: true,
        otpCode: otp,
      })
    }

    // TODO: Send OTP via email service (Twilio SendGrid, etc.)
    console.log('New OTP for verification:', otp)

    return NextResponse.json({
      message: 'Verification code resent successfully',
    })
  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}