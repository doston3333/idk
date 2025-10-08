'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Utensils,
  DollarSign,
  Store,
  Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface Dish {
  id: string
  name: string
  description?: string
  image: string
  price: number
  cuisine: string
  isActive: boolean
  isAvailable: boolean
  createdAt: string
  restaurant: {
    id: string
    name: string
  }
  dishIngredients: Array<{ name: string }>
  dishDietaryTags: Array<{ tag: string }>
}

interface RestaurantsResponse {
  restaurants: Array<{ id: string; name: string }>
}

interface DishesResponse {
  dishes: Dish[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function DishesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [restaurants, setRestaurants] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    dish: Dish | null
  }>({ open: false, dish: null })

  useEffect(() => {
    fetchRestaurants()
    fetchDishes()
  }, [search, selectedRestaurant, page])

  const fetchRestaurants = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100' // Get all restaurants for the filter
      })

      const response = await fetch(`/api/admin/restaurants?${params}`)
      if (response.ok) {
        const data: RestaurantsResponse = await response.json()
        setRestaurants(data.restaurants)
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  const fetchDishes = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(selectedRestaurant && { restaurantId: selectedRestaurant })
      })

      const response = await fetch(`/api/admin/dishes?${params}`)
      if (response.ok) {
        const data: DishesResponse = await response.json()
        setDishes(data.dishes)
        setPagination(data.pagination)
      } else {
        toast.error('Failed to fetch dishes')
      }
    } catch (error) {
      toast.error('Error fetching dishes')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (dish: Dish) => {
    setDeleteDialog({ open: true, dish })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.dish) return

    try {
      const response = await fetch(`/api/admin/dishes/${deleteDialog.dish.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Dish deleted successfully')
        fetchDishes()
      } else {
        toast.error('Failed to delete dish')
      }
    } catch (error) {
      toast.error('Error deleting dish')
    } finally {
      setDeleteDialog({ open: false, dish: null })
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dishes</h1>
          <p className="text-gray-600 mt-2">
            Manage dishes and their information
          </p>
        </div>
        <Link href="/admin/dishes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Dish
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
        <div className="w-64">
          <Select value={selectedRestaurant} onValueChange={(value) => {
            setSelectedRestaurant(value)
            setPage(1)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by restaurant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Restaurants</SelectItem>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dishes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="mr-2 h-5 w-5" />
            Dishes ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dietary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dishes.map((dish) => (
                <TableRow key={dish.id}>
                  <TableCell>
                    <div className="w-12 h-12 relative">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        className="object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dish.name}</div>
                      {dish.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {dish.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Store className="h-3 w-3 mr-1" />
                      {dish.restaurant.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {dish.price.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={dish.isActive ? "default" : "secondary"}>
                        {dish.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {dish.isActive && (
                        <Badge 
                          variant={dish.isAvailable ? "default" : "outline"}
                          className="text-xs"
                        >
                          {dish.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {dish.dishDietaryTags.slice(0, 2).map((tag) => (
                        <Badge key={tag.tag} variant="outline" className="text-xs">
                          {tag.tag}
                        </Badge>
                      ))}
                      {dish.dishDietaryTags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{dish.dishDietaryTags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/dishes/${dish.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/dishes/${dish.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(dish)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, dish: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dish</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.dish?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, dish: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}