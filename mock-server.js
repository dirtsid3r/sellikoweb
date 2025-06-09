const express = require('express')
const cors = require('cors')
const multer = require('multer')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Mock database
const users = new Map()
const otps = new Map()
const listings = new Map()
const JWT_SECRET = 'mock-jwt-secret'

// Generate random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      phone: user.phone, 
      role: user.role,
      sessionId: `session_${Date.now()}`
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// Mock users for testing
const mockUsers = [
  { id: '1', phone: '+919876543210', name: 'Test User 1', role: 'CLIENT' },
  { id: '2', phone: '+919123456789', name: 'Test User 2', role: 'CLIENT' },
]

mockUsers.forEach(user => {
  users.set(user.phone, { 
    ...user, 
    isActive: true, 
    createdAt: new Date(), 
    lastLogin: new Date(),
    metadata: {}
  })
})

// Mock listings for demo
const mockListings = [
  {
    id: 'listing_demo_1',
    clientId: '1',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    storage: '256GB',
    color: 'Space Black',
    condition: 'Excellent',
    imei1: '123456789012345',
    batteryHealth: 98,
    askingPrice: 85000,
    description: 'Like new condition, all accessories included',
    devicePhotos: [
      'https://mock-cdn.com/iphone14pro_front.jpg',
      'https://mock-cdn.com/iphone14pro_back.jpg'
    ],
    billPhoto: 'https://mock-cdn.com/iphone14pro_bill.pdf',
    hasWarranty: true,
    warrantyType: 'Manufacturer',
    warrantyExpiry: new Date('2024-12-01'),
    pickupAddress: {
      streetAddress: '123 MG Road, Near Metro Station',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682001',
      landmark: 'Near Lulu Mall'
    },
    pickupTime: 'evening',
    status: 'pending',
    submittedAt: new Date(),
    views: 24,
    watchers: [],
    metadata: {}
  },
  {
    id: 'listing_demo_2', 
    clientId: '1',
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    storage: '512GB',
    color: 'Phantom Black',
    condition: 'Good',
    imei1: '987654321098765',
    batteryHealth: 92,
    askingPrice: 75000,
    description: 'Minor scratches on back, screen perfect',
    devicePhotos: [
      'https://mock-cdn.com/galaxys23_front.jpg'
    ],
    hasWarranty: false,
    pickupAddress: {
      streetAddress: '456 Marine Drive',
      city: 'Thiruvananthapuram',
      state: 'Kerala', 
      pincode: '695001'
    },
    pickupTime: 'morning',
    status: 'live',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    auctionEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    views: 156,
    watchers: ['vendor1', 'vendor2'],
    metadata: {}
  }
]

// Pre-populate listings
mockListings.forEach(listing => {
  listings.set(listing.id, listing)
})

console.log('🔧 Mock Backend Server for SELLIKO')
console.log('📋 Available Test Users:')
mockUsers.forEach(user => {
  console.log(`   📱 ${user.phone} (${user.name})`)
})
console.log('🔑 Test OTP: 123456 (works for all numbers)')
console.log('📱 Demo Listings: 2 sample listings added for testing')

// =============================================================================
// AUTH ENDPOINTS (from integrationguide.md)
// =============================================================================

// POST /auth/send-otp
app.post('/auth/send-otp', (req, res) => {
  const { phone } = req.body

  console.log(`📨 OTP Request: ${phone}`)

  if (!phone || !phone.match(/^\+91[6-9]\d{9}$/)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid phone number format'
    })
  }

  const otpId = `otp_${Date.now()}_${Math.random()}`
  const otp = '123456' // Fixed OTP for testing
  
  // Store OTP with 5-minute expiry
  otps.set(otpId, {
    phone,
    otp,
    createdAt: Date.now(),
    verified: false
  })

  console.log(`✅ OTP sent to ${phone}: ${otp} (ID: ${otpId})`)

  res.json({
    success: true,
    message: 'OTP sent successfully',
    otpId
  })
})

// POST /auth/verify-otp
app.post('/auth/verify-otp', (req, res) => {
  const { phone, otp, otpId } = req.body

  console.log(`🔐 OTP Verification: ${phone} with OTP: ${otp}`)

  const otpData = otps.get(otpId)
  
  if (!otpData || otpData.phone !== phone) {
    return res.status(400).json({
      success: false,
      error: 'Invalid OTP ID or phone number'
    })
  }

  if (otpData.verified) {
    return res.status(400).json({
      success: false,
      error: 'OTP already used'
    })
  }

  if (Date.now() - otpData.createdAt > 5 * 60 * 1000) {
    return res.status(400).json({
      success: false,
      error: 'OTP expired'
    })
  }

  if (otpData.otp !== otp) {
    return res.status(400).json({
      success: false,
      error: 'Invalid OTP'
    })
  }

  // Mark OTP as verified
  otpData.verified = true

  // Get or create user
  let user = users.get(phone)
  if (!user) {
    user = {
      id: `user_${Date.now()}`,
      phone,
      name: `User ${phone.slice(-4)}`,
      role: 'CLIENT',
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date(),
      metadata: {}
    }
    users.set(phone, user)
    console.log(`👤 New user created: ${user.name}`)
  } else {
    user.lastLogin = new Date()
    console.log(`👤 Existing user logged in: ${user.name}`)
  }

  const accessToken = generateToken(user)
  const refreshToken = generateToken({ ...user, type: 'refresh' })

  res.json({
    success: true,
    user,
    accessToken,
    refreshToken
  })
})

