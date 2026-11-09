import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import useAuth from '../contexts/AuthContext/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const admin = location.pathname.startsWith('/admin')
  const seller = location.pathname.startsWith('/vendedor') || location.pathname.startsWith('/crud-')
  if ((admin && !(user.canAdmin && user.role === 'Admin')) || (seller && !['Vendedor', 'Admin'].includes(user.role))) return <Box sx={{ p: 4 }}><Typography variant="h4">Acceso no disponible en este modo</Typography><Typography sx={{ my: 2 }}>Selecciona el modo correspondiente en el menú lateral.</Typography><Button component={Link} to="/perfil" variant="contained">Volver a mi cuenta</Button></Box>
  return <Outlet />
}

export function GuestOnlyRoute() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Navigate to="/inicio" replace /> : <Outlet />
}
