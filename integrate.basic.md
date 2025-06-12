# SELLIKO Supabase Integration Analysis

## Current Architecture Analysis

### 1. ROUTING MANAGEMENT
**How it currently works:**
- Uses Next.js 14 App Router with file-based routing
- Route groups for organization:
  - `(auth)/` - Authentication pages (login, verify-otp)
  - `(dashboard)/` - Protected role-based routes (admin, client, vendor, agent)
- Protected routes use client-side checks in components:
  ```typescript
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])
  ```
- Role-based routing handled in `/dashboard` page that redirects based on user role

**Issues with current approach:**
- No server-side middleware protection
- Client-side only authentication checks
- Vulnerable to direct URL access before auth state loads
- No systematic route protection system

### 2. API CALLS MANAGEMENT
**Current implementation:**
- **Direct fetch() calls** throughout components
- **No centralized API client** or abstraction layer
- **AuthAPI class** in `src/lib/auth.tsx` for authentication only
- **Manual header management** with localStorage tokens
- **Individual API calls** scattered across components:

**Example patterns found:**
```typescript
// In auth.tsx
const response = await fetch(`${API_BASE}/auth/send-otp`, {
  method: 'POST',
  headers: this.getHeaders(),
  body: JSON.stringify({ phone })
})

// In components
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/listings?clientId=${user?.id}`,
  {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('selliko_access_token')}`
    }
  }
)
```

**Current API endpoints structure:**
- Mock server on localhost:3001
- Internal Next.js API routes (mostly empty stubs)
- Environment variable: `NEXT_PUBLIC_API_URL`

### 3. AUTHENTICATION MANAGEMENT
**Current flow:**
1. **AuthProvider** context wraps entire app via `ClientProviders`
2. **localStorage** for token storage:
   - `selliko_access_token`
   - `selliko_refresh_token` 
   - `selliko_user` (JSON serialized user object)
3. **Manual session restoration** on app mount
4. **OTP-based authentication** via phone numbers
5. **Role-based access** (CLIENT, VENDOR, AGENT, ADMIN)

**Current user object structure:**
```typescript
interface User {
  id: string
  phone: string
  name: string
  role: 'ANON' | 'CLIENT' | 'VENDOR' | 'AGENT' | 'ADMIN'
  isActive: boolean
  createdAt: Date
  lastLogin: Date
  metadata: Record<string, any>
}
```

---

## REQUIRED CHANGES FOR SUPABASE INTEGRATION

### 1. AUTHENTICATION CHANGES

#### What to Replace:
- **AuthAPI class** in `src/lib/auth.tsx`
- **Manual localStorage token management**
- **Custom OTP verification system**
- **Manual session restoration logic**

#### What to Keep:
- **AuthProvider context structure** (modify implementation)
- **User interface definition** (adapt to Supabase user)
- **Role-based authentication logic**
- **Test login functions** (adapt for development)

#### New Implementation:
```typescript
// selliko-client.js will handle:
- Supabase Auth methods (signInWithOtp, etc.)
- Automatic session management
- Token refresh handling
- User profile management
```

#### Required Changes:
1. **Replace AuthAPI class** with Supabase client calls from [[selliko-client.md]]
2. **Update AuthProvider** to use Supabase session management
3. **Remove manual localStorage operations** (Supabase handles this)
4. **Update user object** to map from Supabase user + profile
5. **Implement phone-based auth** using Supabase OTP

### 2. API CALLS RESTRUCTURING

#### Current Issues to Address:
- **Scattered fetch() calls** across components
- **Manual header management**
- **No error handling standardization**
- **No retry logic or loading states**
- **Hard-coded API URLs**

#### New Architecture:
```typescript
// selliko-client.js will provide:
class SellikoClient {
  // Authentication methods
  async sendOTP(phone)
  async verifyOTP(phone, otp)
  async logout()
  
  // Data methods
  async getListings(filters)
  async createListing(data)
  async updateListing(id, data)
  async deleteListing(id)
  
  // Real-time subscriptions
  async subscribeToListings(callback)
  async subscribeToNotifications(callback)
}
```

