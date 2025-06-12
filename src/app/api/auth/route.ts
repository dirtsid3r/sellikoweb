import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Auth API has been migrated to Supabase Functions',
    endpoints: {
      sendOTP: 'POST /functions/v1/auth',
      verifyOTP: 'POST /functions/v1/auth-verify',
      currentUser: 'GET /auth/v1/user'
    }
  })
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Auth API has been migrated to Supabase Functions',
    redirect: 'Use selliko-client.js for authentication'
  })
} 