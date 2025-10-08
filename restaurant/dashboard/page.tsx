'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Store, 
  Plus, 
  TrendingUp, 
  Users, 
  Star,
  ChefHat,
  BarChart3,
  Settings,
  Utensils
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import Link from 'next/link'

interface RestaurantStats {
  totalDishes: number
  totalOrders: number
  totalReviews: number
  averageRating: number
  activeDishes: number
  monthlyViews: number
}

interface Dish {
  id: string
  name: string
  price: number
  isActive: boolean
  isAvailable: boolean
  cuisine: string
  createdAt: string
}

export default function RestaurantDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<RestaurantStats | null>(null)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'restaurant_owner') {
      toast.error('Restaurant owner access required')
      return
    }

    fetchRestaurantData()
  }, [user])

  const fetchRestaurantData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsResponse = await fetch('/api/restaurant/stats', {
        headers: {
          'Authorization': `Bearer ${user?.email}`,
          'Content-Type': 'application/json'
        }
      })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch dishes
      const dishesResponse = await fetch('/api/restaurant/dishes', {
        headers: {
          'Authorization': `Bearer ${user?.email}`,
          'Content-Type': 'application/json'
        }
      })
      if (dishesResponse.ok) {
        const dishesData = await dishesResponse.json()
        setDishes(dishesData)
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error)
      toast.error('Failed to load restaurant data')
    } finally {
      setLoading(false)
    }
  }

  const toggleDishStatus = async (dishId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/restaurant/dishes', {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${user?.email}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ dishId, isActive })
      })

      if (response.ok) {
        toast.success('Dish status updated successfully')
        fetchRestaurantData()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update dish status')
      }
    } catch (error) {
      console.error('Error updating dish status:', error)
      toast.error('Failed to update dish status')
    }
  }

  if (user?.role !== 'restaurant_owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Store className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription>
              You need restaurant owner privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading restaurant dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Dashboard</h1>
              <p className="text-muted-foreground">Manage your restaurant and dishes</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                <Store className="h-4 w-4 mr-1" />
                Restaurant Owner
              </Badge>
              <Link href="/restaurant/add-dish">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Dish
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Dishes</CardTitle>
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDishes}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeDishes} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  All time orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  From {stats.totalReviews} reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.monthlyViews}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="dishes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dishes">My Dishes</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dishes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Dishes</CardTitle>
                    <CardDescription>
                      Manage your restaurant's dishes
                    </CardDescription>
                  </div>
                  <Link href="/restaurant/add-dish">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Dish
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dishes.length === 0 ? (
                    <div className="text-center py-8">
                      <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No dishes yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by adding your first dish to the menu
                      </p>
                      <Link href="/restaurant/add-dish">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Dish
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    dishes.map((dish) => (
                      <div key={dish.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{dish.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {dish.cuisine} • ${dish.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={dish.isActive ? 'default' : 'secondary'}>
                              {dish.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant={dish.isAvailable ? 'default' : 'outline'}>
                              {dish.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            {dish.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>
                  View and manage customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Order management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track your restaurant's performance and customer engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Popular Dishes</h3>
                    <p className="text-muted-foreground">Detailed analytics coming soon...</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customer Insights</h3>
                    <p className="text-muted-foreground">Customer analytics coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Settings</CardTitle>
                <CardDescription>
                  Manage your restaurant profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Restaurant settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}