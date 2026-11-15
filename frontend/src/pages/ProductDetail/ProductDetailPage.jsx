import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AddShoppingCartOutlined, ChatOutlined, DescriptionOutlined, Favorite, FavoriteBorderOutlined, LocalShippingOutlined, StorefrontOutlined } from '@mui/icons-material'
import { Box, Breadcrumbs, Button, Card, Divider, IconButton, Link, Rating, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import ReferenceBadge from '../../components/atoms/ReferenceBadge'
import ProductCard from '../../components/molecules/ProductCard/ProductCard'
import { productGrid } from '../../components/molecules/ProductCard/productGrid'
import ReviewsAndQASection from '../../components/organisms/ReviewsAndQASection/ReviewsAndQASection'
import { catalogSeed, asItem, effectivePrice, addToCart, requestQuote, toggleFavorite } from '../../data/catalog'
import useCollection from '../../hooks/useCollection'
import { catalogGallery } from '../../utils/catalogImages'
import { notify } from '../../utils/feedback'
import { formatCLP } from '../../utils/taxonomyData'

function Gallery({ images, name }) {
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const current = images[active] || images[0]
  return <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5}>
    {images.length > 1 && <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1}>
      {images.map((image, index) => <Box
        key={image} component="button" type="button" aria-label={`Ver imagen ${index + 1}`} aria-pressed={active === index}
        onClick={() => { setActive(index); setLoaded(false) }}
        sx={{ width: 68, height: 68, p: 0, borderRadius: 2, overflow: 'hidden', cursor: 'pointer', bgcolor: '#f4f2ff', border: '2px solid', borderColor: active === index ? 'primary.main' : 'transparent', outline: '1px solid', outlineColor: 'divider' }}
      ><Box component="img" src={image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /></Box>)}
    </Stack>}
    <Box sx={{ position: 'relative', flex: 1, aspectRatio: { xs: '4 / 3', md: '1 / 1' }, maxHeight: 520, borderRadius: 3, overflow: 'hidden', bgcolor: '#f4f2ff' }}>
      {!loaded && <Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, height: '100%' }} />}
      <Box component="img" src={current} alt={name} onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity 250ms ease' }} />
      <ReferenceBadge image={current} />
    </Box>
  </Stack>
}

