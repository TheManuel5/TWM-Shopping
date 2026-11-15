import { useNavigate, useParams } from 'react-router-dom'
import { AccessTimeOutlined, AddShoppingCartOutlined, ChatOutlined, DescriptionOutlined, Favorite, FavoriteBorderOutlined, PersonOutlined, PlaceOutlined, StorefrontOutlined } from '@mui/icons-material'
import { Box, Breadcrumbs, Button, Card, Divider, IconButton, Link, Rating, Stack, Tooltip, Typography } from '@mui/material'
import ReferenceBadge from '../../components/atoms/ReferenceBadge'
import ReviewsAndQASection from '../../components/organisms/ReviewsAndQASection/ReviewsAndQASection'
import { asItem, addToCart, requestQuote, toggleFavorite } from '../../data/catalog'
import useCollection from '../../hooks/useCollection'
import { notify } from '../../utils/feedback'
import { formatCLP } from '../../utils/taxonomyData'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [catalog] = useCollection('catalog', [])
  const [wishlist] = useCollection('wishlist', [])
  const product = catalog.find(item => item.id === id && item.tipo === 'Servicio' && item.estado !== 'Borrador')
  if (!product) return <Card sx={{ p: 5, textAlign: 'center', maxWidth: 560, mx: 'auto' }}><Typography variant="h5" sx={{ mb: 2 }}>Servicio no encontrado</Typography><Button variant="contained" onClick={() => navigate('/catalogo?tipo=Servicios')}>Volver al catálogo</Button></Card>

  const item = asItem(product)
  const favorite = wishlist.some(row => row.id === product.id)
  const book = () => { try { addToCart(item); navigate('/carrito') } catch (error) { notify(error.message, 'error') } }
  const quote = () => { try { requestQuote([item]); notify('Cotización enviada.'); navigate('/cotizaciones') } catch (error) { notify(error.message, 'error') } }
  const contact = () => navigate('/mensajes?vendedor=' + encodeURIComponent(product.ownerRut))
  const facts = [
    [AccessTimeOutlined, 'Duración', product.duracion || 'No registrada'],
    [PlaceOutlined, 'Modalidad', product.modalidad || 'No registrada'],
    [PlaceOutlined, 'Ubicación', product.comuna || 'Consulta al vendedor'],
    [PersonOutlined, 'Edad mínima', product.edad ? `${product.edad} años` : 'Sin restricción'],
  ]

  return <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
    <Breadcrumbs sx={{ mb: 2, fontSize: '0.85rem' }}>
      <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/inicio')}>Inicio</Link>
      <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/catalogo?tipo=Servicios')}>Servicios</Link>
      <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>{item.name}</Typography>
    </Breadcrumbs>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 340px' }, gap: 3, alignItems: 'start', mb: 4 }}>
      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', bgcolor: '#f4f2ff' }}>
          <Box component="img" src={item.image} alt={item.name} sx={{ width: '100%', height: { xs: 220, md: 360 }, objectFit: item.image.includes('placeholder') ? 'contain' : 'cover', display: 'block' }} />
          <ReferenceBadge image={item.image} />
        </Box>
        <Box sx={{ p: { xs: 2, md: 3.5 } }}>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{product.categoria}</Typography>
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' } }}>{item.name}</Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 1, color: 'text.secondary' }}>
            <Rating value={Number(product.rating) || 0} precision={0.1} size="small" readOnly />
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{item.rating}</Typography>
            <Typography variant="body2">({item.reviews} {item.reviews === 1 ? 'reseña' : 'reseñas'})</Typography>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5, my: 3 }}>
            {facts.map(([Icon, label, value]) => <Box key={label} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'secondary.light', minWidth: 0 }}>
              <Icon color="primary" sx={{ fontSize: 20 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{label}</Typography>
              <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{value}</Typography>
            </Box>)}
          </Box>

          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>Descripción</Typography>
          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{product.descripcion || 'El vendedor no registró una descripción. Consulta las condiciones antes de contratar.'}</Typography>
        </Box>
      </Card>

      <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Precio del servicio</Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '2.1rem', lineHeight: 1.15, letterSpacing: '-0.03em', color: 'primary.main' }}>{formatCLP(item.price)}</Typography>
              <Typography variant="caption" color="text.secondary">IVA incluido</Typography>
            </Box>
            <Tooltip title={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
              <IconButton aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'} aria-pressed={favorite} onClick={() => toggleFavorite(item)} sx={{ border: '1px solid', borderColor: 'divider' }}>
                {favorite ? <Favorite sx={{ color: 'error.main' }} /> : <FavoriteBorderOutlined />}
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack spacing={1.25} sx={{ mt: 2.5, '& .MuiButton-root': { minHeight: 46 } }}>
            <Button variant="contained" size="large" fullWidth startIcon={<AddShoppingCartOutlined />} onClick={book}>Contratar</Button>
            <Button variant="outlined" size="large" fullWidth startIcon={<DescriptionOutlined />} onClick={quote}>Solicitar cotización</Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>La cotización mantiene el precio por 15 días.</Typography>
        </Card>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 2, bgcolor: 'secondary.light', color: 'primary.main' }}><StorefrontOutlined /></Box>
            <Box sx={{ minWidth: 0 }}><Typography variant="caption" color="text.secondary">Ofrecido por</Typography><Typography noWrap sx={{ fontWeight: 800 }}>{item.seller}</Typography></Box>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Button fullWidth startIcon={<ChatOutlined />} onClick={contact}>Enviar mensaje</Button>
        </Card>
      </Stack>
    </Box>

    <ReviewsAndQASection entityId={id} sellerName={item.seller} />
  </Box>
}
