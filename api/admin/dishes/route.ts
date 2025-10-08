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
    const restaurantId = searchParams.get('restaurantId')

    const where = {
      ...(restaurantId && { restaurantId }),
      ...(user.role === 'restaurant_owner' && !restaurantId && {
        restaurant: { ownerId: user.id }
      }),
      ...(user.role === 'restaurant_owner' && restaurantId && {
        restaurant: { 
          id: restaurantId,
          ownerId: user.id 
        }
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { restaurant: { name: { contains: search, mode: 'insensitive' as const } } }
        ]
      })
    }

    const [dishes, total] = await Promise.all([
      db.dish.findMany({
        where,
        include: {
          restaurant: {
            select: { name: true, id: true }
          },
          dishIngredients: true,
          dishDietaryTags: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.dish.count({ where })
    ])

    return NextResponse.json({
      dishes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Dishes fetch error:', error)
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
      image,
      price,
      cuisine,
      restaurantId,
      allergens,
      ingredients,
      dietaryTags
    } = body

    if (!name || !price || !restaurantId) {
      return NextResponse.json(
        { error: 'Name, price, and restaurant ID are required' },
        { status: 400 }
      )
    }

    // Check if user has access to the restaurant
    const restaurant = await db.restaurant.findFirst({
      where: {
        id: restaurantId,
        ...(user.role === 'restaurant_owner' && { ownerId: user.id })
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or access denied' },
        { status: 404 }
      )
    }

    const dish = await db.dish.create({
      data: {
        name,
        description,
        image,
        price,
        cuisine,
        restaurantId,
        allergens: allergens ? JSON.stringify(allergens) : null,
        dishIngredients: ingredients ? {
          create: ingredients.map((name: string) => ({ name }))
        } : undefined,
        dishDietaryTags: dietaryTags ? {
          create: dietaryTags.map((tag: string) => ({ tag }))
        } : undefined
      },
      include: {
        restaurant: {
          select: { name: true, id: true }
        },
        dishIngredients: true,
        dishDietaryTags: true
      }
    })

    return NextResponse.json(dish, { status: 201 })

  } catch (error) {
    console.error('Dish creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}