import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    
    console.log('📊 [REPORTS API] Received request:', requestBody)
    
    // Validate required fields
    if (!requestBody.report_type) {
      return NextResponse.json(
        { success: false, error: 'Missing report_type', message: 'report_type is required' },
        { status: 400 }
      )
    }
    
    if (!requestBody.limit || requestBody.limit < 1 || requestBody.limit > 10000) {
      return NextResponse.json(
        { success: false, error: 'Invalid limit', message: 'limit must be between 1 and 10,000' },
        { status: 400 }
      )
    }

    // Get Supabase configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ [REPORTS API] Missing Supabase configuration')
      return NextResponse.json(
        { success: false, error: 'Configuration error', message: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    // Call Supabase Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/reports`
    
    console.log('🚀 [REPORTS API] Calling edge function:', edgeFunctionUrl)
    console.log('📤 [REPORTS API] Request body:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📡 [REPORTS API] Edge function response status:', response.status)
    console.log('📡 [REPORTS API] Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('💥 [REPORTS API] Edge function error:', errorText)
      
      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { success: false, error: errorData.error, message: errorData.message },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { success: false, error: 'Edge function error', message: errorText },
          { status: response.status }
        )
      }
    }

    // Check content type
    const contentType = response.headers.get('content-type')
    console.log('📄 [REPORTS API] Response content type:', contentType)
    
    if (contentType?.includes('text/csv')) {
      // Return CSV response
      const csvData = await response.text()
      console.log('✅ [REPORTS API] Returning CSV data, length:', csvData.length)
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': response.headers.get('Content-Disposition') || `attachment; filename="${requestBody.report_type}_report.csv"`
        }
      })
    } else {
      // Return JSON response (likely an error)
      const jsonData = await response.json()
      console.log('📄 [REPORTS API] Returning JSON data:', jsonData)
      return NextResponse.json(jsonData, { status: response.status })
    }

  } catch (error) {
    console.error('💥 [REPORTS API] Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed', message: 'Only POST method is supported' },
    { status: 405 }
  )
}
