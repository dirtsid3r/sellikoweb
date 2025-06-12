# Instance ID Management Guide

## Overview

The SELLIKO platform now includes automatic **Instance ID** generation and management. This provides a unique identifier for each browser session that persists across page reloads and is accessible globally throughout the application.

## How It Works

1. **Automatic Generation**: When the app loads, it checks `localStorage` for an existing `instance-id`
2. **UUID Creation**: If no ID exists, it generates a new UUID and stores it in `localStorage`
3. **Global Access**: The instance ID is available to all components through React Context
4. **Persistence**: The ID persists across browser sessions until localStorage is cleared

## Implementation Details

### Files Modified/Created

```
src/lib/utils.ts                     # UUID generation utilities
src/contexts/instance-context.tsx    # Instance ID React Context
src/components/providers/client-providers.tsx  # Updated to include InstanceProvider
src/components/shared/InstanceIdDisplay.tsx    # Demo component
```

### Technical Implementation

#### 1. UUID Generation (`src/lib/utils.ts`)
```typescript
// Modern browser support with fallback
export function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()  // Native crypto API
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
```

#### 2. localStorage Management
```typescript
export function getOrCreateInstanceId(): string {
  // Server-side safe
  if (typeof window === 'undefined') return ''
  
  try {
    const existingId = localStorage.getItem('instance-id')
    if (existingId) return existingId
    
    // Generate and store new ID
    const newInstanceId = generateUUID()
    localStorage.setItem('instance-id', newInstanceId)
    return newInstanceId
  } catch (error) {
    // Fallback if localStorage fails
    return generateUUID()
  }
}
```

#### 3. React Context Provider
```typescript
export function InstanceProvider({ children }: { children: ReactNode }) {
  const [instanceId, setInstanceId] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    const id = getOrCreateInstanceId()
    setInstanceId(id)
    setIsLoaded(true)
  }, [])

  return (
    <InstanceContext.Provider value={{ instanceId, isLoaded }}>
      {children}
    </InstanceContext.Provider>
  )
}
```

## Usage in Components

### Method 1: Full Context Hook
```typescript
import { useInstanceId } from '@/contexts/instance-context'

function MyComponent() {
  const { instanceId, isLoaded } = useInstanceId()
  
  if (!isLoaded) {
    return <div>Loading...</div>
  }
  
  return <div>Instance ID: {instanceId}</div>
}
```

### Method 2: Value-Only Hook (Convenience)
```typescript
import { useInstanceIdValue } from '@/contexts/instance-context'

function MyComponent() {
  const instanceId = useInstanceIdValue()
  
  // Use instanceId directly
  console.log('Current instance:', instanceId)
  
  return <div>ID: {instanceId}</div>
}
```

### Method 3: Direct Utility (Client-side only)
```typescript
import { getOrCreateInstanceId } from '@/lib/utils'

function handleClientSideAction() {
  const instanceId = getOrCreateInstanceId()
  // Use for analytics, API calls, etc.
}
```

## Use Cases

### 1. Analytics Tracking
```typescript
function useAnalytics() {
  const instanceId = useInstanceIdValue()
  
  const trackEvent = (event: string) => {
    analytics.track(event, {
      instanceId,
      timestamp: Date.now()
    })
  }
  
  return { trackEvent }
}
```

### 2. API Request Headers
```typescript
function useApiClient() {
  const instanceId = useInstanceIdValue()
  
  const apiCall = async (endpoint: string) => {
    return fetch(endpoint, {
      headers: {
        'X-Instance-ID': instanceId,
        'Content-Type': 'application/json'
      }
    })
  }
  
  return { apiCall }
}
```

### 3. Session Management
```typescript
function useSessionTracking() {
  const instanceId = useInstanceIdValue()
  
  useEffect(() => {
    // Track session start
    sessionAPI.start(instanceId)
    
    return () => {
      // Track session end
      sessionAPI.end(instanceId)
    }
  }, [instanceId])
}
```

## Browser Support

- ✅ **Modern Browsers**: Uses `crypto.randomUUID()` (Chrome 92+, Firefox 95+, Safari 15.4+)
- ✅ **Legacy Support**: Fallback UUID generation for older browsers
- ✅ **Server-Side Safe**: No errors during SSR/hydration
- ✅ **localStorage Fallback**: Temporary ID if storage access fails

## Security & Privacy

- **No Personal Data**: Instance ID is just a random UUID
- **Session Scoped**: New ID generated per browser/device combination
- **Local Storage**: Stored client-side only, not transmitted automatically
- **Clearable**: Removed when user clears browser data

## Testing

### Development Mode
```bash
# The instance ID is logged to console in development
🔑 Instance ID initialized: 123e4567-e89b-12d3-a456-426614174000
```

### Manual Testing
```javascript
// Browser console
localStorage.getItem('instance-id')
// Should return: "123e4567-e89b-12d3-a456-426614174000"

// Clear and reload to test generation
localStorage.removeItem('instance-id')
location.reload()
```

## Production Considerations

1. **Monitoring**: Instance IDs can be used for error tracking and user journey analysis
2. **Rate Limiting**: Can be used alongside user authentication for API rate limiting
3. **Analytics**: Enables session-based analytics without user identification
4. **Debugging**: Helps correlate logs and errors to specific browser sessions

---

The instance ID system is now ready to use throughout the SELLIKO platform! 🎉 