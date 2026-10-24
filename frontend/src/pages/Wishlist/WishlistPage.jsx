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
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import applianceImage from '../../assets/products/appliance.jpg'
import chairImage from '../../assets/products/chair.jpg'
import fashionImage from '../../assets/products/fashion.jpg'
import laptopImage from '../../assets/products/laptop.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import { formatCLP } from '../../utils/taxonomyData'

const INITIAL_WISHLIST = [
  { category: 'Hogar', id: 1, type: 'producto', name: 'Cafetera Espresso Oster PrimaLatte', seller: 'HogarPlus', rating: '4,8', reviews: 1234, price: 129990, oldPrice: 159990, status: 'Oferta', offerNote: 'Oferta válida hasta el 30 de oct. 2026', stock: 5, image: applianceImage },
  { category: 'Hogar', id: 2, type: 'producto', name: 'Freidora de aire Ursus Trotter 5,5 L', seller: 'HogarPlus', rating: '4,7', reviews: 856, price: 79990, oldPrice: 99990, status: 'Oferta', offerNote: 'Oferta válida hasta el 30 de oct. 2026', stock: 9, image: chairImage },
  { category: 'Tecnología', id: 3, type: 'producto', name: 'Consola Nintendo Switch OLED', seller: 'TecnoStore', rating: '4,9', reviews: 2341, price: 349990, oldPrice: null, status: null, offerNote: null, stock: 4, image: phoneImage },
  { category: 'Tecnología', id: 4, type: 'producto', name: 'Notebook Lenovo IdeaPad 3 15,6"', seller: 'TecnoStore', rating: '4,6', reviews: 892, price: 499990, oldPrice: null, status: 'Sin stock', offerNote: null, stock: 0, image: laptopImage },
  { category: 'Tecnología', id: 5, type: 'producto', name: 'Audífonos Sony WH-CH520', seller: 'TecnoStore', rating: '4,8', reviews: 1567, price: 39990, oldPrice: null, status: 'Oferta finalizada', offerNote: 'La oferta terminó el 15 de sep. 2026 (Precio oficial restaurado)', stock: 7, image: fashionImage },
  { category: 'Moda', id: 6, type: 'producto', name: 'Zapatillas Adidas Grand Court', seller: 'ModaChile', rating: '4,7', reviews: 1123, price: 59990, oldPrice: 69990, status: 'Oferta', offerNote: 'Oferta válida hasta el 30 de oct. 2026', stock: 11, image: shoeImage },
]

