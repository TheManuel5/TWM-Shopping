import {
  AccessTimeOutlined,
  AddPhotoAlternateOutlined,
  DesktopWindowsOutlined,
  GroupOutlined,
  HomeOutlined,
  InfoOutlined,
  LocationOnOutlined,
  MapOutlined,
  StorefrontOutlined,
} from '@mui/icons-material'
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import applianceImage from '../../assets/products/appliance.jpg'
import laptopImage from '../../assets/products/laptop.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import { formatCLP } from '../../utils/taxonomyData'

export default function PublishServicePage() {
  const navigate = useNavigate()
  const [serviceName, setServiceName] = useState('Mantenimiento de computadores')
  const [subCategory, setSubCategory] = useState('Computación y Tecnología')
  const [duration, setDuration] = useState('90 minutos')
  const [ageRestriction, setAgeRestriction] = useState('18 años')
  const [modality, setModality] = useState('En local')
  const [comunas, setComunas] = useState(['Osorno', 'San Pablo', 'Puerto Octay', 'Purranque'])
  const [description, setDescription] = useState(
    'Revisión, limpieza y optimización de computadores de escritorio y notebooks. Incluye limpieza interna, cambio de pasta térmica y revisión de hardware.',
  )
  const [officialPrice, setOfficialPrice] = useState(35700)
  const [offerActive, setOfferActive] = useState(true)
  const [offerPrice, setOfferPrice] = useState(29750)
  const [offerFrom, setOfferFrom] = useState('2026-09-20')
  const [offerTo, setOfferTo] = useState('2026-10-20')

  const handleRemoveComuna = (com) => {
    setComunas((prev) => prev.filter((c) => c !== com))
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 1.5, fontSize: '0.85rem' }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/vendedor/inventario')} sx={{ cursor: 'pointer' }}>
          Catálogo
        </Link>
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
          Publicar servicio
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Publicar servicio
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Completa la información de tu servicio profesional o doméstico para que sea visible en Shopping (RF09).
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/vendedor/publicar-producto')}>
          Producto
        </Button>
        <Button variant="contained">Servicio</Button>
      </Stack>

      <Grid container spacing={2.5}>
        {/* Columna 1: Información Principal del Servicio (RF09 - P16) */}
        <Grid item xs={12} lg={5.5}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Información principal (RF09)
            </Typography>

            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Nombre del servicio *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              sx={{ mt: 0.5, mb: 2 }}
            />

            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Categoría *
            </Typography>
            <Grid container spacing={1.5} sx={{ mt: 0.25, mb: 2 }}>
              <Grid item xs={5}>
                <Select fullWidth size="small" value="Servicios">
                  <MenuItem value="Servicios">Servicios</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={7}>
                <Select fullWidth size="small" value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
                  <MenuItem value="Computación y Tecnología">Computación y Tecnología</MenuItem>
                  <MenuItem value="Servicios domésticos">Servicios domésticos</MenuItem>
                  <MenuItem value="Servicios profesionales">Servicios profesionales</MenuItem>
                </Select>
              </Grid>
            </Grid>

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              Fotos del servicio *
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              {[laptopImage, phoneImage, applianceImage].map((img, i) => (
                <Box key={i} component="img" src={img} alt="" sx={{ width: 76, height: 76, borderRadius: 2, objectFit: 'cover' }} />
              ))}
              <Paper
                variant="outlined"
                sx={{
                  width: 76,
                  height: 76,
                  borderStyle: 'dashed',
                  borderColor: 'primary.main',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <AddPhotoAlternateOutlined color="primary" fontSize="small" />
                <Typography variant="caption" color="primary" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                  Agregar
                </Typography>
              </Paper>
            </Stack>

            {/* Duración y Restricción Etaria (RF09 + Trigger 6) */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Duración del servicio *</Typography>
                <Select fullWidth size="small" value={duration} onChange={(e) => setDuration(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="60 minutos">60 minutos</MenuItem>
                  <MenuItem value="90 minutos">90 minutos</MenuItem>
                  <MenuItem value="120 minutos">120 minutos</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Restricción de edad *</Typography>
                <Select fullWidth size="small" value={ageRestriction} onChange={(e) => setAgeRestriction(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="Sin restricción">Sin restricción</MenuItem>
                  <MenuItem value="18 años">18 años (Mayoría legal)</MenuItem>
                </Select>
              </Grid>
            </Grid>

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
              Modalidad de atención * (Consulta JSON 2)
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {[
                { label: 'En local', Icon: StorefrontOutlined },
                { label: 'A domicilio', Icon: HomeOutlined },
                { label: 'Remoto', Icon: DesktopWindowsOutlined },
              ].map((m) => (
                <Button
                  key={m.label}
                  fullWidth
                  size="small"
                  variant={modality === m.label ? 'contained' : 'outlined'}
                  startIcon={<m.Icon fontSize="small" />}
                  onClick={() => setModality(m.label)}
                >
                  {m.label}
                </Button>
              ))}
            </Stack>

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
              Región y comunas de cobertura *
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 2 }}>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Chip label="Los Lagos" size="small" />
                {comunas.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    size="small"
                    color="secondary"
                    onDelete={() => handleRemoveComuna(c)}
                    sx={{ color: 'primary.main', fontWeight: 700 }}
                  />
                ))}
              </Stack>
            </Paper>

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              Descripción del servicio *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Card>
        </Grid>

        {/* Columna 2: Precio y Disponibilidad (RF10 - P16) */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Precio y disponibilidad
            </Typography>

            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Precio oficial (CLP) *
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={officialPrice}
              onChange={(e) => setOfficialPrice(Math.max(0, Number(e.target.value)))}
              sx={{ mt: 0.5, mb: 2 }}
            />

            <FormControlLabel
              control={<Switch checked={offerActive} onChange={(e) => setOfferActive(e.target.checked)} color="primary" />}
              label={<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Activar oferta temporal</Typography>}
              sx={{ mb: 1.5 }}
            />

            {offerActive && (
              <Stack spacing={1.75}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Precio en oferta (CLP) *</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Math.max(0, Number(e.target.value)))}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Desde *</Typography>
                  <TextField fullWidth size="small" type="date" value={offerFrom} onChange={(e) => setOfferFrom(e.target.value)} sx={{ mt: 0.5 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Hasta *</Typography>
                  <TextField fullWidth size="small" type="date" value={offerTo} onChange={(e) => setOfferTo(e.target.value)} sx={{ mt: 0.5 }} />
                </Box>
              </Stack>
            )}
          </Card>
        </Grid>

        {/* Columna 3: Vista Previa Pública en Tiempo Real (P16) */}
        <Grid item xs={12} md={6} lg={3.5}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Vista previa pública
            </Typography>
            <Box
              component="img"
              src={laptopImage}
              alt={serviceName}
              sx={{ width: '100%', height: 185, objectFit: 'cover', borderRadius: 2.5, mb: 1.5 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.75 }}>
              {serviceName}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                {formatCLP(offerActive ? offerPrice : officialPrice)}
              </Typography>
              {offerActive && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    {formatCLP(officialPrice)}
                  </Typography>
                  <Chip label="Oferta" size="small" sx={{ bgcolor: 'error.light', color: 'error.main' }} />
                </>
              )}
            </Stack>

            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeOutlined fontSize="small" color="primary" />
                <Typography variant="body2">Duración: <strong>{duration}</strong></Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <GroupOutlined fontSize="small" color="primary" />
                <Typography variant="body2">Restricción de edad: <strong>{ageRestriction}</strong></Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnOutlined fontSize="small" color="primary" />
                <Typography variant="body2">Modalidad: <strong>{modality}</strong></Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <MapOutlined fontSize="small" color="primary" />
                <Typography variant="body2">
                  Cobertura: <strong>Los Lagos</strong> ({comunas.join(', ')})
                </Typography>
              </Stack>
            </Stack>

            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'secondary.light', borderRadius: 2, mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoOutlined fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Así se verá tu servicio en Shopping. Podrás editar la información en cualquier momento.
                </Typography>
              </Stack>
            </Paper>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" fullWidth onClick={() => navigate('/vendedor/inventario')}>
                Guardar borrador
              </Button>
              <Button variant="contained" fullWidth onClick={() => navigate('/servicio/102')}>
                Publicar servicio
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}