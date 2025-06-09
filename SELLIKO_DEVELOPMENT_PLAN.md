# SELLIKO Development Plan - Claude Sonnet 4 + Cursor Optimized

## 🎯 Project Overview

**SELLIKO** is a comprehensive mobile device resale auction platform for Kerala, India, featuring a 5-user role system (Anonymous, Client, Vendor, Agent, Admin) with real-time bidding, WhatsApp OTP authentication, and agent verification workflows.

### Key Technologies
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Backend**: Node.js + Express.js + PostgreSQL + Redis
- **Authentication**: JWT + WhatsApp Business API
- **Payment**: Razorpay integration
- **File Storage**: AWS S3
- **Real-time**: Socket.io for bidding
- **AI Assistant**: Claude Sonnet 4 via Cursor

---

## 📁 Optimal File Structure for Claude Sonnet 4 + Cursor

```
selliko/
├── README.md
├── CLAUDE.md                          # 🤖 Claude context file (CRITICAL)
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
├── .env.example
├── .gitignore
├── .cursorrules                       # 🎯 Cursor AI rules
│
├── docs/                              # 📚 Documentation
│   ├── api/                          # API documentation
│   ├── flows/                        # User flow diagrams
│   └── design-system.md              # Design tokens & guidelines
│
├── public/                           # 🖼️ Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── src/                              # 🏗️ Main application source
│   ├── app/                          # 🛣️ Next.js 14 App Router
│   │   ├── globals.css               # Global styles + Plus Jakarta Sans
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Homepage
│   │   ├── loading.tsx               # Global loading UI
│   │   ├── not-found.tsx             # 404 page
│   │   ├── error.tsx                 # Error boundary
│   │   │
│   │   ├── (auth)/                   # 🔐 Authentication routes
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── verify-otp/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/              # 📊 Role-based dashboards
│   │   │   ├── client/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── list-device/
│   │   │   │   ├── my-listings/
│   │   │   │   ├── orders/
│   │   │   │   └── profile/
│   │   │   │
│   │   │   ├── vendor/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── marketplace/
│   │   │   │   ├── my-bids/
│   │   │   │   ├── orders/
│   │   │   │   └── profile/
│   │   │   │
│   │   │   ├── agent/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tasks/
│   │   │   │   ├── verification/
│   │   │   │   └── profile/
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── page.tsx
│   │   │       ├── pending-approvals/
│   │   │       ├── assign-agents/
│   │   │       ├── analytics/
│   │   │       └── settings/
│   │   │
│   │   └── api/                      # 🔌 API routes
│   │       ├── auth/
│   │       ├── listings/
│   │       ├── bids/
│   │       ├── orders/
│   │       ├── agents/
│   │       ├── admin/
│   │       ├── uploads/
│   │       ├── notifications/
│   │       └── webhooks/
│   │
│   ├── components/                   # 🧩 Reusable components
│   │   ├── ui/                       # 🎨 Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── forms/                    # 📝 Form components
│   │   │   ├── device-listing-wizard/
│   │   │   ├── bid-placement-modal/
│   │   │   ├── agent-verification-form/
│   │   │   └── auth-forms/
│   │   │
│   │   ├── dashboard/                # 📈 Dashboard components
│   │   │   ├── client/
│   │   │   ├── vendor/
│   │   │   ├── agent/
│   │   │   └── admin/
│   │   │
│   │   ├── layout/                   # 🏗️ Layout components
│   │   │   ├── sidebar/
│   │   │   ├── header/
│   │   │   ├── navigation/
│   │   │   └── breadcrumbs/
│   │   │
│   │   ├── marketplace/              # 🏪 Marketplace components
│   │   │   ├── device-card/
│   │   │   ├── bidding-interface/
│   │   │   ├── filters/
│   │   │   └── search/
│   │   │
│   │   └── shared/                   # 🔗 Shared components
│   │       ├── notifications/
│   │       ├── status-tracker/
│   │       ├── photo-upload/
│   │       ├── timer/
│   │       └── loading-states/
│   │
│   ├── lib/                          # 🛠️ Core utilities
│   │   ├── api.ts                    # API client configuration
│   │   ├── auth.ts                   # Authentication helpers
│   │   ├── utils.ts                  # General utilities
│   │   ├── validations.ts            # Zod schemas
│   │   ├── constants.ts              # App constants
│   │   ├── db.ts                     # Database configuration
│   │   ├── redis.ts                  # Redis configuration
│   │   ├── s3.ts                     # S3 file upload
│   │   ├── whatsapp.ts               # WhatsApp API
│   │   ├── payments.ts               # Razorpay integration
│   │   └── socket.ts                 # Socket.io client
│   │
│   ├── hooks/                        # 🪝 Custom React hooks
│   │   ├── use-auth.ts               # Authentication state
│   │   ├── use-api.ts                # API data fetching
│   │   ├── use-socket.ts             # Real-time connections
│   │   ├── use-notifications.ts      # Notification management
│   │   ├── use-timer.ts              # Auction timers
│   │   ├── use-file-upload.ts        # File upload handling
│   │   └── use-local-storage.ts      # Local storage
│   │
│   ├── types/                        # 📋 TypeScript definitions
│   │   ├── auth.ts                   # Authentication types
│   │   ├── user.ts                   # User types
│   │   ├── listing.ts                # Device listing types
│   │   ├── bid.ts                    # Bidding types
│   │   ├── order.ts                  # Order management types
│   │   ├── agent.ts                  # Agent types
│   │   ├── api.ts                    # API response types
│   │   └── index.ts                  # Export all types
│   │
│   ├── contexts/                     # 🔄 React contexts
│   │   ├── auth-context.tsx          # Authentication context
│   │   ├── socket-context.tsx        # Socket.io context
│   │   ├── notification-context.tsx  # Notifications context
│   │   └── role-context.tsx          # User role context
│   │
│   ├── middleware/                   # 🛡️ API middleware
│   │   ├── auth.ts                   # JWT authentication
│   │   ├── rate-limit.ts             # Rate limiting
│   │   ├── validation.ts             # Request validation
│   │   ├── error-handler.ts          # Error handling
│   │   └── cors.ts                   # CORS configuration
│   │
│   └── styles/                       # 🎨 Styling
│       ├── globals.css               # Global styles
│       ├── components.css            # Component styles
│       └── utilities.css             # Utility classes
│
├── tests/                            # 🧪 Test files
│   ├── __mocks__/
│   ├── components/
│   ├── pages/
│   ├── api/
│   └── utils/
│
├── prisma/                           # 🗄️ Database
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
└── scripts/                          # 🔧 Build & deployment scripts
    ├── build.sh
    ├── deploy.sh
    └── db-setup.sh
```

