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
  MapPin,
  Phone,
  Globe,
  DollarSign,
  Store
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

interface Restaurant {
  id: string
  name: string
  description?: string
  address: string
  phone?: string
  website?: string
  email?: string
  priceRange: string
  isActive: boolean
  createdAt: string
  owner?: {
    name: string
    email: string
  }
  restaurantCuisines: Array<{ cuisine: string }>
  _count: {
    dishes: number
  }
}

interface RestaurantsResponse {
  restaurants: Restaurant[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function RestaurantsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    restaurant: Restaurant | null
  }>({ open: false, restaurant: null })

  useEffect(() => {
    fetchRestaurants()
  }, [search, page])

  const fetchRestaurants = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/restaurants?${params}`)
      if (response.ok) {
        const data: RestaurantsResponse = await response.json()
        setRestaurants(data.restaurants)
        setPagination(data.pagination)
      } else {
        toast.error('Failed to fetch restaurants')
      }
    } catch (error) {
      toast.error('Error fetching restaurants')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (restaurant: Restaurant) => {
    setDeleteDialog({ open: true, restaurant })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.restaurant) return

    try {
      const response = await fetch(`/api/admin/restaurants/${deleteDialog.restaurant.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Restaurant deleted successfully')
        fetchRestaurants()
      } else {
        toast.error('Failed to delete restaurant')
      }
    } catch (error) {
      toast.error('Error deleting restaurant')
    } finally {
      setDeleteDialog({ open: false, restaurant: null })
    }
  }

  const getPriceRangeColor = (range: string) => {
    switch (range) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriceRangeSymbol = (range: string) => {
    switch (range) {
      case 'low': return '$'
      case 'medium': return '$$'
      case 'high': return '$$$'
      default: return '$'
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
          <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-600 mt-2">
            Manage restaurants and their information
          </p>
        </div>
        <Link href="/admin/restaurants/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Restaurant
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="mr-2 h-5 w-5" />
            Restaurants ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Dishes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{restaurant.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {restaurant.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {restaurant.restaurantCuisines.map((cuisine) => (
                        <Badge key={cuisine.cuisine} variant="secondary" className="text-xs">
                          {cuisine.cuisine}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriceRangeColor(restaurant.priceRange)}>
                      {getPriceRangeSymbol(restaurant.priceRange)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{restaurant._count.dishes}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={restaurant.isActive ? "default" : "secondary"}>
                      {restaurant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {restaurant.owner ? (
                        <>
                          <div className="font-medium">{restaurant.owner.name}</div>
                          <div className="text-gray-500">{restaurant.owner.email}</div>
                        </>
                      ) : (
                        <span className="text-gray-500">No owner</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/restaurants/${restaurant.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/restaurants/${restaurant.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(restaurant)}
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
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, restaurant: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Restaurant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.restaurant?.name}"? 
              This will also delete all dishes associated with this restaurant. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, restaurant: null })}
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