export default function WishlistPage() {
  const [tab, setTab] = useState('producto')
  const [items, setItems] = useState(INITIAL_WISHLIST)
  const [selectedIds, setSelectedIds] = useState([1, 2])
  const [sellerFilter, setSellerFilter] = useState('Todos')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [sortOrder, setSortOrder] = useState('recientes')
  const [notice, setNotice] = useState('')

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  // Permiso Eliminar en Wishlist (Tabla 2.3 Etapa 11)
  const handleRemoveFavorite = (id) => {
    console.log('Quitar de favoritos (simulado):', { id })
    setItems((prev) => prev.filter((it) => it.id !== id))
    setSelectedIds((prev) => prev.filter((sel) => sel !== id))
    setNotice('Favorito quitado de esta vista (cambio local)')
  }

  const sellers = [...new Set(items.map((item) => item.seller))]
  const categories = [...new Set(items.map((item) => item.category))]
  const visibleItems = items
    .filter((item) => item.type === tab)
    .filter((item) => sellerFilter === 'Todos' || item.seller === sellerFilter)
    .filter((item) => categoryFilter === 'Todas' || item.category === categoryFilter)
    .sort((a, b) => {
      if (sortOrder === 'precio-asc') return a.price - b.price
      if (sortOrder === 'precio-desc') return b.price - a.price
      return b.id - a.id
    })
  const selectedItems = items.filter((item) => selectedIds.includes(item.id) && item.stock > 0)
  const selectedSellers = [...new Set(selectedItems.map((item) => item.seller))]
  const canRequestQuote = selectedItems.length > 0 && selectedSellers.length === 1 && tab === 'producto'

  const handleRequestQuote = () => {
    if (!canRequestQuote) return
    console.log('Solicitud de cotización simulada:', {
      vendedor: selectedSellers[0],
      productos: selectedItems.map(({ id, name, price }) => ({ id, name, price })),
    })
    setNotice('Solicitud simulada: no fue enviada al vendedor')
  }

  const handleAddCart = (item) => {
    console.log('Agregar al carrito (simulado):', { productoId: item.id, cantidad: 1 })
    setNotice('Acción simulada: el carrito real todavía no se ha actualizado')
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Mis favoritos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Guarda tus productos y servicios favoritos para encontrarlos o cotizarlos fácilmente (RF25).
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab value="producto" icon={<ShoppingCartOutlined fontSize="small" />} iconPosition="start" label={`Productos (${items.filter((item) => item.type === 'producto').length})`} />
        <Tab value="servicio" icon={<BuildOutlined fontSize="small" />} iconPosition="start" label={`Servicios (${items.filter((item) => item.type === 'servicio').length})`} />
      </Tabs>

      {/* Filtros de Favoritos (P11) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" color="text.secondary">Categoría</Typography>
          <Select fullWidth size="small" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} sx={{ bgcolor: 'background.paper', mt: 0.5 }}>
            <MenuItem value="Todas">Todas las categorías</MenuItem>
            {categories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
          </Select>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" color="text.secondary">Vendedor</Typography>
          <Select
            fullWidth
            size="small"
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            sx={{ bgcolor: 'background.paper', mt: 0.5 }}
          >
            <MenuItem value="Todos">Todos los vendedores</MenuItem>
            {sellers.map((seller) => <MenuItem key={seller} value={seller}>{seller}</MenuItem>)}
          </Select>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="caption" color="text.secondary">Ordenar por</Typography>
          <Select fullWidth size="small" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} sx={{ bgcolor: 'background.paper', mt: 0.5 }}>
            <MenuItem value="recientes">Más recientes</MenuItem>
            <MenuItem value="precio-asc">Menor precio</MenuItem>
            <MenuItem value="precio-desc">Mayor precio</MenuItem>
          </Select>
        </Grid>
      </Grid>

      {visibleItems.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {tab === 'servicio' ? 'Aún no tienes servicios guardados en esta demostración.' : 'No hay favoritos que coincidan con los filtros.'}
          </Typography>
        </Paper>
      )}
      {/* Grilla de Favoritos (P11) */}
      <Grid container spacing={2.5}>
        {visibleItems.map((item) => {
          const isSelected = selectedIds.includes(item.id)
          const outOfStock = item.stock === 0
          return (
            <Grid item xs={12} sm={6} lg={4} key={item.id}>
              <Card
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  border: isSelected ? '2px solid #602ff7' : '1px solid #e5e7f0',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
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

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <StorefrontOutlined sx={{ fontSize: 15, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">{item.seller}</Typography>
                  <StarBorderOutlined sx={{ fontSize: 15, color: '#f59e0b' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>{item.rating}</Typography>
                  <Typography variant="caption" color="text.secondary">({item.reviews})</Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
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
                  onClick={() => handleAddCart(item)}
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
      {tab === 'producto' && selectedItems.length > 0 && (
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
              {selectedItems.length} productos seleccionados
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedSellers.length === 1 ? `Productos de ${selectedSellers[0]} listos para cotizar` : 'Selecciona productos de un mismo vendedor para cotizar'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              startIcon={<DescriptionOutlined />}
              onClick={handleRequestQuote}
              disabled={!canRequestQuote}
            >
              Solicitar cotización
            </Button>
            <Button color="inherit" onClick={() => setSelectedIds([])}>
              Limpiar selección
            </Button>
          </Stack>
        </Paper>
      )}
      <Snackbar open={Boolean(notice)} message={notice} autoHideDuration={3500} onClose={() => setNotice('')} />
    </Box>
  )
}