---

## 🤖 Essential Files for Claude Sonnet 4 Optimization

### 1. CLAUDE.md (Project Context File)
```markdown
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
```

### 2. .cursorrules (Cursor AI Configuration)
```
# SELLIKO Cursor Rules

## General Guidelines
- Use TypeScript strictly with proper type definitions
- Follow Next.js 14 app router conventions
- Implement proper error handling with try-catch blocks
- Use Zod for all data validation
- Follow the atomic design principles for components
- Write clean, readable, and maintainable code

## Component Development
- Use shadcn/ui as the base component library
- Implement proper loading and error states
- Follow the role-based component structure
- Use proper TypeScript interfaces for all props
- Implement responsive design with Tailwind CSS

## API Development
- Follow RESTful API conventions
- Implement proper authentication middleware
- Use Zod for request/response validation
- Include comprehensive error handling
- Follow the API structure defined in integrationguide.md

## State Management
- Use React Context for global state
- Implement custom hooks for data fetching
- Use proper TypeScript types for all state

## File Organization
- Group related components in feature folders
- Use index.ts files for clean exports
- Follow the established folder structure
- Keep components small and focused

## Testing
- Write unit tests for all utilities
- Test components with React Testing Library
- Mock external dependencies properly
- Test error scenarios and edge cases

## Performance
- Implement code splitting where appropriate
- Use Next.js Image component for all images
- Optimize for Core Web Vitals
- Implement proper caching strategies

## Security
- Validate all user inputs
- Implement proper CORS configuration
- Use environment variables for sensitive data
- Follow OWASP security guidelines
```

---

## 🚀 Development Phases & Implementation Strategy

### Phase 1: Foundation Setup (Week 1-2)
**Claude Prompt for Initial Setup:**
```
Help me set up a Next.js 14 project with TypeScript, Tailwind CSS, and shadcn/ui following the SELLIKO project structure. I need:

1. Project initialization with all necessary dependencies
2. Tailwind CSS configuration with Plus Jakarta Sans font
3. shadcn/ui setup with custom theme colors
4. Basic folder structure as outlined in CLAUDE.md
5. Environment variable setup for development
6. Basic layout components with sidebar navigation

Please create the files step by step and ensure proper TypeScript configuration throughout.
```

**Deliverables:**
- [ ] Next.js 14 project setup
- [ ] Tailwind CSS + shadcn/ui configuration
- [ ] Plus Jakarta Sans font integration
- [ ] Basic folder structure
- [ ] Environment configuration
- [ ] Git repository setup

