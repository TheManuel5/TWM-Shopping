import { useDeferredValue, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ExpandMoreRounded, SearchOffOutlined, TuneRounded } from '@mui/icons-material'
import { Box, Breadcrumbs, Button, Card, Checkbox, Chip, Divider, Drawer, FormControlLabel, LinearProgress, Link, MenuItem, Select, Slider, Stack, TextField, Typography } from '@mui/material'
import ColorSwatch from '../../components/atoms/ColorSwatch/ColorSwatch'
import ProductCard, { ProductCardSkeleton } from '../../components/molecules/ProductCard/ProductCard'
import { productGrid } from '../../components/molecules/ProductCard/productGrid'
import useCollection from '../../hooks/useCollection'
import { catalogSeed, asItem, addToCart, byName, offerOf, toggleFavorite } from '../../data/catalog'
import { categoryNamesUnder } from '../../utils/categories'
import { notify } from '../../utils/feedback'
import { CATEGORY_TREE, formatCLP } from '../../utils/taxonomyData'

const BLOCK = 24
const COLOR_HEX = { Blanco: '#ffffff', Negro: '#111827', Gris: '#6b7280', Violeta: '#602ff7', Rosa: '#f472b6', Azul: '#2563eb', Rojo: '#dc2626', Verde: '#16a34a', Amarillo: '#facc15', Beige: '#e7d8c3', Naranja: '#f97316', Café: '#7c4a21' }
const SORTS = [
  ['nombre', 'Nombre (A–Z)'],
  ['menor', 'Menor precio'],
  ['mayor', 'Mayor precio'],
  ['valorados', 'Mejor valorados'],
  ['ofertas', 'Mayor descuento'],
]
const INITIAL = { price: null, size: '', color: '', onlyStock: false, vendors: [], sort: 'nombre', tab: 'Todos' }
const numeric = value => Number(String(value).replace(',', '.')) || 0

function durationMinutes(value) { const text = String(value || ''); if (/^\d+:\d+:\d+/.test(text)) { const [h, m] = text.split(':').map(Number); return h * 60 + m } return parseFloat(text) * (/hora|hour/i.test(text) ? 60 : 1) }

