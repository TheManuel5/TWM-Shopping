import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowForwardRounded, ExpandMoreRounded, HandymanOutlined, Inventory2Outlined, StorefrontOutlined } from '@mui/icons-material'
import { Box, Button, Stack, Typography } from '@mui/material'
import heroDevices from '../../assets/home/hero_devices.png'
import ProductCard from '../../components/molecules/ProductCard/ProductCard'
import { productGrid } from '../../components/molecules/ProductCard/productGrid'
import useCollection from '../../hooks/useCollection'
import { catalogSeed, asItem, addToCart, byName, offerOf, toggleFavorite } from '../../data/catalog'
import { catalogImage } from '../../utils/catalogImages'
import { notify } from '../../utils/feedback'

const BLOCK = 8
const railGrid = { ...productGrid, gridTemplateColumns: { ...productGrid.gridTemplateColumns, lg: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' } }
const numeric = value => Number(String(value).replace(',', '.')) || 0

/** Sección de publicaciones que crece por bloques cuando el usuario lo pide. */
function Rail({ title, subtitle, items, favorites, onAdd, onSeeAll }) {
  const [count, setCount] = useState(BLOCK)
  if (!items.length) return null
  const remaining = Math.min(items.length, BLOCK * 3) - count
  return <Box component="section" sx={{ mb: { xs: 5, md: 7 } }}>
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end', mb: 2.5, gap: 2 }}>
      <Box sx={{ borderLeft: '5px solid', borderColor: 'primary.main', pl: 1.5 }}>
        <Typography component="h2" sx={{ fontWeight: 900, fontSize: { xs: '1.35rem', md: '1.7rem' }, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{subtitle}</Typography>}
      </Box>
      <Button onClick={onSeeAll} endIcon={<ArrowForwardRounded />} sx={{ fontWeight: 800, flexShrink: 0 }}>Ver todo</Button>
    </Stack>
    <Box sx={railGrid}>
      {items.slice(0, count).map(item => <ProductCard key={item.id} item={item} favorite={favorites.has(item.id)} onToggleFavorite={toggleFavorite} onAddToCart={onAdd} />)}
    </Box>
    {remaining > 0 && <Stack sx={{ alignItems: 'center', mt: 3 }}>
      <Button variant="outlined" endIcon={<ExpandMoreRounded />} onClick={() => setCount(count + BLOCK)} sx={{ px: 4, borderRadius: 99, bgcolor: 'background.paper' }}>Ver {Math.min(BLOCK, remaining)} más</Button>
    </Stack>}
  </Box>
}

export default function Home() {
  const navigate = useNavigate()
  const [categoryTree] = useCollection('categories', { Productos: [], Servicios: [] })
  const [savedFavorites] = useCollection('wishlist', [])
  const [catalog] = useCollection('catalog', catalogSeed)
  const favorites = useMemo(() => new Set(savedFavorites.map(item => item.id)), [savedFavorites])

  const home = useMemo(() => {
    const published = catalog.filter(p => p.estado !== 'Borrador')
    const products = published.filter(p => p.tipo !== 'Servicio' && p.stock > 0)
    const services = published.filter(p => p.tipo === 'Servicio')
    const byRating = (a, b) => numeric(b.rating) - numeric(a.rating) || (b.reviews || 0) - (a.reviews || 0) || byName(a, b)
    const offers = products.map(p => [p, offerOf(p)?.discount || 0]).filter(([, discount]) => discount > 0).sort((a, b) => b[1] - a[1] || byName(a[0], b[0]))
    return {
      totals: { products: published.length - services.length, services: services.length, sellers: new Set(published.map(p => p.ownerRut || p.vendedor)).size },
      maxDiscount: offers[0]?.[1] || 0,
      offers: offers.slice(0, BLOCK * 3).map(([p]) => asItem(p)),
      featured: [...products].sort(byRating).slice(0, BLOCK * 3).map(asItem),
      services: [...services].sort(byRating).slice(0, BLOCK * 3).map(asItem),
    }
  }, [catalog])

  const categories = useMemo(() => [...(categoryTree.Productos || []), ...(categoryTree.Servicios || [])]
    .map(category => ({ name: category.name, image: catalogImage({ categoria: category.name }) }))
    // Una tarjeta por fotografía: evita nombres o imágenes repetidos entre productos y servicios.
    .filter((category, index, list) => !category.image.includes('placeholder') && list.findIndex(other => other.name === category.name || other.image === category.image) === index)
    .slice(0, 6), [categoryTree])

  const add = item => { try { addToCart(item); notify(`«${item.name}» se agregó al carrito.`) } catch (error) { notify(error.message, 'error') } }
  const stats = [
    [Inventory2Outlined, home.totals.products, 'productos'],
    [HandymanOutlined, home.totals.services, 'servicios'],
    [StorefrontOutlined, home.totals.sellers, 'vendedores'],
  ]

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', pb: 4 }}>
      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', overflow: 'hidden', borderRadius: { xs: 4, md: 5 }, color: 'white', mb: { xs: 3, md: 4 }, background: 'linear-gradient(120deg, #4520c7 0%, #602ff7 55%, #7c4dff 100%)', boxShadow: '0 20px 48px rgba(96,47,247,0.24)' }}>
        <Box aria-hidden="true" sx={{ position: 'absolute', top: -140, right: -80, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 70%)' }} />
        <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' }, alignItems: 'center', gap: { xs: 2, md: 4 }, p: { xs: 3, sm: 4, md: 6 } }}>
          <Box>
            {home.maxDiscount > 0 && <Box sx={{ display: 'inline-block', bgcolor: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 99, px: 1.5, py: 0.5, fontSize: 13, fontWeight: 700, mb: 2 }}>Ofertas de hasta {home.maxDiscount}% de descuento</Box>}
            <Typography component="h1" sx={{ color: 'white', fontWeight: 900, fontSize: { xs: '2rem', sm: '2.6rem', md: '3.1rem' }, lineHeight: 1.05, letterSpacing: '-0.035em', mb: 1.5 }}>Todo lo que buscas, en un solo lugar</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.86)', fontSize: { xs: '0.98rem', md: '1.1rem' }, maxWidth: 460, mb: 3 }}>Compra productos y contrata servicios directamente a emprendedores.</Typography>
            <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button size="large" onClick={() => navigate('/catalogo')} endIcon={<ArrowForwardRounded />} sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 800, borderRadius: 99, px: 3.5, '&:hover': { bgcolor: '#f1eeff' } }}>Explorar catálogo</Button>
              <Button size="large" onClick={() => navigate('/catalogo?tipo=Servicios')} sx={{ color: 'white', fontWeight: 700, borderRadius: 99, px: 3, border: '1px solid rgba(255,255,255,0.5)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', borderColor: 'white' } }}>Ver servicios</Button>
            </Stack>
            <Stack direction="row" spacing={{ xs: 2.5, sm: 4 }} sx={{ mt: { xs: 3, md: 4 } }}>
              {stats.map(([Icon, value, label]) => <Stack key={label} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Icon sx={{ fontSize: 22, opacity: 0.85, display: { xs: 'none', sm: 'block' } }} />
                <Box><Typography sx={{ color: 'white', fontWeight: 900, fontSize: { xs: '1.15rem', md: '1.35rem' }, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{value.toLocaleString('es-CL')}</Typography><Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: 12.5 }}>{label}</Typography></Box>
              </Stack>)}
            </Stack>
          </Box>
          <Box component="img" src={heroDevices} alt="" sx={{ display: { xs: 'none', md: 'block' }, width: '100%', maxWidth: 560, justifySelf: 'center', filter: 'drop-shadow(0 22px 34px rgba(18,2,48,0.4))' }} />
        </Box>
      </Box>

      {/* Categorías */}
      {categories.length > 0 && <Box component="section" aria-label="Categorías" sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: `repeat(${categories.length}, 1fr)` }, gap: { xs: 1.5, md: 2 }, mb: { xs: 5, md: 7 } }}>
        {categories.map(category => <Box
          key={category.name} component="button" type="button" onClick={() => navigate(`/catalogo?categoria=${encodeURIComponent(category.name)}`)}
          sx={{ position: 'relative', overflow: 'hidden', height: { xs: 96, md: 120 }, borderRadius: 3.5, border: 0, p: 0, cursor: 'pointer', textAlign: 'left', bgcolor: '#4520c7', transition: 'transform 180ms ease, box-shadow 180ms ease', '&:hover, &:focus-visible': { transform: 'translateY(-3px)', boxShadow: '0 14px 30px rgba(96,47,247,0.35)', outline: 'none' }, '&:hover img': { transform: 'scale(1.07)' } }}
        >
          <Box component="img" src={category.image} alt="" loading="lazy" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6, transition: 'transform 350ms ease' }} />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(69,32,199,0.10) 0%, rgba(69,32,199,0.92) 100%)' }} />
          <Typography sx={{ position: 'absolute', left: 14, right: 14, bottom: 12, color: 'white', fontWeight: 800, fontSize: { xs: '0.85rem', md: '0.95rem' }, lineHeight: 1.2 }}>{category.name}</Typography>
        </Box>)}
      </Box>}

      <Rail title="Ofertas del momento" subtitle="Publicaciones con precio rebajado" items={home.offers} favorites={favorites} onAdd={add} onSeeAll={() => navigate('/catalogo?tipo=Productos')} />
      <Rail title="Productos destacados" subtitle="Los mejor valorados por los compradores" items={home.featured} favorites={favorites} onAdd={add} onSeeAll={() => navigate('/catalogo?tipo=Productos')} />
      <Rail title="Servicios" subtitle="Profesionales y emprendedores disponibles" items={home.services} favorites={favorites} onAdd={add} onSeeAll={() => navigate('/catalogo?tipo=Servicios')} />
    </Box>
  )
}
