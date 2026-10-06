import {
  AppsOutlined,
  ChevronRight,
  Inventory2Outlined,
  KeyboardArrowDown,
  LocalOfferOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'

const categorySections = [
  {
    code: '1',
    label: 'Servicios',
    Icon: LocalOfferOutlined,
    items: [
      { code: '1.1', label: 'Computación y Tecnología' },
      {
        code: '1.2',
        label: 'Servicios domésticos',
        children: [
          { code: '1.2.1', label: 'Aseo' },
          { code: '1.2.2', label: 'Trabajo de jardín' },
          { code: '1.2.3', label: 'Limpieza de combustión y reparaciones menores' },
          { code: '1.2.4', label: 'Cuidado de adultos' },
          { code: '1.2.5', label: 'Cuidado de niños' },
          { code: '1.2.6', label: 'Otros servicios domésticos' },
        ],
      },
      {
        code: '1.3',
        label: 'Servicios profesionales',
        children: [
          { code: '1.3.1', label: 'Computación (creación de página web, diseño y publicidad)' },
          { code: '1.3.2', label: 'Abogados' },
          { code: '1.3.3', label: 'Contadores y Auditores' },
          { code: '1.3.4', label: 'Arquitecto' },
          { code: '1.3.5', label: 'Psicólogos' },
          {
            code: '1.3.6',
            label: 'Servicios de salud',
            children: [
              { code: '1.3.6.1', label: 'Médico' },
              { code: '1.3.6.2', label: 'Dentista' },
              { code: '1.3.6.3', label: 'Enfermería' },
              { code: '1.3.6.4', label: 'Kinesiología' },
              { code: '1.3.6.5', label: 'Otros' },
            ],
          },
          {
            code: '1.3.7',
            label: 'Servicios educativos',
            children: [
              { code: '1.3.7.1', label: 'Clases particulares' },
              { code: '1.3.7.2', label: 'Fonoaudiología' },
              { code: '1.3.7.3', label: 'Terapeuta Ocupacional' },
              { code: '1.3.7.4', label: 'Otros' },
            ],
          },
          { code: '1.3.8', label: 'Veterinarios' },
          { code: '1.3.9', label: 'Otros' },
        ],
      },
      { code: '1.4', label: 'Vehículos (reparación, pintura, compra y venta, mecánica general y otros)' },
      { code: '1.5', label: 'Confección de ropa y vestuario' },
      { code: '1.6', label: 'Servicio de banquetería, repostería y alimentación en general' },
      { code: '1.7', label: 'Otros' },
    ],
  },
  {
    code: '2',
    label: 'Productos',
    Icon: Inventory2Outlined,
    items: [
      {
        code: '2.1',
        label: 'Tecnología',
        children: [
          { code: '2.1.1', label: 'Computación' },
          { code: '2.1.2', label: 'Audio y Música' },
          { code: '2.1.3', label: 'Juegos y consolas' },
          { code: '2.1.4', label: 'Electrónica y Televisión' },
          { code: '2.1.5', label: 'Otros' },
        ],
      },
      { code: '2.2', label: 'Celulares' },
      { code: '2.3', label: 'Hogar y Cocina' },
      { code: '2.4', label: 'Alimentación' },
      { code: '2.5', label: 'Accesorios para vehículos' },
      { code: '2.6', label: 'Libros e instrumentos musicales' },
      { code: '2.7', label: 'Ropa, moda y calzado' },
      { code: '2.8', label: 'Juguetes y Niños' },
      { code: '2.9', label: 'Útiles y librería' },
      { code: '2.10', label: 'Otros' },
    ],
  },
]

export default function CategoryMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCode, setActiveCode] = useState('1.3')
  const [activeNestedCode, setActiveNestedCode] = useState(null)

  const allMainCategories = categorySections.flatMap((section) => section.items)
  const activeCategory = allMainCategories.find((category) => category.code === activeCode)
  const activeNestedCategory = activeCategory?.children?.find(
    (category) => category.code === activeNestedCode && category.children,
  )

  const activateCategory = (category) => {
    setActiveCode(category.code)
    setActiveNestedCode(null)
  }

  const selectCategory = (category) => {
    if (category.children) {
      activateCategory(category)
      return
    }

    console.log('Categoría seleccionada:', category)
    setMenuOpen(false)
  }

  const selectLeafCategory = (category) => {
    console.log('Categoría seleccionada:', category)
    setMenuOpen(false)
    setActiveNestedCode(null)
  }

  return (
    <>
      <Button
        color="inherit"
        startIcon={<AppsOutlined />}
        endIcon={<KeyboardArrowDown />}
        onClick={() => setMenuOpen((currentOpen) => !currentOpen)}
        aria-controls={menuOpen ? 'category-drawer' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        sx={{
          display: { xs: 'none', md: 'inline-flex' },
          px: 1.5,
          whiteSpace: 'nowrap',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
        }}
      >
        Categorías
      </Button>

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          zIndex: (muiTheme) => muiTheme.zIndex.appBar + 1,
          '& .MuiBackdrop-root': {
            top: { xs: 64, md: 72 },
            bgcolor: 'rgba(3, 12, 46, 0.38)',
          },
          '& .MuiDrawer-paper': {
            top: { xs: 64, md: 72 },
            bottom: 0,
            width: { xs: '94vw', sm: activeNestedCategory ? 920 : 650 },
            height: { xs: 'calc(100% - 64px)', md: 'calc(100% - 72px)' },
            maxWidth: '100%',
            borderRight: 'none',
            boxShadow: '12px 20px 38px rgba(3, 12, 46, 0.18)',
            overflow: 'hidden',
            transition: 'width 180ms ease',
          },
        }}
      >
        <Box
          id="category-drawer"
          sx={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: {
              xs: '46% 54%',
              sm: activeNestedCategory
                ? '280px 320px minmax(280px, 1fr)'
                : '280px minmax(0, 1fr)',
            },
          }}
        >
          <Box
            sx={{
              gridColumn: 1,
              gridRow: 1,
              overflowY: 'auto',
              borderRight: '1px solid',
              borderColor: 'divider',
            }}
          >
            {categorySections.map((section, sectionIndex) => {
              const SectionIcon = section.Icon

              return (
                <Box key={section.code}>
                  {sectionIndex > 0 && <Divider />}
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ px: 2, pt: 2, pb: 0.75, color: 'primary.main', alignItems: 'center' }}
                  >
                    <SectionIcon fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 850 }}>
                      {section.label}
                    </Typography>
                  </Stack>

                  <List disablePadding sx={{ pb: 1.5 }}>
                    {section.items.map((category) => (
                      <ListItemButton
                        key={category.code}
                        selected={category.code === activeCode}
                        onMouseEnter={() => category.children && activateCategory(category)}
                        onClick={() => selectCategory(category)}
                        sx={{
                          minHeight: 38,
                          px: 2,
                          py: 0.6,
                          alignItems: 'flex-start',
                          '&.Mui-selected': {
                            bgcolor: 'secondary.main',
                            color: 'primary.main',
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ flexGrow: 1, lineHeight: 1.35 }}>
                          {category.label}
                        </Typography>
                        {category.children && (
                          <ChevronRight sx={{ ml: 0.5, mt: 0.1, fontSize: 18, color: 'text.secondary' }} />
                        )}
                      </ListItemButton>
                    ))}
                  </List>
                </Box>
              )
            })}
          </Box>

          <Box
            sx={{
              gridColumn: { xs: 2, sm: 'auto' },
              gridRow: 1,
              display: { xs: activeNestedCategory ? 'none' : 'block', sm: 'block' },
              p: { xs: 2, sm: 3 },
              overflowY: 'auto',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>
              Categoría
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 850 }}>
              {activeCategory?.label}
            </Typography>

            <Stack spacing={1.75}>
              {activeCategory?.children?.map((category) => (
                <Box key={category.code}>
                  {category.children ? (
                    <ListItemButton
                      selected={category.code === activeNestedCode}
                      onMouseEnter={() => setActiveNestedCode(category.code)}
                      onClick={() => setActiveNestedCode(category.code)}
                      sx={{
                        mx: -1,
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 1.5,
                        '&.Mui-selected': {
                          bgcolor: 'secondary.main',
                          color: 'primary.main',
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        {category.label}
                      </Typography>
                      <ChevronRight sx={{ ml: 1, fontSize: 18, color: 'text.secondary' }} />
                    </ListItemButton>
                  ) : (
                    <Button
                      color="inherit"
                      onClick={() => selectLeafCategory(category)}
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        px: 0,
                        py: 0.25,
                        textAlign: 'left',
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                    >
                      {category.label}
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          {activeNestedCategory && (
            <Box
              sx={{
                gridColumn: { xs: 2, sm: 'auto' },
                gridRow: 1,
                p: { xs: 2, sm: 3 },
                overflowY: 'auto',
                bgcolor: 'background.paper',
                borderLeft: '1px solid',
                borderColor: 'divider',
                boxShadow: '-8px 0 24px rgba(3, 12, 46, 0.08)',
              }}
            >
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>
                Subcategoría
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ mb: 2, fontWeight: 850 }}>
                {activeNestedCategory.label}
              </Typography>

              <Stack spacing={0.5}>
                {activeNestedCategory.children.map((category) => (
                  <Button
                    key={category.code}
                    color="inherit"
                    onClick={() => selectLeafCategory(category)}
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      px: 0,
                      py: 0.5,
                      textAlign: 'left',
                      fontWeight: 500,
                      color: 'text.primary',
                    }}
                  >
                    {category.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  )
}