function ProductDetailContent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [catalog] = useCollection('catalog', catalogSeed)
  const [wishlist] = useCollection('wishlist', [])
  const product = catalog.find(item => String(item.id) === id)
  const variants = useMemo(() => product?.variantes?.length ? product.variantes : [{ sku: `PRD-${id}`, size: product?.talla || 'Única', color: product?.color || '', price: product?.precio || 0, stock: product?.stock || 0 }], [product, id])
  const [sku, setSku] = useState(() => (variants.find(variant => variant.stock > 0) || variants[0]).sku)
  const [qty, setQty] = useState(1)
  const related = useMemo(() => product ? catalog.filter(item => item.id !== product.id && item.tipo !== 'Servicio' && item.estado !== 'Borrador' && (product.relacionados?.length ? product.relacionados.includes(item.id) : item.categoria === product.categoria)).slice(0, 4).map(asItem) : [], [catalog, product])

  if (!product || product.estado === 'Borrador' || product.tipo === 'Servicio') return <Card sx={{ p: 5, textAlign: 'center', maxWidth: 560, mx: 'auto' }}><Typography variant="h5" sx={{ mb: 2 }}>Producto no encontrado</Typography><Button variant="contained" onClick={() => navigate('/catalogo')}>Volver al catálogo</Button></Card>

  const variant = variants.find(row => row.sku === sku) || variants[0]
  const onOffer = product.oferta && effectivePrice(product) !== product.precio
  const price = onOffer ? effectivePrice(product) : variant.price
  const regular = onOffer ? product.precio : variant.regularPrice > variant.price ? variant.regularPrice : null
  const item = { ...asItem(product), sku: variant.sku, size: variant.size, price, stock: variant.stock, color: variant.color }
  const favorite = wishlist.some(row => row.id === product.id)
  const soldOut = variant.stock <= 0
  const add = () => { try { addToCart(item, Math.min(qty, variant.stock)); notify(`«${product.nombre}» se agregó al carrito.`) } catch (error) { notify(error.message, 'error') } }
  const buy = () => { try { addToCart(item, Math.min(qty, variant.stock)); navigate('/carrito') } catch (error) { notify(error.message, 'error') } }
  const quote = () => { try { requestQuote([{ ...item, qty }]); navigate('/cotizaciones') } catch (error) { notify(error.message, 'error') } }
  const specs = [
    ['Talla', variant.size || product.tamano], ['Color', variant.color || product.color], ['Material principal', product.material], ['Marca', product.marca],
    ['Peso', product.peso ? `${Number(product.peso).toLocaleString('es-CL')} g` : ''], ['Medidas', product.tamano], ['Edad mínima', product.edad ? `${product.edad} años` : ''], ['SKU', variant.sku],
  ].filter(([, value]) => value)

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 2, fontSize: '0.85rem' }}>
        <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/inicio')}>Inicio</Link>
        <Link component="button" underline="hover" color="inherit" onClick={() => navigate(`/catalogo?categoria=${encodeURIComponent(product.categoria)}`)}>{product.categoria}</Link>
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>{product.nombre}</Typography>
      </Breadcrumbs>

      <Card sx={{ p: { xs: 2, md: 3.5 }, mb: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 1fr)' }, gap: { xs: 3, md: 5 }, alignItems: 'start' }}>
          <Gallery images={catalogGallery(product)} name={product.nombre} />

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{product.categoria}</Typography>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '1.9rem' } }}>{product.nombre}</Typography>
              <Tooltip title={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
                <IconButton aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'} aria-pressed={favorite} onClick={() => toggleFavorite(item)} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  {favorite ? <Favorite sx={{ color: 'error.main' }} /> : <FavoriteBorderOutlined />}
                </IconButton>
              </Tooltip>
            </Stack>
            <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 1, color: 'text.secondary' }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Rating value={Number(product.rating) || 0} precision={0.1} size="small" readOnly />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{item.rating}</Typography>
                <Typography variant="body2">({item.reviews} {item.reviews === 1 ? 'reseña' : 'reseñas'})</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}><StorefrontOutlined sx={{ fontSize: 18 }} /><Typography variant="body2">Vendido por <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{item.seller}</Box></Typography></Stack>
            </Stack>

            <Box sx={{ my: 2.5 }}>
              {regular && <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25 }}>
                <Typography sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>{formatCLP(regular)}</Typography>
                <Box sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 800, fontSize: 12, px: 1, py: 0.25, borderRadius: 1.5 }}>-{Math.floor(100 * (1 - price / regular))}%</Box>
              </Stack>}
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.4rem' }, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'primary.main' }}>{formatCLP(price)}</Typography>
              <Typography variant="caption" color="text.secondary">IVA incluido{onOffer && product.oferta?.fin ? ` · Oferta hasta ${product.oferta.fin}` : ''}</Typography>
            </Box>

            {product.descripcion && <Typography color="text.secondary" sx={{ mb: 2.5, whiteSpace: 'pre-line' }}>{product.descripcion}</Typography>}

            <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', mb: 1 }}>Variante</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2.5 }}>
              {variants.map(row => <Button
                key={row.sku} disabled={row.stock <= 0} aria-pressed={row.sku === variant.sku}
                variant={row.sku === variant.sku ? 'contained' : 'outlined'} onClick={() => { setSku(row.sku); setQty(1) }}
                sx={{ borderColor: 'divider', color: row.sku === variant.sku ? undefined : 'text.primary', px: 2 }}
              >{[row.size, row.color].filter(Boolean).join(' · ') || 'Única'}</Button>)}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2.5 }}>
              <QuantityInput value={qty} max={Math.max(1, variant.stock)} onChange={setQty} size="medium" />
              <Typography variant="body2" sx={{ fontWeight: 700, color: soldOut ? 'error.main' : variant.stock < 10 ? 'warning.dark' : 'success.dark' }}>
                {soldOut ? 'Sin stock' : variant.stock < 10 ? `Quedan ${variant.stock} unidades` : `${variant.stock.toLocaleString('es-CL')} unidades disponibles`}
              </Typography>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25, '& .MuiButton-root': { minHeight: 48 } }}>
              <Button variant="contained" size="large" disabled={soldOut} onClick={buy}>Comprar ahora</Button>
              <Button variant="outlined" size="large" disabled={soldOut} startIcon={<AddShoppingCartOutlined />} onClick={add}>Agregar al carrito</Button>
              <Button startIcon={<DescriptionOutlined />} onClick={quote}>Solicitar cotización</Button>
              <Button startIcon={<ChatOutlined />} onClick={() => navigate('/mensajes?vendedor=' + encodeURIComponent(product.ownerRut))}>Contactar vendedor</Button>
            </Box>

            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mt: 2.5, p: 1.5, borderRadius: 2.5, bgcolor: 'secondary.light' }}>
              <LocalShippingOutlined color="primary" />
              <Typography variant="body2" color="text.secondary">El costo de despacho se calcula al confirmar la compra, según tu comuna y las tarifas del vendedor.</Typography>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 3, md: 4 } }} />
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Características</Typography>
        <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, columnGap: 4, m: 0 }}>
          {specs.map(([label, value]) => <Stack key={label} direction="row" sx={{ justifyContent: 'space-between', gap: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography component="dt" variant="body2" color="text.secondary">{label}</Typography>
            <Typography component="dd" variant="body2" sx={{ fontWeight: 700, m: 0, textAlign: 'right' }}>{value}</Typography>
          </Stack>)}
        </Box>
      </Card>

      {related.length > 0 && <Box component="section" sx={{ mb: 5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography component="h2" sx={{ fontWeight: 900, fontSize: { xs: '1.3rem', md: '1.6rem' }, letterSpacing: '-0.02em' }}>También te puede interesar</Typography>
          <Button onClick={() => navigate(`/catalogo?categoria=${encodeURIComponent(product.categoria)}`)}>Ver más</Button>
        </Stack>
        <Box sx={productGrid}>{related.map(row => <ProductCard key={row.id} item={row} favorite={wishlist.some(saved => saved.id === row.id)} onToggleFavorite={toggleFavorite} />)}</Box>
      </Box>}

      <ReviewsAndQASection key={id} entityId={id} sellerName={item.seller} />
    </Box>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  return <ProductDetailContent key={id} />
}
