# 🧪 SELLIKO Testing Guide

## Overview
This guide explains how to test the authentication system and verify API endpoints match the `integrationguide.md` specifications.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start Development Servers
```bash
# Option 1: Start both servers together
npm run dev:mock

# Option 2: Start individually
npm run mock-server    # Terminal 1
npm run dev            # Terminal 2
```

## 📋 API Endpoints Verification

Our implementation matches **exactly** with `integrationguide.md`:

### ✅ Authentication Endpoints
| Endpoint | Status | Implementation |
|----------|--------|---------------|
| `POST /auth/send-otp` | ✅ | `src/lib/auth.ts` line 21 |
| `POST /auth/verify-otp` | ✅ | `src/lib/auth.ts` line 41 |
| `POST /auth/refresh-token` | ✅ | `src/lib/auth.ts` line 67 |
| `POST /auth/logout` | ✅ | `src/lib/auth.ts` line 81 |

### 🔧 Request/Response Format Compliance

#### POST /auth/send-otp
```typescript
// Request (matches integrationguide.md)
{
  phone: string // +919876543210
}

// Response (matches integrationguide.md)
{
  success: boolean
  message: string  
  otpId: string
}
```

#### POST /auth/verify-otp
```typescript
// Request (matches integrationguide.md)
{
  phone: string
  otp: string
  otpId: string
}

// Response (matches integrationguide.md)
{
  success: boolean
  user: User
  accessToken: string
  refreshToken: string
}
```

## 🧪 Testing Scenarios

### Test Users (Mock Backend)
- **Phone**: `+919876543210` (Test User 1)
- **Phone**: `+919123456789` (Test User 2)
- **OTP**: `123456` (works for all numbers)

### Manual Testing Steps

#### 1. Test OTP Request
1. Visit `http://localhost:3000`
2. Click "Login" or "List Your Device"
3. Enter phone: `+919876543210`
4. Click "Send OTP"
5. ✅ Check console for OTP sent message
6. ✅ Check network tab for correct API call

#### 2. Test OTP Verification
1. Enter OTP: `123456`
2. Click "Verify"
3. ✅ Should redirect to authenticated state
4. ✅ User name should appear in navigation
5. ✅ Token should be stored in localStorage

#### 3. Test Token Persistence
1. Refresh the page
2. ✅ Should remain logged in
3. ✅ User data should persist

#### 4. Test Logout
1. Click user menu
2. Click "Logout"
3. ✅ Should return to anonymous state
4. ✅ Tokens should be cleared from localStorage

### Browser DevTools Testing

#### Network Tab Verification
1. Open DevTools → Network tab
2. Perform auth flow
3. Verify requests match specifications:

```
POST /auth/send-otp
├── Request Body: { phone: "+919876543210" }
├── Status: 200
└── Response: { success: true, message: "...", otpId: "..." }

POST /auth/verify-otp
├── Request Body: { phone: "+919876543210", otp: "123456", otpId: "..." }
├── Status: 200
└── Response: { success: true, user: {...}, accessToken: "...", refreshToken: "..." }
```

#### Local Storage Verification
1. DevTools → Application → Local Storage
2. Check for keys:
   - `selliko_access_token`
   - `selliko_refresh_token`
   - `selliko_user`

#### Console Verification
Mock server logs in terminal:
```
📨 OTP Request: +919876543210
✅ OTP sent to +919876543210: 123456 (ID: otp_...)
🔐 OTP Verification: +919876543210 with OTP: 123456
👤 Existing user logged in: Test User 1
```

## 🔍 API Endpoint Testing with curl

### Send OTP
```bash
curl -X POST http://localhost:3001/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:3001/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "otp": "123456", 
    "otpId": "YOUR_OTP_ID_HERE"
  }'
```

### Test with Postman
1. Import collection: `SELLIKO Auth Tests`
2. Set base URL: `http://localhost:3001`
3. Run test sequence:
   - Send OTP → Verify OTP → Refresh Token → Logout

## 🏗️ Mock Backend Features

The mock server (`mock-server.js`) implements:

### ✅ Complete integrationguide.md Compliance
- Exact endpoint paths
- Correct request/response formats
- Proper HTTP status codes
- JWT token generation
- Phone number validation (`+91[6-9]\d{9}`)

### 🔧 Development Features
- Fixed OTP `123456` for easy testing
- Detailed console logging
- CORS enabled for frontend
- File upload simulation
- Persistent user storage

### 📊 Health Check
Visit `http://localhost:3001/health` to see:
- Server status
- Available endpoints
- Test user accounts
- API documentation

## 🚨 Common Issues & Solutions

### Issue: CORS Error
**Solution**: Ensure mock server is running and CORS is enabled
```bash
npm run mock-server
```

### Issue: Token Not Persisting
**Solution**: Check localStorage and refresh token logic
```javascript
// DevTools Console
localStorage.getItem('selliko_access_token')
```

### Issue: Invalid Phone Format
**Solution**: Use correct Indian format
```
✅ Correct: +919876543210
❌ Wrong: 9876543210, 919876543210
```

### Issue: OTP Expired
**Solution**: Use fixed OTP `123456` within 5 minutes
```
Test OTP: 123456 (never expires in mock)
```

## 🎯 Next Steps

Once authentication is verified:

1. **Device Listing Flow**
   - Test 4-step wizard (integrationguide.md Step 3)
   - File upload functionality
   - Form validation

2. **Admin Approval**
   - Mock admin interface
   - Listing status updates

3. **Real Backend Integration**
   - Replace mock server with actual API
   - Update `NEXT_PUBLIC_API_URL`
   - Test with production WhatsApp API

## 📝 Test Checklist

### ✅ Authentication Flow
- [ ] OTP request sends to correct endpoint
- [ ] OTP verification returns proper tokens
- [ ] Token refresh works correctly
- [ ] Logout clears all tokens
- [ ] Phone validation enforces Indian format
- [ ] Error handling shows proper messages

### ✅ UI/UX Testing
- [ ] Login modal opens/closes properly
- [ ] Loading states show during API calls
- [ ] Success/error messages display correctly
- [ ] Navigation updates after auth state change
- [ ] Mobile responsiveness works

### ✅ Security Testing
- [ ] Tokens stored securely in localStorage
- [ ] API requests include Authorization headers
- [ ] Expired tokens trigger refresh
- [ ] Logout clears all sensitive data

---

## 🔗 Related Files
- `src/lib/auth.ts` - Authentication logic
- `src/components/auth/LoginModal.tsx` - Login UI
- `mock-server.js` - Mock backend server
- `integrationguide.md` - API specifications

**Ready to test!** Start with `npm run dev:mock` and follow the manual testing steps above. 