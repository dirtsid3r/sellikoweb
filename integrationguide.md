# SELLIKO Backend Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture Recommendations](#architecture-recommendations)
3. [Authentication System](#authentication-system)
4. [Data Models](#data-models)
5. [API Endpoints](#api-endpoints)
6. [File Upload System](#file-upload-system)
7. [Real-time Features](#real-time-features)
8. [WhatsApp Integration](#whatsapp-integration)
9. [Security Considerations](#security-considerations)
10. [Deployment Recommendations](#deployment-recommendations)

## Overview

SELLIKO is a mobile device resale platform for Kerala, India, featuring a 5-user role system (Anonymous, Client, Vendor, Agent, Admin) with 24-hour bidding cycles, WhatsApp OTP authentication, and comprehensive auction management.

### Key Features
- **Multi-role authentication** with WhatsApp OTP
- **4-step device listing wizard** with photo uploads
- **Real-time bidding system** with instant win capability
- **Admin approval workflow** for listings
- **Agent task management** for field operations
- **Comprehensive order tracking** with status updates
- **Notification system** with WhatsApp integration

## Architecture Recommendations

### Tech Stack
```
Backend: Node.js + Express.js / Python Django / Go Gin
Database: PostgreSQL (primary) + Redis (caching/sessions)
File Storage: AWS S3 / Google Cloud Storage
Real-time: Socket.io / WebSockets
Message Queue: Redis / RabbitMQ
Authentication: JWT + WhatsApp Business API
Monitoring: Prometheus + Grafana
```

### Database Design
```sql
-- Use PostgreSQL with proper indexing
-- Enable UUID extensions for secure IDs
-- Implement proper foreign key constraints
-- Use JSONB for flexible metadata storage
```

### Microservices Structure
```
├── auth-service/          # Authentication & user management
├── listing-service/       # Device listings & approvals
├── bidding-service/       # Auction & bidding logic
├── notification-service/  # WhatsApp & in-app notifications
├── file-service/         # Photo uploads & management
├── order-service/        # Order tracking & fulfillment
├── agent-service/        # Agent task management
└── admin-service/        # Admin operations & metrics
```

## Authentication System

### User Roles & Permissions
```typescript
enum UserRole {
  ANONYMOUS = 'ANONYMOUS',
  CLIENT = 'CLIENT',
  VENDOR = 'VENDOR', 
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

interface User {
  id: string
  phone: string
  name: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  lastLogin: Date
  metadata: Record<string, any>
}
```

### Authentication Flow
1. **Phone Number Submission** → OTP generation
2. **OTP Verification** → JWT token issuance
3. **Role Assignment** based on phone number pattern (demo) or admin assignment
4. **Session Management** with refresh tokens

## Data Models

### Core Entities

#### Device Listing
```typescript
interface DeviceListing {
  id: string
  clientId: string
  
  // Device Information (Step 1)
  brand: string
  model: string
  storage: string
  color: string
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  
  // Technical Details (Step 2)
  imei1: string
  imei2?: string
  batteryHealth: number // 1-100%
  askingPrice: number
  description: string
  
  // Photos & Documentation (Step 3)
  devicePhotos: string[] // S3 URLs
  billPhoto?: string
  hasWarranty: boolean
  warrantyType?: string
  warrantyExpiry?: Date
  
  // Pickup Details (Step 4)
  pickupAddress: {
    streetAddress: string
    city: string
    state: string
    pincode: string
    landmark?: string
  }
  pickupTime: 'morning' | 'afternoon' | 'evening'
  
  // System Fields
  status: 'pending' | 'approved' | 'rejected' | 'live' | 'sold' | 'expired'
  submittedAt: Date
  approvedAt?: Date
  approvedBy?: string
  rejectionReason?: string
  auctionEndTime?: Date
  
  // Analytics
  views: number
  watchers: string[] // user IDs
  
  // Metadata
  metadata: Record<string, any>
}
```

#### Bid
```typescript
interface Bid {
  id: string
  listingId: string
  vendorId: string
  amount: number
  isInstantWin: boolean
  isWinning: boolean
  timestamp: Date
  metadata: Record<string, any>
}
```

#### Order
```typescript
interface Order {
  id: string
  listingId: string
  clientId: string
  vendorId: string
  agentId?: string
  
  // Pricing
  finalPrice: number
  commissionRate: number
  agentCommission: number
  platformFee: number
  
  // Status Tracking
  status: 'pending_pickup' | 'picked_up' | 'in_transit' | 'delivered' | 'completed' | 'cancelled'
  statusHistory: {
    status: string
    timestamp: Date
    updatedBy: string
    notes?: string
  }[]
  
  // Scheduling
  pickupScheduledAt?: Date
  pickedUpAt?: Date
  deliveredAt?: Date
  completedAt?: Date
  
  metadata: Record<string, any>
}
```

#### Agent Task
```typescript
interface AgentTask {
  id: string
  agentId: string
  orderId: string
  type: 'pickup' | 'delivery' | 'verification'
  priority: 'high' | 'normal' | 'low'
  
  // Task Details
  description: string
  clientContact: {
    name: string
    phone: string
    address: string
  }
  
  // Status
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'failed'
  assignedAt: Date
  acceptedAt?: Date
  completedAt?: Date
  
  // Commission
  commissionAmount: number
  isPaid: boolean
  
  metadata: Record<string, any>
}
```

#### Notification
```typescript
interface Notification {
  id: string
  userId: string
  type: 'bid_placed' | 'listing_approved' | 'auction_ending' | 'order_update' | 'task_assigned'
  priority: 'high' | 'normal' | 'low'
  
  title: string
  message: string
  data?: Record<string, any>
  
  // Channels
  isRead: boolean
  sentViaWhatsApp: boolean
  whatsappMessageId?: string
  
  createdAt: Date
  readAt?: Date
}
```

## API Endpoints

### Authentication Service

#### POST /auth/send-otp
```typescript
Request: {
  phone: string // +919876543210
}
Response: {
  success: boolean
  message: string
  otpId: string
}
```

#### POST /auth/verify-otp
```typescript
Request: {
  phone: string
  otp: string
  otpId: string
}
Response: {
  success: boolean
  user: User
  accessToken: string
  refreshToken: string
}
```

#### POST /auth/refresh-token
```typescript
Request: {
  refreshToken: string
}
Response: {
  accessToken: string
  refreshToken: string
}
```

#### POST /auth/logout
```typescript
Headers: {
  Authorization: "Bearer <token>"
}
Response: {
  success: boolean
}
```

### Listing Service

#### POST /listings
```typescript
Headers: {
  Authorization: "Bearer <token>"
  Content-Type: "multipart/form-data"
}
Request: FormData {
  // Step 1 fields
  brand: string
  model: string
  storage: string
  color: string
  condition: string
  
  // Step 2 fields  
  imei1: string
  imei2?: string
  batteryHealth: number
  askingPrice: number
  description: string
  
  // Step 3 files
  devicePhoto0: File
  devicePhoto1: File
  devicePhoto2: File
  devicePhoto3: File
  devicePhoto4?: File
  devicePhoto5?: File
  billPhoto?: File
  hasWarranty: boolean
  warrantyType?: string
  warrantyExpiry?: string
  
  // Step 4 fields
  streetAddress: string
  city: string
  state: string
  pincode: string
  landmark?: string
  pickupTime: string
}
Response: {
  success: boolean
  listing: DeviceListing
}
```

#### GET /listings
```typescript
Query: {
  status?: string
  clientId?: string
  page?: number
  limit?: number
  sortBy?: string
  searchQuery?: string
}
Response: {
  listings: DeviceListing[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

#### GET /listings/:id
```typescript
Response: {
  listing: DeviceListing
  bids: Bid[]
  currentHighestBid?: Bid
}
```

#### PUT /listings/:id/approve
```typescript
Headers: {
  Authorization: "Bearer <admin-token>"
}
Request: {
  approved: boolean
  rejectionReason?: string
  auctionDurationHours?: number // default 24
}
Response: {
  success: boolean
  listing: DeviceListing
}
```

#### PUT /listings/:id/assign-agent
```typescript
Headers: {
  Authorization: "Bearer <admin-token>"
}
Request: {
  agentId: string
}
Response: {
  success: boolean
  assignment: AgentTask
}
```

### Bidding Service

#### POST /bids
```typescript
Headers: {
  Authorization: "Bearer <vendor-token>"
}
Request: {
  listingId: string
  amount: number
}
Response: {
  success: boolean
  bid: Bid
  isInstantWin: boolean
  message: string
}
```

#### GET /bids
```typescript
Query: {
  vendorId?: string
  listingId?: string
  status?: 'active' | 'won' | 'lost'
  page?: number
  limit?: number
}
Response: {
  bids: Bid[]
  pagination: PaginationMeta
}
```

#### GET /marketplace
```typescript
Query: {
  search?: string
  brand?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'newest' | 'ending-soon' | 'lowest-price' | 'highest-price'
  page?: number
  limit?: number
}
Response: {
  listings: (DeviceListing & {
    currentBid?: number
    totalBids: number
    timeLeft: number // minutes
  })[]
  pagination: PaginationMeta
}
```

### Order Service

#### GET /orders
```typescript
Query: {
  clientId?: string
  vendorId?: string
  agentId?: string
  status?: string
  page?: number
  limit?: number
}
Response: {
  orders: Order[]
  pagination: PaginationMeta
}
```

#### GET /orders/:id
```typescript
Response: {
  order: Order
  listing: DeviceListing
  client: User
  vendor: User
  agent?: User
}
```

#### PUT /orders/:id/status
```typescript
Headers: {
  Authorization: "Bearer <token>"
}
Request: {
  status: string
  notes?: string
  location?: {
    lat: number
    lng: number
  }
}
Response: {
  success: boolean
  order: Order
}
```

### Agent Service

#### GET /agent/tasks
```typescript
Headers: {
  Authorization: "Bearer <agent-token>"
}
Query: {
  status?: string
  priority?: string
  date?: string
}
Response: {
  tasks: AgentTask[]
  totalCommission: number
  completedToday: number
}
```

#### PUT /agent/tasks/:id/accept
```typescript
Headers: {
  Authorization: "Bearer <agent-token>"
}
Response: {
  success: boolean
  task: AgentTask
}
```

#### PUT /agent/tasks/:id/complete
```typescript
Headers: {
  Authorization: "Bearer <agent-token>"
}
Request: {
  notes?: string
  verificationPhotos?: string[]
}
Response: {
  success: boolean
  task: AgentTask
  commissionEarned: number
}
```

### Admin Service

#### GET /admin/dashboard
```typescript
Headers: {
  Authorization: "Bearer <admin-token>"
}
Response: {
  metrics: {
    pendingReviews: number
    availableAgents: number
    activeListings: number
    pendingAssignments: number
    totalRevenue: number
    platformFees: number
  }
  recentActivity: {
    type: string
    message: string
    timestamp: Date
  }[]
}
```

#### GET /admin/listings/pending
```typescript
Headers: {
  Authorization: "Bearer <admin-token>"
}
Response: {
  listings: DeviceListing[]
}
```

#### GET /admin/agents/available
```typescript
Headers: {
  Authorization: "Bearer <admin-token>"
}
Response: {
  agents: (User & {
    activeTasks: number
    completionRate: number
    totalEarnings: number
    rating: number
  })[]
}
```

### Notification Service

#### GET /notifications
```typescript
Headers: {
  Authorization: "Bearer <token>"
}
Query: {
  unreadOnly?: boolean
  type?: string
  limit?: number
}
Response: {
  notifications: Notification[]
  unreadCount: number
}
```

#### PUT /notifications/:id/read
```typescript
Headers: {
  Authorization: "Bearer <token>"
}
Response: {
  success: boolean
}
```

#### PUT /notifications/mark-all-read
```typescript
Headers: {
  Authorization: "Bearer <token>"
}
Response: {
  success: boolean
  markedCount: number
}
```

## File Upload System

### Configuration
```typescript
// File upload limits
const FILE_LIMITS = {
  devicePhotos: {
    maxFiles: 6,
    minFiles: 4,
    maxSizePerFile: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  billPhoto: {
    maxFiles: 1,
    maxSizePerFile: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/pdf']
  }
}
```

### Image Processing Pipeline
```typescript
// Implement image optimization
1. Resize to multiple sizes (thumbnail, medium, full)
2. Compress with quality optimization
3. Generate WebP versions for modern browsers
4. Store in CDN with proper caching headers
5. Generate secure signed URLs for access
```

### Storage Structure
```
s3://selliko-storage/
├── listings/
│   ├── {listingId}/
│   │   ├── device/
│   │   │   ├── photo1_thumb.jpg
│   │   │   ├── photo1_medium.jpg
│   │   │   ├── photo1_full.jpg
│   │   │   └── photo1.webp
│   │   └── bill/
│   │       └── bill.pdf
└── verification/
    └── {orderId}/
        └── agent_verification.jpg
```

## Real-time Features

### WebSocket Events

#### Client Events
```typescript
// Connect to WebSocket
socket.emit('join_room', { listingId: string })

// Bid placed
socket.on('new_bid', {
  listingId: string
  bid: Bid
  newHighestBid: number
  totalBids: number
})

// Auction ending soon
socket.on('auction_ending', {
  listingId: string
  timeLeft: number // seconds
})

// Instant win
socket.on('auction_won', {
  listingId: string
  winningBid: Bid
  winner: string
})
```

#### Agent Events
```typescript
// Task assignment
socket.on('task_assigned', {
  task: AgentTask
  priority: 'high' | 'normal' | 'low'
})

// Order updates
socket.on('order_update', {
  orderId: string
  status: string
  message: string
})
```

#### Admin Events
```typescript
// New listing submitted
socket.on('listing_submitted', {
  listing: DeviceListing
  priority: boolean
})

// System alerts
socket.on('system_alert', {
  type: 'error' | 'warning' | 'info'
  message: string
})
```

## WhatsApp Integration

### WhatsApp Business API Setup
```typescript
// Required configuration
const WHATSAPP_CONFIG = {
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  apiVersion: 'v17.0'
}
```

### Message Templates
```typescript
// OTP Message
const OTP_TEMPLATE = {
  name: 'otp_verification',
  language: { code: 'en' },
  components: [{
    type: 'body',
    parameters: [{
      type: 'text',
      text: '{{otp_code}}'
    }]
  }]
}

// Bid Notification
const BID_NOTIFICATION = {
  name: 'bid_placed',
  language: { code: 'en' },
  components: [{
    type: 'body',
    parameters: [
      { type: 'text', text: '{{device_name}}' },
      { type: 'text', text: '{{bid_amount}}' }
    ]
  }]
}

// Order Update
const ORDER_UPDATE = {
  name: 'order_status',
  language: { code: 'en' },
  components: [{
    type: 'body',
    parameters: [
      { type: 'text', text: '{{order_id}}' },
      { type: 'text', text: '{{status}}' },
      { type: 'text', text: '{{agent_contact}}' }
    ]
  }]
}
```

### Webhook Handling
```typescript
// POST /webhooks/whatsapp
interface WhatsAppWebhook {
  object: 'whatsapp_business_account'
  entry: {
    id: string
    changes: {
      value: {
        messaging_product: 'whatsapp'
        metadata: { phone_number_id: string }
        statuses?: {
          id: string
          status: 'sent' | 'delivered' | 'read' | 'failed'
          timestamp: string
          recipient_id: string
        }[]
      }
      field: 'messages'
    }[]
  }[]
}
```

## Security Considerations

### Authentication & Authorization
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string
  phone: string
  role: UserRole
  sessionId: string
  iat: number
  exp: number
}

// Role-based middleware
const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}
```

### Data Protection
```typescript
// Sensitive data encryption
const sensitiveFields = ['phone', 'imei1', 'imei2', 'address']

// Rate limiting
const rateLimits = {
  '/auth/send-otp': { windowMs: 60000, max: 3 }, // 3 per minute
  '/auth/verify-otp': { windowMs: 300000, max: 5 }, // 5 per 5 minutes
  '/bids': { windowMs: 60000, max: 10 } // 10 bids per minute
}

// Input validation
const validation = {
  phone: /^\+91[6-9]\d{9}$/,
  imei: /^\d{15}$/,
  pincode: /^\d{6}$/,
  price: { min: 1000, max: 1000000 }
}
```

### API Security
```typescript
// Request sanitization
app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }))
app.use(express.json({ limit: '1mb' }))

// SQL injection prevention
// Use parameterized queries only
// Implement input sanitization
// Use ORM with built-in protections
```

## Deployment Recommendations

### Infrastructure
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=selliko
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/selliko
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# WhatsApp Business API
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
S3_BUCKET_NAME=selliko-storage
S3_CDN_URL=https://cdn.selliko.com

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://selliko.com
API_BASE_URL=https://api.selliko.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Database Migrations
```sql
-- Initial migration structure
-- 001_create_users.sql
-- 002_create_listings.sql
-- 003_create_bids.sql
-- 004_create_orders.sql
-- 005_create_agent_tasks.sql
-- 006_create_notifications.sql
-- 007_add_indexes.sql
-- 008_add_triggers.sql
```

### Monitoring & Logging
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  })
})

// Metrics to track
const metrics = [
  'api_requests_total',
  'api_request_duration_seconds',
  'active_users_total',
  'active_listings_total',
  'bids_placed_total',
  'orders_completed_total',
  'whatsapp_messages_sent_total',
  'file_uploads_total'
]
```

### Backup Strategy
```bash
# Database backup (daily)
pg_dump $DATABASE_URL | gzip > "backup-$(date +%Y%m%d).sql.gz"

# S3 backup (using AWS CLI)
aws s3 sync s3://selliko-storage s3://selliko-backup/$(date +%Y%m%d)/

# Redis backup
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb /backup/redis-$(date +%Y%m%d).rdb
```

## Integration Checklist

### Phase 1: Core Setup
- [ ] Set up development environment
- [ ] Configure PostgreSQL with proper schemas
- [ ] Set up Redis for caching and sessions
- [ ] Implement JWT authentication system
- [ ] Set up WhatsApp Business API
- [ ] Configure AWS S3 for file storage

### Phase 2: User Management
- [ ] Implement OTP generation and verification
- [ ] Create user registration and profile management
- [ ] Set up role-based access control
- [ ] Implement session management

### Phase 3: Listing System
- [ ] Create device listing submission API
- [ ] Implement file upload and processing
- [ ] Build admin approval workflow
- [ ] Set up listing status management

### Phase 4: Bidding System
- [ ] Implement bid placement and validation
- [ ] Create auction timer management
- [ ] Set up instant win functionality
- [ ] Build bidding history tracking

### Phase 5: Order Management
- [ ] Create order creation from winning bids
- [ ] Implement order status tracking
- [ ] Set up agent assignment system
- [ ] Build delivery workflow

### Phase 6: Notifications
- [ ] Set up WhatsApp message templates
- [ ] Implement notification dispatch system
- [ ] Create real-time WebSocket events
- [ ] Build notification preference management

### Phase 7: Testing & Deployment
- [ ] Write comprehensive API tests
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment
- [ ] Implement monitoring and logging
- [ ] Set up backup and disaster recovery

---

## Contact & Support

For technical questions or clarification on any integration aspect, please refer to the frontend implementation in the `/src` directory for exact data structures and expected API responses.

**Note**: All monetary values should be stored in paise (smallest currency unit) to avoid floating-point precision issues. Frontend expects values in rupees, so conversion is needed at the API layer. 