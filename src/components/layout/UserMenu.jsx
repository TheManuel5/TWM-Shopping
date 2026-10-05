import {
  AccountCircleOutlined,
  ExpandMore,
  LogoutOutlined,
  SettingsOutlined,
} from '@mui/icons-material'
import {
  Avatar,
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

export default function UserMenu() {
  const [anchorElement, setAnchorElement] = useState(null)
  const navigate = useNavigate()
  const menuOpen = Boolean(anchorElement)

  const closeMenu = () => setAnchorElement(null)

  const navigateFromMenu = (path) => {
    closeMenu()
    navigate(path)
  }

  const handleLogout = () => {
    closeMenu()
    console.log('Sesión cerrada')
    navigate('/login')
  }

  return (
    <>
      <Button
        color="inherit"
        onClick={(event) => setAnchorElement(event.currentTarget)}
        aria-controls={menuOpen ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        endIcon={<ExpandMore />}
        sx={{
          minWidth: 0,
          px: { xs: 0.5, sm: 1 },
          borderRadius: 2,
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
        }}
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            mr: { xs: 0, sm: 1 },
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 700,
          }}
        >
          JT
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
          <Typography variant="body2" fontWeight={700} lineHeight={1.1}>
            Jheffry Trepstein
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Comprador
          </Typography>
        </Box>
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
            Jheffry Trepstein
          </Typography>
          <Typography variant="caption" color="text.secondary">
            jheffry.trepstein@shopping.cl
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
