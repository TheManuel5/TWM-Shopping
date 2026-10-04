import { Box, Toolbar } from '@mui/material'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar, { drawerWidth } from './Sidebar'

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleMobileDrawer = () => {
    setMobileOpen((currentValue) => !currentValue)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onMenuClick={toggleMobileDrawer} />
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          p: { xs: 2, sm: 3, lg: 4 },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
