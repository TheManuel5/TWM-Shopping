import {
  ArrowForward,
  CheckroomOutlined,
  CreditCardOutlined,
  HeadphonesOutlined,
  HomeOutlined,
  LaptopMacOutlined,
  LocalOfferOutlined,
  LocalShippingOutlined,
  ShoppingBagOutlined,
  SportsSoccerOutlined,
  StorefrontOutlined,
  VerifiedUserOutlined,
} from '@mui/icons-material'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import applianceImage from '../../assets/products/appliance.jpg'
import chairImage from '../../assets/products/chair.jpg'
import fashionImage from '../../assets/products/fashion.jpg'
import laptopImage from '../../assets/products/laptop.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import ProductCard from './components/ProductCard'

const heroBenefits = [
  { title: 'Envíos rápidos', detail: 'A todo el país', Icon: LocalShippingOutlined },
  { title: 'Compra segura', detail: 'Tus datos siempre protegidos', Icon: VerifiedUserOutlined },
  { title: 'Hasta 12 cuotas', detail: 'Sin interés con tarjetas bancarias', Icon: CreditCardOutlined },
]

const categories = [
  {
    eyebrow: 'TECNOLOGÍA',
    title: 'Innovación para tu día a día',
    image: laptopImage,
    background: '#eef0ff',
    color: '#4f35df',
    Icon: LaptopMacOutlined,
  },
  {
    eyebrow: 'HOGAR Y COCINA',
    title: 'Haz de tu hogar un mejor lugar',
    image: applianceImage,
    background: '#e6f7f2',
    color: '#008a6b',
    Icon: HomeOutlined,
  },
  {
    eyebrow: 'MODA',
    title: 'Tu estilo, sin límites',
    image: fashionImage,
    background: '#fdebf4',
    color: '#de1e70',
    Icon: CheckroomOutlined,
  },
  {
    eyebrow: 'DEPORTES',
    title: 'Vive lo que te apasiona',
    image: shoeImage,
    background: '#e4f8e9',
    color: '#12833b',
    Icon: SportsSoccerOutlined,
  },
]

const serviceBenefits = [
  { title: 'Envío a todo Chile', detail: 'Rápidos y confiables', Icon: LocalShippingOutlined },
  { title: 'Retiro en tienda', detail: 'Sin costo de despacho', Icon: StorefrontOutlined },
  { title: 'Múltiples medios de pago', detail: 'Tarjetas y transferencias', Icon: CreditCardOutlined },
  { title: 'Ofertas exclusivas', detail: 'Las mejores marcas', Icon: LocalOfferOutlined },
  { title: 'Te ayudamos', detail: 'Atención 100% local', Icon: HeadphonesOutlined },
]

const products = [
  {
    id: 1,
    name: 'Notebook Lenovo IdeaPad 3 15.6” Ryzen 5 16GB 512GB SSD',
    image: laptopImage,
    rating: '4.8',
    reviews: 124,
    previousPrice: '$579.990',
    price: '$449.990',
    discount: 22,
  },
  {
    id: 2,
    name: 'Smartphone 128GB Negro con pantalla de alta resolución',
    image: phoneImage,
    rating: '4.7',
    reviews: 86,
    previousPrice: '$649.990',
    price: '$479.950',
    discount: 26,
  },
  {
    id: 3,
    name: 'Licuadora Oster 1,5 litros con vaso de vidrio',
    image: applianceImage,
    rating: '4.9',
    reviews: 203,
    previousPrice: '$99.990',
    price: '$79.990',
    discount: 20,
  },
  {
    id: 4,
    name: 'Zapatillas deportivas para hombre edición urbana',
    image: shoeImage,
    rating: '4.8',
    reviews: 167,
    previousPrice: '$69.990',
    price: '$54.990',
    discount: 21,
  },
  {
    id: 5,
    name: 'Sillón de lectura ergonómico para living y dormitorio',
    image: chairImage,
    rating: '4.6',
    reviews: 96,
    previousPrice: '$129.990',
    price: '$89.990',
    discount: 31,
  },
]

