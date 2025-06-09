# SELLIKO - Mobile Device Resale Auction Platform

## Project Overview
SELLIKO is a production-ready auction platform for mobile device resale in Kerala, India, featuring 5 user roles, real-time bidding, WhatsApp OTP authentication, and agent verification workflows.

## Architecture
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express.js + PostgreSQL + Redis
- **Authentication**: JWT + WhatsApp Business API
- **Real-time**: Socket.io for bidding
- **Payments**: Razorpay integration
- **File Storage**: AWS S3

## User Roles & Key Flows
1. **Anonymous**: Browse listings
2. **Client**: List devices, track sales
3. **Vendor**: Browse, bid, win devices
4. **Agent**: Verify devices, complete transactions
5. **Admin**: Approve listings, assign agents

## Design System
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Colors**: Primary blue, accent colors per design plan
- **Components**: shadcn/ui base + custom components
- **Responsive**: Mobile-first design
- **Style**: Apple/Airbnb-level minimal, clean, engaging

## Key Commands
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run test            # Run tests
npm run lint            # Lint code

# Database
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate client
npx prisma seed         # Seed database

# Deployment
npm run deploy:staging  # Deploy to staging
npm run deploy:prod     # Deploy to production
```

## Core Files to Reference
- `src/types/index.ts` - All TypeScript definitions
- `src/lib/api.ts` - API client configuration
- `src/components/ui/` - Base UI components
- `DESIGN_PLAN.md` - Complete UI/UX specifications
- `integrationguide.md` - Backend API specifications

## Coding Standards
- Use TypeScript strictly
- Follow Next.js 14 best practices
- Implement proper error handling
- Use Zod for validation
- Follow atomic design principles
- Write comprehensive tests
- Use semantic commit messages

## Testing Strategy
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- API tests for all endpoints
- E2E tests for critical user flows

## Important Notes
- All monetary values stored in paise (Indian currency)
- WhatsApp integration for all notifications
- Real-time bidding with Socket.io
- Multi-role authentication system
- File uploads to AWS S3
- Comprehensive audit trail for all transactions

## Key Features Implementation
### 4-Step Device Listing Wizard
1. Device Information (brand, model, storage, color, condition)
2. Technical Details (IMEI, battery health, asking price, description)
3. Photos & Documentation (4-6 device photos, bill photo, warranty)
4. Pickup Details (address, preferred time, terms agreement)

### Real-time Bidding System
- Live auction interface with Socket.io
- Instant win at asking price
- 24-hour bidding cycles
- Real-time notifications

### Admin Workflow
- Manual listing approval (2-6 hours)
- Agent assignment for pickup/verification
- Order tracking and management

### Agent Verification Process
- 10-step mobile verification workflow
- Photo documentation requirements
- Customer OTP acceptance
- Payment processing

### Multi-role Dashboard System
- Client: List devices, track sales
- Vendor: Browse marketplace, place bids, track orders
- Agent: Manage tasks, complete verifications
- Admin: Approve listings, assign agents, view analytics

## API Integration Points
### Authentication
- `POST /api/auth/send-otp` - Send WhatsApp OTP
- `POST /api/auth/verify-otp` - Verify OTP and get JWT

### Listings
- `POST /api/listings` - Create device listing (multipart/form-data)
- `GET /api/listings` - Get listings with filters
- `PUT /api/listings/:id/approve` - Admin approve/reject

### Bidding
- `POST /api/bids` - Place bid
- `GET /api/marketplace` - Browse available devices

### Orders
- `GET /api/orders` - Get orders by role
- `PUT /api/orders/:id/status` - Update order status

### Agent Tasks
- `GET /api/agent/tasks` - Get assigned tasks
- `PUT /api/agent/tasks/:id/accept` - Accept task
- `PUT /api/agent/tasks/:id/complete` - Complete verification

### Admin Operations
- `GET /api/admin/dashboard` - Admin metrics
- `GET /api/admin/listings/pending` - Pending approvals
- `POST /api/admin/transactions/:id/assign-agent` - Assign agent

## Environment Variables Required
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/selliko_dev"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
WHATSAPP_ACCESS_TOKEN="your_access_token"
WHATSAPP_VERIFY_TOKEN="your_verify_token"

# AWS S3
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
S3_BUCKET_NAME="selliko-uploads"

# Razorpay
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# Development
NODE_ENV="development"
LOG_LEVEL="debug"
```

## Development Workflow with Claude
1. **Always reference this CLAUDE.md file** for project context
2. **Use DESIGN_PLAN.md** for exact UI specifications
3. **Use integrationguide.md** for backend API requirements
4. **Follow component patterns** established in project structure
5. **Implement features incrementally** following development phases
6. **Test immediately** after each implementation
7. **Maintain consistent TypeScript** types throughout

## Critical Success Factors
- **Mobile-first responsive design** (80% mobile users in Kerala)
- **Fast WhatsApp OTP authentication** (< 30 seconds)
- **Real-time bidding experience** (< 500ms latency)
- **Simple 4-step listing process** (< 5 minutes to complete)
- **Reliable photo uploads** (multiple file support)
- **Clear status tracking** for all user roles
- **Professional minimal design** (Apple/Airbnb quality)

## Kerala Market Specifics
- State dropdown defaults to Kerala
- City options: Thiruvananthapuram, Kochi, Kozhikode, Thrissur, etc.
- Indian Rupee (₹) currency throughout
- WhatsApp as primary communication channel
- Focus on local trust and reliability
- Agent coverage across major Kerala cities

This context should be referenced in every interaction for consistent, informed development assistance. 