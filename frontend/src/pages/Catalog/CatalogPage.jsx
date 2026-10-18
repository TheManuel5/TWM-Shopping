import { FavoriteBorderOutlined, LocalShippingOutlined, ShoppingCartOutlined, StarBorderOutlined } from '@mui/icons-material'
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
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
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import applianceImage from '../../assets/products/appliance.jpg'
import chairImage from '../../assets/products/chair.jpg'
import fashionImage from '../../assets/products/fashion.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import ColorSwatch from '../../components/atoms/ColorSwatch/ColorSwatch'
import { apiService } from '../../services/api'
import { formatCLP } from '../../utils/taxonomyData'

const VENDORS = [
  { name: 'Deerclan', count: 12 },
  { name: 'Zapatillas Chile', count: 9 },
  { name: 'UrbanStore', count: 8 },
  { name: 'CalzaBien', count: 7 },
  { name: 'TodoDeporte', count: 6 },
]

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

const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43']

export default function CatalogPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('categoria') || 'Catálogo General'

  // Estados para los datos de la Base de Datos
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados de Filtros
  const [priceRange, setPriceRange] = useState([0, 200000])
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [onlyStock, setOnlyStock] = useState(false)
  const [sortBy, setSortBy] = useState('relevantes')
  const [subTab, setSubTab] = useState('Todos')
  const [favorites, setFavorites] = useState([])

  // Efecto para cargar los datos reales desde el Backend (.NET -> PostgreSQL)
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true)
      try {
        const data = await apiService.getCatalogo()
        
        // Mapeamos los datos de la BD a la estructura que espera la interfaz
        const adaptedData = data.map((item) => ({
          id: item.id,
          name: item.nombre,
          category: item.categoria,
          type: item.tipo, // Producto o Servicio
          price: item.precio > 0 ? item.precio : 15000, // Precio por defecto si viene en 0
          stock: item.stock,
          seller: 'Emprendedor Local', 
          rating: (Math.random() * (5 - 4) + 4).toFixed(1), // Simulación visual
          reviews: Math.floor(Math.random() * 100) + 10,
          // Asignamos una imagen por defecto según el tipo de categoría
          image: item.tipo === 'Servicio' ? applianceImage : (item.id % 2 === 0 ? shoeImage : fashionImage)
        }))

        setProducts(adaptedData)
      } catch (err) {
        setError('No se pudo conectar con la base de datos PostgreSQL.')
      } finally {
        setLoading(false)
      }
    }

    fetchCatalog()
  }, [])

  // Aplicar filtros dinámicos al estado de productos obtenidos
  const filteredProducts = products.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1] && (!onlyStock || p.stock > 0)
  )

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Grid container spacing={3}>
        {/* Sidebar de Filtros (P03) */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              Precio
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <TextField size="small" value={formatCLP(priceRange[0])} slotProps={{ input: { readOnly: true } }} />
              <Typography>–</Typography>
              <TextField size="small" value={formatCLP(priceRange[1])} slotProps={{ input: { readOnly: true } }} />
            </Stack>
            <Slider
              value={priceRange}
              min={0}
              max={200000}
              step={5000}
              onChange={(_, val) => setPriceRange(val)}
              color="primary"
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              Vendedor
            </Typography>
            <Stack spacing={0.25}>
              {VENDORS.map((v) => (
                <Stack key={v.name} direction="row" justifyContent="space-between" alignItems="center">
                  <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">{v.name}</Typography>} />
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
                  onClick={() => setSelectedColor(c.name)}
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
                    onClick={() => setSelectedSize(sz)}
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
        <Grid item xs={12} md={9}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ mb: 2 }}
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
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            spacing={1.5}
            sx={{ mb: 2.5 }}
          >
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
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
                  setPriceRange([0, 200000])
                  setOnlyStock(false)
                }}
              >
                Limpiar todo
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
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

          {/* ESTADOS DE CARGA Y ERROR */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
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
              {filteredProducts.map((item) => (
                <Grid item xs={12} sm={6} lg={4} key={`${item.type}-${item.id}`}>
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
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFavorites((prev) =>
                            prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                          )
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

                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
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
                      {item.stock > 0 ? `${item.stock} disponibles` : 'Sin stock'}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 2, color: 'primary.main' }}>
                      <LocalShippingOutlined sx={{ fontSize: 16 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Envío rápido desde Osorno
                      </Typography>
                    </Stack>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<ShoppingCartOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/carrito')
                      }}
                      sx={{ mt: 'auto' }}
                      disabled={item.stock === 0}
                    >
                      {item.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
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