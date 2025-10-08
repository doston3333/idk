import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!user || !['admin', 'restaurant_owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Convert file to base64 for AI moderation
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Use AI to moderate the image
    try {
      const zai = await ZAI.create()
      
      const moderationResponse = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an AI content moderator. Analyze the provided image and determine if it's appropriate for a food platform.

Rules:
- ACCEPT: High-quality food photos, restaurant interiors, menu items
- REJECT: Images with text overlays, watermarks, or promotional text
- REJECT: Violent, inappropriate, or non-food content
- REJECT: Blurry, low-quality, or poorly lit images
- REJECT: Images that are clearly not food-related

Respond with only "APPROVED" or "REJECTED" followed by a brief reason if rejected.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please moderate this image for a food platform:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      })

      const moderationResult = moderationResponse.choices[0]?.message?.content || ''
      
      if (moderationResult.toUpperCase().includes('REJECTED')) {
        return NextResponse.json(
          { 
            error: 'Image rejected by content moderation',
            reason: moderationResult.replace('REJECTED', '').trim()
          },
          { status: 400 }
        )
      }

    } catch (aiError) {
      console.error('AI moderation error:', aiError)
      // Continue with upload if AI moderation fails
    }

    // For now, return the base64 data URL
    // In production, you'd upload to a cloud storage service
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    
    return NextResponse.json({
      url: dataUrl,
      filename,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}