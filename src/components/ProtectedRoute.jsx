import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

export function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    )
  }

  if (!user || !isAdmin) return <Navigate to="/login" replace />

  return children
}

