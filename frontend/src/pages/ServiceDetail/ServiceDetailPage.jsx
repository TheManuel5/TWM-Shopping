import {
  AccessTimeOutlined,
  ArrowBackOutlined,
  CalendarMonthOutlined,
  ChatOutlined,
  CheckCircleOutlined,
  DescriptionOutlined,
  FavoriteBorderOutlined,
  GroupOutlined,
  HomeOutlined,
  LocationOnOutlined,
  ProductionQuantityLimitsOutlined,
  StorefrontOutlined,
  VerifiedOutlined,
  WorkspacePremiumOutlined,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import laptopImage from '../../assets/products/laptop.jpg'
import ReviewsAndQASection from '../../components/organisms/ReviewsAndQASection/ReviewsAndQASection'
import { apiService } from '../../services/api'
import { formatCLP } from '../../utils/taxonomyData'

const FALLBACK_SERVICES = {
  1: {
    id: 1,
    name: 'Reparación y mantenimiento de computadores',
    category: 'Computación y Tecnología',
    price: 35700,
    duration: '90 minutos',
    minAge: '18 años',
    company: 'Tecnología Austral',
    rutEmpresa: '77.987.654-3',
    rating: 4.8,
    reviewsCount: 126,
    address: 'Av. Juan Mackenna 851, Osorno',
    description: 'Servicio técnico especializado en notebooks y PC de escritorio. Diagnóstico, mantención, limpieza interna y cambio de pasta térmica con garantía.',
    included: [
      'Diagnóstico completo del equipo',
      'Optimización del sistema operativo',
      'Limpieza interna y cambio de pasta térmica',
      'Asesoría personalizada',
      'Revisión y testeo de componentes',
      'Garantía en el servicio',
    ],
  },
}

export default function ServiceDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [service, setService] = useState(null)

  const [serviceOption, setServiceOption] = useState('Diagnóstico y mantenimiento')
  const [modality, setModality] = useState('A domicilio')
  const [comuna, setComuna] = useState('Osorno')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    const serviceIdNum = Number(id)

    apiService.getCatalogo()
      .then((items) => {
        if (!isMounted) return

        let found = null
        if (Array.isArray(items)) {
          const match = items.find(
            (it) => String(it.id || it.Id) === String(id) && (it.tipo?.toLowerCase() === 'servicio' || it.Tipo?.toLowerCase() === 'servicio')
          )
          if (match) {
            const rawId = match.id || match.Id
            found = {
              id: rawId,
              name: match.nombre || match.Nombre,
              category: match.categoria || match.Categoria || 'Servicios Profesionales',
              price: Number(match.precio || match.Precio) || 35000,
              duration: '60 - 90 min',
              minAge: '18 años',
              company: 'Servicios Profesionales Austral',
              rutEmpresa: '76.123.456-7',
              rating: 4.8,
              reviewsCount: 54,
              address: 'Centro de Servicios, Osorno',
              description: `Servicio profesional certificado disponible en la plataforma. Categoría: ${match.categoria || match.Categoria}. Especialistas en la zona de Los Lagos.`,
              included: [
                'Atención personalizada por especialistas',
                'Diagnóstico previo sin costo adicional',
                'Materiales y equipamiento profesional',
                'Garantía de satisfacción',
              ],
            }
          }
        }

        if (!found && FALLBACK_SERVICES[serviceIdNum]) {
          found = FALLBACK_SERVICES[serviceIdNum]
        }

        if (found) {
          setService(found)
        } else {
          if (!isNaN(serviceIdNum) && serviceIdNum > 0 && serviceIdNum < 5000) {
            const generatedService = {
              id: serviceIdNum,
              name: `Servicio Especializado #${serviceIdNum}`,
              category: 'Servicios Generales',
              price: 25000 + (serviceIdNum % 15) * 2000,
              duration: '60 minutos',
              minAge: '18 años',
              company: 'Emprendimiento Austral',
              rutEmpresa: '78.654.321-9',
              rating: 4.7,
              reviewsCount: 28,
              address: 'Osorno, Región de Los Lagos',
              description: 'Servicio brindado por emprendedores locales certificados. Agendamiento directo y confirmación en menos de 24 horas.',
              included: [
                'Evaluación de requerimientos',
                'Ejecución del servicio con técnicos capacitados',
                'Soporte post-atención',
              ],
            }
            setService(generatedService)
          } else {
            setError(`El servicio con identificador #${id} no se encuentra disponible.`)
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return
        if (FALLBACK_SERVICES[serviceIdNum]) {
          setService(FALLBACK_SERVICES[serviceIdNum])
        } else {
          setError(err.message || 'Error al consultar el servicio.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  // Contratar servicio -> Dirige al Checkout con el servicio cargado
  const handleHireService = () => {
    if (!service) return
    navigate('/checkout', {
      state: {
        selectedVendor: {
          vendorId: 'servicios-austral',
          vendorName: service.company,
          comuna: comuna,
          shippingCost: 0,
          items: [
            {
              id: service.id,
              name: `${service.name} (${serviceOption} - ${modality})`,
              subtitle: `Comuna: ${comuna}`,
              size: 'Servicio',
              price: service.price,
              qty: 1,
              stock: 999,
              image: laptopImage,
            },
          ],
        },
        subtotal: service.price,
        shippingCost: 0,
        total: service.price,
      },
    })
  }

  // Estado de Carga
  if (loading) {
    return (
      <Box sx={{ maxWidth: 1380, mx: 'auto', py: 10, textAlign: 'center' }}>
        <CircularProgress size={52} thickness={4} sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Cargando ficha del servicio...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Consultando disponibilidad y condiciones
        </Typography>
      </Box>
    )
  }

  // Estado de Error / Servicio inexistente
  if (error || !service) {
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
            Servicio no encontrado
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mb: 3.5, lineHeight: 1.6 }}>
            {error || `El servicio con identificador #${id} no existe o fue pausado.`}
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
              Ir al inicio
            </Button>
          </Stack>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1380, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 2, fontSize: '0.85rem' }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/inicio')} sx={{ cursor: 'pointer' }}>
          Inicio
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate('/catalogo')} sx={{ cursor: 'pointer' }}>
          Servicios
        </Link>
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
          {service.category}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Bloque Principal Izquierdo/Central P05 */}
        <Grid item xs={12} lg={8.5}>
          <Card sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={3}>
              {/* Galería e Iconos de Confianza */}
              <Grid item xs={12} md={6.5}>
                <Box
                  component="img"
                  src={laptopImage}
                  alt={service.name}
                  sx={{ width: '100%', height: 340, objectFit: 'cover', borderRadius: 3, mb: 1.5 }}
                />
                <Grid container spacing={1}>
                  {[
                    { icon: <VerifiedOutlined color="primary" />, title: 'Servicio profesional', sub: 'Técnicos certificados' },
                    { icon: <AccessTimeOutlined color="primary" />, title: 'Atención rápida', sub: service.duration },
                    { icon: <WorkspacePremiumOutlined color="primary" />, title: 'Garantía del servicio', sub: 'En todos los trabajos' },
                  ].map((b) => (
                    <Grid item xs={4} key={b.title}>
                      <Paper variant="outlined" sx={{ p: 1.25, bgcolor: 'secondary.light', borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {b.icon}
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', lineHeight: 1.1 }}>
                              {b.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                              {b.sub}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Condiciones del Servicio (RF09) */}
              <Grid item xs={12} md={5.5}>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.75 }}>
                  {service.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  ★ <strong>{service.rating}</strong> ({service.reviewsCount} opiniones) &nbsp;|&nbsp; <strong>{service.company}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {service.description}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Valor del servicio
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {formatCLP(service.price)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    IVA incluido
                  </Typography>
                </Stack>

                {/* Duración y Restricción de edad (RF09) */}
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeOutlined color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Duración estimada
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {service.duration}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <GroupOutlined color="primary" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Edad mínima
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {service.minAge}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Selecciona la opción
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={serviceOption}
                  onChange={(e) => setServiceOption(e.target.value)}
                  sx={{ mb: 1.5 }}
                >
                  <MenuItem value="Diagnóstico y mantenimiento">Diagnóstico y mantenimiento</MenuItem>
                  <MenuItem value="Formateo y respaldo">Formateo y respaldo de datos</MenuItem>
                  <MenuItem value="Armado gamer">Armado y optimización de PC</MenuItem>
                </Select>

                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Modalidad de atención
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                  <Button
                    fullWidth
                    variant={modality === 'A domicilio' ? 'contained' : 'outlined'}
                    startIcon={<HomeOutlined />}
                    onClick={() => setModality('A domicilio')}
                  >
                    A domicilio
                  </Button>
                  <Button
                    fullWidth
                    variant={modality === 'En local' ? 'contained' : 'outlined'}
                    startIcon={<StorefrontOutlined />}
                    onClick={() => setModality('En local')}
                  >
                    En local
                  </Button>
                </Stack>

                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Comuna de atención
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={comuna}
                  onChange={(e) => setComuna(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="Osorno">Osorno</MenuItem>
                  <MenuItem value="Puerto Montt">Puerto Montt</MenuItem>
                  <MenuItem value="Río Negro">Río Negro</MenuItem>
                  <MenuItem value="Frutillar">Frutillar</MenuItem>
                  <MenuItem value="Puerto Varas">Puerto Varas</MenuItem>
                </Select>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CalendarMonthOutlined />}
                    onClick={handleHireService}
                  >
                    Contratar servicio
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DescriptionOutlined />}
                    onClick={() => navigate('/cotizaciones')}
                  >
                    Solicitar cotización
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ChatOutlined />}
                    onClick={() => navigate('/mensajes')}
                  >
                    Enviar mensaje
                  </Button>
                  <IconButton
                    onClick={() => navigate('/favoritos')}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}
                    title="Añadir a favoritos"
                  >
                    <FavoriteBorderOutlined color="primary" />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 1 }}>
              ¿Qué incluye este servicio?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {service.description}
            </Typography>

            <Grid container spacing={1}>
              {service.included?.map((inc) => (
                <Grid item xs={12} sm={6} key={inc}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleOutlined color="primary" fontSize="small" />
                    <Typography variant="body2">{inc}</Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>

        {/* Ficha Derecha de Empresa (P05) */}
        <Grid item xs={12} lg={3.5}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'text.primary', fontWeight: 800 }}>
                {service.company.slice(0, 2).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">{service.company}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Servicios Verificados
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  ★ {service.rating} ({service.reviewsCount} opiniones)
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1} sx={{ mb: 2.5 }}>
              <Typography variant="body2">✅ Empresa verificada (RUT {service.rutEmpresa})</Typography>
              <Typography variant="body2">🏆 Más de 5 años en Shopping</Typography>
              <Typography variant="body2">📍 Cobertura en {comuna} y alrededores</Typography>
            </Stack>

            <Button variant="outlined" fullWidth sx={{ mb: 2.5 }} onClick={() => navigate('/catalogo')}>
              Ver más de esta empresa
            </Button>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <LocationOnOutlined color="primary" fontSize="small" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Ubicación y atención
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.address}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="flex-start">
                <AccessTimeOutlined color="primary" fontSize="small" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Horario de atención
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lunes a viernes: 09:00 a 19:00
                    <br />
                    Sábado: 09:00 a 14:00
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <ReviewsAndQASection sellerName={service.company} />
    </Box>
  )
}
