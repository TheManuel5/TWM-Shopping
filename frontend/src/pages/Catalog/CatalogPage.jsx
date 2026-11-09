import ReferenceBadge from '../../components/atoms/ReferenceBadge'
import { notify } from '../../utils/feedback'
import { categoryNamesUnder } from '../../utils/categories'
import { CATEGORY_TREE } from '../../utils/taxonomyData'
import { FavoriteBorderOutlined, LocalShippingOutlined, ShoppingCartOutlined, StarBorderOutlined } from '@mui/icons-material'
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Chip,
  Skeleton,
  Pagination,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ColorSwatch from '../../components/atoms/ColorSwatch/ColorSwatch'
import useCollection from '../../hooks/useCollection'
import { catalogSeed, asItem, addToCart, toggleFavorite } from '../../data/catalog'
import { formatCLP } from '../../utils/taxonomyData'


const COLORS = [
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Negro', hex: '#111827' },
  { name: 'Gris', hex: '#6b7280' },
  { name: 'Violeta', hex: '#602ff7' },
  { name: 'Rosa', hex: '#f472b6' },
  { name: 'Azul', hex: '#1e3a8a' },
  { name: 'Rojo', hex: '#dc2626' },
  { name: 'Verde', hex: '#15803d' },
]

function durationMinutes(value) { const text = String(value || ''); if (/^\d+:\d+:\d+/.test(text)) { const [h, m] = text.split(':').map(Number); return h * 60 + m } return parseFloat(text) * (/hora|hour/i.test(text) ? 60 : 1) }

const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43']

