import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DescriptionOutlined, FavoriteBorderOutlined } from '@mui/icons-material'
import { Box, Button, Card, Checkbox, Chip, FormControlLabel, MenuItem, Paper, Select, Slide, Stack, Typography } from '@mui/material'
import ProductCard from '../../components/molecules/ProductCard/ProductCard'
import { productGrid } from '../../components/molecules/ProductCard/productGrid'
import { addToCart, asItem, byName, catalogSeed, requestQuote, toggleFavorite } from '../../data/catalog'
import useCollection from '../../hooks/useCollection'
import { notify } from '../../utils/feedback'

const TABS = [['Todos', 'Todos'], ['Producto', 'Productos'], ['Servicio', 'Servicios']]

export default function WishlistPage() {
  const navigate = useNavigate()
  const [saved] = useCollection('wishlist', [])
  const [catalog] = useCollection('catalog', catalogSeed)
  const [tab, setTab] = useState('Todos')
  const [seller, setSeller] = useState('Todos')
  const [sort, setSort] = useState('recientes')
  const [selectedIds, setSelectedIds] = useState([])

  // Se muestran los datos vigentes del catálogo, no la copia guardada al marcar el favorito.
  const items = useMemo(() => {
    const byId = new Map(catalog.map(product => [product.id, product]))
    return saved.map(row => byId.get(row.id)).filter(product => product && product.estado !== 'Borrador').map(asItem).reverse()
  }, [saved, catalog])
  const sellers = useMemo(() => [...new Set(items.map(item => item.seller))].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })), [items])
  const visible = items
    .filter(item => (tab === 'Todos' || item.type === tab) && (seller === 'Todos' || item.seller === seller))
    .sort(sort === 'menor' ? (a, b) => a.price - b.price : sort === 'mayor' ? (a, b) => b.price - a.price : sort === 'nombre' ? byName : () => 0)
  const selected = items.filter(item => selectedIds.includes(item.id))

  const toggleSelect = id => setSelectedIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])
  const remove = item => { toggleFavorite(item); setSelectedIds(current => current.filter(value => value !== item.id)) }
  const add = item => { try { addToCart(item); notify(`«${item.name}» se agregó al carrito.`) } catch (error) { notify(error.message, 'error') } }
  const quote = () => { try { requestQuote(selected); navigate('/cotizaciones') } catch (error) { notify(error.message, 'error') } }

  return (
    <Box sx={{ maxWidth: 1240, mx: 'auto', pb: selected.length ? 12 : 0 }}>
      <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>Mis favoritos</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{items.length} {items.length === 1 ? 'publicación guardada' : 'publicaciones guardadas'}</Typography>

      {!items.length ? <Card sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', maxWidth: 560, mx: 'auto' }}>
        <Box sx={{ display: 'grid', placeItems: 'center', width: 72, height: 72, mx: 'auto', mb: 2, borderRadius: '50%', bgcolor: 'secondary.light', color: 'primary.main' }}><FavoriteBorderOutlined sx={{ fontSize: 34 }} /></Box>
        <Typography variant="h6">Todavía no guardas favoritos</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>Toca el corazón de un producto o servicio para guardarlo aquí.</Typography>
        <Button variant="contained" onClick={() => navigate('/catalogo')}>Explorar catálogo</Button>
      </Card> : <>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2.5 }}>
          <Stack direction="row" spacing={1}>
            {TABS.map(([value, label]) => {
              const count = value === 'Todos' ? items.length : items.filter(item => item.type === value).length
              return <Chip key={value} label={`${label} (${count})`} clickable onClick={() => setTab(value)} color={tab === value ? 'primary' : 'default'} variant={tab === value ? 'filled' : 'outlined'} sx={{ borderRadius: 99, bgcolor: tab === value ? undefined : 'background.paper' }} />
            })}
          </Stack>
          <Stack direction="row" spacing={1}>
            {sellers.length > 1 && <Select size="small" value={seller} onChange={event => setSeller(event.target.value)} sx={{ bgcolor: 'background.paper', minWidth: 170 }} inputProps={{ 'aria-label': 'Filtrar por vendedor' }}>
              <MenuItem value="Todos">Todos los vendedores</MenuItem>
              {sellers.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>}
            <Select size="small" value={sort} onChange={event => setSort(event.target.value)} sx={{ bgcolor: 'background.paper', minWidth: 170 }} inputProps={{ 'aria-label': 'Ordenar favoritos' }}>
              <MenuItem value="recientes">Más recientes</MenuItem><MenuItem value="nombre">Nombre (A–Z)</MenuItem><MenuItem value="menor">Menor precio</MenuItem><MenuItem value="mayor">Mayor precio</MenuItem>
            </Select>
          </Stack>
        </Stack>

        {!visible.length && <Card sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">No hay favoritos con estos filtros.</Typography></Card>}
        <Box sx={productGrid}>
          {visible.map(item => {
            const checked = selectedIds.includes(item.id)
            return <Stack key={item.id} sx={{ minWidth: 0, borderRadius: 3.5, outline: checked ? '2px solid' : 'none', outlineColor: 'primary.main', outlineOffset: 3 }}>
              <Box sx={{ flex: 1 }}><ProductCard item={item} favorite onToggleFavorite={remove} onAddToCart={add} /></Box>
              <FormControlLabel sx={{ mx: 0, mt: 0.5 }} control={<Checkbox size="small" checked={checked} onChange={() => toggleSelect(item.id)} />} label={<Typography variant="caption" color="text.secondary">Incluir en cotización</Typography>} />
            </Stack>
          })}
        </Box>
      </>}

      {/* Barra de cotización múltiple */}
      <Slide direction="up" in={selected.length > 0} mountOnEnter unmountOnExit>
        <Paper elevation={0} sx={{ position: 'fixed', left: 0, right: 0, mx: 'auto', bottom: { xs: 12, md: 24 }, zIndex: 1200, width: 'min(680px, calc(100vw - 24px))', p: 2, borderRadius: 3.5, bgcolor: '#030c2e', color: 'white', boxShadow: '0 18px 44px rgba(3,12,46,0.35)' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, color: 'white' }}>{selected.length} {selected.length === 1 ? 'seleccionado' : 'seleccionados'}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.72)' }}>La cotización debe ser de un solo vendedor.</Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <Button onClick={() => setSelectedIds([])} sx={{ color: 'white' }}>Limpiar</Button>
              <Button variant="contained" startIcon={<DescriptionOutlined />} onClick={quote}>Cotizar</Button>
            </Stack>
          </Stack>
        </Paper>
      </Slide>
    </Box>
  )
}
