'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function TestOnboardingComplete() {
  const { user, login } = useAuth()
  const router = useRouter()
  const [message, setMessage] = useState('Testing onboarding completion...')

  useEffect(() => {
    // Simulate completing onboarding
    const testUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      onboardingCompleted: true
    }

    console.log('TestOnboardingComplete: Setting test user', testUser)
    login(testUser)
    setMessage('User logged in, redirecting to dashboard in 2 seconds...')

    // Redirect to dashboard after 2 seconds
    const timer = setTimeout(() => {
      console.log('TestOnboardingComplete: Redirecting to dashboard')
      router.push('/dashboard')
    }, 2000)

    return () => clearTimeout(timer)
  }, [login, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-4">Onboarding Test</h1>
        <p className="text-gray-600">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Current user: {user ? JSON.stringify(user) : 'None'}</p>
      </div>
    </div>
  )
}