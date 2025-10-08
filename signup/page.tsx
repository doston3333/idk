'use client'

import { OnboardingWizard } from '@/components/auth/onboarding-wizard'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  const handleOnboardingComplete = () => {
    // Redirect to the main app or dashboard
    router.push('/dashboard')
  }

  return (
    <OnboardingWizard onComplete={handleOnboardingComplete} />
  )
}