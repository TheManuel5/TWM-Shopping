import {
  Favorite,
  FavoriteBorderOutlined,
  LocalShippingOutlined,
  ShoppingCartOutlined,
  Star,
  StorefrontOutlined,
} from '@mui/icons-material'
import { Box, Card, Chip, IconButton, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({
  product,
  favorite = false,
  onToggleFavorite,
  onAddToCart,
}) {
  const navigate = useNavigate()

  return (
    <Card
      onClick={() => navigate(`/producto/${product.id}`)}
      sx={{
        p: 2,
        borderRadius: 3.5,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        height: '100%',
        bgcolor: '#ffffff',
        border: '1px solid #eef0f6',
        boxShadow: '0 2px 10px rgba(3, 12, 46, 0.03)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 28px rgba(96, 47, 247, 0.12)',
          borderColor: 'primary.light',
        },
      }}
    >
      {/* Contenedor de Imagen y Botón de Favoritos */}
      <Box
        sx={{
          position: 'relative',
          height: 175,
          borderRadius: 2.5,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafaff',
          mb: 1.5,
          p: 1.5,
        }}
      >
        <Box
          component="img"
          src={product.image}
          alt={product.name}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transition: 'transform 0.25s ease',
            '&:hover': {
              transform: 'scale(1.04)',
            },
          }}
        />

        {product.discount && (
          <Chip
            label={`-${product.discount}%`}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              bgcolor: 'error.main',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.72rem',
              height: 22,
            }}
          />
        )}

        <IconButton
          size="small"
          aria-label="Guardar en favoritos"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite?.(product.id)
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f1f3f9',
            p: 0.65,
            '&:hover': {
              bgcolor: '#ffffff',
              transform: 'scale(1.08)',
            },
          }}
        >
          {favorite ? (
            <Favorite sx={{ fontSize: 18, color: '#ef4444' }} />
          ) : (
            <FavoriteBorderOutlined sx={{ fontSize: 18, color: '#94a3b8' }} />
          )}
        </IconButton>
      </Box>

      {/* Nombre del Producto */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
          fontSize: '0.92rem',
          color: '#030c2e',
          lineHeight: 1.3,
          minHeight: '2.6em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          mb: 0.75,
        }}
      >
        {product.name}
      </Typography>

      {/* Vendedor si aplica */}
      {product.seller && (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75, color: 'text.secondary' }}>
          <StorefrontOutlined sx={{ fontSize: 14 }} />
          <Typography variant="caption" noWrap>
            {product.seller}
          </Typography>
        </Stack>
      )}

      {/* Calificaciones */}
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
        <Star sx={{ fontSize: 15, color: '#f59e0b' }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#030c2e' }}>
          {product.rating}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ({product.reviews})
        </Typography>
      </Stack>

      {/* Precios y Botón de Carrito (según Figma) */}
      <Box sx={{ mt: 'auto', pt: 1 }}>
        {product.previousPrice && (
          <Typography
            variant="caption"
            sx={{
              textDecoration: 'line-through',
              color: '#94a3b8',
              display: 'block',
              lineHeight: 1.1,
              fontSize: '0.78rem',
            }}
          >
            {product.previousPrice}
          </Typography>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              fontSize: '1.22rem',
              color: '#030c2e',
              lineHeight: 1.2,
            }}
          >
            {product.price}
          </Typography>

          <IconButton
            size="small"
            aria-label="Agregar al carrito"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart?.(product)
            }}
            sx={{
              bgcolor: 'primary.main',
              color: '#ffffff',
              borderRadius: 2.2,
              p: 1,
              boxShadow: '0 4px 12px rgba(96, 47, 247, 0.25)',
              transition: 'background-color 0.2s ease, transform 0.15s ease',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)',
              },
            }}
          >
            <ShoppingCartOutlined sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>

        {/* Etiqueta de despacho */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: '#f1f5f9',
              borderRadius: 1.2,
              px: 0.75,
              py: 0.25,
            }}
          >
            <LocalShippingOutlined sx={{ fontSize: 13, color: '#475569' }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569' }}>
              {product.shippingText || 'Envío a todo Chile'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Card>
  )
}