function HeroBanner() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: 250, sm: 270 },
        p: { xs: 2.5, sm: 4 },
        borderRadius: 3,
        color: 'common.white',
        background: 'linear-gradient(115deg, #4d20dc 0%, #7412f8 58%, #6420f4 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.08)',
          right: '28%',
          top: -185,
        }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: '0.9fr 1.15fr 0.8fr' },
          gap: 3,
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              maxWidth: 430,
              fontSize: { xs: 'clamp(1.75rem, 9vw, 2rem)', md: '2.45rem' },
              lineHeight: 1.02,
              fontWeight: 900,
              letterSpacing: '-0.035em',
            }}
          >
            Ofertas para todo lo que necesitas
          </Typography>
          <Typography sx={{ mt: 1.5, maxWidth: 410, color: 'rgba(255,255,255,0.82)' }}>
            Las mejores marcas, grandes descuentos y hasta 12 cuotas sin interés.
          </Typography>
          <Button
            component="a"
            href="#productos-destacados"
            variant="contained"
            endIcon={<ArrowForward />}
            sx={{
              mt: 2.5,
              bgcolor: 'common.white',
              color: 'primary.main',
              '&:hover': { bgcolor: '#f4f1ff' },
            }}
          >
            Ver ofertas
          </Button>
          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 1.5, color: 'rgba(255,255,255,0.7)' }}
          >
            Tecnología, hogar, moda, deportes y mucho más.
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: '1.25fr 0.8fr 0.8fr',
            gap: 1.25,
            alignItems: 'end',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: -8,
              top: -28,
              width: 76,
              height: 76,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.75)',
              bgcolor: 'rgba(47, 9, 152, 0.35)',
              textAlign: 'center',
              fontWeight: 900,
              fontSize: 14,
              lineHeight: 1.05,
              zIndex: 2,
            }}
          >
            HASTA<br />50%<br />DCTO.
          </Box>
          {[
            { image: laptopImage, alt: 'Notebook en oferta', height: 150 },
            { image: phoneImage, alt: 'Teléfono en oferta', height: 125 },
            { image: shoeImage, alt: 'Zapatillas en oferta', height: 112 },
          ].map((item) => (
            <Box
              key={item.alt}
              sx={{
                height: item.height,
                p: 0.75,
                borderRadius: 2.5,
                bgcolor: 'rgba(255,255,255,0.96)',
                boxShadow: '0 14px 30px rgba(28, 4, 92, 0.24)',
                transform: item.height === 125 ? 'translateY(-12px)' : 'none',
              }}
            >
              <Box
                component="img"
                src={item.image}
                alt={item.alt}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1.75 }}
              />
            </Box>
          ))}
        </Box>

        <Stack spacing={1.1} sx={{ display: { xs: 'none', xl: 'flex' } }}>
          {heroBenefits.map(({ title, detail, Icon }) => (
            <Paper
              key={title}
              elevation={0}
              sx={{ p: 1.4, display: 'flex', alignItems: 'center', gap: 1.25, borderRadius: 2 }}
            >
              <Box sx={{ color: 'primary.main', display: 'grid', placeItems: 'center' }}>
                <Icon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.primary" fontWeight={800}>{title}</Typography>
                <Typography variant="caption" color="text.secondary">{detail}</Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

export default function Home() {
  const [favorites, setFavorites] = useState([])

  const toggleFavorite = (productId) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(productId)
        ? currentFavorites.filter((id) => id !== productId)
        : [...currentFavorites, productId],
    )
  }

  const addToCart = (product) => {
    console.log('Producto agregado al carrito:', product)
  }

  return (
    <Box>
      <HeroBanner />

      <Box
        component="section"
        aria-label="Categorías destacadas"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
          gap: 1.5,
          mt: 2,
        }}
      >
        {categories.map(({ eyebrow, title, image, background, color, Icon }) => (
          <Paper
            key={eyebrow}
            elevation={0}
            sx={{
              minHeight: 138,
              p: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr) 88px', sm: 'minmax(0, 1fr) 104px' },
              alignItems: 'center',
              gap: 1.25,
              borderRadius: 2.5,
              bgcolor: background,
              overflow: 'hidden',
            }}
          >
            <Box>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color }}>
                <Icon sx={{ fontSize: 15 }} />
                <Typography variant="overline" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                  {eyebrow}
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ mt: 0.75, fontWeight: 850, lineHeight: 1.15 }}>
                {title}
              </Typography>
              <Button
                component="a"
                href="#productos-destacados"
                size="small"
                endIcon={<ArrowForward />}
                sx={{ mt: 1, px: 0, color }}
              >
                Ver productos
              </Button>
            </Box>
            <Box
              component="img"
              src={image}
              alt=""
              sx={{
                width: { xs: 88, sm: 104 },
                height: { xs: 84, sm: 96 },
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
          </Paper>
        ))}
      </Box>

      <Paper
        component="section"
        variant="outlined"
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
          borderRadius: 2.5,
          overflow: 'hidden',
        }}
      >
        {serviceBenefits.map(({ title, detail, Icon }, index) => (
          <Stack
            key={title}
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: 'center',
              p: 1.75,
              borderRight: { lg: index < serviceBenefits.length - 1 ? '1px solid' : 'none' },
              borderBottom: { xs: index < serviceBenefits.length - 1 ? '1px solid' : 'none', lg: 'none' },
              borderColor: 'divider',
            }}
          >
            <Icon color="primary" fontSize="small" />
            <Box>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 800 }}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">{detail}</Typography>
            </Box>
          </Stack>
        ))}
      </Paper>

      <Box component="section" id="productos-destacados" sx={{ mt: 2.5, scrollMarginTop: 96 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1,
            mb: 1.5,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ShoppingBagOutlined color="primary" />
            <Typography
              component="h2"
              variant="h5"
              fontWeight={850}
              sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' } }}
            >
              Productos destacados
            </Typography>
          </Stack>
          <Button endIcon={<ArrowForward />} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            Ver todos los productos
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 1.5,
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite={favorites.includes(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)}
              onAddToCart={() => addToCart(product)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
