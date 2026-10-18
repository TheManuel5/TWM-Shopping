import {
  ChatOutlined,
  DescriptionOutlined,
  FavoriteBorderOutlined,
  LocalOfferOutlined,
  LocalShippingOutlined,
  ShoppingCartOutlined,
  StraightenOutlined,
  VerifiedUserOutlined,
  WorkspacePremiumOutlined,
} from '@mui/icons-material'
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  Link,
  Paper,
  Rating,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import applianceImage from '../../assets/products/appliance.jpg'
import chairImage from '../../assets/products/chair.jpg'
import fashionImage from '../../assets/products/fashion.jpg'
import laptopImage from '../../assets/products/laptop.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import ColorSwatch from '../../components/atoms/ColorSwatch/ColorSwatch'
import PriceTag from '../../components/atoms/PriceTag/PriceTag'
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import ReviewsAndQASection from '../../components/organisms/ReviewsAndQASection/ReviewsAndQASection'
import { formatCLP } from '../../utils/taxonomyData'

const VARIANTS = {
  36: { stock: 4, price: 29990, sku: 'PUM-36-BV' },
  37: { stock: 6, price: 29990, sku: 'PUM-37-BV' },
  38: { stock: 8, price: 29990, sku: 'PUM-38-BV' },
  39: { stock: 5, price: 31990, sku: 'PUM-39-BV' },
  40: { stock: 0, price: 31990, sku: 'PUM-40-BV' },
  41: { stock: 3, price: 31990, sku: 'PUM-41-BV' },
}

