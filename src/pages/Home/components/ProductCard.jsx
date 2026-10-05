import {
  Favorite,
  FavoriteBorderOutlined,
  LocalShippingOutlined,
  ShoppingCartOutlined,
  StarRounded,
} from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'

export default function ProductCard({ product, favorite, onToggleFavorite, onAddToCart }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2.5,
        overflow: 'hidden',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 14px 32px rgba(3, 12, 46, 0.1)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: 168,
          bgcolor: '#f4f3ff',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={product.image}
          alt={product.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Chip
          label={`-${product.discount}%`}
          size="small"
          color="primary"
          sx={{ position: 'absolute', left: 10, top: 10, fontWeight: 800 }}
        />
        <IconButton
          size="small"
          onClick={onToggleFavorite}
          aria-label={favorite ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
          sx={{
            position: 'absolute',
            right: 10,
            top: 10,
            bgcolor: 'background.paper',
            color: favorite ? 'primary.main' : 'text.secondary',
            boxShadow: '0 3px 12px rgba(3, 12, 46, 0.12)',
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          {favorite ? <Favorite fontSize="small" /> : <FavoriteBorderOutlined fontSize="small" />}
        </IconButton>
      </Box>

      <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography variant="body2" fontWeight={750} lineHeight={1.35} sx={{ minHeight: 38 }}>
          {product.name}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
          <StarRounded sx={{ fontSize: 17, color: '#f5a623' }} />
          <Typography variant="caption" fontWeight={700}>{product.rating}</Typography>
          <Typography variant="caption" color="text.secondary">({product.reviews})</Typography>
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, textDecoration: 'line-through' }}
        >
          {product.previousPrice}
        </Typography>
        <Typography variant="h6" color="primary.main" fontWeight={850} lineHeight={1.2}>
          {product.price}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto', pt: 1.5 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocalShippingOutlined sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Envío a todo Chile
            </Typography>
          </Stack>
          <IconButton
            size="small"
            color="primary"
            onClick={onAddToCart}
            aria-label={`Agregar ${product.name} al carrito`}
            sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: '#d4d0ff' } }}
          >
            <ShoppingCartOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  )
}
