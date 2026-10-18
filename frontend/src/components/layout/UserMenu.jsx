import {
  AccountCircleOutlined,
  ExpandMoreOutlined,
  LogoutOutlined,
  SettingsOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../contexts/AuthContext/useAuth'

export default function UserMenu() {
  const [anchorElement, setAnchorElement] = useState(null)
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const menuOpen = Boolean(anchorElement)
  
  const closeMenu = () => setAnchorElement(null)

  const navigateFromMenu = (path) => {
    closeMenu()
    navigate(path)
  }

  const handleLogout = () => {
    closeMenu()
    logout()
    console.log('Sesión cerrada')
    navigate('/inicio')
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        color="inherit"
        onClick={() => navigate('/login')}
        aria-label="Iniciar sesión en Mi cuenta"
        sx={{
          minWidth: { xs: 36, sm: 'auto' },
          px: { xs: 0.5, sm: 1.5 },
          gap: { xs: 0, sm: 0.75 },
          whiteSpace: 'nowrap',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <AccountCircleOutlined fontSize="small" />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Mi cuenta
        </Box>
      </Button>
    )
  }

  // MAGIA AQUÍ: Interceptamos el objeto anidado que manda C#
  const userData = user.user || user || {}
  
  const nombreReal = userData.nombre || userData.Nombre || userData.name || ''
  const apellidoReal = userData.apellido || userData.Apellido || ''
  const rutReal = userData.run || userData.Run || userData.rut || userData.Rut || ''

  const fullName = nombreReal ? `${nombreReal} ${apellidoReal}`.trim() : 'Usuario'

  return (
    <>
      <Button
        color="inherit"
        onClick={(event) => setAnchorElement(event.currentTarget)}
        aria-controls={menuOpen ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        sx={{
          minWidth: { xs: 38, sm: 'auto' },
          px: { xs: 0.75, sm: 1 },
          borderRadius: 2,
          fontWeight: 600,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <AccountCircleOutlined fontSize="small" />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.75, whiteSpace: 'nowrap' }}>
          Mi cuenta
        </Box>
        <ExpandMoreOutlined sx={{ display: { xs: 'none', sm: 'block' }, ml: 0.25, fontSize: 18 }} />
      </Button>

      <Menu
        id="user-menu"
        anchorEl={anchorElement}
        open={menuOpen}
        onClose={closeMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 230,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 16px 40px rgba(3, 12, 46, 0.16)',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            RUT: {rutReal}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => navigateFromMenu('/perfil')}>
          <ListItemIcon>
            <AccountCircleOutlined fontSize="small" />
          </ListItemIcon>
          Mi perfil
        </MenuItem>
        <MenuItem onClick={() => navigateFromMenu('/configuracion')}>
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>
          Configuración
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutOutlined fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  )
}
