import {
  AccountCircleOutlined,
  DashboardOutlined,
  Inventory2Outlined,
  StorefrontOutlined,
} from '@mui/icons-material'
import {
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { NavLink } from 'react-router-dom'
import { desktopHeaderHeight, headerOffset } from './layoutConstants'

export const drawerWidth = 248

const navigationItems = [
  { label: 'Inicio', path: '/inicio', icon: <DashboardOutlined /> },
  { label: 'Perfil', path: '/perfil', icon: <AccountCircleOutlined /> },
  { label: 'Pedidos', path: '/crud-1', icon: <Inventory2Outlined /> },
  { label: 'Productos', path: '/crud-2', icon: <StorefrontOutlined /> },
]

function SidebarContent({ includeHeaderSpacer = true, onNavigate }) {
  return (
    <>
      {includeHeaderSpacer && <div aria-hidden="true" style={{ height: desktopHeaderHeight }} />}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2.5, pt: 2, fontWeight: 700 }}
      >
        Navegación
      </Typography>
      <List sx={{ px: 1.5 }}>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onNavigate}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              color: 'text.secondary',
              '&.active': {
                bgcolor: 'secondary.main',
                color: 'primary.main',
              },
              '&.active .MuiListItemIcon-root': {
                color: 'primary.main',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ mx: 2, mt: 1 }} />
    </>
  )
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            top: headerOffset.xs,
            width: drawerWidth,
            height: `calc(100% - ${headerOffset.xs})`,
          },
        }}
      >
        <SidebarContent includeHeaderSpacer={false} onNavigate={onClose} />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            borderRightColor: 'divider',
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    </>
  )
}
