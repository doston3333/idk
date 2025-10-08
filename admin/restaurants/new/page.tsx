'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ArrowLeft, Save, MapPin, Phone, Globe, Mail, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import AddressAutocomplete from '@/components/ui/address-autocomplete'
import { toast } from 'sonner'
import Link from 'next/link'

const CUISINE_TYPES = [
  'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai', 'French',
  'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Spanish',
  'Middle Eastern', 'Ethiopian', 'Brazilian', 'German', 'British', 'Irish',
  'Caribbean', 'Cuban', 'Moroccan', 'Turkish', 'Russian', 'Fusion'
]

export default function NewRestaurantPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cuisineInput, setCuisineInput] = useState('')
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    lat: 0,
    lng: 0,
    phone: '',
    website: '',
    email: '',
    priceRange: 'medium'
  })

  useEffect(() => {
    // Get user's location as default
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }))
        },
        (error) => {
          console.log('Could not get location:', error)
        }
      )
    }
  }, [])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCuisine = () => {
    if (cuisineInput.trim() && !selectedCuisines.includes(cuisineInput.trim())) {
      setSelectedCuisines([...selectedCuisines, cuisineInput.trim()])
      setCuisineInput('')
    }
  }

  const removeCuisine = (cuisine: string) => {
    setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine))
  }

  const handleAddressChange = (address: string, lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, address, lat, lng }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.address) {
      toast.error('Name and address are required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          cuisineTypes: selectedCuisines
        })
      })

      if (response.ok) {
        toast.success('Restaurant created successfully')
        router.push('/admin/restaurants')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create restaurant')
      }
    } catch (error) {
      toast.error('Error creating restaurant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/restaurants">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Restaurants
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Restaurant</h1>
        <p className="text-gray-600 mt-2">Fill in the restaurant details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter restaurant name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the restaurant ambiance, specialties, etc."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <AddressAutocomplete
                    value={formData.address}
                    onChange={handleAddressChange}
                    placeholder="Enter full address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => handleInputChange('lat', parseFloat(e.target.value))}
                      placeholder="Auto-filled from address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitude</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => handleInputChange('lng', parseFloat(e.target.value))}
                      placeholder="Auto-filled from address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://restaurant.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@restaurant.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Select value={formData.priceRange} onValueChange={(value) => handleInputChange('priceRange', value)}>
                    <SelectTrigger className="pl-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">$ - Budget Friendly</SelectItem>
                      <SelectItem value="medium">$$ - Moderate</SelectItem>
                      <SelectItem value="high">$$$ - Upscale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cuisine Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={cuisineInput}
                    onChange={(e) => setCuisineInput(e.target.value)}
                    placeholder="Add cuisine type"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCuisine())}
                  />
                  <Button type="button" onClick={addCuisine}>Add</Button>
                </div>

                <div className="space-y-2">
                  {selectedCuisines.map((cuisine) => (
                    <Badge key={cuisine} variant="secondary" className="mr-2">
                      {cuisine}
                      <button
                        type="button"
                        onClick={() => removeCuisine(cuisine)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="text-sm text-gray-500">
                  Suggestions: {CUISINE_TYPES.slice(0, 5).join(', ')}...
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Creating...' : 'Create Restaurant'}
                </Button>
                <Link href="/admin/restaurants">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}