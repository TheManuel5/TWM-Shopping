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
  useMediaQuery,
} from '@mui/material'
import { useState } from 'react'
import CategoryMenu from './CategoryMenu'
import UserMenu from './UserMenu'
import { desktopHeaderHeight, mobileHeaderHeight } from './layoutConstants'

export default function Navbar({ onMenuClick, showSidebarToggle = true }) {
  const [searchTerm, setSearchTerm] = useState('')
  const compactSearch = useMediaQuery((muiTheme) => muiTheme.breakpoints.down('sm'))

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
          display: 'grid',
          gridTemplateAreas: {
            xs: '"brand actions" "tools tools"',
            md: '"brand tools actions"',
          },
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr) auto',
            md: 'max-content minmax(300px, 1fr) max-content',
          },
          gridTemplateRows: {
            xs: `${mobileHeaderHeight / 2}px ${mobileHeaderHeight / 2}px`,
            md: `${desktopHeaderHeight}px`,
          },
          columnGap: { xs: 1, md: 2 },
          minHeight: { xs: mobileHeaderHeight, md: desktopHeaderHeight },
          px: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Box
          sx={{
            gridArea: 'brand',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.5, md: 1 },
            minWidth: 0,
          }}
        >
          {showSidebarToggle && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMenuClick}
              aria-label="abrir navegación"
              sx={{ mr: 0.25, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: { xs: 34, md: 38 },
              height: { xs: 34, md: 38 },
              bgcolor: 'primary.main',
              borderRadius: 2,
            }}
          >
            <ShoppingBagOutlined />
          </Box>
          <Typography
            variant="h6"
            sx={{
              display: { xs: showSidebarToggle ? 'none' : 'block', sm: 'block' },
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            Shopping
          </Typography>
        </Box>

        <Box
          sx={{
            gridArea: 'tools',
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr)',
            alignItems: 'center',
            gap: { xs: 0.75, md: 1.5 },
            width: '100%',
            minWidth: 0,
          }}
        >
          <CategoryMenu />
          <Paper
            component="form"
            onSubmit={handleSearch}
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifySelf: 'center',
              width: '100%',
              maxWidth: 620,
              minWidth: 0,
              height: { xs: 40, md: 44 },
              p: { xs: '3px 3px 3px 8px', sm: '3px 3px 3px 12px' },
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
              placeholder={compactSearch ? '¿Qué buscas?' : '¿Qué estás buscando?'}
              slotProps={{ input: { 'aria-label': 'Buscar productos' } }}
              startAdornment={(
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" sx={{ color: '#8d96b2' }} />
                </InputAdornment>
              )}
              sx={{
                minWidth: 0,
                color: 'text.primary',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                '& input::placeholder': { color: '#8d96b2', opacity: 1 },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                height: { xs: 32, md: 36 },
                minWidth: { xs: 64, sm: 84, md: 92 },
                px: { xs: 1.25, sm: 2, md: 2.5 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              Buscar
            </Button>
          </Paper>
        </Box>

        <Box
          sx={{
            gridArea: 'actions',
            display: 'flex',
            alignItems: 'center',
            justifySelf: 'end',
            gap: { xs: 0, sm: 0.5 },
            minWidth: 0,
          }}
        >
          <IconButton
            color="inherit"
            aria-label="favoritos"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            <FavoriteBorderOutlined />
          </IconButton>
          <IconButton color="inherit" aria-label="carrito de compras" size="small">
            <Badge badgeContent={2} color="primary">
              <ShoppingCartOutlined />
            </Badge>
          </IconButton>
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
