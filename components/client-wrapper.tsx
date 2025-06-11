'use client'

import { useAuth } from '../contexts/auth-context'
import { AuthProvider } from '../contexts/auth-context'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}