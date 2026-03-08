import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FullPageSpinner } from '../ui/Spinner'

export default function ProtectedRoute({ requiredRole }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (requiredRole && profile?.role !== requiredRole) return <Navigate to="/" replace />

  return <Outlet />
}
