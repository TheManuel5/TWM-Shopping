import {
  AccessTimeOutlined,
  CalendarMonthOutlined,
  ChatOutlined,
  CheckCircleOutlined,
  DescriptionOutlined,
  FavoriteBorderOutlined,
  GroupOutlined,
  HomeOutlined,
  LocationOnOutlined,
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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import applianceImage from '../../assets/products/appliance.jpg'
import chairImage from '../../assets/products/chair.jpg'
import laptopImage from '../../assets/products/laptop.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import ReviewsAndQASection from '../../components/organisms/ReviewsAndQASection/ReviewsAndQASection'

export default function ServiceDetailPage() {
  const navigate = useNavigate()
  const [serviceOption, setServiceOption] = useState('Diagnóstico y mantenimiento')
  const [modality, setModality] = useState('A domicilio')
  const [comuna, setComuna] = useState('Osorno')

  return (
    <Box sx={{ maxWidth: 1380, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 2, fontSize: '0.85rem' }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/inicio')} sx={{ cursor: 'pointer' }}>
          Inicio
        </Link>
        <Link underline="hover" color="inherit">
          Servicios
        </Link>
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
          Computación y Tecnología
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Bloque Principal Izquierdo/Central P05 */}
        <Grid item xs={12} lg={8.5}>
          <Card sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={3}>
              {/* Galería */}
              <Grid item xs={12} md={6.5}>
                <Box
                  component="img"
                  src={laptopImage}
                  alt="Reparación y mantenimiento de computadores"
                  sx={{ width: '100%', height: 340, objectFit: 'cover', borderRadius: 3, mb: 1.5 }}
                />
                <Grid container spacing={1}>
                  {[
                    { icon: <VerifiedOutlined color="primary" />, title: 'Servicio profesional', sub: 'Técnicos certificados' },
                    { icon: <AccessTimeOutlined color="primary" />, title: 'Atención rápida', sub: '90 minutos' },
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
                  Reparación y mantenimiento de computadores
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  ★ <strong>4,8</strong> (126 opiniones) &nbsp;|&nbsp; <strong>Tecnología Austral</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Servicio técnico especializado en notebooks y PC de escritorio. Diagnóstico, mantención, limpieza interna y cambio de pasta térmica.
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Desde
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    $35.700
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
                          90 minutos
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
                          18 años
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Selecciona el servicio
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
                  Comuna
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
                </Select>

                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CalendarMonthOutlined />}
                    onClick={() => navigate('/checkout')}
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
                  >
                    <FavoriteBorderOutlined color="primary" />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 1 }}>
              Descripción del servicio
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Realizamos diagnóstico, mantención y reparación de computadores, notebooks y all-in-one en Osorno. Nuestro equipo identifica fallas de hardware y software y realiza limpieza interna para prolongar su vida útil.
            </Typography>

            <Grid container spacing={1}>
              {[
                'Diagnóstico completo del equipo',
                'Optimización del sistema operativo',
                'Limpieza interna y cambio de pasta térmica',
                'Asesoría personalizada',
                'Revisión y testeo de componentes',
                'Garantía en el servicio',
              ].map((inc) => (
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
                TA
              </Avatar>
              <Box>
                <Typography variant="h6">Tecnología Austral</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Soluciones que conectan
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  ★ 4,8 (126 opiniones)
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1} sx={{ mb: 2.5 }}>
              <Typography variant="body2">✅ Empresa verificada (RUT 77.987.654-3)</Typography>
              <Typography variant="body2">🏆 Más de 5 años en Shopping</Typography>
              <Typography variant="body2">📍 Atención en Osorno y alrededores</Typography>
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
                    Ubicación tienda física
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Av. Juan Mackenna 851, Osorno
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

      <ReviewsAndQASection sellerName="Tecnología Austral" />
    </Box>
  )
}