#### Files Requiring Updates:
1. **src/lib/auth.tsx** - Replace AuthAPI with Supabase calls
2. **src/components/listing/DeviceListingWizard.tsx** - Update API calls
3. **src/app/my-listings/page.tsx** - Update fetch to use client
4. **All dashboard components** - Centralize API calls

### 3. ROUTING PROTECTION UPDATES

#### Current State:
- Client-side only route protection
- Inconsistent implementation across pages
- No middleware-level protection

#### Required Changes:
1. **Add Next.js middleware** for server-side route protection
2. **Implement systematic auth checks** using Supabase session
3. **Update all protected pages** to use consistent pattern
4. **Add loading states** for auth resolution

#### New Middleware Structure:
```typescript
// middleware.ts
export async function middleware(request) {
  // Check Supabase session
  // Redirect unauthenticated users
  // Handle role-based access
}
```

### 4. DATA LAYER CHANGES

#### Current Database:
- Mock server with in-memory storage
- Express.js REST API endpoints
- Manual data validation

#### Supabase Migration:
1. **Replace mock server** with Supabase database
2. **Update all API calls** to use Supabase client
3. **Implement Row Level Security** for data protection
4. **Add real-time subscriptions** for live updates
5. **Update file uploads** to use Supabase Storage

### 5. REAL-TIME FEATURES

#### New Capabilities:
- **Live auction updates** via Supabase Realtime
- **Notification system** using Supabase channels
- **Bidding updates** in real-time
- **Status change notifications**

---

## INTEGRATION STEPS PRIORITY

### Phase 1: Authentication Migration ✅ COMPLETED
1. ✅ Create `selliko-client.js` with Supabase auth methods
2. ⏳ Update `AuthProvider` to use Supabase
3. ✅ Migrate login/verify-otp pages
4. ⏳ Test authentication flow

### Phase 2: API Client Centralization  
1. Build centralized API client in `selliko-client.js`
2. Replace scattered fetch calls
3. Update all components to use new client
4. Add error handling and loading states

### Phase 3: Route Protection
1. Implement Next.js middleware
2. Add server-side auth checks
3. Update protected pages
4. Test role-based access

### Phase 4: Data & Real-time
1. Set up Supabase database schema
2. Migrate from mock server
3. Implement real-time subscriptions
4. Add file upload functionality

### Phase 5: Testing & Optimization
1. End-to-end testing
2. Performance optimization
3. Error handling improvements
4. Documentation updates

---

## FILES REQUIRING MODIFICATION

### Critical Files:
- `src/lib/auth.tsx` - Complete rewrite for Supabase
- `selliko-client.js` - ✅ New centralized client created
- `src/components/providers/client-providers.tsx` - Update providers
- `middleware.ts` - New server-side protection

### Component Updates:
- `src/app/(auth)/login/page.tsx` - ✅ Updated to use selliko-client
- `src/app/(auth)/verify-otp/page.tsx` - ✅ Updated to use selliko-client  
- `src/components/listing/DeviceListingWizard.tsx` - Update API calls
- `src/app/my-listings/page.tsx` - Update fetch to use client
- All dashboard pages

### Configuration:
- Environment variables update
- Next.js config for Supabase URLs
- Package.json dependencies

---

## ENVIRONMENT VARIABLES TO UPDATE

```bash
# Remove
NEXT_PUBLIC_API_URL=http://localhost:3001

# Add/Update
NEXT_PUBLIC_SELLIKO_API_BASE=http://127.0.0.1:54321/
S3_URL=http://127.0.0.1:54321/storage/v1/s3
```

## COMPLETED CHANGES

### ✅ Authentication System Migration
- **selliko-client.js**: Implemented with getAuthOTP, verifyAuthOTP, getCurrentUser functions
- **Login page**: Updated to use selliko-client.getAuthOTP()
- **Verify-OTP page**: Updated to use selliko-client.verifyAuthOTP() with role-based routing
- **Auth API route**: Updated to reflect migration status
- **Role-based routing**: Now routes to `/{user_role}` after successful authentication
- **Refresh token logic**: Disabled as per requirements

This analysis provides the roadmap for migrating from the current mock server architecture to a fully integrated Supabase backend while maintaining all existing functionality and improving security and performance. 