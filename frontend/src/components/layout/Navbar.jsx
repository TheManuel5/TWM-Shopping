import {
  FavoriteBorderOutlined,
  GridViewRounded,
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
import { useNavigate } from 'react-router-dom'
import CategoryMenu from './CategoryMenu'
import UserMenu from './UserMenu'

function SearchForm({ searchTerm, onSearchTermChange, onSubmit, mobile = false }) {
  return (
    <Paper
      component="form"
      onSubmit={onSubmit}
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        minWidth: 0,
        height: mobile ? 46 : 42,
        p: '3px 4px 3px 12px',
        borderRadius: 2,
        bgcolor: '#ffffff',
        border: '1px solid',
        borderColor: mobile ? 'divider' : 'transparent',
      }}
    >
      <InputBase
        fullWidth
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        placeholder="¿Qué estás buscando?"
        inputProps={{ 'aria-label': 'Buscar productos y servicios' }}
        startAdornment={
          <InputAdornment position="start">
            <SearchOutlined fontSize="small" sx={{ color: '#8690aa' }} />
          </InputAdornment>
        }
        sx={{ fontSize: '0.9rem', color: 'text.primary' }}
      />
      <Button type="submit" variant="contained" sx={{ height: 34, px: { xs: 2, md: 2.75 }, borderRadius: 1.5 }}>
        Buscar
      </Button>
    </Paper>
  )
}

export default function Navbar({ onMenuClick, showSidebarToggle = true }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (event) => {
    event.preventDefault()
    const normalizedSearch = searchTerm.trim()
    setMobileSearchOpen(false)
    navigate(`/catalogo${normalizedSearch ? `?q=${encodeURIComponent(normalizedSearch)}` : ''}`)
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2,
          bgcolor: '#050d25',
          color: '#ffffff',
          borderBottom: '2px solid',
          borderColor: 'primary.main',
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: '60px !important', md: '64px !important' },
            px: { xs: 1.25, sm: 2, lg: 3.5 },
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1, lg: 2 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
            {showSidebarToggle && (
              <IconButton
                color="inherit"
                onClick={onMenuClick}
                aria-label="Abrir navegación de usuario"
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box
              onClick={() => navigate('/inicio')}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer' }}
            >
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: { xs: 34, md: 38 },
                  height: { xs: 34, md: 38 },
                  bgcolor: 'primary.main',
                  color: '#ffffff',
                  borderRadius: 2,
                }}
              >
                <ShoppingBagOutlined fontSize="small" />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 900,
                  letterSpacing: '-0.4px',
                  color: '#ffffff',
                }}
              >
                Shopping
              </Typography>
            </Box>

            <Button
              color="inherit"
              onClick={() => setCategoryOpen((current) => !current)}
              startIcon={<GridViewRounded fontSize="small" />}
              aria-haspopup="dialog"
              aria-expanded={categoryOpen}
              sx={{
                minWidth: { xs: 38, sm: 'auto' },
                px: { xs: 0.75, sm: 1.25 },
                fontWeight: 700,
                bgcolor: categoryOpen ? 'rgba(255,255,255,0.14)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.75 } },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Categorías
              </Box>
            </Button>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, maxWidth: 680, mx: 'auto', minWidth: 180 }}>
            <SearchForm
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSubmit={handleSearch}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.25, lg: 0.75 }, flexShrink: 0 }}>
            <IconButton
              color="inherit"
              onClick={() => setMobileSearchOpen((current) => !current)}
              aria-label="Abrir búsqueda"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <SearchOutlined />
            </IconButton>

            <UserMenu />

            <Button
              color="inherit"
              onClick={() => navigate('/favoritos')}
              startIcon={<FavoriteBorderOutlined />}
              sx={{
                minWidth: { xs: 38, lg: 'auto' },
                px: { xs: 0.75, lg: 1 },
                fontWeight: 600,
                '& .MuiButton-startIcon': { mr: { xs: 0, lg: 0.75 } },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', lg: 'inline' } }}>
                Favoritos
              </Box>
            </Button>

            <Button
              color="inherit"
              onClick={() => navigate('/carrito')}
              startIcon={
                <Badge badgeContent={0} showZero color="primary">
                  <ShoppingCartOutlined />
                </Badge>
              }
              sx={{
                minWidth: { xs: 38, sm: 'auto' },
                px: { xs: 0.75, sm: 1 },
                fontWeight: 700,
                '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.75 } },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Carrito
              </Box>
            </Button>
          </Box>
        </Toolbar>

        {mobileSearchOpen && (
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              position: 'absolute',
              top: { xs: 60, md: 64 },
              left: 0,
              right: 0,
              p: 1,
              bgcolor: '#050d25',
              boxShadow: '0 12px 24px rgba(3,12,46,0.22)',
            }}
          >
            <SearchForm
              mobile
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSubmit={handleSearch}
            />
          </Box>
        )}
      </AppBar>

      {categoryOpen && <CategoryMenu open onClose={() => setCategoryOpen(false)} />}
    </>
  )
}