const RELATED_PRODUCTS = [
  { id: 11, name: 'Zapatillas Urbanas Puma Carina 3.0', price: 29990, rating: '4,7', reviews: 98, image: shoeImage },
  { id: 12, name: 'Zapatillas Puma Smash 3.0 Mujer', price: 32990, rating: '4,6', reviews: 76, image: fashionImage },
  { id: 13, name: 'Zapatillas Adidas Grand Court', price: 34990, rating: '4,8', reviews: 112, image: shoeImage },
  { id: 14, name: 'Zapatillas New Balance 574', price: 39990, rating: '4,7', reviews: 64, image: chairImage },
  { id: 15, name: 'Zapatillas Nike Court Vision', price: 36990, rating: '4,6', reviews: 53, image: laptopImage },
  { id: 16, name: 'Zapatillas Vans Old Skool Mujer', price: 41990, rating: '4,8', reviews: 91, image: phoneImage },
]

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const gallery = [shoeImage, fashionImage, chairImage, applianceImage]
  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('38')
  const [selectedColor, setSelectedColor] = useState('Blanco y violeta')
  const [qty, setQty] = useState(1)

  const currentVariant = VARIANTS[selectedSize] || VARIANTS['38']

  return (
    <Box sx={{ maxWidth: 1380, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 2, fontSize: '0.85rem' }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/inicio')} sx={{ cursor: 'pointer' }}>
          Inicio
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate('/catalogo')} sx={{ cursor: 'pointer' }}>
          Ropa, moda y calzado
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate('/catalogo')} sx={{ cursor: 'pointer' }}>
          Calzado
        </Link>
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
          Zapatillas Urbanas Mujer
        </Typography>
      </Breadcrumbs>

      {/* Ficha Principal P04 */}
      <Card sx={{ p: { xs: 2, md: 3.5 }, mb: 3 }}>
        <Grid container spacing={4}>
          {/* Galería Izquierda */}
          <Grid item xs={12} md={6}>
            <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={2}>
              <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1.25}>
                {gallery.map((img, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={img}
                    alt={`Vista ${idx + 1}`}
                    onClick={() => setActiveImg(idx)}
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: 'cover',
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: activeImg === idx ? '2px solid #602ff7' : '1px solid #e5e7f0',
                    }}
                  />
                ))}
              </Stack>

              <Box
                sx={{
                  flexGrow: 1,
                  height: { xs: 280, sm: 420 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: '#f7f6ff',
                }}
              >
                <Box
                  component="img"
                  src={gallery[activeImg]}
                  alt="Zapatillas Urbanas Puma Carina 3.0 Mujer"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Stack>
          </Grid>

          {/* Detalles y Variantes Derecha */}
          <Grid item xs={12} md={6}>
            <Chip
              label="Oferta"
              size="small"
              sx={{ bgcolor: 'secondary.main', color: 'primary.main', mb: 1 }}
            />
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              Zapatillas Urbanas Puma Carina 3.0 Mujer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Estilo y comodidad para tu día a día · SKU: {currentVariant.sku}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Vendido por{' '}
                <Typography component="span" color="primary.main" sx={{ fontWeight: 700 }}>
                  Tienda Sur
                </Typography>
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Rating value={4.8} precision={0.1} size="small" readOnly />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  4,8
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (124 reseñas)
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mb: 1 }}>
              <PriceTag price={currentVariant.price} originalPrice={39990} size="lg" />
            </Stack>

            <Chip
              icon={<LocalOfferOutlined sx={{ fontSize: 15 }} />}
              label="Oferta vigente hasta el 30 oct. 2026"
              size="small"
              sx={{ bgcolor: 'error.light', color: 'error.main', mb: 2.5 }}
            />

            {/* Selector de Tallas (Variantes RF27) */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Talla
              </Typography>
              <Button size="small" startIcon={<StraightenOutlined fontSize="small" />}>
                Guía de tallas
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap" useFlexGap>
              {Object.entries(VARIANTS).map(([sz, data]) => {
                const disabled = data.stock === 0
                const active = selectedSize === sz
                return (
                  <Button
                    key={sz}
                    disabled={disabled}
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => setSelectedSize(sz)}
                    sx={{ minWidth: 52, borderColor: 'divider' }}
                  >
                    {sz}
                  </Button>
                )
              })}
            </Stack>

            {/* Selector de Color */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Color:{' '}
              <Typography component="span" variant="body2" color="text.secondary">
                {selectedColor}
              </Typography>
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
              <ColorSwatch
                colorHex="#b497ff"
                name="Blanco y violeta"
                selected={selectedColor === 'Blanco y violeta'}
                onClick={() => setSelectedColor('Blanco y violeta')}
              />
              <ColorSwatch
                colorHex="#111827"
                name="Negro"
                selected={selectedColor === 'Negro'}
                onClick={() => setSelectedColor('Negro')}
              />
              <ColorSwatch
                colorHex="#f9a8d4"
                name="Rosa pastel"
                selected={selectedColor === 'Rosa pastel'}
                onClick={() => setSelectedColor('Rosa pastel')}
              />
            </Stack>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Material: <strong>Textil</strong> &nbsp;|&nbsp; Stock:{' '}
              <Typography component="span" sx={{ color: 'success.main', fontWeight: 800 }}>
                {currentVariant.stock} unidades disponibles
              </Typography>
            </Typography>

            {/* Cantidad + Costo de Envío a Osorno */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch" sx={{ mb: 2.5 }}>
              <QuantityInput value={qty} max={currentVariant.stock} onChange={setQty} size="medium" />

              <Paper
                variant="outlined"
                sx={{
                  px: 2,
                  py: 1,
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#f7f6ff',
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <LocalShippingOutlined color="primary" />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                      Enviar a Osorno
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Recíbelo entre 2 y 3 días hábiles
                    </Typography>
                  </Box>
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Costo de envío
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    $3.570
                  </Typography>
                </Box>
              </Paper>
            </Stack>

            {/* Botones de Acción P04 */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartOutlined />}
                onClick={() => navigate('/carrito')}
                sx={{ flexGrow: 1 }}
              >
                Agregar al carrito
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DescriptionOutlined />}
                onClick={() => navigate('/cotizaciones')}
              >
                Solicitar cotización
              </Button>
              <IconButton
                onClick={() => navigate('/favoritos')}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}
              >
                <FavoriteBorderOutlined color="primary" />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<ChatOutlined />}
                onClick={() => navigate('/mensajes')}
              >
                Contactar vendedor
              </Button>
            </Stack>

            <Stack direction="row" justifyContent="space-between" sx={{ color: 'text.secondary', pt: 1 }}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <VerifiedUserOutlined fontSize="small" color="primary" />
                <Typography variant="caption">Compra segura en Shopping</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <WorkspacePremiumOutlined fontSize="small" color="primary" />
                <Typography variant="caption">Una tienda de confianza</Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* Tabla de Características mínimas (RF08 - P04) */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
            Características principales (RF08)
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
            <Grid container spacing={2}>
              {[
                { label: 'Tamaño / Talla', value: selectedSize },
                { label: 'Peso', value: '650 g' },
                { label: 'Color', value: selectedColor },
                { label: 'Material principal', value: 'Textil' },
              ].map((attr) => (
                <Grid item xs={6} md={3} key={attr.label}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {attr.label}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {attr.value}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Card>

      {/* Productos Relacionados (RF28: "También te puede gustar") */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="h6">También te puede gustar (Productos relacionados)</Typography>
          <Button size="small" onClick={() => navigate('/catalogo')}>
            Ver más productos →
          </Button>
        </Stack>
        <Grid container spacing={1.5}>
          {RELATED_PRODUCTS.map((rel) => (
            <Grid item xs={6} sm={4} md={2} key={rel.id}>
              <Card
                onClick={() => navigate(`/producto/${rel.id}`)}
                sx={{ p: 1.5, cursor: 'pointer', height: '100%' }}
              >
                <Box
                  component="img"
                  src={rel.image}
                  alt={rel.name}
                  sx={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 2, mb: 1 }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }} noWrap>
                  {rel.name}
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {formatCLP(rel.price)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ★ {rel.rating}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Sección integrada P23: Reseñas y Preguntas Públicas */}
      <ReviewsAndQASection sellerName="Tienda Sur" />
    </Box>
  )
}