export default function CatalogPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('categoria') || 'Catálogo General'

  const [categoryTree] = useCollection('categories', CATEGORY_TREE)
  const categoryNames = categoryNamesUnder(categoryTree, activeCategory)
  const [catalogPage, setCatalogPage] = useState(1)
  const [catalog] = useCollection('catalog', catalogSeed)
  const products = catalog.filter(p => p.estado !== 'Borrador').map(asItem)
  const loading = false
  const error = null
  const [savedFavorites] = useCollection('wishlist', [])
  const favorites = savedFavorites.map(item => item.id)
  const [vendors, setVendors] = useState([])
  const [vendorQuery, setVendorQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  // Estados de Filtros
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [onlyStock, setOnlyStock] = useState(false)
  const [sortBy, setSortBy] = useState('relevantes')
  const [subTab, setSubTab] = useState('Todos')

  const query = (searchParams.get('q') || '').toLowerCase()
  const filteredProducts = products.filter(p =>
    p.price >= priceRange[0] && p.price <= priceRange[1] && (!onlyStock || p.stock > 0) &&
    (!query || `${p.name} ${p.category} ${p.seller}`.toLowerCase().includes(query)) &&
    (activeCategory === 'Catálogo General' || categoryNames.includes(p.category) || categoryNames.includes(p.subcategoria) || p.type + 's' === activeCategory) &&
    (subTab === 'Todos' || p.type + 's' === subTab) &&
    (!searchParams.get('tipo') || p.type + 's' === searchParams.get('tipo')) &&
    (!searchParams.get('comuna') || p.modalidad === 'Remoto' || p.comunas?.includes(searchParams.get('comuna')) || p.comuna === searchParams.get('comuna')) &&
    (!searchParams.get('modalidad') || searchParams.get('modalidad') === 'Todas' || p.modalidad === searchParams.get('modalidad')) &&
    (!searchParams.get('duracion') || searchParams.get('duracion') === 'Cualquiera' || durationMinutes(p.duracion) <= Number(searchParams.get('duracion'))) &&
    (!searchParams.get('edad') || searchParams.get('edad') === 'Todas' || p.edad >= Number(searchParams.get('edad'))) &&
    (!selectedSize || p.talla === selectedSize || p.variantes?.some(v => v.size === selectedSize)) &&
    (!selectedColor || p.color === selectedColor || p.variantes?.some(v => v.color === selectedColor)) &&
    (!vendors.length || vendors.includes(p.seller))
  ).sort((a, b) => sortBy === 'menor' ? a.price - b.price : sortBy === 'mayor' ? b.price - a.price : 0)
  const vendorOptions = [...new Set(products.map(p => p.seller))].map(name => ({ name, count: products.filter(p => p.seller === name).length }))
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Grid container spacing={3}>
        {/* Sidebar de Filtros (P03) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Button fullWidth variant="outlined" onClick={() => setShowFilters(value => !value)} aria-expanded={showFilters} sx={{ display: { xs: 'flex', md: 'none' }, mb: 1 }}>{showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}</Button>
          <Card sx={{ p: 2.5, display: { xs: showFilters ? 'block' : 'none', md: 'block' } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              Precio
            </Typography>
            <Stack direction="row" spacing={1}  sx={[{ alignItems: "center" }, { mb: 1.5 }]}>
              <TextField size="small" value={formatCLP(priceRange[0])} slotProps={{ input: { readOnly: true } }} />
              <Typography>–</Typography>
              <TextField size="small" value={formatCLP(priceRange[1])} slotProps={{ input: { readOnly: true } }} />
            </Stack>
            <Slider
              value={priceRange}
              min={0}
              max={1000000}
              step={5000}
              onChange={(_, val) => setPriceRange(val)}
              color="primary"
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Vendedor
            </Typography>
            <TextField fullWidth size="small" label="Buscar vendedor" value={vendorQuery} onChange={event => setVendorQuery(event.target.value)} sx={{ mb: 1 }} />
            <Stack spacing={0.25} sx={{ maxHeight: 240, overflowY: 'auto', pr: 1 }}>
              {vendorOptions.filter(v => v.name.toLowerCase().includes(vendorQuery.toLowerCase())).map((v) => (
                <Stack key={v.name} direction="row"   sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <FormControlLabel control={<Checkbox size="small" checked={vendors.includes(v.name)} onChange={() => setVendors(prev => prev.includes(v.name) ? prev.filter(n => n !== v.name) : [...prev, v.name])} />} label={<Typography variant="body2">{v.name}</Typography>} />
                  <Typography variant="caption" color="text.secondary">{v.count}</Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
              {COLORS.map((c) => (
                <ColorSwatch
                  key={c.name}
                  name={c.name}
                  colorHex={c.hex}
                  selected={selectedColor === c.name}
                  onClick={() => setSelectedColor(selectedColor === c.name ? '' : c.name)}
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              Talla
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
              {SIZES.map((sz) => {
                const active = selectedSize === sz
                return (
                  <Button
                    key={sz}
                    variant={active ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    sx={{ minWidth: 0, py: 0.75, borderColor: 'divider' }}
                  >
                    {sz}
                  </Button>
                )
              })}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Disponibilidad
            </Typography>
            <FormControlLabel
              control={<Checkbox size="small" checked={onlyStock} onChange={(e) => setOnlyStock(e.target.checked)} />}
              label={<Typography variant="body2">Solo productos con stock ({products.filter(p => p.stock > 0).length})</Typography>}
            />
          </Card>
        </Grid>

        {/* Área Principal de Resultados (P03) */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}


            spacing={2}
            sx={[{ justifyContent: "space-between", alignItems: { xs: 'flex-start', sm: 'center' } }, { mb: 2 }]}
          >
            <Box>
              <Breadcrumbs sx={{ fontSize: '0.82rem', mb: 0.5 }}>
                <Link underline="hover" color="inherit" onClick={() => navigate('/inicio')} sx={{ cursor: 'pointer' }}>
                  Inicio
                </Link>
                <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
                  {activeCategory}
                </Typography>
              </Breadcrumbs>
              <Typography variant="h4">{activeCategory}</Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredProducts.length} resultados disponibles
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              {['Todos', 'Productos', 'Servicios'].map((pill) => (
                <Chip
                  key={pill}
                  label={pill}
                  onClick={() => setSubTab(pill)}
                  color={subTab === pill ? 'primary' : 'default'}
                  variant={subTab === pill ? 'filled' : 'outlined'}
                  sx={{ px: 1, borderRadius: '999px' }}
                />
              ))}
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}


            spacing={1.5}
            sx={[{ justifyContent: "space-between", alignItems: { xs: 'stretch', md: 'center' } }, { mb: 2.5 }]}
          >
            <Stack direction="row" spacing={1}   useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
              {selectedSize && (
                <Chip
                  label={`Talla: ${selectedSize}`}
                  onDelete={() => setSelectedSize('')}
                  color="secondary"
                  sx={{ color: 'primary.main', fontWeight: 700 }}
                />
              )}
              {selectedColor && (
                <Chip
                  label={`Color: ${selectedColor}`}
                  onDelete={() => setSelectedColor('')}
                  color="secondary"
                  sx={{ color: 'primary.main', fontWeight: 700 }}
                />
              )}
              <Button
                size="small"
                onClick={() => {
                  setSelectedSize('')
                  setSelectedColor('')
                  setPriceRange([0, 1000000])
                  setOnlyStock(false)
                  setVendors([])
                  setSubTab('Todos')
                }}
              >
                Limpiar todo
              </Button>
            </Stack>

            <Stack direction="row" spacing={1}  sx={{ alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Ordenar por
              </Typography>
              <Select
                size="small"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ bgcolor: 'background.paper', minWidth: 165 }}
              >
                <MenuItem value="relevantes">Más relevantes</MenuItem>
                <MenuItem value="menor">Menor precio</MenuItem>
                <MenuItem value="mayor">Mayor precio</MenuItem>
              </Select>
            </Stack>
          </Stack>

          {!filteredProducts.length && <Card sx={{ p: { xs: 3, md: 5 }, textAlign: 'center', mb: 2 }}><Typography variant="h6">No hay publicaciones para esta selección</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>Prueba otra categoría o ajusta los filtros para encontrar productos y servicios.</Typography><Button variant="contained" onClick={() => { setVendors([]); setPriceRange([0, 1000000]); setSelectedSize(''); setSelectedColor(''); setOnlyStock(false); setSubTab('Todos'); navigate('/catalogo') }}>Ver todo el catálogo</Button></Card>}
          {/* ESTADOS DE CARGA Y ERROR */}
          {!loading && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, my: 2 }}><Typography variant="body2">{filteredProducts.length} resultados</Typography><Pagination count={Math.max(1, Math.ceil(filteredProducts.length / 24))} page={Math.min(catalogPage, Math.max(1, Math.ceil(filteredProducts.length / 24)))} onChange={(_, page) => setCatalogPage(page)} color="primary" /></Stack>}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <Stack spacing={2} sx={{ width: '100%' }}>{[1, 2, 3].map(id => <Skeleton key={id} variant="rounded" height={200} />)}</Stack>
            </Box>
          )}

          {error && (
            <Box sx={{ textAlign: 'center', py: 5, color: 'error.main' }}>
              <Typography variant="h6">{error}</Typography>
              <Typography variant="body2">Asegúrate de que la API de .NET esté corriendo en el puerto 5156.</Typography>
            </Box>
          )}

          {/* Grilla de Productos Conectados a PostgreSQL */}
          {!loading && !error && (
            <Grid container spacing={2.5}>
              {filteredProducts.slice((Math.min(catalogPage, Math.max(1, Math.ceil(filteredProducts.length / 24))) - 1) * 24, Math.min(catalogPage, Math.max(1, Math.ceil(filteredProducts.length / 24))) * 24).map((item) => (
                <Grid key={`${item.type}-${item.id}`} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card
                    onClick={() => navigate(item.type === 'Servicio' ? `/servicio/${item.id}` : `/producto/${item.id}`)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      '&:hover': { boxShadow: '0 8px 22px rgba(96,47,247,0.12)' },
                    }}
                  >
                    <Box sx={{ position: 'relative', height: 190, borderRadius: 2.5, overflow: 'hidden', mb: 1.5 }}>
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <ReferenceBadge image={item.image} />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(item)
                        }}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)' }}
                      >
                        {favorites.includes(item.id) ? (
                          <FavoriteBorderOutlined color="primary" fontSize="small" />
                        ) : (
                          <FavoriteBorderOutlined fontSize="small" />
                        )}
                      </IconButton>
                    </Box>

                    <Chip
                      label={item.category}
                      size="small"
                      sx={{ width: 'fit-content', mb: 1, fontSize: '0.7rem', height: 20 }}
                    />

                    <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
                      {item.name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75 }}>
                      por {item.seller}
                    </Typography>

                    <Stack direction="row"  spacing={0.5} sx={[{ alignItems: "center" }, { mb: 1 }]}>
                      <StarBorderOutlined sx={{ fontSize: 16, color: '#f59e0b' }} />
                      <Typography variant="caption" sx={{ fontWeight: 800 }}>
                        {item.rating}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({item.reviews})
                      </Typography>
                    </Stack>

                    <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
                      {formatCLP(item.price)}
                    </Typography>

                    <Typography variant="caption" color={item.stock > 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 700, mb: 1 }}>
                      {item.type === 'Servicio' ? 'Servicio disponible' : item.stock > 0 ? `${item.stock} disponibles` : 'Sin stock'}
                    </Typography>

                    <Stack direction="row"  spacing={0.75} sx={[{ alignItems: "center" }, { mb: 2, color: 'primary.main' }]}>
                      <LocalShippingOutlined sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Despacho calculado antes de confirmar
                      </Typography>
                    </Stack>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ShoppingCartOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        try { addToCart(item); navigate('/carrito') } catch (error) { notify(error.message) }
                      }}
                      sx={{ mt: 'auto' }}
                      disabled={item.type !== 'Servicio' && item.stock === 0}
                    >
                      {item.type === 'Servicio' || item.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
