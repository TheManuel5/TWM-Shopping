import {
  AccountCircleOutlined,
  Menu as MenuIcon,
  ShoppingBagOutlined,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function Navbar({ onMenuClick }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
        bgcolor: 'text.primary',
        borderBottom: '2px solid',
        borderColor: 'primary.main',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          aria-label="abrir navegación"
          sx={{ mr: 1, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 38,
              height: 38,
              bgcolor: 'primary.main',
              borderRadius: 2,
            }}
          >
            <ShoppingBagOutlined />
          </Box>
          <Typography variant="h6" fontWeight={800}>
            Shopping
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          component={RouterLink}
          to="/perfil"
          color="inherit"
          startIcon={<AccountCircleOutlined />}
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          Mi cuenta
        </Button>
      </Toolbar>
    </AppBar>
  )
}
