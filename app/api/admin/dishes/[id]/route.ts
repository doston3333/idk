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

    const dish = await db.dish.findFirst({
      where: {
        id: params.id,
        ...(user.role === 'restaurant_owner' && {
          restaurant: { ownerId: user.id }
        })
      },
      include: {
        restaurant: {
          select: { name: true, id: true }
        },
        dishIngredients: true,
        dishDietaryTags: true
      }
    })

    if (!dish) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(dish)

  } catch (error) {
    console.error('Dish fetch error:', error)
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
      image,
      price,
      cuisine,
      isActive,
      isAvailable,
      allergens,
      ingredients,
      dietaryTags
    } = body

    // Check if dish exists and user has access
    const existingDish = await db.dish.findFirst({
      where: {
        id: params.id,
        ...(user.role === 'restaurant_owner' && {
          restaurant: { ownerId: user.id }
        })
      }
    })

    if (!existingDish) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      )
    }

    // Update dish
    const dish = await db.dish.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(price !== undefined && { price }),
        ...(cuisine !== undefined && { cuisine }),
        ...(isActive !== undefined && { isActive }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(allergens !== undefined && { allergens: allergens ? JSON.stringify(allergens) : null })
      },
      include: {
        restaurant: {
          select: { name: true, id: true }
        },
        dishIngredients: true,
        dishDietaryTags: true
      }
    })

    // Update ingredients if provided
    if (ingredients !== undefined) {
      // Delete existing ingredients
      await db.dishIngredient.deleteMany({
        where: { dishId: params.id }
      })

      // Add new ingredients
      if (ingredients.length > 0) {
        await db.dishIngredient.createMany({
          data: ingredients.map((name: string) => ({
            dishId: params.id,
            name
          }))
        })
      }
    }

    // Update dietary tags if provided
    if (dietaryTags !== undefined) {
      // Delete existing tags
      await db.dishDietaryTag.deleteMany({
        where: { dishId: params.id }
      })

      // Add new tags
      if (dietaryTags.length > 0) {
        await db.dishDietaryTag.createMany({
          data: dietaryTags.map((tag: string) => ({
            dishId: params.id,
            tag
          }))
        })
      }
    }

    // Fetch updated dish with all relations
    const updatedDish = await db.dish.findUnique({
      where: { id: params.id },
      include: {
        restaurant: {
          select: { name: true, id: true }
        },
        dishIngredients: true,
        dishDietaryTags: true
      }
    })

    return NextResponse.json(updatedDish)

  } catch (error) {
    console.error('Dish update error:', error)
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

    // Check if dish exists and user has access
    const existingDish = await db.dish.findFirst({
      where: {
        id: params.id,
        ...(user.role === 'restaurant_owner' && {
          restaurant: { ownerId: user.id }
        })
      }
    })

    if (!existingDish) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      )
    }

    await db.dish.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Dish deleted successfully' })

  } catch (error) {
    console.error('Dish deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}