function FilterTitle({ children }) { return <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', mb: 1.25, color: 'primary.dark' }}>{children}</Typography> }

export default function CatalogPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('categoria') || 'Catálogo General'
  const [categoryTree] = useCollection('categories', CATEGORY_TREE)
  const [catalog] = useCollection('catalog', catalogSeed)
  const [savedFavorites] = useCollection('wishlist', [])
  const [filters, setFilters] = useState(INITIAL)
  const [vendorQuery, setVendorQuery] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [shown, setShown] = useState({ key: '', count: BLOCK })
  const set = patch => setFilters(current => ({ ...current, ...patch }))

  // Datos derivados del catálogo: se calculan una sola vez por cambio de datos.
  const products = useMemo(() => catalog.filter(p => p.estado !== 'Borrador').map(asItem), [catalog])
  const facets = useMemo(() => {
    const vendors = new Map(), colors = new Set(), sizes = new Set()
    let maxPrice = 0, inStock = 0
    for (const p of products) {
      vendors.set(p.seller, (vendors.get(p.seller) || 0) + 1)
      maxPrice = Math.max(maxPrice, p.price)
      if (p.type === 'Servicio' || p.stock > 0) inStock += 1
      for (const v of p.variantes?.length ? p.variantes : [{ color: p.color, size: p.talla }]) { if (COLOR_HEX[v.color]) colors.add(v.color); if (v.size && v.size !== 'Única') sizes.add(String(v.size)) }
    }
    const step = maxPrice > 200000 ? 5000 : 500
    return {
      vendors: [...vendors].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es', { numeric: true })),
      colors: [...colors], sizes: [...sizes].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })).slice(0, 16),
      maxPrice: Math.max(step, Math.ceil(maxPrice / step) * step), step, inStock,
    }
  }, [products])
  const favorites = useMemo(() => new Set(savedFavorites.map(item => item.id)), [savedFavorites])
  const categoryNames = useMemo(() => new Set(categoryNamesUnder(categoryTree, activeCategory)), [categoryTree, activeCategory])

  const params = searchParams.toString()
  const active = useDeferredValue(filters)
  const updating = active !== filters
  const results = useMemo(() => {
    const search = new URLSearchParams(params)
    const query = (search.get('q') || '').toLowerCase()
    const [min, max] = active.price || [0, Infinity]
    const tipo = search.get('tipo'), comuna = search.get('comuna'), modalidad = search.get('modalidad'), duracion = search.get('duracion'), edad = search.get('edad')
    const list = products.filter(p =>
      p.price >= min && p.price <= max && (!active.onlyStock || p.type === 'Servicio' || p.stock > 0) &&
      (!query || `${p.name} ${p.category} ${p.seller}`.toLowerCase().includes(query)) &&
      (activeCategory === 'Catálogo General' || categoryNames.has(p.category) || categoryNames.has(p.subcategoria) || p.type + 's' === activeCategory) &&
      (active.tab === 'Todos' || p.type + 's' === active.tab) &&
      (!tipo || p.type + 's' === tipo) &&
      (!comuna || p.modalidad === 'Remoto' || p.comunas?.includes(comuna) || p.comuna === comuna) &&
      (!modalidad || modalidad === 'Todas' || p.modalidad === modalidad) &&
      (!duracion || duracion === 'Cualquiera' || durationMinutes(p.duracion) <= Number(duracion)) &&
      (!edad || edad === 'Todas' || p.edad >= Number(edad)) &&
      (!active.size || String(p.talla) === active.size || p.variantes?.some(v => String(v.size) === active.size)) &&
      (!active.color || p.color === active.color || p.variantes?.some(v => v.color === active.color)) &&
      (!active.vendors.length || active.vendors.includes(p.seller)))
    const order = { menor: (a, b) => a.price - b.price, mayor: (a, b) => b.price - a.price, valorados: (a, b) => numeric(b.rating) - numeric(a.rating) || b.reviews - a.reviews, ofertas: (a, b) => (offerOf(b)?.discount || 0) - (offerOf(a)?.discount || 0) }[active.sort]
    return list.sort((a, b) => (order ? order(a, b) : 0) || byName(a, b))
  }, [products, active, params, activeCategory, categoryNames])

  // Al cambiar la búsqueda se vuelve al primer bloque.
  const viewKey = params + JSON.stringify(filters)
  const count = shown.key === viewKey ? shown.count : BLOCK
  const visible = results.slice(0, count)
  const remaining = results.length - visible.length
  const price = filters.price || [0, facets.maxPrice]
  const reset = () => { setFilters(INITIAL); setVendorQuery('') }
  const add = item => { try { addToCart(item); notify(`«${item.name}» se agregó al carrito.`) } catch (error) { notify(error.message, 'error') } }
  const chips = [
    filters.price && [`${formatCLP(price[0])} – ${formatCLP(price[1])}`, { price: null }],
    filters.size && [`Talla ${filters.size}`, { size: '' }],
    filters.color && [`Color ${filters.color}`, { color: '' }],
    filters.onlyStock && ['Con stock', { onlyStock: false }],
    ...filters.vendors.map(name => [name, { vendors: filters.vendors.filter(item => item !== name) }]),
  ].filter(Boolean)
  const matchingVendors = facets.vendors.filter(v => v.name.toLowerCase().includes(vendorQuery.toLowerCase()))

  const filterPanel = <Box>
    <FilterTitle>Precio</FilterTitle>
    <Slider value={price} min={0} max={facets.maxPrice} step={facets.step} onChange={(_, value) => set({ price: value[0] === 0 && value[1] === facets.maxPrice ? null : value })} getAriaLabel={index => index ? 'Precio máximo' : 'Precio mínimo'} valueLabelDisplay="auto" valueLabelFormat={formatCLP} sx={{ mx: 1, width: 'calc(100% - 16px)' }} />
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}><Typography variant="caption" color="text.secondary">{formatCLP(price[0])}</Typography><Typography variant="caption" color="text.secondary">{formatCLP(price[1])}</Typography></Stack>

    <Divider sx={{ my: 2.5 }} />
    <FormControlLabel control={<Checkbox size="small" checked={filters.onlyStock} onChange={event => set({ onlyStock: event.target.checked })} />} label={<Typography variant="body2">Solo disponibles <Box component="span" sx={{ color: 'text.secondary' }}>({facets.inStock.toLocaleString('es-CL')})</Box></Typography>} />

    {facets.colors.length > 0 && <><Divider sx={{ my: 2.5 }} /><FilterTitle>Color</FilterTitle>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>{facets.colors.map(name => <ColorSwatch key={name} name={name} colorHex={COLOR_HEX[name]} selected={filters.color === name} onClick={() => set({ color: filters.color === name ? '' : name })} />)}</Box></>}

    {facets.sizes.length > 0 && <><Divider sx={{ my: 2.5 }} /><FilterTitle>Talla</FilterTitle>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{facets.sizes.map(size => <Chip key={size} label={size} clickable onClick={() => set({ size: filters.size === size ? '' : size })} color={filters.size === size ? 'primary' : 'default'} variant={filters.size === size ? 'filled' : 'outlined'} sx={{ minWidth: 44 }} />)}</Box></>}

    <Divider sx={{ my: 2.5 }} />
    <FilterTitle>Vendedor</FilterTitle>
    <TextField fullWidth size="small" placeholder="Buscar vendedor" value={vendorQuery} onChange={event => setVendorQuery(event.target.value)} sx={{ mb: 1 }} slotProps={{ htmlInput: { 'aria-label': 'Buscar vendedor' } }} />
    <Stack>
      {matchingVendors.slice(0, 8).map(v => <Stack key={v.name} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControlLabel sx={{ minWidth: 0, mr: 1 }} control={<Checkbox size="small" checked={filters.vendors.includes(v.name)} onChange={() => set({ vendors: filters.vendors.includes(v.name) ? filters.vendors.filter(name => name !== v.name) : [...filters.vendors, v.name] })} />} label={<Typography variant="body2" noWrap>{v.name}</Typography>} />
        <Typography variant="caption" color="text.secondary">{v.count}</Typography>
      </Stack>)}
      {matchingVendors.length > 8 && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>{(matchingVendors.length - 8).toLocaleString('es-CL')} vendedores más. Escribe para encontrarlos.</Typography>}
      {!matchingVendors.length && <Typography variant="caption" color="text.secondary">Sin coincidencias.</Typography>}
    </Stack>
  </Box>

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Breadcrumbs sx={{ fontSize: '0.82rem', mb: 0.5 }}>
        <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/inicio')}>Inicio</Link>
        {activeCategory !== 'Catálogo General' && <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/catalogo')}>Catálogo</Link>}
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>{activeCategory}</Typography>
      </Breadcrumbs>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, mb: 2.5 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>{activeCategory}</Typography>
          <Typography variant="body2" color="text.secondary" aria-live="polite">{results.length.toLocaleString('es-CL')} {results.length === 1 ? 'resultado' : 'resultados'}{searchParams.get('q') ? ` para «${searchParams.get('q')}»` : ''}</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
          {['Todos', 'Productos', 'Servicios'].map(tab => <Chip key={tab} label={tab} clickable onClick={() => set({ tab })} color={filters.tab === tab ? 'primary' : 'default'} variant={filters.tab === tab ? 'filled' : 'outlined'} sx={{ borderRadius: 99, px: 0.5, bgcolor: filters.tab === tab ? undefined : 'background.paper' }} />)}
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
        <Card component="aside" aria-label="Filtros" sx={{ p: 2.5, display: { xs: 'none', md: 'block' }, position: 'sticky', top: 88, maxHeight: 'calc(100vh - 104px)', overflowY: 'auto' }}>{filterPanel}</Card>
        <Drawer anchor="left" open={drawer} onClose={() => setDrawer(false)} slotProps={{ paper: { sx: { width: 'min(320px, 88vw)', p: 2.5 } } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Filtros</Typography>{filterPanel}
          <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => setDrawer(false)}>Ver {results.length.toLocaleString('es-CL')} resultados</Button>
        </Drawer>

        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', rowGap: 1 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}>
              <Button variant="outlined" size="small" startIcon={<TuneRounded />} onClick={() => setDrawer(true)} sx={{ display: { md: 'none' }, bgcolor: 'background.paper' }}>Filtros{chips.length ? ` (${chips.length})` : ''}</Button>
              {chips.map(([label, patch]) => <Chip key={label} label={label} size="small" onDelete={() => set(patch)} color="secondary" sx={{ color: 'primary.dark', fontWeight: 700 }} />)}
              {chips.length > 0 && <Button size="small" onClick={reset}>Limpiar filtros</Button>}
            </Stack>
            <Select size="small" value={filters.sort} onChange={event => set({ sort: event.target.value })} sx={{ bgcolor: 'background.paper', minWidth: 190 }} inputProps={{ 'aria-label': 'Ordenar resultados' }} renderValue={value => <><Box component="span" sx={{ color: 'text.secondary' }}>Ordenar: </Box>{SORTS.find(([id]) => id === value)[1]}</>}>
              {SORTS.map(([id, label]) => <MenuItem key={id} value={id}>{label}</MenuItem>)}
            </Select>
          </Stack>

          {updating ? <Box sx={productGrid}>{Array.from({ length: 8 }, (_, index) => <ProductCardSkeleton key={index} />)}</Box>
            : !results.length ? <Card sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <SearchOffOutlined sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
              <Typography variant="h6">No encontramos publicaciones</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>Prueba con otra categoría o quita algunos filtros.</Typography>
              <Button variant="contained" onClick={() => { reset(); navigate('/catalogo') }}>Ver todo el catálogo</Button>
            </Card>
              : <>
                <Box sx={productGrid}>
                  {visible.map(item => <ProductCard key={`${item.type}-${item.id}`} item={item} favorite={favorites.has(item.id)} onToggleFavorite={toggleFavorite} onAddToCart={add} />)}
                </Box>
                <Stack spacing={1.5} sx={{ alignItems: 'center', mt: 4, mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Viendo {visible.length.toLocaleString('es-CL')} de {results.length.toLocaleString('es-CL')}</Typography>
                  <LinearProgress variant="determinate" value={visible.length / results.length * 100} aria-label="Publicaciones vistas" sx={{ width: 220, height: 4 }} />
                  {remaining > 0 && <Button variant="outlined" size="large" endIcon={<ExpandMoreRounded />} onClick={() => setShown({ key: viewKey, count: count + BLOCK })} sx={{ px: 4, bgcolor: 'background.paper', borderRadius: 99 }}>Ver {Math.min(BLOCK, remaining)} más</Button>}
                </Stack>
              </>}
        </Box>
      </Box>
    </Box>
  )
}