### Phase 2: Authentication System (Week 2-3)
**Claude Prompt for Auth Implementation:**
```
Implement the complete WhatsApp OTP authentication system for SELLIKO following the integrationguide.md specifications. I need:

1. JWT-based authentication with refresh tokens
2. WhatsApp Business API integration for OTP
3. Multi-role user system (Client, Vendor, Agent, Admin)
4. Protected route middleware
5. Auth context and hooks
6. Login/OTP verification UI components

Please ensure proper TypeScript types and error handling throughout.
```

**Deliverables:**
- [ ] JWT authentication system
- [ ] WhatsApp OTP integration
- [ ] Role-based access control
- [ ] Auth UI components
- [ ] Protected routes
- [ ] Session management

### Phase 3: Core UI Components (Week 3-4)
**Claude Prompt for UI Development:**
```
Create the core UI component library for SELLIKO following the DESIGN_PLAN.md specifications. I need:

1. Role-based sidebar navigation components
2. Dashboard layout components for each user type
3. Device listing card components
4. Bidding interface components
5. Status tracking components
6. Notification components
7. Form components with proper validation

Use shadcn/ui as the base and ensure mobile-first responsive design with Plus Jakarta Sans font.
```

**Deliverables:**
- [ ] Role-based navigation components
- [ ] Dashboard layouts (Client, Vendor, Agent, Admin)
- [ ] Device listing components
- [ ] Bidding interface
- [ ] Form components
- [ ] Notification system UI

### Phase 4: Device Listing System (Week 4-5)
**Claude Prompt for Listing Implementation:**
```
Implement the 4-step device listing wizard following the DESIGN_PLAN.md specifications. I need:

1. Multi-step form with validation using Zod
2. File upload component for device photos
3. Address input with Kerala location validation
4. Form state management and persistence
5. API integration for listing submission
6. Success/error handling

Ensure proper TypeScript types and follow the exact UI flow specified in the design plan.
```

**Deliverables:**
- [ ] 4-step listing wizard
- [ ] File upload functionality
- [ ] Form validation
- [ ] API integration
- [ ] State persistence
- [ ] Success/error flows

### Phase 5: Bidding System (Week 5-6)
**Claude Prompt for Bidding Implementation:**
```
Create the real-time bidding system for SELLIKO following the integrationguide.md and DESIGN_PLAN.md. I need:

1. Marketplace browsing with filters
2. Real-time bidding interface with Socket.io
3. Bid placement modal with validation
4. Auction timer components
5. Instant win functionality
6. Bid history tracking
7. WebSocket connection management

Ensure proper error handling and TypeScript types throughout.
```

**Deliverables:**
- [ ] Marketplace browsing
- [ ] Real-time bidding
- [ ] Socket.io integration
- [ ] Auction timers
- [ ] Instant win logic
- [ ] Bid tracking

### Phase 6: Admin Panel (Week 6-7)
**Claude Prompt for Admin Development:**
```
Build the comprehensive admin panel for SELLIKO following the DESIGN_PLAN.md specifications. I need:

1. Pending listings approval interface
2. Agent assignment system
3. Analytics dashboard
4. User management
5. System settings
6. Audit trail tracking

Ensure proper role-based access control and follow the exact UI specifications.
```

**Deliverables:**
- [ ] Listing approval system
- [ ] Agent assignment interface
- [ ] Analytics dashboard
- [ ] User management
- [ ] System configuration
- [ ] Audit logging

### Phase 7: Agent Verification (Week 7-8)
**Claude Prompt for Agent Implementation:**
```
Create the agent verification workflow following the integrationguide.md specifications. I need:

1. Mobile-optimized verification interface
2. 10-step verification process
3. Photo upload for verification
4. OTP verification system
5. Customer/vendor handover process
6. Task management interface

Ensure mobile-first design and proper error handling.
```

**Deliverables:**
- [ ] Agent task dashboard
- [ ] Verification workflow
- [ ] Photo upload system
- [ ] OTP verification
- [ ] Mobile optimization
- [ ] Task tracking

### Phase 8: Payment Integration (Week 8-9)
**Claude Prompt for Payment System:**
```
Implement the Razorpay payment system for SELLIKO following the integrationguide.md. I need:

1. Payment processing workflow
2. Commission calculation system
3. Multi-party payment distribution
4. Payment status tracking
5. Refund handling
6. Financial reporting

Ensure PCI compliance and proper error handling.
```

**Deliverables:**
- [ ] Razorpay integration
- [ ] Payment workflows
- [ ] Commission system
- [ ] Status tracking
- [ ] Financial reporting
- [ ] Security compliance

### Phase 9: Notifications & Real-time (Week 9-10)
**Claude Prompt for Notifications:**
```
Build the comprehensive notification system for SELLIKO. I need:

1. WhatsApp notification integration
2. In-app notification center
3. Real-time updates with Socket.io
4. Push notification support
5. Notification preferences
6. Email backup notifications

Follow the notification specifications from integrationguide.md.
```

