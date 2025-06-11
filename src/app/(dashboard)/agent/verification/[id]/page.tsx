'use client'

import { useParams, useRouter } from 'next/navigation'
import AgentVerification from '../page'

export default function VerificationTask() {
  const params = useParams()
  const router = useRouter()
  const verificationId = params.id as string

  // This would normally fetch specific verification data based on ID
  // For now, we'll just pass the ID through and redirect to the main verification flow
  
  return <AgentVerification />
} 