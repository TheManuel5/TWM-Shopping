import ReferenceBadge from '../../components/atoms/ReferenceBadge'
import { notify } from '../../utils/feedback'
import useCollection from '../../hooks/useCollection'
import { addToCart, requestQuote, catalogSeed, asItem } from '../../data/catalog'
import {
  BuildOutlined,
  DescriptionOutlined,
  FavoriteBorderOutlined,
  ShoppingCartOutlined,
  StarBorderOutlined,
  StorefrontOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import { formatCLP } from '../../utils/taxonomyData'

export default function WishlistPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('producto')
  const [savedItems, setItems] = useCollection('wishlist', [])
  const [catalog] = useCollection('catalog', catalogSeed)
  const items = savedItems.map(saved => catalog.find(product => product.id === saved.id)).filter(product => product && product.estado !== 'Borrador').map(asItem)
  const [category, setCategory] = useState('Todas')
  const [sort, setSort] = useState('recientes')
  const [selectedIds, setSelectedIds] = useState([])
  const [sellerFilter, setSellerFilter] = useState('Todos')

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  // Permiso Eliminar en Wishlist (Tabla 2.3 Etapa 11)
  const handleRemoveFavorite = (id) => {
    setItems((prev) => prev.filter((it) => it.id !== id))
    setSelectedIds((prev) => prev.filter((sel) => sel !== id))
  }

  const visibleItems = items.filter(
    (it) => it.type?.toLowerCase() === tab && (sellerFilter === 'Todos' || it.seller === sellerFilter) && (category === 'Todas' || it.category === category),
  ).sort((a, b) => sort === 'menor' ? a.price - b.price : sort === 'mayor' ? b.price - a.price : 0)

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Mis favoritos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Guarda tus productos y servicios favoritos para encontrarlos o cotizarlos fácilmente.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab value="producto" icon={<ShoppingCartOutlined fontSize="small" />} iconPosition="start" label={`Productos (${items.filter(item => item.type === 'Producto').length})`} />
        <Tab value="servicio" icon={<BuildOutlined fontSize="small" />} iconPosition="start" label={`Servicios (${items.filter(item => item.type === 'Servicio').length})`} />
      </Tabs>

      {/* Filtros de Favoritos (P11) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="caption" color="text.secondary">Categoría</Typography>
          <Select fullWidth size="small" value={category} onChange={event => setCategory(event.target.value)} sx={{ bgcolor: 'background.paper', mt: 0.5 }}>
            <MenuItem value="Todas">Todas las categorías</MenuItem>{[...new Set(items.map(item => item.category))].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </Select>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="caption" color="text.secondary">Vendedor</Typography>
          <Select
            fullWidth
            size="small"
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            sx={{ bgcolor: 'background.paper', mt: 0.5 }}
          >
            <MenuItem value="Todos">Todos los vendedores</MenuItem>
            {[...new Set(items.map(item => item.seller))].map(seller => <MenuItem key={seller} value={seller}>{seller}</MenuItem>)}
          </Select>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="caption" color="text.secondary">Ordenar por</Typography>
          <Select fullWidth size="small" value={sort} onChange={event => setSort(event.target.value)} sx={{ bgcolor: 'background.paper', mt: 0.5 }}>
            <MenuItem value="recientes">Más recientes</MenuItem><MenuItem value="menor">Menor precio</MenuItem><MenuItem value="mayor">Mayor precio</MenuItem>
          </Select>
        </Grid>
      </Grid>

      {!visibleItems.length && <Paper variant="outlined" sx={{ p: { xs: 3, md: 5 }, mb: 3, borderRadius: 3, textAlign: 'center' }}><Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'secondary.light', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}><FavoriteBorderOutlined color="primary" sx={{ fontSize: 30 }} /></Box><Typography variant="h6">Tus próximos favoritos están por descubrir</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: 1, mb: 2.5 }}>Toca el corazón de un producto o servicio para guardarlo aquí.</Typography><Button variant="contained" onClick={() => navigate('/catalogo')}>Explorar catálogo</Button></Paper>}
      {/* Grilla de Favoritos (P11) */}
      <Grid container spacing={2.5}>
        {visibleItems.map((item) => {
          const isSelected = selectedIds.includes(item.id)
          const outOfStock = item.stock === 0
          return (
            <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  border: isSelected ? '2px solid #602ff7' : '1px solid #e5e7f0',
                }}
              >
                <Stack direction="row"   sx={[{ justifyContent: "space-between", alignItems: "center" }, { mb: 1 }]}>
                  <Checkbox
                    checked={isSelected}
                    disabled={outOfStock}
                    onChange={() => handleToggleSelect(item.id)}
                  />
                  <IconButton size="small" onClick={() => handleRemoveFavorite(item.id)} title="Quitar de favoritos">
                    <FavoriteBorderOutlined color="primary" />
                  </IconButton>
                </Stack>

                <Box sx={{ position: 'relative', height: 165, borderRadius: 2, overflow: 'hidden', mb: 1.5 }}>
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: outOfStock ? 0.45 : 1,
                    }}
                  />
                  <ReferenceBadge image={item.image} />
                  {outOfStock && (
                    <StatusChip
                      status="Sin stock"
                      sx={{ position: 'absolute', top: '42%', left: '35%' }}
                    />
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {item.name}
                </Typography>

                <Stack direction="row" spacing={1}  sx={[{ alignItems: "center" }, { mb: 1 }]}>
                  <StorefrontOutlined sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">{item.seller}</Typography>
                  <StarBorderOutlined sx={{ fontSize: 15, color: '#f59e0b' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{item.rating}</Typography>
                  <Typography variant="caption" color="text.secondary">({item.reviews})</Typography>
                </Stack>

                <Stack direction="row" spacing={1}  sx={[{ alignItems: "center" }, { mb: 0.5 }]}>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {formatCLP(item.price)}
                  </Typography>
                  {item.status && item.status !== 'Sin stock' && <StatusChip status={item.status} />}
                  {item.oldPrice && (
                    <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      {formatCLP(item.oldPrice)}
                    </Typography>
                  )}
                </Stack>

                {item.offerNote && (
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    {item.offerNote}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  disabled={outOfStock}
                  startIcon={<ShoppingCartOutlined />}
                  onClick={() => { try { addToCart(item); navigate('/carrito') } catch (error) { notify(error.message) } }}
                  sx={{ mt: 'auto' }}
                >
                  {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
                </Button>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Barra Inferior Flotante de Cotización Múltiple (P11) */}
      {selectedIds.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            mt: 3,
            p: 2,
            px: 3,
            bgcolor: 'secondary.main',
            borderRadius: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {selectedIds.length} productos seleccionados
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Selecciona artículos de un mismo vendedor para cotizar
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}  sx={{ alignItems: "center" }}>
            <Button
              variant="contained"
              startIcon={<DescriptionOutlined />}
              onClick={() => { try { requestQuote(items.filter(item => selectedIds.includes(item.id))); navigate('/cotizaciones') } catch (error) { notify(error.message) } }}
            >
              Solicitar cotización
            </Button>
            <Button color="inherit" onClick={() => setSelectedIds([])}>
              Limpiar selección
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  )
}
