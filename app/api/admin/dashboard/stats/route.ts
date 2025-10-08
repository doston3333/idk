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

    // Get user with role
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    })

    if (!user || !['admin', 'restaurant_owner'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build where clause based on user role
    const restaurantWhere = user.role === 'restaurant_owner' 
      ? { ownerId: user.id }
      : {}

    // Get stats
    const [
      totalRestaurants,
      totalDishes,
      totalUsers,
      activeRestaurants
    ] = await Promise.all([
      db.restaurant.count({ where: restaurantWhere }),
      db.dish.count({
        where: {
          restaurant: restaurantWhere
        }
      }),
      db.user.count(),
      db.restaurant.count({
        where: {
          ...restaurantWhere,
          isActive: true
        }
      })
    ])

    // Get recent activity (simplified for now)
    const recentRestaurants = await db.restaurant.findMany({
      where: restaurantWhere,
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    })

    const recentActivity = recentRestaurants.map(restaurant => ({
      id: restaurant.id,
      type: 'restaurant' as const,
      action: 'created',
      description: `New restaurant "${restaurant.name}" was added`,
      timestamp: restaurant.createdAt.toLocaleDateString()
    }))

    return NextResponse.json({
      totalRestaurants,
      totalDishes,
      totalUsers,
      activeRestaurants,
      recentActivity
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}