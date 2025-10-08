import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const verifySchema = z.object({
  identifier: z.string(), // email or phone
  code: z.string().length(6),
  type: z.enum(['email', 'phone']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, code, type } = verifySchema.parse(body)

    // Find valid OTP
    const otpRecord = await db.oTPVerification.findFirst({
      where: {
        identifier,
        code,
        type,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Mark OTP as used
    await db.oTPVerification.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    // Update user verification status
    const updateField = type === 'email' ? 'emailVerified' : 'phoneVerified'
    await db.user.updateMany({
      where: { [type]: identifier },
      data: { [updateField]: true },
    })

    return NextResponse.json({
      message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully`,
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}