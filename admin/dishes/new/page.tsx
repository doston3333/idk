'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ArrowLeft, Save, Camera, DollarSign, Utensils, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface Restaurant {
  id: string
  name: string
}

const DIETARY_TAGS = [
  'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
  'Halal', 'Kosher', 'Low-Carb', 'Keto', 'Paleo', 'Sugar-Free',
  'Organic', 'Local', 'Sustainable', 'Farm-to-Table'
]

const ALLERGENS = [
  'Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts',
  'Wheat', 'Soybeans', 'Sesame', 'Mustard', 'Celery', 'Lupin'
]

const CUISINE_TYPES = [
  'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai', 'French',
  'American', 'Mediterranean', 'Korean', 'Vietnamese', 'Greek', 'Spanish',
  'Middle Eastern', 'Ethiopian', 'Brazilian', 'German', 'British', 'Irish',
  'Caribbean', 'Cuban', 'Moroccan', 'Turkish', 'Russian', 'Fusion'
]

export default function NewDishPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([])
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: '',
    cuisine: '',
    restaurantId: ''
  })

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/admin/restaurants?limit=100')
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data.restaurants)
      }
    } catch (error) {
      toast.error('Error fetching restaurants')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, image: data.url }))
        toast.success('Image uploaded successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload image')
      }
    } catch (error) {
      toast.error('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const addIngredient = () => {
    if (ingredientInput.trim() && !selectedIngredients.includes(ingredientInput.trim())) {
      setSelectedIngredients([...selectedIngredients, ingredientInput.trim()])
      setIngredientInput('')
    }
  }

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient))
  }

  const toggleDietaryTag = (tag: string) => {
    setSelectedDietaryTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.restaurantId) {
      toast.error('Name, price, and restaurant are required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/dishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          ingredients: selectedIngredients,
          dietaryTags: selectedDietaryTags,
          allergens: selectedAllergens
        })
      })

      if (response.ok) {
        toast.success('Dish created successfully')
        router.push('/admin/dishes')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create dish')
      }
    } catch (error) {
      toast.error('Error creating dish')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/dishes">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dishes
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Dish</h1>
        <p className="text-gray-600 mt-2">Fill in the dish details</p>
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
                  <Label htmlFor="name">Dish Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter dish name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the dish, ingredients, preparation, etc."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cuisine">Cuisine Type</Label>
                    <div className="relative">
                      <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Select value={formData.cuisine} onValueChange={(value) => handleInputChange('cuisine', value)}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          {CUISINE_TYPES.map((cuisine) => (
                            <SelectItem key={cuisine} value={cuisine}>
                              {cuisine}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="restaurant">Restaurant *</Label>
                  <Select value={formData.restaurantId} onValueChange={(value) => handleInputChange('restaurantId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((restaurant) => (
                        <SelectItem key={restaurant.id} value={restaurant.id}>
                          {restaurant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    placeholder="Add ingredient"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  />
                  <Button type="button" onClick={addIngredient}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedIngredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary">
                      {ingredient}
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.image && (
                  <div className="relative w-full h-48">
                    <Image
                      src={formData.image}
                      alt="Dish preview"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
                      <Camera className="h-6 w-6 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dietary Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {DIETARY_TAGS.map((tag) => (
                    <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDietaryTags.includes(tag)}
                        onChange={() => toggleDietaryTag(tag)}
                        className="rounded"
                      />
                      <span className="text-sm">{tag}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allergens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ALLERGENS.map((allergen) => (
                    <label key={allergen} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAllergens.includes(allergen)}
                        onChange={() => toggleAllergen(allergen)}
                        className="rounded"
                      />
                      <span className="text-sm">{allergen}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading || uploading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Creating...' : 'Create Dish'}
                </Button>
                <Link href="/admin/dishes">
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