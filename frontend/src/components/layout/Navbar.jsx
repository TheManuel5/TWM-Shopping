import {
  FavoriteBorderOutlined,
  KeyboardArrowDownOutlined,
  LocationOnOutlined,
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
  Container,
  IconButton,
  InputAdornment,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../contexts/AuthContext/useAuth'
import CategoryMenu from './CategoryMenu'
import UserMenu from './UserMenu'

const COMUNAS_DISPONIBLES = ['Osorno', 'Puerto Montt', 'Puerto Varas', 'Frutillar', 'Valdivia']

export default function Navbar({ onMenuClick, showSidebarToggle = true }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [anchorLoc, setAnchorLoc] = useState(null)
  const { selectedComuna = 'Osorno', setSelectedComuna } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (event) => {
    event.preventDefault()
    navigate(`/catalogo?q=${encodeURIComponent(searchTerm.trim())}`)
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        zIndex: (muiTheme) => muiTheme.zIndex.drawer + 2,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 1, md: 2.5 },
          }}
        >
          {/* Logo Shopping + Selector Ubicación */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {showSidebarToggle && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={onMenuClick}
                aria-label="abrir navegación"
                sx={{ display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box
              onClick={() => navigate('/inicio')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 38,
                  height: 38,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  borderRadius: 2.5,
                }}
              >
                <ShoppingBagOutlined fontSize="small" />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  color: 'text.primary',
                }}
              >
                Shopping
              </Typography>
            </Box>

            {/* Enviar a Osorno (P01-P23) */}
            <Button
              color="inherit"
              size="small"
              onClick={(e) => setAnchorLoc(e.currentTarget)}
              startIcon={<LocationOnOutlined color="primary" />}
              endIcon={<KeyboardArrowDownOutlined fontSize="small" />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                textAlign: 'left',
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
              }}
            >
              <Box sx={{ lineHeight: 1.1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem' }}>
                  Enviar a
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {selectedComuna}
                </Typography>
              </Box>
            </Button>
            <Menu
              anchorEl={anchorLoc}
              open={Boolean(anchorLoc)}
              onClose={() => setAnchorLoc(null)}
            >
              {COMUNAS_DISPONIBLES.map((comuna) => (
                <MenuItem
                  key={comuna}
                  selected={comuna === selectedComuna}
                  onClick={() => {
                    setSelectedComuna?.(comuna)
                    setAnchorLoc(null)
                  }}
                >
                  {comuna}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Barra de búsqueda central */}
          <Paper
            component="form"
            onSubmit={handleSearch}
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              maxWidth: 640,
              height: 44,
              p: '3px 4px 3px 14px',
              borderRadius: 2.5,
              bgcolor: '#f7f6ff',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <InputBase
              fullWidth
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="¿Qué estás buscando?"
              startAdornment={
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              }
              sx={{ fontSize: '0.92rem' }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ height: 36, px: 2.5, borderRadius: 2 }}
            >
              Buscar
            </Button>
          </Paper>

          {/* Acciones Derecha: Mi cuenta, Favoritos, Carrito */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 } }}>
            <UserMenu />

            <Button
              color="inherit"
              onClick={() => navigate('/favoritos')}
              startIcon={
                <Badge badgeContent={8} color="primary">
                  <FavoriteBorderOutlined />
                </Badge>
              }
              sx={{ display: { xs: 'none', md: 'inline-flex' }, fontWeight: 600 }}
            >
              Favoritos
            </Button>

            <Button
              color="inherit"
              onClick={() => navigate('/carrito')}
              startIcon={
                <Badge badgeContent={3} color="primary">
                  <ShoppingCartOutlined />
                </Badge>
              }
              sx={{ fontWeight: 700 }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', lineHeight: 1.1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem' }}>
                  Carrito
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  $49.980
                </Typography>
              </Box>
            </Button>
          </Box>
        </Toolbar>
      </Container>

      {/* Segunda barra horizontal con Mega-Menú P02 */}
      <CategoryMenu />
    </AppBar>
  )
}