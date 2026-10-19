import {
  ArrowBackOutlined,
  ChevronRightOutlined,
  Inventory2Outlined,
  LocalOfferOutlined,
} from '@mui/icons-material'
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_TREE } from '../../utils/taxonomyData'
import { headerOffset } from './layoutConstants'

const PANEL_WIDTH = 300
const SECTION_ORDER = ['Servicios', 'Productos']

export default function CategoryMenu({ open, onClose }) {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeChild, setActiveChild] = useState(null)

  const panelCount = 1 + (activeCategory ? 1 : 0) + (activeChild ? 1 : 0)

  const closeMenu = () => {
    onClose()
  }

  const navigateToCategory = (section, categoryName) => {
    const query = new URLSearchParams()
    query.set('categoria', categoryName)
    if (section === 'Servicios') query.set('tipo', 'servicio')
    closeMenu()
    navigate(`/catalogo?${query.toString()}`)
  }

  const selectPrimaryCategory = (section, category) => {
    if (!category.children?.length) {
      navigateToCategory(section, category.name)
      return
    }

    setActiveSection(section)
    setActiveCategory(category)
    setActiveChild(null)
  }

  const selectSecondaryCategory = (category) => {
    if (!category.children?.length) {
      navigateToCategory(activeSection, category.name)
      return
    }

    setActiveChild(category)
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={closeMenu}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        '& .MuiBackdrop-root': {
          top: headerOffset,
          bgcolor: 'rgba(3, 12, 46, 0.42)',
        },
        '& .MuiDrawer-paper': {
          top: headerOffset,
          height: {
            xs: `calc(100% - ${headerOffset.xs})`,
            md: `calc(100% - ${headerOffset.md})`,
          },
          width: {
            xs: '100vw',
            sm: `${panelCount * PANEL_WIDTH}px`,
          },
          maxWidth: '100vw',
          overflow: 'hidden',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: (theme) => theme.transitions.create('width'),
        },
      }}
    >
      <Box sx={{ display: 'flex', height: '100%', minWidth: 0 }}>
        <Box
          sx={{
            display: { xs: activeCategory ? 'none' : 'flex', sm: 'flex' },
            flexDirection: 'column',
            flex: { xs: '1 1 100%', sm: `0 0 ${PANEL_WIDTH}px` },
            minWidth: 0,
            overflowY: 'auto',
            bgcolor: 'background.paper',
          }}
        >
          {SECTION_ORDER.map((section, sectionIndex) => (
            <Box key={section}>
              {sectionIndex > 0 && <Divider sx={{ my: 1 }} />}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, pt: 1.25, pb: 0.5, color: 'primary.main' }}>
                {section === 'Servicios' ? <LocalOfferOutlined fontSize="small" /> : <Inventory2Outlined fontSize="small" />}
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {section}
                </Typography>
              </Box>
              <List disablePadding>
                {CATEGORY_TREE[section].map((category) => {
                  const selected = activeSection === section && activeCategory?.id === category.id
                  return (
                    <ListItemButton
                      key={category.id}
                      selected={selected}
                      onClick={() => selectPrimaryCategory(section, category)}
                      sx={{
                        mx: 1,
                        minHeight: 40,
                        borderRadius: 1.5,
                        color: 'text.primary',
                        '&.Mui-selected': {
                          bgcolor: 'secondary.main',
                          color: 'primary.main',
                        },
                        '&.Mui-selected:hover': { bgcolor: 'secondary.main' },
                      }}
                    >
                      <ListItemText
                        primary={category.name}
                        primaryTypographyProps={{ fontSize: '0.86rem', fontWeight: selected ? 700 : 500 }}
                      />
                      {category.children?.length > 0 && <ChevronRightOutlined fontSize="small" color="action" />}
                    </ListItemButton>
                  )
                })}
              </List>
            </Box>
          ))}
        </Box>

        {activeCategory && (
          <Box
            sx={{
              display: { xs: activeChild ? 'none' : 'flex', sm: 'flex' },
              flexDirection: 'column',
              flex: { xs: '1 1 100%', sm: `0 0 ${PANEL_WIDTH}px` },
              minWidth: 0,
              overflowY: 'auto',
              bgcolor: 'background.paper',
              borderLeft: { sm: '1px solid' },
              borderColor: { sm: 'divider' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2, py: 1.5 }}>
              <IconButton
                size="small"
                onClick={() => setActiveCategory(null)}
                aria-label="Volver a categorías"
                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
              >
                <ArrowBackOutlined fontSize="small" />
              </IconButton>
              <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800, flexGrow: 1 }}>
                {activeCategory.name}
              </Typography>
            </Box>
            <Divider />
            <List disablePadding sx={{ py: 1 }}>
              {activeCategory.children.map((category) => {
                const selected = activeChild?.id === category.id
                return (
                  <ListItemButton
                    key={category.id}
                    selected={selected}
                    onClick={() => selectSecondaryCategory(category)}
                    sx={{
                      mx: 1,
                      minHeight: 44,
                      borderRadius: 1.5,
                      '&.Mui-selected': {
                        bgcolor: 'secondary.main',
                        color: 'primary.main',
                      },
                      '&.Mui-selected:hover': { bgcolor: 'secondary.main' },
                    }}
                  >
                    <ListItemText
                      primary={category.name}
                      primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: selected ? 700 : 500 }}
                    />
                    {category.children?.length > 0 && <ChevronRightOutlined fontSize="small" color="action" />}
                  </ListItemButton>
                )
              })}
            </List>
          </Box>
        )}

        {activeChild && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: { xs: '1 1 100%', sm: `0 0 ${PANEL_WIDTH}px` },
              minWidth: 0,
              overflowY: 'auto',
              bgcolor: 'background.paper',
              borderLeft: { sm: '1px solid' },
              borderColor: { sm: 'divider' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 2, py: 1.5 }}>
              <IconButton
                size="small"
                onClick={() => setActiveChild(null)}
                aria-label="Volver a subcategorías"
                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
              >
                <ArrowBackOutlined fontSize="small" />
              </IconButton>
              <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 800, flexGrow: 1 }}>
                {activeChild.name}
              </Typography>
            </Box>
            <Divider />
            <List disablePadding sx={{ py: 1 }}>
              {activeChild.children.map((category) => (
                <ListItemButton
                  key={category.id}
                  onClick={() => navigateToCategory(activeSection, category.name)}
                  sx={{ mx: 1, minHeight: 44, borderRadius: 1.5 }}
                >
                  <ListItemText
                    primary={category.name}
                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}
