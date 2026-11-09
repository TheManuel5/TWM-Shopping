import { catalogGallery } from '../../utils/catalogImages'
import ReferenceBadge from '../../components/atoms/ReferenceBadge'
import { notify } from '../../utils/feedback'
import useCollection from '../../hooks/useCollection'
import { catalogSeed, asItem, effectivePrice, addToCart, requestQuote, toggleFavorite } from '../../data/catalog'
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
import { useNavigate, useParams } from 'react-router-dom'
import PriceTag from '../../components/atoms/PriceTag/PriceTag'
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import ReviewsAndQASection from '../../components/organisms/ReviewsAndQASection/ReviewsAndQASection'
import { formatCLP } from '../../utils/taxonomyData'

function ProductDetailContent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [catalog] = useCollection('catalog', catalogSeed)
  const product = catalog.find(item => String(item.id) === id)
  const variants = product?.variantes?.length ? product.variantes : [{ sku: `PRD-${id}`, size: product?.talla || 'Única', color: product?.color || 'Gris', price: product?.precio || 0, stock: product?.stock || 0 }]
  const gallery = catalogGallery(product)
  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState(product?.color || 'Gris')
  const [qty, setQty] = useState(1)

  const currentVariant = variants.find(variant => variant.size === selectedSize) || variants[0]
  const relatedProducts = catalog.filter(item => item.id !== product?.id && item.tipo !== 'Servicio' && item.estado !== 'Borrador' && (!product?.relacionados?.length || product.relacionados.includes(item.id))).slice(0, 6).map(asItem)
  const item = product ? { ...asItem(product), sku: currentVariant.sku, size: currentVariant.size, price: product.oferta && effectivePrice(product) !== product.precio ? effectivePrice(product) : currentVariant.price, stock: currentVariant.stock, color: currentVariant.color } : null
  if (!product || product.estado === 'Borrador' || product.tipo === 'Servicio') return <Card sx={{ p: 5 }}><Typography variant="h5">Producto no encontrado</Typography><Button onClick={() => navigate('/catalogo')}>Volver al catálogo</Button></Card>

  return (
    <Box sx={{ maxWidth: 1380, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 2, fontSize: '0.85rem' }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/inicio')} sx={{ cursor: 'pointer' }}>
          Inicio
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate('/catalogo')} sx={{ cursor: 'pointer' }}>
          {product.categoria}
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate('/catalogo')} sx={{ cursor: 'pointer' }}>
          {product.subcategoria || product.tipo}
        </Link>
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
          {product.nombre}
        </Typography>
      </Breadcrumbs>

      {/* Ficha Principal P04 */}
      <Card sx={{ p: { xs: 2, md: 3.5 }, mb: 3 }}>
        <Grid container spacing={4}>
          {/* Galería Izquierda */}
          <Grid size={{ xs: 12, md: 6 }}>
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
                      objectFit: 'contain',
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: activeImg === idx ? '2px solid #602ff7' : '1px solid #e5e7f0',
                    }}
                  />
                ))}
              </Stack>

              <Box
                sx={{
                  position: 'relative',
                  flexGrow: 1,
                  height: { xs: 280, sm: 420 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: '#f7f6ff',
                }}
              >
                <Box
                  component="img"
                  src={gallery[activeImg] || gallery[0]}
                  alt={product.nombre}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <ReferenceBadge image={gallery[activeImg] || gallery[0]} />
              </Box>
            </Stack>
          </Grid>

          {/* Detalles y Variantes Derecha */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip
              label={product.oferta ? 'Oferta temporal' : 'Disponible'}
              size="small"
              sx={{ bgcolor: 'secondary.main', color: 'primary.main', mb: 1 }}
            />
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              {product.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {product.descripcion} · SKU: {currentVariant.sku}
            </Typography>

            <Stack direction="row" spacing={2}  sx={[{ alignItems: "center" }, { mb: 2 }]}>
              <Typography variant="body2">
                Vendido por{' '}
                <Typography component="span" color="primary.main" sx={{ fontWeight: 700 }}>
                  {item.seller}
                </Typography>
              </Typography>
              <Stack direction="row"  spacing={0.5} sx={{ alignItems: "center" }}>
                <Rating value={Number(product.rating) || 0} precision={0.1} size="small" readOnly />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {item.rating}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({item.reviews} reseñas)
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={2}  sx={[{ alignItems: "baseline" }, { mb: 1 }]}>
              <PriceTag price={item.price} originalPrice={product.oferta ? product.precio : undefined} size="lg" />
            </Stack>

            <Chip
              icon={<LocalOfferOutlined sx={{ fontSize: 15 }} />}
              label={product.oferta ? `Oferta hasta ${product.oferta.fin}` : 'Precios en pesos chilenos · IVA incluido'}
              size="small"
              sx={{ bgcolor: 'error.light', color: 'error.main', mb: 2.5 }}
            />

            {/* Selector de Tallas (Variantes RF27) */}
            <Stack direction="row"   sx={[{ justifyContent: "space-between", alignItems: "center" }, { mb: 1 }]}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Talla
              </Typography>
              <Button size="small" onClick={() => notify("Comprueba las medidas indicadas por el vendedor. Tallas EU: 38 = 24 cm; 39 = 25 cm; 40 = 25,5 cm; 41 = 26 cm; 42 = 27 cm.")} startIcon={<StraightenOutlined fontSize="small" />}>
                Guía de tallas
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} sx={[{ flexWrap: "wrap" }, { mb: 2.5 }]}  useFlexGap>
              {variants.map(data => {
                const sz = data.size
                const disabled = data.stock === 0
                const active = selectedSize === sz
                return (
                  <Button
                    key={sz}
                    disabled={disabled}
                    variant={active ? 'contained' : 'outlined'}
                    onClick={() => { setSelectedSize(sz); setSelectedColor(data.color || product.color); setQty(1) }}
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
            <Stack direction="row" useFlexGap spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>{[...new Set(variants.map(variant => variant.color || product.color))].map(color => <Button key={color} variant={(currentVariant.color || product.color) === color ? 'contained' : 'outlined'} onClick={() => { const variant = variants.find(item => item.color === color && item.stock > 0) || variants.find(item => item.color === color); if (variant) { setSelectedSize(variant.size); setSelectedColor(color); setQty(1) } }}>{color}</Button>)}</Stack>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Material: <strong>{product.material}</strong> &nbsp;|&nbsp; Stock:{' '}
              <Typography component="span" sx={{ color: 'success.main', fontWeight: 800 }}>
                {currentVariant.stock} unidades disponibles
              </Typography>
            </Typography>

            {/* Cantidad + Costo de Envío a Osorno */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}  sx={[{ alignItems: "stretch" }, { mb: 2.5 }]}>
              <QuantityInput value={qty} max={currentVariant.stock} onChange={setQty} size="medium" />

              <Paper
                variant="outlined"
                sx={{
                  px: 2,
                  py: 1,
                  position: 'relative',
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#f7f6ff',
                }}
              >
                <Stack direction="row" spacing={1.25}  sx={{ alignItems: "center" }}>
                  <LocalShippingOutlined color="primary" />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                      Consulta el despacho en tu compra
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Según el destino y las condiciones del vendedor
                    </Typography>
                  </Box>
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Costo de envío
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Por calcular
                  </Typography>
                </Box>
              </Paper>
            </Stack>

            {/* Botones de Acción P04 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25, mb: 2, '& .MuiButton-root': { minHeight: 44 } }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartOutlined />}
                disabled={currentVariant.stock === 0} onClick={() => { try { addToCart(item, Math.min(qty, currentVariant.stock)); navigate('/carrito') } catch (error) { notify(error.message) } }}
                sx={{ flexGrow: 1 }}
              >
                Agregar al carrito
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DescriptionOutlined />}
                onClick={() => { requestQuote([{ ...item, qty }]); navigate('/cotizaciones') }}
              >
                Solicitar cotización
              </Button>
              <IconButton
                aria-label="Guardar en favoritos" onClick={() => { toggleFavorite(item); navigate('/favoritos') }}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}
              >
                <FavoriteBorderOutlined color="primary" />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<ChatOutlined />}
                onClick={() => navigate('/mensajes?vendedor=' + encodeURIComponent(product.ownerRut))}
              >
                Contactar vendedor
              </Button>
            </Box>

            <Stack direction="row"  sx={[{ justifyContent: "space-between" }, { color: 'text.secondary', pt: 1 }]}>
              <Stack direction="row" spacing={0.75}  sx={{ alignItems: "center" }}>
                <VerifiedUserOutlined fontSize="small" color="primary" />
                <Typography variant="caption">Compra segura en Shopping</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75}  sx={{ alignItems: "center" }}>
                <WorkspacePremiumOutlined fontSize="small" color="primary" />
                <Typography variant="caption">Una tienda de confianza</Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* Tabla de Características mínimas (RF08 - P04) */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
            Características principales
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
            <Grid container spacing={2}>
              {[
                { label: 'Tamaño / Talla', value: currentVariant.size || product.tamano },
                { label: 'Peso', value: `${product.peso} g` },
                { label: 'Color', value: selectedColor },
                { label: 'Material principal', value: product.material },
              ].map((attr) => (
                <Grid key={attr.label} size={{ xs: 6, md: 3 }}>
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
        <Stack direction="row"   sx={[{ justifyContent: "space-between", alignItems: "center" }, { mb: 1.5 }]}>
          <Typography variant="h6">También te puede gustar (Productos relacionados)</Typography>
          <Button size="small" onClick={() => navigate('/catalogo')}>
            Ver más productos →
          </Button>
        </Stack>
        <Grid container spacing={1.5}>
          {relatedProducts.map((rel) => (
            <Grid key={rel.id} size={{ xs: 6, sm: 4, md: 2 }}>
              <Card
                onClick={() => navigate(`/producto/${rel.id}`)}
                sx={{ p: 1.5, cursor: 'pointer', height: '100%' }}
              >
                <Box
                  component="img"
                  src={rel.image}
                  alt={rel.name}
                  sx={{ width: '100%', height: 110, objectFit: 'contain', borderRadius: 2, mb: 1 }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }} noWrap>
                  {rel.name}
                </Typography>
                <Stack direction="row"   sx={{ justifyContent: "space-between", alignItems: "center" }}>
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
      <ReviewsAndQASection key={id} entityId={id} sellerName={item.seller} />
    </Box>
  )
}
export default function ProductDetailPage() {
  const { id } = useParams()
  return <ProductDetailContent key={id} />
}
