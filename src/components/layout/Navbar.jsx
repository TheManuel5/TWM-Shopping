import {
  FavoriteBorderOutlined,
  Menu as MenuIcon,
  ShoppingBagOutlined,
  ShoppingCartOutlined,
} from '@mui/icons-material'
import {
  AppBar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import UserMenu from './UserMenu'

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
      <Toolbar sx={{ gap: { xs: 1, md: 2 }, minHeight: { xs: 64, md: 72 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          aria-label="abrir navegación"
          sx={{ mr: 1, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
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

        <TextField
          size="small"
          placeholder="Buscar en Shopping..."
          aria-label="Buscar en Shopping"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <ShoppingBagOutlined fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 'min(460px, 38vw)',
            ml: { md: 2 },
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
            },
          }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          color="inherit"
          aria-label="favoritos"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          <FavoriteBorderOutlined />
        </IconButton>
        <IconButton color="inherit" aria-label="carrito de compras">
          <Badge badgeContent={2} color="primary">
            <ShoppingCartOutlined />
          </Badge>
        </IconButton>
        <UserMenu />
      </Toolbar>
    </AppBar>
  )
}
