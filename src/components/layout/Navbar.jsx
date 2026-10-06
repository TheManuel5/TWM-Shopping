import {
  FavoriteBorderOutlined,
  Menu as MenuIcon,
  SearchOutlined,
  ShoppingBagOutlined,
  ShoppingCartOutlined,
} from '@mui/icons-material'
import {
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  InputAdornment,
  InputBase,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import CategoryMenu from './CategoryMenu'
import UserMenu from './UserMenu'

export default function Navbar({ onMenuClick, showSidebarToggle = true }) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (event) => {
    event.preventDefault()
    console.log('Búsqueda:', searchTerm.trim())
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (muiTheme) => muiTheme.zIndex.drawer + 2,
        bgcolor: 'text.primary',
        borderBottom: '2px solid',
        borderColor: 'primary.main',
      }}
    >
      <Toolbar
        sx={{
          gap: { xs: 1, md: 2 },
          minHeight: { xs: 64, md: 72 },
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
          {showSidebarToggle && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMenuClick}
              aria-label="abrir navegación"
              sx={{ mr: 0.5, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}

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
          <CategoryMenu />
        </Box>

        <Paper
          component="form"
          onSubmit={handleSearch}
          elevation={0}
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(44vw, 620px)',
            height: 44,
            p: '3px 3px 3px 14px',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <InputBase
            fullWidth
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="¿Qué estás buscando?"
            inputProps={{ 'aria-label': 'Buscar productos' }}
            startAdornment={(
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" sx={{ color: '#8d96b2' }} />
              </InputAdornment>
            )}
            sx={{
              color: 'text.primary',
              '& input::placeholder': { color: '#8d96b2', opacity: 1 },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ height: 36, minWidth: 92, px: 2.5 }}
          >
            Buscar
          </Button>
        </Paper>

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
