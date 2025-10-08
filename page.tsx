'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Utensils, Heart, MapPin, Users, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="p-4 border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <img
                src="/logo.svg"
                alt="FoodieMatch Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold">FoodieMatch</span>
          </div>
          <nav className="flex items-center space-x-6">
            <div className="md:hidden flex items-center space-x-2">
              {user?.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="secondary" size="sm">Admin</Button>
                </Link>
              )}
              {user?.role === 'restaurant_owner' && (
                <Link href="/restaurant/dashboard">
                  <Button variant="secondary" size="sm">Restaurant</Button>
                </Link>
              )}
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link href="/demo-dashboard">
                <Button variant="outline" size="sm">Demo</Button>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
              <Link href="/marketing" className="text-muted-foreground hover:text-foreground">
                Rewards
              </Link>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="secondary">Admin</Button>
                    </Link>
                  )}
                  {user.role === 'restaurant_owner' && (
                    <Link href="/restaurant/dashboard">
                      <Button variant="secondary">My Restaurant</Button>
                    </Link>
                  )}
                  <Link href={user.role === 'restaurant_owner' ? '/restaurant/dashboard' : '/dashboard'}>
                    <Button>Go to Dashboard</Button>
                  </Link>
                  <Link href="/demo-dashboard">
                    <Button variant="outline">Demo</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register">
                    <Button>Sign Up</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/demo-dashboard">
                    <Button variant="outline">Demo</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Your Perfect
              <span className="text-orange-600"> Food Match</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Swipe through delicious dishes tailored to your dietary preferences, 
              allergies, and taste. Find your next favorite meal with AI-powered recommendations.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link href={user.role === 'restaurant_owner' ? '/restaurant/dashboard' : '/dashboard'}>
                  <Button size="lg" className="text-lg px-8 py-6">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/demo-dashboard">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    View Demo Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-6">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Sign Up Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    Sign In
                  </Button>
                </Link>
                <Link href="/demo-dashboard">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    Try Demo Dashboard
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why FoodieMatch?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make food discovery personal, safe, and fun with our smart matching system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Utensils className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Personalized Matches</CardTitle>
                <CardDescription>
                  AI-powered recommendations based on your dietary preferences, allergies, and taste profile.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Smart Swiping</CardTitle>
                <CardDescription>
                  Intuitive swipe interface to like or pass dishes. Save your favorites and discover new cuisines.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Local Discovery</CardTitle>
                <CardDescription>
                  Find amazing dishes and restaurants near you. Set your preferred search radius.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Community Verified</CardTitle>
                <CardDescription>
                  Real reviews and ratings from food lovers like you. Share your experiences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Dietary Safe</CardTitle>
                <CardDescription>
                  Comprehensive filtering for dietary restrictions and allergies. Eat with confidence.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-8 w-8 mb-2">🎯</div>
                <CardTitle>Premium Features</CardTitle>
                <CardDescription>
                  Unlock advanced filters, unlimited likes, and exclusive restaurant partnerships.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and find your perfect food match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                Create your account and set your preferences
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Set Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Tell us about your dietary needs and favorite cuisines
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Start Swiping</h3>
              <p className="text-sm text-muted-foreground">
                Browse through personalized dish recommendations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Enjoy & Share</h3>
              <p className="text-sm text-muted-foreground">
                Try new dishes and share your experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect Food Match?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of food lovers discovering amazing dishes every day.
          </p>
          {user ? (
            <>
              <Link href={user.role === 'restaurant_owner' ? '/restaurant/dashboard' : '/dashboard'}>
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Go to Your Dashboard
                </Button>
              </Link>
              <Link href="/demo-dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-orange-600">
                  View Demo Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Get Started Now - It's Free!
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-orange-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/demo-dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-orange-600">
                  Try Demo Dashboard
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative w-6 h-6">
              <img
                src="/logo.svg"
                alt="FoodieMatch Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-bold">FoodieMatch</span>
          </div>
          <p className="text-gray-400 mb-4">
            Discover amazing dishes tailored to your taste
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}