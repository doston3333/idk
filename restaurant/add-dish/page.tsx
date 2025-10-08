'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ChefHat, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AddDishPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cuisine: '',
    image: '',
    allergens: '',
    ingredients: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const cuisineOptions = [
    'Italian', 'Chinese', 'Japanese', 'Indian', 'Mexican', 
    'Thai', 'French', 'American', 'Mediterranean', 'Korean',
    'Vietnamese', 'Greek', 'Spanish', 'Middle Eastern', 'Other'
  ]

  const validateForm = () => {
    if (!formData.name || formData.name.length < 2) {
      setError('Dish name must be at least 2 characters')
      return false
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price')
      return false
    }
    
    if (!formData.cuisine) {
      setError('Please select a cuisine type')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/restaurant/dishes', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user?.email}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          cuisine: formData.cuisine,
          image: formData.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&crop=center`,
          allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : [],
          ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : []
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Dish added successfully!')
        router.push('/restaurant/dashboard')
      } else {
        setError(data.error || 'Failed to add dish')
        toast.error(data.error || 'Failed to add dish')
      }
    } catch (error) {
      console.error('Error adding dish:', error)
      setError('Something went wrong. Please try again.')
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('') // Clear error when user types
  }

  if (user?.role !== 'restaurant_owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ChefHat className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
            <CardDescription>
              You need restaurant owner privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/restaurant/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Dish</h1>
              <p className="text-muted-foreground">Add a new dish to your restaurant menu</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChefHat className="h-5 w-5" />
              <span>Dish Information</span>
            </CardTitle>
            <CardDescription>
              Fill in the details about your dish
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Dish Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Margherita Pizza"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="12.99"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Type *</Label>
                <Select value={formData.cuisine} onValueChange={(value) => handleInputChange('cuisine', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineOptions.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your dish (ingredients, preparation, taste profile...)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/dish-image.jpg (optional)"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use a default image
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients</Label>
                <Input
                  id="ingredients"
                  placeholder="tomato, cheese, basil (comma separated)"
                  value={formData.ingredients}
                  onChange={(e) => handleInputChange('ingredients', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Separate ingredients with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergens">Allergens</Label>
                <Input
                  id="allergens"
                  placeholder="dairy, gluten, nuts (comma separated)"
                  value={formData.allergens}
                  onChange={(e) => handleInputChange('allergens', e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  List any potential allergens, separated with commas
                </p>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Dish...
                    </>
                  ) : (
                    'Add Dish'
                  )}
                </Button>
                
                <Link href="/restaurant/dashboard">
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}