// POST /auth/refresh-token
app.post('/auth/refresh-token', (req, res) => {
  const { refreshToken } = req.body

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET)
    const user = users.get(decoded.phone)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      })
    }

    const newAccessToken = generateToken(user)
    const newRefreshToken = generateToken({ ...user, type: 'refresh' })

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    })
  }
})

// POST /auth/logout
app.post('/auth/logout', (req, res) => {
  // In a real app, you'd invalidate the token
  console.log('👋 User logged out')
  res.json({ success: true })
})

// =============================================================================
// LISTING ENDPOINTS (from integrationguide.md)
// =============================================================================

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

// POST /listings - matches integrationguide.md exactly
app.post('/listings', upload.fields([
  { name: 'devicePhoto0', maxCount: 1 },
  { name: 'devicePhoto1', maxCount: 1 },
  { name: 'devicePhoto2', maxCount: 1 },
  { name: 'devicePhoto3', maxCount: 1 },
  { name: 'devicePhoto4', maxCount: 1 },
  { name: 'devicePhoto5', maxCount: 1 },
  { name: 'billPhoto', maxCount: 1 }
]), (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // Extract device photos from files
    const devicePhotos = []
    for (let i = 0; i < 6; i++) {
      const fieldName = `devicePhoto${i}`
      if (req.files[fieldName]) {
        devicePhotos.push(`https://mock-cdn.com/device_${Date.now()}_${i}.jpg`)
      }
    }
    
    // Extract bill photo
    const billPhoto = req.files['billPhoto'] ? `https://mock-cdn.com/bill_${Date.now()}.jpg` : null
    
    const listing = {
      id: `listing_${Date.now()}`,
      clientId: decoded.userId,
      
      // Step 1: Device Information
      brand: req.body.brand,
      model: req.body.model,
      storage: req.body.storage,
      color: req.body.color,
      condition: req.body.condition,
      
      // Step 2: Technical Details
      imei1: req.body.imei1,
      imei2: req.body.imei2 || null,
      batteryHealth: parseInt(req.body.batteryHealth) || 100,
      askingPrice: parseInt(req.body.askingPrice) || 0,
      description: req.body.description,
      
      // Step 3: Photos & Documentation
      devicePhotos,
      billPhoto,
      hasWarranty: req.body.hasWarranty === 'true',
      warrantyType: req.body.warrantyType || null,
      warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : null,
      
      // Step 4: Pickup Details
      pickupAddress: {
        streetAddress: req.body.streetAddress,
        city: req.body.city,
        state: req.body.state || 'Kerala',
        pincode: req.body.pincode,
        landmark: req.body.landmark || null
      },
      pickupTime: req.body.pickupTime,
      
      // System fields
      status: 'pending',
      submittedAt: new Date(),
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
      auctionEndTime: null,
      views: 0,
      watchers: [],
      metadata: {}
    }

    listings.set(listing.id, listing)
    
    console.log(`📱 New listing created: ${listing.brand} ${listing.model} by ${decoded.phone}`)
    console.log(`   💰 Asking Price: ₹${listing.askingPrice}`)
    console.log(`   📍 Location: ${listing.pickupAddress.city}, ${listing.pickupAddress.state}`)
    console.log(`   📸 Photos: ${devicePhotos.length} device photos${billPhoto ? ' + bill photo' : ''}`)
    console.log(`   🔄 Status: ${listing.status}`)
    
    res.json({
      success: true,
      listing
    })
  } catch (error) {
    console.error('Listing creation error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
})

// GET /listings
app.get('/listings', (req, res) => {
  const { status, clientId, page = 1, limit = 10 } = req.query
  
  let filteredListings = Array.from(listings.values())
  
  if (status) {
    filteredListings = filteredListings.filter(l => l.status === status)
  }
  
  if (clientId) {
    filteredListings = filteredListings.filter(l => l.clientId === clientId)
  }

  const total = filteredListings.length
  const totalPages = Math.ceil(total / limit)
  const startIndex = (page - 1) * limit
  const paginatedListings = filteredListings.slice(startIndex, startIndex + parseInt(limit))

  res.json({
    listings: paginatedListings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    }
  })
})

// =============================================================================
// HEALTH CHECK
// =============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /auth/send-otp',
      'POST /auth/verify-otp', 
      'POST /auth/refresh-token',
      'POST /auth/logout',
      'POST /listings',
      'GET /listings'
    ],
    testUsers: mockUsers.map(u => ({ phone: u.phone, name: u.name }))
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Mock SELLIKO Backend running on http://localhost:${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`📱 Ready for frontend testing!\n`)
}) 