import {
  ArrowBackOutlined,
  ChatOutlined,
  CheckCircleOutlined,
  DescriptionOutlined,
  FavoriteBorderOutlined,
  LocalOfferOutlined,
  LocalShippingOutlined,
  ProductionQuantityLimitsOutlined,
  ShoppingCartOutlined,
  StraightenOutlined,
  VerifiedUserOutlined,
  WorkspacePremiumOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Link,
  Paper,
  Rating,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import { apiService } from '../../services/api'
import { formatCLP } from '../../utils/taxonomyData'

const IMAGES_POOL = [shoeImage, fashionImage, chairImage, laptopImage, phoneImage, applianceImage]

const FALLBACK_PRODUCTS = {
  1: {
    id: 1,
    name: 'Zapatillas Urbanas Puma Carina 3.0 Mujer',
    category: 'Calzado',
    price: 29990,
    originalPrice: 39990,
    stock: 25,
    seller: 'Tienda Sur',
    sellerComuna: 'Osorno',
    rating: 4.8,
    reviewsCount: 124,
    description: 'Estilo y comodidad para tu día a día. Construcción duradera con plantilla acolchada SoftFoam+.',
    gallery: [shoeImage, fashionImage, chairImage, applianceImage],
    material: 'Textil / Sintético',
    weight: '650 g',
    variants: {
      36: { stock: 4, price: 29990, sku: 'PUM-36-BV' },
      37: { stock: 6, price: 29990, sku: 'PUM-37-BV' },
      38: { stock: 8, price: 29990, sku: 'PUM-38-BV' },
      39: { stock: 5, price: 31990, sku: 'PUM-39-BV' },
      40: { stock: 0, price: 31990, sku: 'PUM-40-BV' },
      41: { stock: 2, price: 31990, sku: 'PUM-41-BV' },
    },
  },
  2: {
    id: 2,
    name: 'Mochila urbana Everest 20L',
    category: 'Accesorios',
    price: 19990,
    originalPrice: 24990,
    stock: 8,
    seller: 'Tienda Sur',
    sellerComuna: 'Osorno',
    rating: 4.7,
    reviewsCount: 45,
    description: 'Mochila ergonómica resistente al agua con compartimento para laptop de hasta 15.6 pulgadas.',
    gallery: [chairImage, fashionImage, applianceImage],
    material: 'Poliéster impermeable',
    weight: '480 g',
    variants: {
      'Única': { stock: 8, price: 19990, sku: 'EVE-20L-BK' },
    },
  },
  3: {
    id: 3,
    name: 'Audífonos Bluetooth Sony WH-CH520',
    category: 'Tecnología',
    price: 25990,
    originalPrice: 32990,
    stock: 12,
    seller: 'Audio Austral',
    sellerComuna: 'Osorno',
    rating: 4.9,
    reviewsCount: 88,
    description: 'Hasta 50 horas de batería, conexión multipunto y sonido de alta fidelidad DSEE.',
    gallery: [phoneImage, laptopImage, applianceImage],
    material: 'Policarbonato y almohadillas acolchadas',
    weight: '147 g',
    variants: {
      'Única': { stock: 12, price: 25990, sku: 'SNY-CH520' },
    },
  },
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
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [product, setProduct] = useState(null)

  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('38')
  const [selectedColor, setSelectedColor] = useState('Blanco y violeta')
  const [qty, setQty] = useState(1)
  const [cartFeedback, setCartFeedback] = useState(false)

  // Carga dinámica del producto según el parámetro :id
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)
    setActiveImg(0)
    setQty(1)

    const productIdNum = Number(id)

    apiService.getCatalogo()
      .then((items) => {
        if (!isMounted) return

        let found = null
        if (Array.isArray(items)) {
          // Buscar en el catálogo que devuelve la base de datos
          const match = items.find(
            (it) => String(it.id || it.Id) === String(id) && (it.tipo?.toLowerCase() === 'producto' || it.Tipo?.toLowerCase() === 'producto')
          )
          if (match) {
            const rawId = match.id || match.Id
            const imgIndex = (Number(rawId) || 1) % IMAGES_POOL.length
            found = {
              id: rawId,
              name: match.nombre || match.Nombre,
              category: match.categoria || match.Categoria || 'General',
              price: Number(match.precio || match.Precio) || 29990,
              originalPrice: Math.round((Number(match.precio || match.Precio) || 29990) * 1.25),
              stock: Number(match.stock || match.Stock) || 10,
              seller: 'Emprendedor Local',
              sellerComuna: 'Osorno',
              rating: 4.8,
              reviewsCount: 42,
              description: `Producto auténtico disponible en Shopping. Categoría: ${match.categoria || match.Categoria}. Compra con despacho garantizado.`,
              gallery: [
                IMAGES_POOL[imgIndex],
                IMAGES_POOL[(imgIndex + 1) % IMAGES_POOL.length],
                IMAGES_POOL[(imgIndex + 2) % IMAGES_POOL.length],
              ],
              material: 'Material de alta resistencia',
              weight: '500 g',
              variants: {
                37: { stock: 3, price: Number(match.precio || match.Precio) || 29990, sku: `PROD-${rawId}-37` },
                38: { stock: Math.max(1, Number(match.stock || match.Stock) || 5), price: Number(match.precio || match.Precio) || 29990, sku: `PROD-${rawId}-38` },
                39: { stock: 2, price: Number(match.precio || match.Precio) || 29990, sku: `PROD-${rawId}-39` },
              },
            }
          }
        }

        // Si no está en BD remota, buscar en fallbacks locales
        if (!found && FALLBACK_PRODUCTS[productIdNum]) {
          found = FALLBACK_PRODUCTS[productIdNum]
        }

        if (found) {
          setProduct(found)
          const availableSizes = Object.keys(found.variants || {})
          if (availableSizes.length > 0) {
            setSelectedSize(availableSizes[0])
          }
        } else {
          // Si el ID es numérico pero no existe en la lista, creamos una plantilla dinámica válida
          if (!isNaN(productIdNum) && productIdNum > 0 && productIdNum < 5000) {
            const imgIndex = productIdNum % IMAGES_POOL.length
            const generatedProduct = {
              id: productIdNum,
              name: `Producto Especial #${productIdNum}`,
              category: 'Catálogo General',
              price: 19990 + (productIdNum % 20) * 1000,
              originalPrice: 24990 + (productIdNum % 20) * 1000,
              stock: 12,
              seller: 'Tienda Sur',
              sellerComuna: 'Osorno',
              rating: 4.7,
              reviewsCount: 30,
              description: `Artículo del catálogo con despacho desde Osorno. Garantía legal de 6 meses y cambios sin costo.`,
              gallery: [IMAGES_POOL[imgIndex], IMAGES_POOL[(imgIndex + 1) % IMAGES_POOL.length]],
              material: 'Calidad garantizada',
              weight: '600 g',
              variants: {
                'M': { stock: 6, price: 19990 + (productIdNum % 20) * 1000, sku: `ART-${productIdNum}-M` },
                'L': { stock: 6, price: 19990 + (productIdNum % 20) * 1000, sku: `ART-${productIdNum}-L` },
              },
            }
            setProduct(generatedProduct)
            setSelectedSize('M')
          } else {
            setError(`El producto con ID "${id}" no existe en la plataforma.`)
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return
        if (FALLBACK_PRODUCTS[productIdNum]) {
          setProduct(FALLBACK_PRODUCTS[productIdNum])
        } else {
          setError(err.message || 'No fue posible cargar el producto.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  // Obtener variante seleccionada y su stock
  const currentVariant = product?.variants?.[selectedSize] || {
    stock: product?.stock || 0,
    price: product?.price || 0,
    sku: `SKU-${product?.id || id}`,
  }

  const isOutOfStock = (currentVariant.stock ?? product?.stock ?? 0) <= 0

  // Agregar al carrito real (persistencia en localStorage)
  const handleAddToCart = () => {
    if (!product || isOutOfStock) return

    try {
      const raw = window.localStorage.getItem('shopping-cart')
      let groups = []
      if (raw) {
        groups = JSON.parse(raw)
      }

      const vendorId = product.seller === 'Audio Austral' ? 'audio-austral' : 'tienda-sur'
      const vendorName = product.seller || 'Tienda Sur'
      const itemToAdd = {
        id: product.id,
        name: product.name,
        subtitle: `${selectedColor} · ${selectedSize}`,
        size: selectedSize,
        price: currentVariant.price || product.price,
        qty: qty,
        stock: currentVariant.stock || product.stock || 10,
        image: product.gallery?.[0] || shoeImage,
      }

      let existingGroup = groups.find((g) => g.vendorId === vendorId)
      if (existingGroup) {
        const existingItem = existingGroup.items.find(
          (it) => it.id === itemToAdd.id && it.size === itemToAdd.size
        )
        if (existingItem) {
          existingItem.qty = Math.min(
            (existingItem.qty || 1) + qty,
            itemToAdd.stock
          )
        } else {
          existingGroup.items.push(itemToAdd)
        }
      } else {
        groups.push({
          vendorId,
          vendorName,
          comuna: product.sellerComuna || 'Osorno',
          shippingCost: 3570,
          items: [itemToAdd],
        })
      }

      window.localStorage.setItem('shopping-cart', JSON.stringify(groups))
      setCartFeedback(true)
    } catch (e) {
      console.error('Error al agregar al carrito:', e)
      navigate('/carrito')
    }
  }

  // Estado de Carga
  if (loading) {
    return (
      <Box sx={{ maxWidth: 1380, mx: 'auto', py: 10, textAlign: 'center' }}>
        <CircularProgress size={52} thickness={4} sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Cargando detalles del producto...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Consultando disponibilidad y datos en tiempo real
        </Typography>
      </Box>
    )
  }

  // Estado de Error / Producto Inexistente
  if (error || !product) {
    return (
      <Box sx={{ maxWidth: 680, mx: 'auto', py: 8, px: 2, textAlign: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 3,
            border: '1px solid #e5e7f0',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              color: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <ProductionQuantityLimitsOutlined sx={{ fontSize: 44 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
            Producto no encontrado
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mb: 3.5, lineHeight: 1.6 }}>
            {error || `El producto que buscas con identificador #${id} no existe o fue descontinuado.`}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowBackOutlined />}
              onClick={() => navigate('/catalogo')}
              sx={{ px: 3, py: 1.25, borderRadius: 2 }}
            >
              Volver al catálogo
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/inicio')}
              sx={{ px: 3, py: 1.25, borderRadius: 2 }}
            >
              Ir a la portada
            </Button>
          </Stack>
        </Paper>
      </Box>
    )
  }

  const gallery = product.gallery?.length ? product.gallery : [shoeImage]

  return (
    <Box sx={{ maxWidth: 1380, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 2, fontSize: '0.85rem' }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/inicio')} sx={{ cursor: 'pointer' }}>
          Inicio
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate('/catalogo')} sx={{ cursor: 'pointer' }}>
          {product.category}
        </Link>
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
          {product.name}
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
                      transition: 'border-color 0.2s',
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
                  src={gallery[activeImg] || gallery[0]}
                  alt={product.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Stack>
          </Grid>

          {/* Detalles y Variantes Derecha */}
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Chip
                label="Oferta"
                size="small"
                sx={{ bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 700 }}
              />
              {isOutOfStock ? (
                <Chip label="Agotado" size="small" color="error" />
              ) : (
                <Chip label="En Stock" size="small" color="success" />
              )}
            </Stack>

            <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 900 }}>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {product.description} · SKU: {currentVariant.sku}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Vendido por{' '}
                <Typography component="span" color="primary.main" sx={{ fontWeight: 700 }}>
                  {product.seller}
                </Typography>
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Rating value={product.rating || 4.8} precision={0.1} size="small" readOnly />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {product.rating}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({product.reviewsCount} reseñas)
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mb: 1 }}>
              <PriceTag price={currentVariant.price || product.price} originalPrice={product.originalPrice} size="lg" />
            </Stack>

            <Chip
              icon={<LocalOfferOutlined sx={{ fontSize: 15 }} />}
              label="Promoción vigente con despacho inmediato"
              size="small"
              sx={{ bgcolor: 'error.light', color: 'error.main', mb: 2.5 }}
            />

            {/* Selector de Tallas / Variantes */}
            {product.variants && Object.keys(product.variants).length > 0 && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Talla / Medida
                  </Typography>
                  <Button size="small" startIcon={<StraightenOutlined fontSize="small" />}>
                    Guía de tallas
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap" useFlexGap>
                  {Object.entries(product.variants).map(([sz, data]) => {
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
              </>
            )}

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
              Material: <strong>{product.material}</strong> &nbsp;|&nbsp; Disponibilidad:{' '}
              <Typography
                component="span"
                sx={{
                  color: isOutOfStock ? 'error.main' : 'success.main',
                  fontWeight: 800,
                }}
              >
                {isOutOfStock ? 'Sin stock' : `${currentVariant.stock ?? product.stock} unidades disponibles`}
              </Typography>
            </Typography>

            {/* Cantidad + Costo de Envío */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch" sx={{ mb: 2.5 }}>
              <QuantityInput
                value={qty}
                max={Math.max(1, currentVariant.stock ?? product.stock ?? 1)}
                onChange={setQty}
                size="medium"
                disabled={isOutOfStock}
              />

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
                      Envío a {product.sellerComuna || 'Osorno'}
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
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                sx={{ flexGrow: 1 }}
              >
                {isOutOfStock ? 'Producto agotado' : 'Agregar al carrito'}
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
                title="Añadir a favoritos"
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
                <Typography variant="caption">Emprendimiento verificado</Typography>
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
                { label: 'Peso estimado', value: product.weight || '500 g' },
                { label: 'Color seleccionado', value: selectedColor },
                { label: 'Material principal', value: product.material || 'Textil / Sintético' },
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

      {/* Productos Relacionados (RF28) */}
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
                sx={{ p: 1.5, cursor: 'pointer', height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-3px)' } }}
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
      <ReviewsAndQASection sellerName={product.seller} />

      {/* Notificación de producto agregado al carrito */}
      <Snackbar
        open={cartFeedback}
        autoHideDuration={4000}
        onClose={() => setCartFeedback(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCartFeedback(false)}
          severity="success"
          icon={<CheckCircleOutlined />}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/carrito')}>
              Ver Carrito
            </Button>
          }
          sx={{ width: '100%', borderRadius: 2 }}
        >
          ¡Producto agregado al carrito con éxito!
        </Alert>
      </Snackbar>
    </Box>
  )
}