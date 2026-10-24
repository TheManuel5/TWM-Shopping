import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import {
  AccessTimeOutlined,
  CalendarTodayOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ChevronRightOutlined,
  CloseOutlined,
  DescriptionOutlined,
  ImageOutlined,
  LocationOnOutlined,
  MemoryOutlined,
  MessageOutlined,
  AccountCircleOutlined,
  Star,
  StarBorder,
} from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import { detalleServicio } from '../data/serviceDetailData'
import fotoPrincipal from './assets/reparacion-foto.jpg'
import fotoTaller from './assets/taller-computadores.jpg'
import fotoEquipo from './assets/reparacion-equipo.jpg'

// Fotografías de demostración recortadas de las capturas de Figma.
// Sustitúyelas por los originales exportados de Figma cuando estén disponibles.
const fotos = [
  { src: fotoPrincipal, alt: 'Técnico revisando los circuitos de un computador' },
  { src: fotoTaller, alt: 'Mantenimiento de un computador en el taller' },
  { src: fotoEquipo, alt: 'Trabajo técnico sobre un equipo electrónico' },
]

const tarjeta = {
  border: '1px solid #dfe3f4',
  borderRadius: 3,
  bgcolor: 'background.paper',
  boxShadow: 'none',
}
const iconoCirculo = {
  width: 34,
  height: 34,
  bgcolor: '#f0eeff',
  color: 'primary.main',
  borderRadius: '50%',
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
}
const formatoPrecio = (numero) => `$${numero.toLocaleString('es-CL')}`

function Valoracion({ tamano = 18 }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
      <Star sx={{ color: '#ff9b00', fontSize: tamano }} />
      <Typography variant="body2" fontWeight={700}>4.8</Typography>
      <Typography variant="body2" color="text.secondary">(126 opiniones)</Typography>
    </Box>
  )
}

