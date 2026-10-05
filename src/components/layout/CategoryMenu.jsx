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

function CategoryCode({ children }) {
  return (
    <Typography
      component="span"
      variant="caption"
      sx={{ display: 'inline-block', minWidth: 42, color: 'text.secondary', fontWeight: 700 }}
    >
      {children}
    </Typography>
  )
}

export default function CategoryMenu() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCode, setActiveCode] = useState('1.3')

  const allMainCategories = categorySections.flatMap((section) => section.items)
  const activeCategory = allMainCategories.find((category) => category.code === activeCode)

  const selectCategory = (category) => {
    if (category.children) {
      setActiveCode(category.code)
      return
    }

    console.log('Categoría seleccionada:', category)
    setMenuOpen(false)
  }

  const selectLeafCategory = (category) => {
    console.log('Categoría seleccionada:', category)
    setMenuOpen(false)
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
            width: { xs: '94vw', sm: 650 },
            height: { xs: 'calc(100% - 64px)', md: 'calc(100% - 72px)' },
            maxWidth: '100%',
            borderRight: 'none',
            boxShadow: '12px 20px 38px rgba(3, 12, 46, 0.18)',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          id="category-drawer"
          sx={{
            height: '100%',
            display: 'grid',
            gridTemplateColumns: { xs: '46% 54%', sm: '280px minmax(0, 1fr)' },
          }}
        >
          <Box sx={{ overflowY: 'auto', borderRight: '1px solid', borderColor: 'divider' }}>
            {categorySections.map((section, sectionIndex) => {
              const SectionIcon = section.Icon

              return (
                <Box key={section.code}>
                  {sectionIndex > 0 && <Divider />}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ px: 2, pt: 2, pb: 0.75, color: 'primary.main' }}
                  >
                    <SectionIcon fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={850}>
                      {section.code}. {section.label}
                    </Typography>
                  </Stack>

                  <List disablePadding sx={{ pb: 1.5 }}>
                    {section.items.map((category) => (
                      <ListItemButton
                        key={category.code}
                        selected={category.code === activeCode}
                        onMouseEnter={() => category.children && setActiveCode(category.code)}
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
                        <CategoryCode>{category.code}</CategoryCode>
                        <Typography variant="body2" lineHeight={1.35} sx={{ flexGrow: 1 }}>
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

          <Box sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto', bgcolor: 'background.paper' }}>
            <Typography variant="overline" color="text.secondary" fontWeight={800}>
              Categoría {activeCategory?.code}
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight={850} sx={{ mb: 2 }}>
              {activeCategory?.label}
            </Typography>

            <Stack spacing={1.75}>
              {activeCategory?.children?.map((category) => (
                <Box key={category.code}>
                  {category.children ? (
                    <>
                      <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.75 }}>
                        <CategoryCode>{category.code}</CategoryCode>
                        <Typography variant="subtitle2" color="primary.main" fontWeight={850}>
                          {category.label}
                        </Typography>
                      </Stack>
                      <Stack spacing={0.25}>
                        {category.children.map((childCategory) => (
                          <Button
                            key={childCategory.code}
                            color="inherit"
                            onClick={() => selectLeafCategory(childCategory)}
                            sx={{
                              justifyContent: 'flex-start',
                              px: 1,
                              py: 0.4,
                              ml: 1,
                              textAlign: 'left',
                              fontWeight: 400,
                            }}
                          >
                            <CategoryCode>{childCategory.code}</CategoryCode>
                            {childCategory.label}
                          </Button>
                        ))}
                      </Stack>
                    </>
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
                        color: 'primary.main',
                      }}
                    >
                      <CategoryCode>{category.code}</CategoryCode>
                      {category.label}
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}
