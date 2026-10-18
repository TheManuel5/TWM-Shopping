import {
  ArrowForward,
  CreditCardOutlined,
  HeadsetMicOutlined,
  LocalOfferOutlined,
  LocalShippingOutlined,
  StorefrontOutlined,
  VerifiedUserOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Assets extraídos directamente de los frames oficiales de Figma (P07)
import catDeportes from '../../assets/home/cat_deportes.png'
import catHogar from '../../assets/home/cat_hogar.png'
import catModa from '../../assets/home/cat_moda.png'
import catTecnologia from '../../assets/home/cat_tecnologia.png'
import heroDevices from '../../assets/home/hero_devices.png'
import prodAdidas from '../../assets/home/prod_adidas.png'
import prodFreidora from '../../assets/home/prod_freidora.png'
import prodIphone from '../../assets/home/prod_iphone.png'
import prodLenovo from '../../assets/home/prod_lenovo.png'
import prodSilla from '../../assets/home/prod_silla.png'

// Assets de respaldo para servicios
import chairImage from '../../assets/products/chair.jpg'
import fashionImage from '../../assets/products/fashion.jpg'
import laptopImage from '../../assets/products/laptop.jpg'
import phoneImage from '../../assets/products/phone.jpg'

import ServiceCard from '../../components/organisms/ServiceCard/ServiceCard'
import ProductCard from './components/ProductCard'

// Beneficios laterales integrados en el Hero Banner (Figma P07)
const heroSideBenefits = [
  {
    title: 'Envíos rápidos',
    detail: 'A todo el país',
    Icon: LocalShippingOutlined,
  },
  {
    title: 'Compra segura',
    detail: 'Tus datos siempre protegidos',
    Icon: VerifiedUserOutlined,
  },
  {
    title: 'Hasta 12 cuotas',
    detail: 'Sin interés con tarjetas bancarias',
    Icon: CreditCardOutlined,
  },
]

// 4 Categorías Bento Cards destacadas (Figma P07)
const bentoCategories = [
  {
    tag: 'TECNOLOGÍA',
    title: 'Innovación para tu día a día',
    bg: '#eff2fd',
    borderColor: 'rgba(79, 70, 229, 0.12)',
    tagColor: '#4f46e5',
    btnBg: '#602ff7',
    btnHover: '#4d1ec9',
    image: catTecnologia,
    categoryName: 'Tecnología',
  },
  {
    tag: 'HOGAR Y COCINA',
    title: 'Haz de tu hogar un mejor lugar',
    bg: '#e6f4f0',
    borderColor: 'rgba(13, 148, 136, 0.12)',
    tagColor: '#0d9488',
    btnBg: '#0d9488',
    btnHover: '#0f766e',
    image: catHogar,
    categoryName: 'Hogar y Cocina',
  },
  {
    tag: 'MODA',
    title: 'Tu estilo, sin límites',
    bg: '#fbe6f2',
    borderColor: 'rgba(219, 39, 119, 0.12)',
    tagColor: '#db2777',
    btnBg: '#db2777',
    btnHover: '#be185d',
    image: catModa,
    categoryName: 'Ropa, moda y calzado',
  },
  {
    tag: 'DEPORTES',
    title: 'Vive lo que te apasiona',
    bg: '#dbfbe6',
    borderColor: 'rgba(22, 163, 74, 0.12)',
    tagColor: '#16a34a',
    btnBg: '#16a34a',
    btnHover: '#15803d',
    image: catDeportes,
    categoryName: 'Otros',
  },
]

// Barra horizontal de confianza y beneficios (5 pilares según Figma P07)
const trustBenefits = [
  {
    title: 'Envío a todo Chile',
    detail: 'Rápidos y confiables',
    Icon: LocalShippingOutlined,
  },
  {
    title: 'Retiro en tienda',
    detail: 'Sin costo de puntos',
    Icon: StorefrontOutlined,
  },
  {
    title: 'Múltiples medios de pago',
    detail: 'Tarjetas, Transferencias y más',
    Icon: CreditCardOutlined,
  },
  {
    title: 'Ofertas exclusivas',
    detail: 'Las mejores marcas',
    Icon: LocalOfferOutlined,
  },
  {
    title: 'Te ayudamos',
    detail: 'Atención 100% local',
    Icon: HeadsetMicOutlined,
  },
]

// 5 Productos Destacados exactos del frame de Figma (P07)
const featuredProducts = [
  {
    id: 1,
    name: "Notebook Lenovo IdeaPad 3 15.6' Ryzen 5 16GB 512GB SSD",
    seller: 'Lenovo Store',
    image: prodLenovo,
    rating: '4.8',
    reviews: 124,
    previousPrice: '$529.990',
    price: '$449.990',
    discount: 15,
    shippingText: 'Envío a todo Chile',
  },
  {
    id: 2,
    name: 'iPhone 15 128GB Negro',
    seller: 'Apple Store',
    image: prodIphone,
    rating: '4.7',
    reviews: 89,
    previousPrice: '$849.990',
    price: '$749.950',
    discount: 12,
    shippingText: 'Envío a todo Chile',
  },
  {
    id: 3,
    name: 'Freidora de aire Oster 5.5 litros',
    seller: 'Oster Chile',
    image: prodFreidora,
    rating: '4.9',
    reviews: 203,
    previousPrice: '$99.990',
    price: '$79.990',
    discount: 20,
    shippingText: 'Envío a todo Chile',
  },
  {
    id: 4,
    name: 'Zapatillas Adidas Grand Court Hombre',
    seller: 'Adidas Sur',
    image: prodAdidas,
    rating: '4.8',
    reviews: 167,
    previousPrice: '$69.990',
    price: '$54.990',
    discount: 21,
    shippingText: 'Envío a todo Chile',
  },
  {
    id: 5,
    name: 'Silla de escritorio ergonómica Mesh Pro',
    seller: 'ErgoDesign',
    image: prodSilla,
    rating: '4.6',
    reviews: 98,
    previousPrice: '$119.990',
    price: '$89.990',
    discount: 25,
    shippingText: 'Envío a todo Chile',
  },
]

// Servicios locales preservados para compatibilidad funcional completa
const localServices = [
  {
    id: 101,
    name: 'Veterinaria Patitas Felices',
    category: 'Salud y bienestar animal',
    comuna: 'Osorno',
    rating: '4.8',
    reviews: 93,
    image: fashionImage,
    horizontal: true,
  },
  {
    id: 102,
    name: 'Servicio Técnico Austral',
    category: 'Reparación de computadores',
    comuna: 'Osorno',
    rating: '4.7',
    reviews: 120,
    image: laptopImage,
    horizontal: true,
  },
  {
    id: 103,
    name: 'Aseo Hogar del Sur',
    category: 'Aseo y limpieza domiciliaria',
    comuna: 'Osorno',
    rating: '4.6',
    reviews: 78,
    image: chairImage,
    horizontal: true,
  },
  {
    id: 104,
    name: 'Sur Media Producciones',
    category: 'Fotografía, diseño y publicidad',
    comuna: 'Osorno',
    rating: '4.9',
    reviews: 64,
    image: phoneImage,
    horizontal: true,
  },
]

export default function Home() {
  const navigate = useNavigate()
  // Variables y hooks de estado estrictamente preservados
  const [favorites, setFavorites] = useState([1])

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1440, mx: 'auto', pb: 6 }}>
      {/* =========================================================================
          1. HERO BANNER PRINCIPAL (Figma P07)
      ========================================================================= */}
      <Box
        sx={{
          borderRadius: { xs: 4, md: 6 },
          p: { xs: 3, sm: 4, md: 5 },
          background: 'linear-gradient(135deg, #740ffb 0%, #602ff7 45%, #4c11e0 100%)',
          boxShadow: '0 16px 40px rgba(96, 47, 247, 0.22)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          mb: 4,
        }}
      >
        {/* Glow y reflejos decorativos */}
        <Box
          sx={{
            position: 'absolute',
            top: -120,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1.1fr 1.3fr',
              lg: '1fr 1.25fr 0.85fr',
            },
            gap: { xs: 3, md: 4 },
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Columna Izquierda: Textos y Botón CTA */}
          <Box>
            <Typography
              component="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.1rem', sm: '2.7rem', md: '3.1rem' },
                lineHeight: 1.06,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                mb: 2,
              }}
            >
              Ofertas para todo{' '}
              <Box component="span" sx={{ display: 'block' }}>
                lo que necesitas
              </Box>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.88)',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.45,
                maxWidth: 400,
                mb: 3.5,
              }}
            >
              Las mejores marcas, grandes descuentos y hasta{' '}
              <Box component="strong" sx={{ fontWeight: 800, color: '#ffffff' }}>
                12 cuotas sin interés
              </Box>
              .
            </Typography>

            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
              onClick={() => navigate('/catalogo')}
              sx={{
                bgcolor: '#ffffff',
                color: '#602ff7',
                fontWeight: 800,
                fontSize: '0.98rem',
                borderRadius: '50px',
                px: 3.8,
                py: 1.25,
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#f5f3ff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              Ver ofertas
            </Button>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 2.5,
                color: 'rgba(255, 255, 255, 0.72)',
                fontSize: '0.82rem',
                fontWeight: 500,
              }}
            >
              Tecnología, hogar, moda, deportes y mucho más
            </Typography>
          </Box>

          {/* Columna Central: Collage Flotante de Productos + Badge 50% DCTO */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: { xs: 2, md: 1 },
            }}
          >
            {/* Badge circular "HASTA 50% DCTO." */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: -10, sm: 0 },
                right: { xs: 15, sm: 35, md: 45 },
                width: { xs: 72, sm: 84 },
                height: { xs: 72, sm: 84 },
                borderRadius: '50%',
                bgcolor: '#1e054d',
                border: '3px solid #ffffff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                zIndex: 3,
                animation: 'pulse 3s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.04)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            >
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>
                HASTA
              </Typography>
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                50%
              </Typography>
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>
                DCTO.
              </Typography>
            </Box>

            {/* Imagen principal de dispositivos en perspectiva */}
            <Box
              component="img"
              src={heroDevices}
              alt="Ofertas en tecnología, electrónica y más"
              sx={{
                width: '100%',
                maxWidth: 520,
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 18px 30px rgba(18, 2, 48, 0.35))',
                transform: 'scale(1.02)',
              }}
            />
          </Box>

          {/* Columna Derecha: Tarjetas de Beneficios (Pills Blancas) */}
          <Stack
            spacing={1.75}
            sx={{
              display: { xs: 'none', lg: 'flex' },
              justifyContent: 'center',
            }}
          >
            {heroSideBenefits.map(({ title, detail, Icon }) => (
              <Paper
                key={title}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3.5,
                  bgcolor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: '0 8px 24px rgba(18, 2, 48, 0.12)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: '0 12px 30px rgba(18, 2, 48, 0.16)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: '#f1eeff',
                    color: '#602ff7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#030c2e', lineHeight: 1.2 }}>
                    {title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#626680', fontWeight: 500, fontSize: '0.78rem' }}>
                    {detail}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* =========================================================================
          2. BENTO CARDS DE CATEGORÍAS (Figma P07)
      ========================================================================= */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        {bentoCategories.map((cat) => (
          <Card
            key={cat.tag}
            sx={{
              bgcolor: cat.bg,
              border: `1px solid ${cat.borderColor}`,
              borderRadius: 4,
              p: 2.75,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 180,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(3, 12, 46, 0.03)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 28px rgba(3, 12, 46, 0.08)',
              },
            }}
          >
            <Box sx={{ maxWidth: '60%', zIndex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: cat.tagColor,
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  letterSpacing: '0.04em',
                  display: 'block',
                  mb: 0.75,
                }}
              >
                {cat.tag}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  fontSize: '1.18rem',
                  color: '#030c2e',
                  lineHeight: 1.25,
                  mb: 2.5,
                }}
              >
                {cat.title}
              </Typography>

              <Button
                size="small"
                variant="contained"
                onClick={() => navigate(`/catalogo?categoria=${encodeURIComponent(cat.categoryName)}`)}
                sx={{
                  bgcolor: cat.btnBg,
                  color: '#ffffff',
                  borderRadius: '30px',
                  px: 2.2,
                  py: 0.65,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: cat.btnHover,
                    boxShadow: 'none',
                  },
                }}
              >
                Ver productos →
              </Button>
            </Box>

            {/* Imagen flotante en el lateral derecho de cada tarjeta */}
            <Box
              component="img"
              src={cat.image}
              alt={cat.title}
              sx={{
                position: 'absolute',
                right: 10,
                bottom: 10,
                width: 120,
                height: 120,
                objectFit: 'contain',
                transition: 'transform 0.25s ease',
                '&:hover': {
                  transform: 'scale(1.06)',
                },
              }}
            />
          </Card>
        ))}
      </Box>

      {/* =========================================================================
          3. BARRA HORIZONTAL DE CONFIANZA Y BENEFICIOS (5 Pilares Figma P07)
      ========================================================================= */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderRadius: 3.5,
          border: '1px solid #eef0f6',
          p: { xs: 2.5, md: 3 },
          boxShadow: '0 4px 16px rgba(3, 12, 46, 0.03)',
          mb: 4.5,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: { xs: 2, lg: 3 },
            alignItems: 'center',
          }}
        >
          {trustBenefits.map(({ title, detail, Icon }, idx) => (
            <Stack
              key={title}
              direction="row"
              alignItems="center"
              spacing={1.75}
              sx={{
                position: 'relative',
                ...(idx !== 0 && {
                  pl: { lg: 2.5 },
                  borderLeft: { lg: '1px solid #eef0f6' },
                }),
              }}
            >
              <Box
                sx={{
                  color: '#602ff7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#030c2e', lineHeight: 1.2 }}>
                  {title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#626680', fontWeight: 500, fontSize: '0.78rem' }}>
                  {detail}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Paper>

      {/* =========================================================================
          4. SECCIÓN: PRODUCTOS DESTACADOS (Figma P07)
      ========================================================================= */}
      <Box sx={{ mb: 5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2.5 }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.4rem', md: '1.75rem' },
              color: '#030c2e',
              letterSpacing: '-0.02em',
            }}
          >
            Productos destacados
          </Typography>

          <Button
            onClick={() => navigate('/catalogo')}
            sx={{
              fontWeight: 800,
              color: 'primary.main',
              textTransform: 'none',
              fontSize: '0.92rem',
              p: 0.5,
              '&:hover': {
                bgcolor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            Ver todos los productos →
          </Button>
        </Stack>

        {/* Grilla de 5 columnas en Desktop (según diseño exacto de Figma) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2.5,
          }}
        >
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite={favorites.includes(product.id)}
              onToggleFavorite={toggleFavorite}
              onAddToCart={() => navigate('/carrito')}
            />
          ))}
        </Box>
      </Box>

      {/* =========================================================================
          5. SECCIÓN: SERVICIOS CERCA DE TI (Preservada para compatibilidad)
      ========================================================================= */}
      <Box sx={{ mt: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.3rem', md: '1.6rem' },
                color: '#030c2e',
                letterSpacing: '-0.02em',
              }}
            >
              Servicios cerca de ti
            </Typography>
            <Typography variant="body2" sx={{ color: '#626680', mt: 0.25 }}>
              Encuentra profesionales y servicios verificados en tu zona
            </Typography>
          </Box>

          <Button
            onClick={() => navigate('/servicio/102')}
            sx={{
              fontWeight: 800,
              color: 'primary.main',
              textTransform: 'none',
              fontSize: '0.92rem',
              '&:hover': {
                bgcolor: 'transparent',
                textDecoration: 'underline',
              },
            }}
          >
            Ver todos los servicios →
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2.5,
          }}
        >
          {localServices.map((srv) => (
            <ServiceCard
              key={srv.id}
              service={srv}
              favorite={favorites.includes(srv.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}