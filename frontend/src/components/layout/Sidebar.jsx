import {
  AccountCircleOutlined,
  AnalyticsOutlined,
  BusinessOutlined,
  ChatOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  FavoriteBorderOutlined,
  GroupOutlined,
  Inventory2Outlined,
  LocalOfferOutlined,
  LocalShippingOutlined,
  SettingsOutlined,
  ShoppingBagOutlined,
  StorefrontOutlined,
} from '@mui/icons-material'
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { NavLink } from 'react-router-dom'
import useAuth from '../../contexts/AuthContext/useAuth'
import RoleSwitcher from '../molecules/RoleSwitcher/RoleSwitcher'
import { desktopHeaderHeight, headerOffset } from './layoutConstants'

export const drawerWidth = 256

const CLIENT_ITEMS = [
  { label: 'Compras y devoluciones', path: '/mis-compras', icon: <ShoppingBagOutlined /> },
  { label: 'Cotizaciones', path: '/cotizaciones', icon: <DescriptionOutlined /> },
  { label: 'Favoritos', path: '/favoritos', icon: <FavoriteBorderOutlined /> },
  { label: 'Mensajes', path: '/mensajes', icon: <ChatOutlined /> },
  { label: 'Perfil y direcciones', path: '/perfil', icon: <AccountCircleOutlined /> },
]

const SELLER_ADMIN_ITEMS = [
  { label: 'Panel de control', path: '/vendedor/dashboard', icon: <DashboardOutlined /> },
  { label: 'Usuarios (Admin)', path: '/admin/usuarios', icon: <GroupOutlined /> },
  { label: 'Empresas (Admin)', path: '/admin/empresas', icon: <BusinessOutlined /> },
  { label: 'Publicar producto', path: '/vendedor/publicar-producto', icon: <LocalOfferOutlined /> },
  { label: 'Publicar servicio', path: '/vendedor/publicar-servicio', icon: <StorefrontOutlined /> },
  { label: 'Ventas y pedidos', path: '/crud-1', icon: <ShoppingBagOutlined /> },
  { label: 'Inventario y ofertas', path: '/vendedor/inventario', icon: <Inventory2Outlined /> },
  { label: 'Catálogo (CRUD)', path: '/crud-2', icon: <StorefrontOutlined /> },
  { label: 'Despachos y tarifas', path: '/vendedor/despachos', icon: <LocalShippingOutlined /> },
  { label: 'Reportes y Consultas SQL', path: '/admin/reportes', icon: <AnalyticsOutlined /> },
  { label: 'Configuración', path: '/configuracion', icon: <SettingsOutlined /> },
]

function SidebarContent({ includeHeaderSpacer = true, onNavigate }) {
  const { user } = useAuth()
  const role = user?.role || 'Comprador'

  return (
    <Box sx={{ pb: 3 }}>
      {includeHeaderSpacer && <div aria-hidden="true" style={{ height: desktopHeaderHeight }} />}

      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 700 }}>
          MODO ACTIVO ({role.toUpperCase()})
        </Typography>
        <RoleSwitcher />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* Menú Mi Cuenta (Cliente P08 - P14) */}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2.5, fontWeight: 800, display: 'block' }}
      >
        Mi cuenta (Cliente)
      </Typography>
      <List sx={{ px: 1.5 }} dense>
        {CLIENT_ITEMS.map((item) => (
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
                fontWeight: 700,
              },
              '&.active .MuiListItemIcon-root': {
                color: 'primary.main',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ mx: 2, my: 1 }} />

      {/* Menú Gestión Comercial y Administración (P15 - P22) */}
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 2.5, fontWeight: 800, display: 'block' }}
      >
        Gestión y Admin
      </Typography>
      <List sx={{ px: 1.5 }} dense>
        {SELLER_ADMIN_ITEMS.map((item) => (
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
                fontWeight: 700,
              },
              '&.active .MuiListItemIcon-root': {
                color: 'primary.main',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
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