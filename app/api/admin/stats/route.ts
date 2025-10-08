import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get basic stats
    const [
      totalUsers,
      totalRestaurants,
      totalDishes,
      totalMatches,
      totalOrders,
      totalReviews,
      activeUsers,
      newUsersToday
    ] = await Promise.all([
      db.user.count(),
      db.restaurant.count(),
      db.dish.count(),
      db.match.count(),
      db.order.count(),
      db.review.count(),
      db.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Active in last 7 days
          }
        }
      }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      totalRestaurants,
      totalDishes,
      totalMatches,
      totalOrders,
      totalReviews,
      activeUsers,
      newUsersToday
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}