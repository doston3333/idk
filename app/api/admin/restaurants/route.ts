import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    })

    if (!user || !['admin', 'restaurant_owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const where = {
      ...(user.role === 'restaurant_owner' && { ownerId: user.id }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { address: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [restaurants, total] = await Promise.all([
      db.restaurant.findMany({
        where,
        include: {
          owner: {
            select: { name: true, email: true }
          },
          restaurantCuisines: true,
          _count: {
            select: { dishes: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.restaurant.count({ where })
    ])

    return NextResponse.json({
      restaurants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Restaurants fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    })

    if (!user || !['admin', 'restaurant_owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      address,
      lat,
      lng,
      phone,
      website,
      email,
      priceRange,
      cuisineTypes
    } = body

    if (!name || !address || !lat || !lng) {
      return NextResponse.json(
        { error: 'Name, address, and coordinates are required' },
        { status: 400 }
      )
    }

    const restaurant = await db.restaurant.create({
      data: {
        name,
        description,
        address,
        lat,
        lng,
        phone,
        website,
        email,
        priceRange,
        ownerId: user.role === 'restaurant_owner' ? user.id : null,
        restaurantCuisines: cuisineTypes ? {
          create: cuisineTypes.map((cuisine: string) => ({ cuisine }))
        } : undefined
      },
      include: {
        restaurantCuisines: true,
        owner: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(restaurant, { status: 201 })

  } catch (error) {
    console.error('Restaurant creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}