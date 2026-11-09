import ReferenceBadge from '../../components/atoms/ReferenceBadge'
import { Box, Breadcrumbs, Button, Card, Chip, Divider, Grid, Link, Stack, Typography } from '@mui/material'
import { AccessTimeOutlined, ChatOutlined, FavoriteBorderOutlined, LocationOnOutlined, ShoppingCartOutlined, StorefrontOutlined } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import useCollection from '../../hooks/useCollection'
import { asItem, addToCart, requestQuote, toggleFavorite } from '../../data/catalog'
import { formatCLP } from '../../utils/taxonomyData'
import { notify } from '../../utils/feedback'
import ReviewsAndQASection from '../../components/organisms/ReviewsAndQASection/ReviewsAndQASection'
export default function ServiceDetailPage() {
  const { id } = useParams(), navigate = useNavigate()
  const [catalog] = useCollection('catalog', [])
  const product = catalog.find(item => item.id === id && item.tipo === 'Servicio' && item.estado !== 'Borrador')
  if (!product) return <Card sx={{ p: 4 }}><Typography variant="h5">Servicio no encontrado</Typography><Button onClick={() => navigate('/catalogo?tipo=Servicios')}>Volver al catálogo</Button></Card>
  const item = asItem(product)
  const book = () => { try { addToCart(item); navigate('/carrito') } catch (error) { notify(error.message, 'error') } }
  const quote = () => { try { requestQuote([item]); notify('Cotización enviada.'); navigate('/cotizaciones') } catch (error) { notify(error.message, 'error') } }
  const contact = () => navigate('/mensajes?vendedor=' + encodeURIComponent(product.ownerRut))
  return <Box sx={{ maxWidth: 1380, mx: 'auto' }}>
    <Breadcrumbs sx={{ mb: 2, fontSize: 12 }}><Link component="button" onClick={() => navigate('/inicio')}>Inicio</Link><Link component="button" onClick={() => navigate('/catalogo?tipo=Servicios')}>Servicios</Link><Typography variant="caption">{product.categoria}</Typography></Breadcrumbs>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8.5 }}><Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', bgcolor: 'secondary.light' }}><Box component="img" src={item.image} alt={item.name} sx={{ width: '100%', height: { xs: 230, md: 350 }, objectFit: item.image.includes('placeholder') ? 'contain' : 'cover', display: 'block' }} /><ReferenceBadge image={item.image} /><Chip label={product.categoria} sx={{ position: 'absolute', left: 20, top: 16, bgcolor: 'background.paper' }} /></Box>
        <Stack spacing={2} sx={{ p: { xs: 2, md: 3 } }}><Typography variant="h4">{item.name}</Typography><Typography color="text.secondary">{item.seller} · {item.rating} ({item.reviews} reseñas)</Typography>
          <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}><Chip icon={<AccessTimeOutlined />} label={product.duracion || 'Duración no registrada'} variant="outlined" /><Chip icon={<LocationOnOutlined />} label={product.modalidad || 'Modalidad no registrada'} variant="outlined" /><Chip label={`Edad mínima: ${product.edad || 0} años`} variant="outlined" /></Stack>
          <Typography variant="h6">Descripción del servicio</Typography><Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{product.descripcion || 'El vendedor no ha registrado una descripción adicional. Consulta las condiciones antes de contratar.'}</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={quote}>Solicitar cotización</Button><Button variant="outlined" startIcon={<ChatOutlined />} onClick={contact}>Contactar vendedor</Button><Button startIcon={<FavoriteBorderOutlined />} onClick={() => toggleFavorite(item)}>Guardar</Button></Stack>
        </Stack>
      </Card></Grid>
      <Grid size={{ xs: 12, md: 3.5 }}><Stack spacing={2}><Card sx={{ p: 3 }}><Typography color="text.secondary" variant="body2">Precio del servicio</Typography><Typography variant="h4" color="primary" sx={{ my: 1 }}>{formatCLP(item.price)}</Typography><Typography variant="caption" color="text.secondary">IVA incluido. La cotización confirma el alcance.</Typography><Button variant="contained" fullWidth startIcon={<ShoppingCartOutlined />} sx={{ mt: 2 }} onClick={book}>Agregar al carrito</Button><Divider sx={{ my: 2 }} /><Typography variant="body2">Ubicación: {product.comuna || 'Consulta al vendedor'}</Typography></Card>
        <Card sx={{ p: 3 }}><Stack direction="row" spacing={1} alignItems="center"><StorefrontOutlined color="primary" /><Typography fontWeight={700}>{item.seller}</Typography></Stack><Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>RUT: {product.ownerRut}</Typography><Button variant="outlined" fullWidth onClick={contact}>Enviar mensaje</Button></Card></Stack></Grid>
    </Grid><ReviewsAndQASection entityId={id} sellerName={item.seller} />
  </Box>
}
