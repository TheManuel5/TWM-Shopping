import { Box } from '@mui/material'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar, { drawerWidth } from './Sidebar'
import { headerOffset } from './layoutConstants'

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const showSidebar = pathname !== '/inicio' && pathname !== '/'

  const toggleMobileDrawer = () => {
    setMobileOpen((currentValue) => !currentValue)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
          p: { xs: 1.5, sm: 2.5, lg: 4 },
        }}
      >
        <Box aria-hidden="true" sx={{ height: headerOffset }} />
        <Outlet />
      </Box>
    </Box>
  )
}
