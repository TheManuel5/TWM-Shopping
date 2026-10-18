import { Box } from '@mui/material'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar, { drawerWidth } from './Sidebar'
import { headerOffset } from './layoutConstants'

// En Figma (P01-P07 y P23), las vistas de tienda ocupan el ancho completo sin Sidebar lateral
const FULL_WIDTH_PATHS = [
  '/',
  '/inicio',
  '/catalogo',
  '/producto',
  '/servicio',
  '/carrito',
  '/checkout',
]

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  const isStorefrontView = FULL_WIDTH_PATHS.some(
    (prefix) => pathname === prefix || (prefix !== '/' && pathname.startsWith(prefix)),
  )
  const showSidebar = !isStorefrontView

  const toggleMobileDrawer = () => {
    setMobileOpen((currentValue) => !currentValue)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar
        onMenuClick={toggleMobileDrawer}
        showSidebarToggle={showSidebar}
      />
      {showSidebar && (
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: showSidebar ? `calc(100% - ${drawerWidth}px)` : '100%' },
          minWidth: 0,
          p: { xs: 1.5, sm: 2.5, lg: 3.5 },
        }}
      >
        <Box aria-hidden="true" sx={{ height: headerOffset }} />
        <Outlet />
      </Box>
    </Box>
  )
}