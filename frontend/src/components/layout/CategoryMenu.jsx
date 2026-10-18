import {
  AccessTimeOutlined,
  DesktopWindowsOutlined,
  ExpandMoreOutlined,
  GroupOutlined,
  LocationOnOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_TREE } from '../../utils/taxonomyData'

const TOP_LINKS = [
  { label: 'Productos', hasMega: true, tab: 'Productos' },
  { label: 'Servicios', hasMega: true, tab: 'Servicios' },
  { label: 'Tecnología', path: '/catalogo?categoria=Tecnología' },
  { label: 'Celulares', path: '/catalogo?categoria=Celulares' },
  { label: 'Hogar y Cocina', path: '/catalogo?categoria=Hogar y Cocina' },
  { label: 'Ropa, moda y calzado', path: '/catalogo?categoria=Calzado' },
  { label: 'Más categorías', hasMega: true, tab: 'Productos' },
]

export default function CategoryMenu() {
  const navigate = useNavigate()
  const [openMega, setOpenMega] = useState(false)
  const [activeTab, setActiveTab] = useState('Servicios')
  const [comunaFilter, setComunaFilter] = useState('Osorno')
  const [modalidadFilter, setModalidadFilter] = useState('Todas')
  const [duracionFilter, setDuracionFilter] = useState('Cualquiera')
  const [edadFilter, setEdadFilter] = useState('Todas')

  const handleNavClick = (item) => {
    if (item.hasMega) {
      if (openMega && activeTab === item.tab) {
        setOpenMega(false)
      } else {
        setActiveTab(item.tab)
        setOpenMega(true)
      }
    } else if (item.path) {
      setOpenMega(false)
      navigate(item.path)
    }
  }

  return (
    <Box sx={{ position: 'relative', bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, md: 3 },
          overflowX: 'auto',
          height: 44,
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {TOP_LINKS.map((item) => {
          const isSelected = openMega && item.hasMega && item.tab === activeTab
          return (
            <Button
              key={item.label}
              size="small"
              onClick={() => handleNavClick(item)}
              endIcon={item.hasMega ? <ExpandMoreOutlined fontSize="small" /> : null}
              sx={{
                color: isSelected ? 'primary.main' : 'text.primary',
                fontWeight: isSelected ? 700 : 500,
                whiteSpace: 'nowrap',
                borderRadius: 0,
                height: '100%',
                borderBottom: isSelected ? '2px solid' : '2px solid transparent',
                borderColor: isSelected ? 'primary.main' : 'transparent',
              }}
            >
              {item.label}
            </Button>
          )
        })}
      </Container>

      {/* Mega-Menú Desplegable P02 */}
      <Collapse in={openMega}>
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            zIndex: 1300,
            borderTop: '1px solid',
            borderColor: 'divider',
            borderRadius: '0 0 16px 16px',
            py: 2.5,
            px: { xs: 2, md: 4 },
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab value="Productos" label="Productos" sx={{ fontWeight: 700 }} />
                <Tab value="Servicios" label="Servicios" sx={{ fontWeight: 700 }} />
              </Tabs>
              <Button size="small" color="inherit" onClick={() => setOpenMega(false)}>
                Cerrar ✕
              </Button>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {activeTab === 'Servicios' ? (
              <>
                <Grid container spacing={3}>
                  {CATEGORY_TREE.Servicios.slice(0, 4).map((cat) => (
                    <Grid item xs={12} sm={6} md={3} key={cat.id}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, mb: 1, color: 'text.primary', cursor: 'pointer' }}
                        onClick={() => {
                          setOpenMega(false)
                          navigate(`/catalogo?tipo=servicio&categoria=${encodeURIComponent(cat.name)}`)
                        }}
                      >
                        {cat.name}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        {(cat.children || []).map((sub) => (
                          <Box key={sub.id}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              onClick={() => {
                                setOpenMega(false)
                                navigate(`/servicio/detalle?cat=${encodeURIComponent(sub.name)}`)
                              }}
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { color: 'primary.main', fontWeight: 600 },
                              }}
                            >
                              {sub.name}
                            </Typography>
                            {sub.children && (
                              <Box sx={{ pl: 1.5, mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                                {sub.children.map((leaf) => (
                                  <Typography
                                    key={leaf.id}
                                    variant="caption"
                                    color="text.secondary"
                                    onClick={() => {
                                      setOpenMega(false)
                                      navigate(`/servicio/detalle?cat=${encodeURIComponent(leaf.name)}`)
                                    }}
                                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                  >
                                    • {leaf.name}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Barra de filtros rápidos de Servicios (P02) */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'secondary.light',
                    borderRadius: 3,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Select
                      value={comunaFilter}
                      onChange={(e) => setComunaFilter(e.target.value)}
                      startAdornment={<LocationOnOutlined color="primary" fontSize="small" sx={{ mr: 1 }} />}
                    >
                      <MenuItem value="Osorno">Comuna: Osorno</MenuItem>
                      <MenuItem value="Puerto Montt">Comuna: Puerto Montt</MenuItem>
                      <MenuItem value="Valdivia">Comuna: Valdivia</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Select
                      value={modalidadFilter}
                      onChange={(e) => setModalidadFilter(e.target.value)}
                      startAdornment={<DesktopWindowsOutlined color="primary" fontSize="small" sx={{ mr: 1 }} />}
                    >
                      <MenuItem value="Todas">Modalidad: Todas</MenuItem>
                      <MenuItem value="A domicilio">A domicilio</MenuItem>
                      <MenuItem value="En local">En local</MenuItem>
                      <MenuItem value="Remoto">Online / Remoto</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Select
                      value={duracionFilter}
                      onChange={(e) => setDuracionFilter(e.target.value)}
                      startAdornment={<AccessTimeOutlined color="primary" fontSize="small" sx={{ mr: 1 }} />}
                    >
                      <MenuItem value="Cualquiera">Duración: Cualquiera</MenuItem>
                      <MenuItem value="60">Hasta 60 min</MenuItem>
                      <MenuItem value="90">90 minutos</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Select
                      value={edadFilter}
                      onChange={(e) => setEdadFilter(e.target.value)}
                      startAdornment={<GroupOutlined color="primary" fontSize="small" sx={{ mr: 1 }} />}
                    >
                      <MenuItem value="Todas">Edad mínima: Todas</MenuItem>
                      <MenuItem value="18">Mayores de 18 años</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                     sx={{ ml: 'auto', px: 3 }}
                    onClick={() => {
                      setOpenMega(false)
                      navigate('/servicio/detalle')
                    }}
                  >
                    Ver servicios →
                  </Button>
                </Box>
              </>
            ) : (
              <Grid container spacing={2.5}>
                {CATEGORY_TREE.Productos.map((cat) => (
                  <Grid item xs={6} sm={4} md={2.4} key={cat.id}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        mb: 0.75,
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' },
                      }}
                      onClick={() => {
                        setOpenMega(false)
                        navigate(`/catalogo?categoria=${encodeURIComponent(cat.name)}`)
                      }}
                    >
                      {cat.name}
                    </Typography>
                    {(cat.children || []).map((sub) => (
                      <Typography
                        key={sub.id}
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          py: 0.25,
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }}
                        onClick={() => {
                          setOpenMega(false)
                          navigate(`/catalogo?categoria=${encodeURIComponent(sub.name)}`)
                        }}
                      >
                        {sub.name}
                      </Typography>
                    ))}
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        </Paper>
      </Collapse>
    </Box>
  )
}