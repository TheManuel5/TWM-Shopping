import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import {
  AddOutlined,
  ArrowForwardOutlined,
  CalendarTodayOutlined,
  ChatOutlined,
  CheckCircleOutlined,
  ChevronRightOutlined,
  DeleteOutlined,
  HistoryOutlined,
  Inventory2Outlined,
  LockOutlined,
  SearchOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material'
import { cotizacionesIniciales } from '../data/quotesData'

const pestañas = [
  { etiqueta: 'Todas', estado: 'Todas' },
  { etiqueta: 'Solicitadas', estado: 'Solicitada' },
  { etiqueta: 'Respondidas', estado: 'Respondida' },
  { etiqueta: 'Aceptadas', estado: 'Aceptada' },
  { etiqueta: 'Expiradas', estado: 'Expirada' },
]

const estilosEstado = {
  Solicitada: { fondo: '#e7f0ff', texto: '#1762d0' },
  Respondida: { fondo: '#f0eaff', texto: '#602ff7' },
  Aceptada: { fondo: '#def8ea', texto: '#087b45' },
  Expirada: { fondo: '#edf0f6', texto: '#65718b' },
}

const formatoPesos = (valor) =>
  typeof valor === 'number' ? `$${valor.toLocaleString('es-CL')}` : 'Por definir'

const totalCotizacion = (cotizacion) => {
  if (cotizacion.productos.some((producto) => producto.precioUnitario === null)) return null
  return cotizacion.productos.reduce(
    (total, producto) => total + producto.precioUnitario * producto.cantidad,
    0,
  )
}

const estiloPanel = {
  bgcolor: 'background.paper',
  border: '1px solid #e0e5f1',
  borderRadius: 2.5,
  boxShadow: 'none',
}

function Estado({ estado }) {
  const estilo = estilosEstado[estado] ?? estilosEstado.Solicitada
  return (
    <Chip
      label={estado}
      size="small"
      sx={{
        bgcolor: estilo.fondo,
        color: estilo.texto,
        fontSize: 11,
        fontWeight: 700,
        height: 23,
        '& .MuiChip-label': { px: 1.2 },
      }}
    />
  )
}

function Etapa({ icono, titulo, detalle }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
      <Box sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, bgcolor: '#eeeaff', color: 'primary.main', borderRadius: 1.5, flexShrink: 0 }}>
        {icono}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{titulo}</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.3 }}>{detalle}</Typography>
      </Box>
    </Box>
  )
}

