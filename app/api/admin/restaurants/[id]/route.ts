import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const restaurant = await db.restaurant.findFirst({
      where: {
        id: params.id,
        ...(user.role === 'restaurant_owner' && { ownerId: user.id })
      },
      include: {
        owner: {
          select: { name: true, email: true }
        },
        restaurantCuisines: true,
        dishes: {
          include: {
            dishIngredients: true,
            dishDietaryTags: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(restaurant)

  } catch (error) {
    console.error('Restaurant fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
      cuisineTypes
    } = body

    // Check if restaurant exists and user has access
    const existingRestaurant = await db.restaurant.findFirst({
      where: {
        id: params.id,
        ...(user.role === 'restaurant_owner' && { ownerId: user.id })
      }
    })

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Update restaurant
    const restaurant = await db.restaurant.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(lat !== undefined && { lat }),
        ...(lng !== undefined && { lng }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(email !== undefined && { email }),
        ...(priceRange !== undefined && { priceRange }),
        ...(isActive !== undefined && { isActive }),
        ...(user.role === 'admin' && { ownerId: body.ownerId })
      },
      include: {
        owner: {
          select: { name: true, email: true }
        },
        restaurantCuisines: true
      }
    })

    // Update cuisine types if provided
    if (cuisineTypes !== undefined) {
      // Delete existing cuisines
      await db.restaurantCuisine.deleteMany({
        where: { restaurantId: params.id }
      })

      // Add new cuisines
      if (cuisineTypes.length > 0) {
        await db.restaurantCuisine.createMany({
          data: cuisineTypes.map((cuisine: string) => ({
            restaurantId: params.id,
            cuisine
          }))
        })
      }

      // Fetch updated restaurant with cuisines
      const updatedRestaurant = await db.restaurant.findUnique({
        where: { id: params.id },
        include: {
          owner: {
            select: { name: true, email: true }
          },
          restaurantCuisines: true
        }
      })

      return NextResponse.json(updatedRestaurant)
    }

    return NextResponse.json(restaurant)

  } catch (error) {
    console.error('Restaurant update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if restaurant exists and user has access
    const existingRestaurant = await db.restaurant.findFirst({
      where: {
        id: params.id,
        ...(user.role === 'restaurant_owner' && { ownerId: user.id })
      }
    })

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    await db.restaurant.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Restaurant deleted successfully' })

  } catch (error) {
    console.error('Restaurant deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}