import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../contexts/AuthContext/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function GuestOnlyRoute() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Navigate to="/inicio" replace /> : <Outlet />
}
