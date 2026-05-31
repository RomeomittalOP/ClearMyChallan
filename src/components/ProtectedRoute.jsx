import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Loader2 } from 'lucide-react'

/**
 * Guards an admin route. Redirects to /admin/login if the user is not
 * authenticated, or to /  if logged in but lacking admin/advocate role.
 */
export default function ProtectedRoute({ children, roles = ['admin', 'advocate'] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-soft">
        <Loader2 className="w-6 h-6 animate-spin text-police-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