function OpinionStars({ cantidad }) {
  return (
    <Box sx={{ display: 'inline-flex', color: '#ff9b00' }} aria-label={`${cantidad} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, index) =>
        index < cantidad ? <Star key={index} sx={{ fontSize: 17 }} /> : <StarBorder key={index} sx={{ fontSize: 17 }} />,
      )}
    </Box>
  )
}

export default function ServiceDetail() {
  const [fotoSeleccionada, setFotoSeleccionada] = useState(0)
  const [galeriaAbierta, setGaleriaAbierta] = useState(false)
  const [servicioId, setServicioId] = useState(detalleServicio.servicios[0].id)
  const [pestana, setPestana] = useState(0)
  const [dialogo, setDialogo] = useState(null) // 'contratar' | 'mensaje' | null
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  const opcion = detalleServicio.servicios.find((item) => item.id === servicioId)
  const cerrarDialogo = () => {
    setDialogo(null)
    setError('')
  }
  const avanzarFoto = (direccion) => {
    setFotoSeleccionada((anterior) => (anterior + direccion + fotos.length) % fotos.length)
  }
  const confirmar = () => {
    if (dialogo === 'contratar') {
      if (!fecha || !hora) {
        setError('Selecciona una fecha y un horario para continuar.')
        return
      }
      setAviso('Solicitud de contratación simulada. No se ha realizado una reserva ni un cobro.')
    } else if (dialogo === 'mensaje') {
      if (!mensaje.trim()) {
        setError('Escribe un mensaje antes de enviarlo.')
        return
      }
      setAviso('Mensaje simulado. No se envió a ningún proveedor.')
      setMensaje('')
    }
    cerrarDialogo()
  }

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto', pb: 4 }}>
      {/* Migas de pan: no creamos rutas que el proyecto aún no tiene. */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.25, flexWrap: 'wrap' }}>
        <Typography component={RouterLink} to="/inicio" sx={{ fontSize: 13, textDecoration: 'none', color: 'text.secondary' }}>
          Inicio
        </Typography>
        <ChevronRightOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography fontSize={13} color="text.secondary">Servicios</Typography>
        <ChevronRightOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography fontSize={13} color="primary.main" fontWeight={600}>{detalleServicio.categoria}</Typography>
      </Box>

      {/* Cabecera visual del servicio: fotografía, información y proveedor. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.7fr) minmax(0, 1.28fr)', lg: 'minmax(0, 1.65fr) minmax(0, 1.25fr) minmax(240px, .80fr)' },
          gap: { xs: 2.5, lg: 3 },
          mb: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Imagen principal. */}
        <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', aspectRatio: { xs: '4 / 3', sm: '1.38 / 1' }, bgcolor: '#d7dbe3' }}>
          <Box
            component="img"
            src={fotos[fotoSeleccionada].src}
            alt={fotos[fotoSeleccionada].alt}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <Button
            size="small"
            variant="contained"
            startIcon={<ImageOutlined />}
            onClick={() => setGaleriaAbierta(true)}
            sx={{ position: 'absolute', right: 12, top: 12, bgcolor: '#111827', '&:hover': { bgcolor: '#293343' }, minWidth: 0 }}
          >
            +{fotos.length - 1}
          </Button>
        </Box>

        {/* Información del servicio. */}
        <Box sx={{ pt: 0.25, minWidth: 0 }}>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 26, md: 28, lg: 29 }, fontWeight: 800, lineHeight: 1.17, mb: 1.2, letterSpacing: '-0.6px' }}
          >
            {detalleServicio.nombre}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 2 }}>
            <Valoracion />
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Typography fontSize={13} fontWeight={600} color="primary.main">{detalleServicio.proveedor}</Typography>
          </Box>
          <Typography color="text.secondary" sx={{ mb: 2.2, fontSize: 14, lineHeight: 1.65 }}>
            {detalleServicio.descripcionCorta}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3, mb: 2.1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={iconoCirculo}><AccessTimeOutlined fontSize="small" /></Box>
              <Box><Typography variant="caption" color="text.secondary">Duración estimada</Typography><Typography variant="body2" fontWeight={700}>{opcion.duracion}</Typography></Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={iconoCirculo}><AccountCircleOutlined fontSize="small" /></Box>
              <Box><Typography variant="caption" color="text.secondary">Edad mínima</Typography><Typography variant="body2" fontWeight={700}>{detalleServicio.edadMinima}</Typography></Box>
            </Box>
          </Box>
          <Typography variant="body2" fontWeight={700} sx={{ mb: 0.8 }}>Selecciona el servicio</Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={servicioId}
            onChange={(event) => setServicioId(event.target.value)}
            aria-label="Seleccionar servicio"
            sx={{ mb: 0.7, '& .MuiOutlinedInput-root': { bgcolor: 'white', minHeight: 45 } }}
          >
            {detalleServicio.servicios.map((item) => (
              <MenuItem key={item.id} value={item.id}>{item.nombre}</MenuItem>
            ))}
          </TextField>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Valor referencial: <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>{formatoPrecio(opcion.precio)}</Box> CLP
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<CalendarTodayOutlined />} onClick={() => { setDialogo('contratar'); setError('') }} sx={{ py: 1.3, px: 2.5, flexGrow: { xs: 1, sm: 0 } }}>
              Contratar servicio
            </Button>
            <Button variant="outlined" startIcon={<MessageOutlined />} onClick={() => { setDialogo('mensaje'); setError('') }} sx={{ py: 1.3, px: 2.5, flexGrow: { xs: 1, sm: 0 } }}>
              Enviar mensaje
            </Button>
          </Box>
        </Box>

        {/* Proveedor. En tablet ocupa el ancho de la sección; en escritorio se ubica a la derecha. */}
        <Paper sx={{ ...tarjeta, py: 3, px: 2.25, textAlign: 'center', gridColumn: { md: '1 / -1', lg: 'auto' } }}>
          <Box sx={{ width: 67, height: 67, borderRadius: '50%', bgcolor: '#030c2e', color: 'white', border: '4px solid #f1f3fa', mx: 'auto', mb: 1.3, display: 'grid', placeItems: 'center' }}>
            <MemoryOutlined sx={{ fontSize: 31 }} />
          </Box>
          <Typography fontWeight={800} sx={{ mb: 0.4 }}>{detalleServicio.proveedor}</Typography>
          <Valoracion tamano={16} />
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textAlign: 'left', mb: 1.5 }}>
            <CheckCircleOutlined fontSize="small" sx={{ color: '#18b96b' }} />
            <Typography variant="body2" color="text.secondary">Empresa verificada</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textAlign: 'left' }}>
            <LocationOnOutlined fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">{detalleServicio.ubicacion}</Typography>
          </Box>
        </Paper>
      </Box>

      {/* Pestañas y contenido de la descripción. */}
      <Paper sx={{ ...tarjeta, px: { xs: 2, md: 2.5 }, py: 2.25, mb: 2.2 }}>
        <Tabs value={pestana} onChange={(_, valor) => setPestana(valor)} sx={{ borderBottom: '1px solid #e3e6f0', minHeight: 38, mb: 2.4, '& .MuiTab-root': { textTransform: 'none', minHeight: 38, fontWeight: 600, px: 1.4, mr: 1.2 } }}>
          <Tab label="Descripción" />
          <Tab label="Incluye" />
          <Tab label={`Opiniones (${detalleServicio.opiniones})`} />
        </Tabs>
        {pestana === 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 3.5 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}><Box sx={{ ...iconoCirculo, borderRadius: 2, width: 28, height: 28 }}><DescriptionOutlined fontSize="small" /></Box><Typography fontWeight={700} fontSize={14}>Descripción</Typography></Box>
              <Typography fontSize={13} color="text.secondary" sx={{ lineHeight: 1.75 }}>
  {detalleServicio.descripcion}
</Typography>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}><Box sx={{ ...iconoCirculo, borderRadius: 2, width: 28, height: 28 }}><CheckCircleOutlined fontSize="small" /></Box><Typography fontWeight={700} fontSize={14}>Incluye</Typography></Box>
              {detalleServicio.incluye.map((incluye) => <Box key={incluye} sx={{ display: 'flex', gap: 0.8, mb: 1 }}><CheckOutlined sx={{ color: 'primary.main', fontSize: 18, mt: 0.1, flexShrink: 0 }} /><Typography fontSize={13} color="text.secondary">{incluye}</Typography></Box>)}
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}><Box sx={{ ...iconoCirculo, borderRadius: 2, width: 28, height: 28 }}><Star fontSize="small" /></Box><Typography fontWeight={700} fontSize={14}>Opiniones ({detalleServicio.opiniones})</Typography></Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Typography fontWeight={800} fontSize={30}>{detalleServicio.calificacion}</Typography>
                <OpinionStars cantidad={5} />
                <IconButton size="small" aria-label="Ver opiniones" onClick={() => setPestana(2)}><ChevronRightOutlined /></IconButton>
              </Box>
            </Box>
          </Box>
        )}
        {pestana === 1 && (
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0,1fr))' } }}>
            {detalleServicio.incluye.map((item) => <Box key={item} sx={{ display: 'flex', gap: 1.25, alignItems: 'center', p: 1.5, bgcolor: '#f7f6ff', borderRadius: 2 }}><CheckCircleOutlined color="primary" /><Typography fontSize={13}>{item}</Typography></Box>)}
          </Box>
        )}
        {pestana === 2 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0,1fr))' }, gap: 2 }}>
            {detalleServicio.resenas.map((resena) => (
              <Box key={resena.id} sx={{ bgcolor: '#fafaff', border: '1px solid #edf0fa', borderRadius: 2, p: 2 }}>
                <Typography fontWeight={700} fontSize={13}>{resena.nombre}</Typography>
                <Typography variant="caption" color="text.secondary">{resena.fecha}</Typography>
                <Box sx={{ mt: 0.5, mb: 1 }}><OpinionStars cantidad={resena.puntuacion} /></Box>
                <Typography fontSize={13} color="text.secondary">{resena.comentario}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Pasos de contratación. */}
      <Typography component="h2" fontWeight={800} sx={{ fontSize: 23, mb: 1.4 }}>Cómo funciona el servicio</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
        {detalleServicio.pasos.map((paso, index) => {
          const Icono = [CalendarTodayOutlined, MemoryOutlined, CheckCircleOutlined][index]
          return (
            <Paper key={paso.titulo} sx={{ ...tarjeta, px: 2, py: 2.1 }}>
              <Box sx={{ ...iconoCirculo, mb: 1.5 }}><Icono fontSize="small" /></Box>
              <Typography fontSize={14} fontWeight={800} sx={{ mb: 1.1 }}>{paso.titulo}</Typography>
              <Typography fontSize={13} color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {paso.descripcion}
              </Typography>
            </Paper>
          )
        })}
      </Box>

      {/* Galería: interactiva, con fotos de referencia locales. */}
      <Dialog open={galeriaAbierta} onClose={() => setGaleriaAbierta(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Fotografías del servicio
          <IconButton onClick={() => setGaleriaAbierta(false)} aria-label="Cerrar galería"><CloseOutlined /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="img" src={fotos[fotoSeleccionada].src} alt={fotos[fotoSeleccionada].alt} sx={{ width: '100%', maxHeight: 480, objectFit: 'contain', bgcolor: '#f5f6fa', borderRadius: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
            <Button onClick={() => avanzarFoto(-1)}>Anterior</Button>
            <Typography variant="caption" color="text.secondary">{fotoSeleccionada + 1} de {fotos.length}</Typography>
            <Button onClick={() => avanzarFoto(1)}>Siguiente</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, justifyContent: 'center' }}>
            {fotos.map((foto, index) => (
              <Box key={foto.alt} component="button" type="button" onClick={() => setFotoSeleccionada(index)} aria-label={`Ver fotografía ${index + 1}`} sx={{ p: 0, border: index === fotoSeleccionada ? '2px solid #602ff7' : '2px solid transparent', borderRadius: 1.5, cursor: 'pointer', bgcolor: 'transparent', overflow: 'hidden' }}>
                <Box component="img" src={foto.src} alt={foto.alt} sx={{ display: 'block', width: 88, height: 62, objectFit: 'cover' }} />
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Contratación y mensajes simulados: NO generan operaciones reales. */}
      <Dialog open={dialogo !== null} onClose={cerrarDialogo} fullWidth maxWidth="xs">
        <DialogTitle>{dialogo === 'contratar' ? 'Solicitar contratación' : 'Enviar mensaje al proveedor'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '12px !important' }}>
          {dialogo === 'contratar' ? (
            <>
              <Typography variant="body2" color="text.secondary">{opcion.nombre} · {formatoPrecio(opcion.precio)} CLP (referencial)</Typography>
              <TextField label="Fecha" type="date" value={fecha} onChange={(event) => setFecha(event.target.value)} fullWidth size="small" slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Horario" select value={hora} onChange={(event) => setHora(event.target.value)} fullWidth size="small">
                {['09:00', '11:00', '15:00', '17:00'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <Alert severity="info">Demostración: no se comprueba disponibilidad ni se realiza una reserva o pago real.</Alert>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">Escribe tu consulta para {detalleServicio.proveedor}.</Typography>
              <TextField multiline minRows={4} label="Tu mensaje" fullWidth value={mensaje} onChange={(event) => setMensaje(event.target.value)} />
              <Alert severity="info">El mensaje se simula localmente y no se envía al proveedor.</Alert>
            </>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={cerrarDialogo}>Cancelar</Button>
          <Button variant="contained" onClick={confirmar}>{dialogo === 'contratar' ? 'Simular solicitud' : 'Simular mensaje'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(aviso)} autoHideDuration={4800} onClose={() => setAviso('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setAviso('')} severity="success" variant="filled">{aviso}</Alert>
      </Snackbar>
    </Box>
  )
}
