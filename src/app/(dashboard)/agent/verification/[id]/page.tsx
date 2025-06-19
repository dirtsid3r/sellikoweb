'use client'

import { useParams, useRouter } from 'next/navigation'
import AgentVerification from '../page'
import Header from '@/components/layout/header'

export default function VerificationTask() {
  const params = useParams()
  const router = useRouter()
  const verificationId = params.id as string

  // This would normally fetch specific verification data based on ID
  // For now, we'll just pass the ID through and redirect to the main verification flow
  
  return (
    <div>
      <Header variant="agent" showBackButton />
      <AgentVerification />
    </div>
  )
} 