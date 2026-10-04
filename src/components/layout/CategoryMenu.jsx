import {
  AppsOutlined,
  KeyboardArrowDown,
} from '@mui/icons-material'
import { Button, Menu, MenuItem } from '@mui/material'
import { useState } from 'react'

const categories = [
  'Todas las categorías',
  'Tecnología',
  'Hogar y muebles',
  'Moda y accesorios',
  'Belleza y cuidado personal',
  'Deportes y aire libre',
  'Automotriz',
]

export default function CategoryMenu() {
  const [anchorElement, setAnchorElement] = useState(null)
  const menuOpen = Boolean(anchorElement)

  const selectCategory = (category) => {
    console.log('Categoría seleccionada:', category)
    setAnchorElement(null)
  }

  return (
    <>
      <Button
        color="inherit"
        startIcon={<AppsOutlined />}
        endIcon={<KeyboardArrowDown />}
        onClick={(event) => setAnchorElement(event.currentTarget)}
        aria-controls={menuOpen ? 'category-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        sx={{
          display: { xs: 'none', lg: 'inline-flex' },
          px: 1.5,
          whiteSpace: 'nowrap',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
        }}
      >
        Categorías
      </Button>

      <Menu
        id="category-menu"
        anchorEl={anchorElement}
        open={menuOpen}
        onClose={() => setAnchorElement(null)}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 245,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 16px 40px rgba(3, 12, 46, 0.16)',
            },
          },
        }}
      >
        {categories.map((category) => (
          <MenuItem key={category} onClick={() => selectCategory(category)}>
            {category}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
