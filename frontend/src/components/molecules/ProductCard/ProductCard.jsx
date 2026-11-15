import { useState } from 'react'
import { AddShoppingCartOutlined, Favorite, FavoriteBorderOutlined, PlaceOutlined, StarRounded, StorefrontOutlined } from '@mui/icons-material'
import { Box, Card, IconButton, Skeleton, Stack, Tooltip, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ReferenceBadge from '../../atoms/ReferenceBadge'
import { offerOf } from '../../../data/catalog'
import { formatCLP } from '../../../utils/taxonomyData'

const clamp = lines => ({ display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' })

/** Tarjeta única de publicación (producto o servicio) para inicio, catálogo y listados. */
export default function ProductCard({ item, favorite = false, onToggleFavorite, onAddToCart }) {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)
  const service = item.type === 'Servicio'
  const soldOut = !service && item.stock <= 0
  const offer = offerOf(item)
  const open = () => navigate(service ? `/servicio/${item.id}` : `/producto/${item.id}`)
  return (
    <Card
      component="article"
      onClick={open}
      onKeyDown={event => { if (event.key === 'Enter' && event.target === event.currentTarget) open() }}
      tabIndex={0}
      aria-label={item.name}
      sx={{
        display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', overflow: 'hidden', bgcolor: 'background.paper',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover, &:focus-visible': { transform: 'translateY(-3px)', boxShadow: '0 14px 30px rgba(96,47,247,0.14)', borderColor: 'primary.light', outline: 'none' },
        '&:hover .product-card-image': { transform: 'scale(1.05)' },
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: '#f4f2ff', overflow: 'hidden' }}>
        {!loaded && <Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, height: '100%' }} />}
        <Box
          component="img" className="product-card-image" src={item.image} alt="" loading="lazy" decoding="async"
          onLoad={() => setLoaded(true)} onError={() => setLoaded(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: loaded ? (soldOut ? 0.55 : 1) : 0, transition: 'opacity 250ms ease, transform 350ms ease' }}
        />
        <ReferenceBadge image={item.image} />
        <Stack direction="row" spacing={0.75} sx={{ position: 'absolute', top: 10, left: 10 }}>
          {offer && <Box sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 800, fontSize: 12, px: 1, py: 0.25, borderRadius: 1.5 }}>-{offer.discount}%</Box>}
          {service && <Box sx={{ bgcolor: '#030c2e', color: 'white', fontWeight: 700, fontSize: 11, px: 1, py: 0.35, borderRadius: 1.5 }}>Servicio</Box>}
          {soldOut && <Box sx={{ bgcolor: 'rgba(3,12,46,0.72)', color: 'white', fontWeight: 700, fontSize: 11, px: 1, py: 0.35, borderRadius: 1.5 }}>Agotado</Box>}
        </Stack>
        <IconButton
          size="small" aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'} aria-pressed={favorite}
          onClick={event => { event.stopPropagation(); onToggleFavorite?.(item) }}
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.94)', boxShadow: '0 2px 8px rgba(3,12,46,0.12)', '&:hover': { bgcolor: 'white', transform: 'scale(1.08)' }, transition: 'transform 150ms ease' }}
        >
          {favorite ? <Favorite sx={{ fontSize: 18, color: 'error.main' }} /> : <FavoriteBorderOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />}
        </IconButton>
      </Box>

      <Box sx={{ p: 1.75, display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <Typography variant="caption" noWrap sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.02em' }}>{item.category}</Typography>
        <Typography component="h3" sx={{ ...clamp(2), fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, minHeight: '2.6em', color: 'text.primary', mt: 0.25 }}>{item.name}</Typography>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mt: 0.75, color: 'text.secondary', minWidth: 0 }}>
          <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <StarRounded sx={{ fontSize: 16, color: '#f59e0b' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>{item.rating}</Typography>
            <Typography variant="caption">({item.reviews})</Typography>
          </Stack>
          {item.seller && <Stack direction="row" spacing={0.4} sx={{ alignItems: 'center', minWidth: 0 }}>
            <StorefrontOutlined sx={{ fontSize: 14, flexShrink: 0 }} /><Typography variant="caption" noWrap>{item.seller}</Typography>
          </Stack>}
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mt: 'auto', pt: 1.5, gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            {offer && <Typography variant="caption" sx={{ display: 'block', textDecoration: 'line-through', color: 'text.disabled', lineHeight: 1.1 }}>{formatCLP(offer.regularPrice)}</Typography>}
            <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', lineHeight: 1.2, color: 'primary.main', letterSpacing: '-0.01em' }}>{formatCLP(item.price)}</Typography>
            <Stack direction="row" spacing={0.4} sx={{ alignItems: 'center', mt: 0.25, color: service ? 'text.secondary' : soldOut ? 'error.main' : item.stock < 10 ? 'warning.dark' : 'success.dark', minWidth: 0 }}>
              {service && <PlaceOutlined sx={{ fontSize: 13 }} />}
              <Typography variant="caption" noWrap sx={{ fontWeight: 600, color: 'inherit' }}>
                {service ? (item.modalidad === 'Remoto' ? 'Remoto' : item.comuna || 'Consultar ubicación') : soldOut ? 'Sin stock' : item.stock < 10 ? `Quedan ${item.stock}` : 'Disponible'}
              </Typography>
            </Stack>
          </Box>
          {onAddToCart && <Tooltip title={soldOut ? 'Sin stock' : 'Agregar al carrito'}><span>
            <IconButton
              aria-label="Agregar al carrito" disabled={soldOut}
              onClick={event => { event.stopPropagation(); onAddToCart(item) }}
              sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2.5, width: 42, height: 42, '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
            ><AddShoppingCartOutlined sx={{ fontSize: 20 }} /></IconButton>
          </span></Tooltip>}
        </Stack>
      </Box>
    </Card>
  )
}

export function ProductCardSkeleton() {
  return <Card aria-hidden="true" sx={{ height: '100%', overflow: 'hidden' }}>
    <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3', height: 'auto' }} />
    <Box sx={{ p: 1.75 }}><Skeleton width="45%" height={16} /><Skeleton width="90%" /><Skeleton width="60%" /><Skeleton width="50%" height={34} sx={{ mt: 1 }} /></Box>
  </Card>
}
