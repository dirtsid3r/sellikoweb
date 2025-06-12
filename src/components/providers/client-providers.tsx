'use client'

import { AuthProvider } from '@/lib/auth'
import { InstanceProvider } from '@/contexts/instance-context'
import { Toaster } from 'react-hot-toast'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <InstanceProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </InstanceProvider>
  )
} 