function DetalleCotizacion({ cotizacion, onMensaje, onAceptar }) {
  const total = totalCotizacion(cotizacion)
  const puedeAceptar = cotizacion.estado === 'Respondida'

  return (
    <Paper sx={{ ...estiloPanel, p: { xs: 2, sm: 2.5 }, minWidth: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2.25 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography component="h2" sx={{ fontSize: 24, fontWeight: 800, color: 'text.primary' }}>{cotizacion.id}</Typography>
            <Estado estado={cotizacion.estado} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{cotizacion.empresa}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.5 }}>Emitida el {cotizacion.fechaLarga}</Typography>
        </Box>
        {cotizacion.fechaVencimiento && (
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Box sx={{ display: 'flex', gap: 0.7, alignItems: 'center', justifyContent: { sm: 'flex-end' }, color: 'primary.main' }}>
              <CalendarTodayOutlined sx={{ fontSize: 17 }} />
              <Typography sx={{ fontSize: 12, color: 'text.primary', fontWeight: 700 }}>{cotizacion.fechaVencimiento}</Typography>
            </Box>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>Fecha de referencia de la cotización</Typography>
          </Box>
        )}
      </Box>

      {cotizacion.estado === 'Respondida' || cotizacion.estado === 'Aceptada' ? (
        <Box sx={{ bgcolor: '#f8f9fc', border: '1px solid #e1e6f0', borderRadius: 2, p: 1.4, display: 'flex', gap: 1, alignItems: 'center', mb: 2.5, flexWrap: 'wrap' }}>
          <Etapa icono={<LockOutlined fontSize="small" />} titulo="Precios fijos" detalle={`${cotizacion.diasPrecioFijo} días`} />
          <ArrowForwardOutlined sx={{ fontSize: 16, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }} />
          <Etapa icono={<TrendingUpOutlined fontSize="small" />} titulo="Luego actualización" detalle={cotizacion.frecuenciaActualizacion?.toLowerCase() ?? '—'} />
          <ArrowForwardOutlined sx={{ fontSize: 16, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }} />
          <Etapa icono={<DeleteOutlined fontSize="small" />} titulo="Eliminación a los" detalle={`${cotizacion.diasEliminacion} días`} />
        </Box>
      ) : (
        <Alert severity={cotizacion.estado === 'Expirada' ? 'warning' : 'info'} sx={{ mb: 2.5 }}>
          {cotizacion.estado === 'Expirada'
            ? 'Esta cotización expiró. Solicita una nueva para obtener precios vigentes.'
            : 'La cotización está pendiente de respuesta del proveedor.'}
        </Alert>
      )}

      <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1.1 }}>Productos cotizados</Typography>
      <TableContainer sx={{ border: '1px solid #e0e5f0', borderRadius: 1.5 }}>
        <Table size="small" sx={{ minWidth: 450 }}>
          <TableHead sx={{ bgcolor: '#f7f8fc' }}>
            <TableRow>
              {['Producto', 'Precio unitario', 'Cantidad', 'Subtotal'].map((nombre, i) => (
                <TableCell key={nombre} align={i === 0 ? 'left' : 'right'} sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', py: 1.1 }}>
                  {nombre}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {cotizacion.productos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell sx={{ py: 1.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ bgcolor: '#f1f3f8', width: 44, height: 44, borderRadius: 1.2, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 25 }} aria-hidden="true">
                      {producto.icono ?? '📦'}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>{producto.nombre}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{producto.detalle}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700 }}>{formatoPesos(producto.precioUnitario)}</TableCell>
                <TableCell align="right" sx={{ fontSize: 12, fontWeight: 700 }}>{producto.cantidad}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700 }}>
                  {formatoPesos(producto.precioUnitario === null ? null : producto.precioUnitario * producto.cantidad)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ bgcolor: '#f7f8fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, borderRadius: 1.5, p: 1.6, mt: 1.2, mb: 2.2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 700 }}>Total de la cotización</Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.7 }}>
          <Typography sx={{ fontSize: 23, fontWeight: 800 }}>{formatoPesos(total)}</Typography>
          {total !== null && <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>CLP</Typography>}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' }, gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 1 }}>
            <HistoryOutlined sx={{ color: 'text.secondary', fontSize: 18 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 13 }}>Historial de precios</Typography>
          </Box>
          {cotizacion.historial.length ? (
            <TableContainer sx={{ border: '1px solid #e0e5f0', borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f7f8fc' }}>
                  <TableRow>
                    {['Fecha', 'Precio total', 'Motivo'].map((nombre) => (
                      <TableCell key={nombre} sx={{ fontWeight: 700, fontSize: 10, color: 'text.secondary', px: 0.9, py: 0.8 }}>{nombre}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cotizacion.historial.map((registro, index) => (
                    <TableRow key={`${registro.fecha}-${index}`}>
                      <TableCell sx={{ fontSize: 10.5, fontWeight: 700, px: 0.9, whiteSpace: 'nowrap' }}>{registro.fecha}</TableCell>
                      <TableCell sx={{ fontSize: 10.5, fontWeight: 700, px: 0.9, whiteSpace: 'nowrap' }}>{formatoPesos(registro.total)}</TableCell>
                      <TableCell sx={{ fontSize: 10.5, color: 'text.secondary', px: 0.9 }}>{registro.motivo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ border: '1px solid #e0e5f0', borderRadius: 1.5, p: 2, color: 'text.secondary', fontSize: 12 }}>
              Aún no hay historial de precios.
            </Box>
          )}
        </Box>
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1 }}>
            <Inventory2Outlined sx={{ color: 'text.secondary', fontSize: 18 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 13 }}>Notas del proveedor</Typography>
          </Box>
          <Box sx={{ bgcolor: '#f8f9fc', border: '1px solid #e0e5f0', borderRadius: 1.5, p: 1.4, flexGrow: 1 }}>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.55 }}>{cotizacion.notas}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.2, flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" startIcon={<ChatOutlined />} onClick={() => onMensaje(cotizacion)}>
              Enviar mensaje
            </Button>
            {puedeAceptar && (
              <Button size="small" variant="contained" startIcon={<CheckCircleOutlined />} onClick={() => onAceptar(cotizacion)}>
                Aceptar y comprar
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

export default function Quotes() {
  const [cotizaciones, setCotizaciones] = useState(() => cotizacionesIniciales.map((cotizacion) => ({ ...cotizacion })))
  const [pestañaActiva, setPestañaActiva] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [seleccionId, setSeleccionId] = useState('COT-024')
  const [dialogoNuevo, setDialogoNuevo] = useState(false)
  const [nueva, setNueva] = useState({ empresa: 'Tienda Sur', producto: '', cantidad: '1' })
  const [errorNuevo, setErrorNuevo] = useState('')
  const [cotizacionMensaje, setCotizacionMensaje] = useState(null)
  const [textoMensaje, setTextoMensaje] = useState('')
  const [cotizacionAceptar, setCotizacionAceptar] = useState(null)
  const [aviso, setAviso] = useState('')

  const cotizacionesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return cotizaciones.filter((cotizacion) => {
      const estadoCoincide = pestañaActiva === 'Todas' || cotizacion.estado === pestañaActiva
      const textoCoincide = `${cotizacion.id} ${cotizacion.empresa}`.toLowerCase().includes(texto)
      return estadoCoincide && textoCoincide
    })
  }, [cotizaciones, pestañaActiva, busqueda])

  const seleccionada = cotizacionesFiltradas.find((cotizacion) => cotizacion.id === seleccionId)
    ?? cotizacionesFiltradas[0]
    ?? null

  const crearCotizacion = () => {
    if (!nueva.producto.trim() || !Number.isInteger(Number(nueva.cantidad)) || Number(nueva.cantidad) < 1) {
      setErrorNuevo('Escribe un producto y una cantidad entera mayor que cero.')
      return
    }
    const siguienteNumero = Math.max(24, ...cotizaciones.map((cotizacion) => Number(cotizacion.id.replace('COT-', '')) || 0)) + 1
    const id = `COT-${String(siguienteNumero).padStart(3, '0')}`
    const fecha = new Date()
    const fechaCorta = fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
    const fechaLarga = fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    const cotizacionNueva = {
      id,
      empresa: nueva.empresa,
      estado: 'Solicitada',
      fechaCorta,
      fechaLarga,
      fechaVencimiento: null,
      diasPrecioFijo: null,
      frecuenciaActualizacion: null,
      diasEliminacion: 45,
      productos: [{ id: 'p1', nombre: nueva.producto.trim(), detalle: 'Precio pendiente de respuesta', cantidad: Number(nueva.cantidad), precioUnitario: null, icono: '📦' }],
      historial: [],
      notas: 'Pendiente de respuesta del proveedor.',
    }
    setCotizaciones((actuales) => [cotizacionNueva, ...actuales])
    setSeleccionId(id)
    setPestañaActiva('Todas')
    setBusqueda('')
    setDialogoNuevo(false)
    setNueva({ empresa: 'Tienda Sur', producto: '', cantidad: '1' })
    setErrorNuevo('')
    setAviso('Cotización creada en esta demostración. No se envió a un proveedor.')
  }

  const aceptarCotizacion = () => {
    if (!cotizacionAceptar) return
    setCotizaciones((actuales) => actuales.map((cotizacion) =>
      cotizacion.id === cotizacionAceptar.id ? { ...cotizacion, estado: 'Aceptada' } : cotizacion,
    ))
    setPestañaActiva('Todas')
    setSeleccionId(cotizacionAceptar.id)
    setCotizacionAceptar(null)
    setAviso('Cotización marcada como aceptada en la demostración. No se realizó ninguna compra.')
  }

  return (
    <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={800} sx={{ color: 'text.primary', fontSize: { xs: 26, sm: 30 }, mb: 0.5 }}>
            Mis cotizaciones
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13 }}>
            Revisa el estado de tus cotizaciones y continúa con tu compra.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setDialogoNuevo(true)} sx={{ px: 2.5, borderRadius: 5 }}>
          Nueva cotización
        </Button>
      </Box>

      <Paper sx={{ ...estiloPanel, mb: 2.2, overflow: 'hidden' }}>
        <Tabs
          value={pestañaActiva}
          onChange={(_, valor) => setPestañaActiva(valor)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Filtrar cotizaciones por estado"
          sx={{ minHeight: 44, px: 0.5, '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontSize: 12, px: { xs: 1.5, sm: 2.3 }, fontWeight: 500 }, '& .Mui-selected': { color: 'primary.main', bgcolor: '#f0eaff', borderRadius: 1.5, fontWeight: 700 }, '& .MuiTabs-indicator': { display: 'none' } }}
        >
          {pestañas.map((pestaña) => {
            const cantidad = pestaña.estado === 'Todas'
              ? cotizaciones.length
              : cotizaciones.filter((cotizacion) => cotizacion.estado === pestaña.estado).length
            return <Tab key={pestaña.estado} value={pestaña.estado} label={`${pestaña.etiqueta} (${cantidad})`} />
          })}
        </Tabs>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(230px, 0.43fr) minmax(0, 1fr)' }, gap: 2.2, alignItems: 'start' }}>
        <Box sx={{ minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar cotizaciones..."
            aria-label="Buscar cotizaciones"
            slotProps={{ input: { startAdornment: <SearchOutlined sx={{ fontSize: 19, mr: 1, color: 'text.secondary' }} /> } }}
            sx={{ mb: 1.3, bgcolor: 'white' }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
            {cotizacionesFiltradas.map((cotizacion) => {
              const activa = seleccionada?.id === cotizacion.id
              return (
                <Paper
                  key={cotizacion.id}
                  component="button"
                  type="button"
                  onClick={() => setSeleccionId(cotizacion.id)}
                  aria-pressed={activa}
                  sx={{
                    ...estiloPanel,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    p: 1.6,
                    bgcolor: activa ? '#f0eaff' : '#fff',
                    borderColor: activa ? 'primary.main' : '#e0e5f1',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.5, mb: 0.8 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{cotizacion.id}</Typography>
                    <Estado estado={cotizacion.estado} />
                  </Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.2 }}>{cotizacion.empresa}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{cotizacion.productos.length} {cotizacion.productos.length === 1 ? 'producto' : 'productos'}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{cotizacion.fechaCorta}</Typography>
                    <ChevronRightOutlined sx={{ color: activa ? 'primary.main' : 'text.secondary', fontSize: 19 }} />
                  </Box>
                </Paper>
              )
            })}
            {cotizacionesFiltradas.length === 0 && (
              <Paper sx={{ ...estiloPanel, p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>No hay cotizaciones para esta búsqueda o estado.</Typography>
              </Paper>
            )}
          </Box>
        </Box>

        {seleccionada ? (
          <DetalleCotizacion cotizacion={seleccionada} onMensaje={setCotizacionMensaje} onAceptar={setCotizacionAceptar} />
        ) : (
          <Paper sx={{ ...estiloPanel, p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">Selecciona otra pestaña o cambia la búsqueda para ver una cotización.</Typography>
          </Paper>
        )}
      </Box>

      <Dialog open={dialogoNuevo} onClose={() => setDialogoNuevo(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nueva cotización de demostración</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          <Typography color="text.secondary" sx={{ fontSize: 12 }}>Esta pantalla aún no está conectada al carrito ni al backend. Los datos quedarán guardados solo hasta recargar la página.</Typography>
          <TextField select size="small" label="Tienda" value={nueva.empresa} onChange={(event) => setNueva((actual) => ({ ...actual, empresa: event.target.value }))}>
            {['Tienda Sur', 'Electrohogar SpA', 'Mundo Outdoor'].map((empresa) => <MenuItem key={empresa} value={empresa}>{empresa}</MenuItem>)}
          </TextField>
          <TextField size="small" required label="Producto o servicio" value={nueva.producto} onChange={(event) => setNueva((actual) => ({ ...actual, producto: event.target.value }))} inputProps={{ maxLength: 120 }} />
          <TextField size="small" required type="number" label="Cantidad" value={nueva.cantidad} onChange={(event) => setNueva((actual) => ({ ...actual, cantidad: event.target.value }))} slotProps={{ htmlInput: { min: 1, step: 1 } }} />
          {errorNuevo && <Alert severity="error">{errorNuevo}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setDialogoNuevo(false); setErrorNuevo('') }}>Cancelar</Button>
          <Button variant="contained" onClick={crearCotizacion}>Crear cotización</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(cotizacionMensaje)} onClose={() => setCotizacionMensaje(null)} fullWidth maxWidth="sm">
        <DialogTitle>Mensaje para {cotizacionMensaje?.empresa ?? 'proveedor'}</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, mb: 2 }}>Mensaje asociado a {cotizacionMensaje?.id}. Simulación local, sin envío real.</Typography>
          <TextField fullWidth multiline minRows={4} label="Tu mensaje" value={textoMensaje} onChange={(event) => setTextoMensaje(event.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCotizacionMensaje(null)}>Cancelar</Button>
          <Button variant="contained" disabled={!textoMensaje.trim()} onClick={() => { setCotizacionMensaje(null); setTextoMensaje(''); setAviso('Mensaje registrado en la demostración. No se envió al proveedor.') }}>Guardar mensaje de prueba</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(cotizacionAceptar)} onClose={() => setCotizacionAceptar(null)} fullWidth maxWidth="xs">
        <DialogTitle>Aceptar cotización</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14 }}>
            ¿Marcar {cotizacionAceptar?.id} como aceptada? Esta acción solo actualiza los datos de prueba y no realiza un pago ni una compra.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCotizacionAceptar(null)}>Cancelar</Button>
          <Button variant="contained" onClick={aceptarCotizacion}>Marcar aceptada</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(aviso)} autoHideDuration={5000} onClose={() => setAviso('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" onClose={() => setAviso('')} sx={{ width: '100%' }}>{aviso}</Alert>
      </Snackbar>
    </Box>
  )
}