**Deliverables:**
- [ ] WhatsApp notifications
- [ ] In-app notifications
- [ ] Real-time updates
- [ ] Push notifications
- [ ] User preferences
- [ ] Email integration

### Phase 10: Testing & Optimization (Week 10-12)
**Claude Prompt for Testing:**
```
Create comprehensive tests for the SELLIKO platform. I need:

1. Unit tests for all utilities and hooks
2. Component tests with React Testing Library
3. API endpoint tests
4. E2E tests for critical user flows
5. Performance optimization
6. Security testing
7. Accessibility testing

Ensure high test coverage and proper CI/CD setup.
```

**Deliverables:**
- [ ] Unit test suite
- [ ] Component tests
- [ ] API tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Accessibility compliance

---

## 🎯 Claude Sonnet 4 Optimization Strategies

### 1. Context Management
- **Use CLAUDE.md**: Always reference this file for project context
- **Chunk Large Tasks**: Break complex features into smaller, manageable pieces
- **Iterative Development**: Review and refine code with Claude in iterations

### 2. Effective Prompting Patterns
```
# Pattern 1: Feature Development
"Following the SELLIKO CLAUDE.md and DESIGN_PLAN.md, implement [specific feature] with:
1. Proper TypeScript types
2. Error handling
3. Mobile-responsive design
4. Following established patterns
5. Comprehensive testing"

# Pattern 2: Code Review
"Review this [component/function] for:
1. Code quality and best practices
2. Performance optimizations
3. Security vulnerabilities
4. Accessibility compliance
5. TypeScript improvements"

# Pattern 3: Bug Fixing
"Debug this issue in SELLIKO:
[error description]
[relevant code]
Expected behavior: [description]
Current behavior: [description]
Consider the project structure in CLAUDE.md"
```

### 3. Development Workflow with Cursor
1. **Start each session** by opening CLAUDE.md and relevant design docs
2. **Use Cursor's chat** for planning and architectural decisions
3. **Use inline editing** for code implementation
4. **Review changes** with Cursor's diff view
5. **Test immediately** after each implementation

### 4. Code Quality Standards
- **TypeScript Strict Mode**: Enable all strict type checking
- **ESLint + Prettier**: Automated code formatting and linting
- **Husky Pre-commit Hooks**: Ensure code quality before commits
- **Comprehensive Testing**: Unit, integration, and E2E tests

---

## 🛠️ Development Environment Setup

### Prerequisites
```bash
# Node.js 18+ and npm
node --version  # v18.0.0+
npm --version   # 9.0.0+

# Git configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Initial Setup Commands
```bash
# Create project
npx create-next-app@latest selliko --typescript --tailwind --eslint --app
cd selliko

# Install additional dependencies
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install zod react-hook-form @hookform/resolvers
npm install socket.io-client axios swr
npm install @aws-sdk/client-s3 sharp

# Install development dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D prisma @prisma/client
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D cypress @types/cypress

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Setup Prisma
npx prisma init
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="postgresql://username:password@localhost:5432/selliko_dev"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

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

### Plus Jakarta Sans Font Integration
```typescript
// src/app/layout.tsx
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={`font-sans ${plusJakartaSans.className}`}>
        {children}
      </body>
    </html>
  )
}
```

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-plus-jakarta-sans: 'Plus Jakarta Sans', sans-serif;
  }
  
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-plus-jakarta-sans);
  }
}
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

---

## 🔄 Claude Sonnet 4 + Cursor Workflow

### 1. Daily Development Routine
```bash
# Morning startup routine
1. Open Cursor in SELLIKO project
2. Review CLAUDE.md and DESIGN_PLAN.md
3. Check integrationguide.md for API specifications
4. Start development with clear context
```

### 2. Feature Development Workflow
```
1. 📋 PLAN: Chat with Claude about feature requirements
2. 🏗️ ARCHITECT: Design component/API structure
3. 💻 CODE: Implement with Cursor inline suggestions
4. 🧪 TEST: Write tests and verify functionality
5. 📝 DOCUMENT: Update docs and commit changes
```

### 3. Best Practices for AI-Assisted Development
- **Always provide context**: Reference CLAUDE.md in prompts
- **Iterative refinement**: Build features incrementally
- **Code review**: Use Claude for code quality checks
- **Documentation**: Keep documentation updated
- **Testing**: Write tests for all features

---

This comprehensive development plan provides a solid foundation for building SELLIKO with Claude Sonnet 4 and Cursor, ensuring optimal AI-assisted development workflow while maintaining high code quality and following best practices. 