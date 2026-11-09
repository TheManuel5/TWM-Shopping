import { API_MODE } from '../../services/api'
import useAuth from '../../contexts/AuthContext/useAuth'
import { catalogSeed } from '../../data/catalog'
import { writeCollection, logEvent } from '../../data/localStore'
import { notify } from '../../utils/feedback'
import { exportDocument } from '../../utils/pdfExport'
import useCollection from '../../hooks/useCollection'
import {
  AddOutlined,
  ChatOutlined,
  DeleteSweepOutlined,
  LockClockOutlined,
  PictureAsPdfOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import chairImage from '../../assets/products/chair.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import { formatCLP } from '../../utils/taxonomyData'

const INITIAL_QUOTES = [
  {
    id: 'COT-024',
    vendor: 'Tienda Sur',
    emittedDate: '20 de septiembre de 2026',
    validUntil: '5 de octubre de 2026',
    status: 'Respondida',
    total: 77350,
    items: [
      { id: 1, name: 'Zapatillas Deportivas Hombre Nike Air Max Excee', detail: 'Color: Negro/Blanco | Talla: 42', unitPrice: 29750, qty: 2, image: shoeImage },
      { id: 2, name: 'Mochila Nike Brasilia 24L', detail: 'Color: Negro', unitPrice: 17850, qty: 1, image: chairImage },
    ],
    // Historial coherente: solo fechas >= a la emisión (corrige el pendiente de P13)
    history: [
      { date: '21 sep 2026', total: 77350, reason: 'Cotización respondida con descuento por volumen' },
      { date: '20 sep 2026', total: 78900, reason: 'Precio inicial al emitir la solicitud' },
    ],
  },
  {
    id: 'COT-023',
    vendor: 'Electrohogar SpA',
    emittedDate: '15 de septiembre de 2026',
    validUntil: '30 de septiembre de 2026',
    status: 'Solicitada',
    total: 124990,
    items: [
      { id: 3, name: 'Cafetera Espresso Oster PrimaLatte', detail: 'Color: Acero', unitPrice: 124990, qty: 1, image: chairImage },
    ],
    history: [
      { date: '15 sep 2026', total: 124990, reason: 'Solicitud emitida por el cliente' },
    ],
  },
  {
    id: 'COT-019',
    vendor: 'Mundo Outdoor',
    emittedDate: '1 de agosto de 2026',
    validUntil: '16 de agosto de 2026',
    status: 'Expirada',
    total: 52900,
    items: [
      { id: 4, name: 'Termo Stanley 1,2 L', detail: 'Verde', unitPrice: 52900, qty: 1, image: shoeImage },
    ],
    history: [
      { date: '23 ago 2026', total: 52900, reason: 'Ajuste automático semanal tras 15 días' },
      { date: '1 ago 2026', total: 49900, reason: 'Precio inicial emitido' },
    ],
  },
]

export default function QuotesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [catalog] = useCollection('catalog', catalogSeed)
  const [query, setQuery] = useState('')
  const [quotes, setQuotes] = useCollection('quotes', INITIAL_QUOTES)
  const [selectedId, setSelectedId] = useState('COT-024')
  const [tab, setTab] = useState('Todas')

  const activeQuote = quotes.find((q) => q.id === selectedId) || quotes[0]

  const handleAcceptQuote = () => {
    if (!activeQuote || activeQuote.status === 'Expirada') { notify('La cotización expiró. Solicita una nueva.', 'warning'); return }
    if (activeQuote.items.some(item => !catalog.some(product => product.id === item.id && (product.tipo === 'Servicio' || product.stock >= item.qty)))) { notify('Hay artículos sin stock suficiente.', 'error'); return }
    const items = activeQuote.items.map(item => ({ ...item, quoteId: activeQuote.id, price: item.unitPrice, seller: activeQuote.vendor, key: `${item.id}:${item.sku || ''}` }))
    writeCollection('cart', cart => [...cart.filter(item => item.seller !== activeQuote.vendor), ...items])
    writeCollection('selectedVendor', activeQuote.vendor)
    setQuotes(current => current.map(quote => quote.id === activeQuote.id ? { ...quote, status: 'Aceptada por el cliente' } : quote))
    logEvent('Aceptar cotización', { id: activeQuote.id })
    notify('Cotización aceptada. Revisa la compra antes de confirmar.')
    return true
  }
  const handleDownloadQuotePDF = () => exportDocument('SHOPPING - COTIZACION', [
    `Cotización: ${activeQuote.id} | Vendedor: ${activeQuote.vendor}`,
    `Emisión: ${activeQuote.emittedDate} | Válida hasta: ${activeQuote.validUntil} | Estado: ${activeQuote.status}`,
    ...activeQuote.items.map(item => { const unitNet = item.netPrice ?? Math.round(item.unitPrice / 1.19); return `${item.qty} x ${item.name} | Neto unitario: ${formatCLP(unitNet)} | Neto línea: ${formatCLP(item.qty * unitNet)}` }),
    `Neto: ${formatCLP(activeQuote.items.reduce((sum, item) => sum + (item.netPrice ?? Math.round(item.unitPrice / 1.19)) * item.qty, 0))}`,
    `Total: ${formatCLP(activeQuote.total)}`,
    'Vigencia de 15 días. Actualización semanal de precios después del vencimiento. Eliminación al cumplir 45 días.',
  ], `cotizacion-${activeQuote.id}.pdf`)
  const visibleQuotes = quotes.filter(q => (tab === 'Todas' || q.status.startsWith(tab.slice(0, -1))) && (!query || `${q.id} ${q.vendor}`.toLowerCase().includes(query.toLowerCase())))

  if (!activeQuote) return <Card sx={{ p: 5 }}><Typography variant="h4">Aún no tienes cotizaciones</Typography><Button onClick={() => navigate('/catalogo')}>Explorar catálogo</Button></Card>
  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}


        spacing={2}
        sx={[{ justifyContent: "space-between", alignItems: { xs: 'flex-start', sm: 'center' } }, { mb: 2.5 }]}
      >
        <Box>
          <Typography variant="h4">Mis cotizaciones</Typography>
          <Typography variant="body2" color="text.secondary">
            Revisa el estado de tus cotizaciones, exporta el PDF y continúa con tu compra.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={() => navigate('/carrito')}>
          Nueva cotización
        </Button>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2.5, bgcolor: 'background.paper', borderRadius: 2.5, px: 1 }}
      >
        <Tab value="Todas" label={`Todas (${quotes.length})`} />
        <Tab value="Solicitadas" label="Solicitadas" />
        <Tab value="Respondidas" label="Respondidas" />
        <Tab value="Aceptadas" label="Aceptadas" />
        <Tab value="Expiradas" label="Expiradas" />
      </Tabs>

      <Grid container spacing={2.5}>
        {/* Lista Izquierda de Cotizaciones (P13) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar cotizaciones..." value={query} onChange={event => setQuery(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />

            <Stack spacing={1.5}>
              {visibleQuotes.map((q) => {
                const selected = q.id === activeQuote.id
                return (
                  <Paper
                    key={q.id}
                    variant="outlined"
                    onClick={() => setSelectedId(q.id)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderColor: selected ? 'primary.main' : 'divider',
                      bgcolor: selected ? 'secondary.light' : 'background.paper',
                    }}
                  >
                    <Stack direction="row"   sx={[{ justifyContent: "space-between", alignItems: "center" }, { mb: 0.5 }]}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{q.id}</Typography>
                      <StatusChip status={q.status} />
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{q.vendor}</Typography>
                    <Stack direction="row"  sx={[{ justifyContent: "space-between" }, { mt: 0.5 }]}>
                      <Typography variant="caption" color="text.secondary">{q.items.length} productos</Typography>
                      <Typography variant="caption" color="text.secondary">{q.emittedDate}</Typography>
                    </Stack>
                  </Paper>
                )
              })}
            </Stack>
          </Card>
        </Grid>

        {/* Detalle Derecho de la Cotización Seleccionada (P13) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}


              spacing={2}
              sx={[{ justifyContent: "space-between", alignItems: { xs: 'flex-start', sm: 'center' } }, { mb: 2.5 }]}
            >
              <Box>
                <Stack direction="row" spacing={1.5}  sx={{ alignItems: "center" }}>
                  <Typography variant="h4">{activeQuote.id}</Typography>
                  <StatusChip status={activeQuote.status} />
                </Stack>
                <Typography variant="subtitle2" sx={{ mt: 0.5 }}>{activeQuote.vendor}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Emitida el {activeQuote.emittedDate}
                </Typography>
              </Box>

              <Box sx={{ textAlign: { sm: 'right' } }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Válida hasta el
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                  📅 {activeQuote.validUntil}
                </Typography>
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
                  Precios fijos por 15 días
                </Typography>
              </Box>
            </Stack>

            {/* Línea de Ciclo de Vida RF22 (15 días -> Semanal -> 45 días) */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f6ff', borderRadius: 2.5, mb: 3 }}>
              <Grid container spacing={2}  sx={{ alignItems: "center" }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack direction="row" spacing={1}  sx={{ alignItems: "center" }}>
                    <LockClockOutlined color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Precios fijos</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>15 días iniciales</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack direction="row" spacing={1}  sx={{ alignItems: "center" }}>
                    <TrendingUpOutlined color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Luego actualización</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Semanal automática</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack direction="row" spacing={1}  sx={{ alignItems: "center" }}>
                    <DeleteSweepOutlined color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Eliminación física</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>A los 45 días</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Tabla de Productos Cotizados */}
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              Productos cotizados
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden', mb: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f7f6ff' }}>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Precio unitario</TableCell>
                    <TableCell align="center">Cantidad</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeQuote.items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5}  sx={{ alignItems: "center" }}>
                          <Box component="img" src={it.image} alt="" sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'cover' }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{it.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{it.detail}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{formatCLP(it.unitPrice)}</TableCell>
                      <TableCell align="center">{it.qty}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCLP(it.netPrice != null ? Math.round(it.netPrice * it.qty * 1.19) : it.unitPrice * it.qty)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2.5, mb: 3 }}>
              <Stack direction="row"   sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total de la cotización</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{formatCLP(activeQuote.total)} CLP</Typography>
              </Stack>
            </Paper>

            <Grid container spacing={2.5}  sx={{ alignItems: "flex-end" }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Historial de precios
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Precio total</TableCell>
                        <TableCell>Motivo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeQuote.history.map((h, i) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{h.date}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 800 }}>{formatCLP(h.total)}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{h.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f6ff', borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                    Notas del proveedor
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Precios válidos por 15 días. Luego se actualizarán semanalmente según disponibilidad de stock hasta los 45 días.
                  </Typography>
                </Paper>

                <Stack direction="row" spacing={1}  useFlexGap sx={{ flexWrap: "wrap" }}>
                  {['Vendedor', 'Admin'].includes(user?.role) && activeQuote.status === 'Solicitada' && <Button variant="contained" onClick={() => { setQuotes(current => current.map(quote => quote.id === activeQuote.id ? { ...quote, status: 'Respondida', history: [{ date: new Date().toLocaleDateString('es-CL'), total: quote.total, reason: 'Respuesta del vendedor' }, ...quote.history] } : quote)); logEvent('Responder cotización', { id: activeQuote.id }); notify('Cotización respondida.') }}>Responder cotización</Button>}
                  <Button variant="outlined" startIcon={<PictureAsPdfOutlined />} onClick={handleDownloadQuotePDF}>
                    Exportar PDF
                  </Button>
                  <Button variant="outlined" startIcon={<ChatOutlined />} onClick={() => navigate('/mensajes')}>
                    Enviar mensaje
                  </Button>
                  <Button
                    variant="contained"
                    disabled={activeQuote.status === 'Expirada' || (API_MODE && (activeQuote.customerRut !== user?.rut || user?.canBuy === false))}
                    startIcon={<ShoppingCartOutlined />}
                    onClick={() => {
                      if (handleAcceptQuote()) navigate('/checkout')
                    }}
                  >
                    Aceptar y comprar
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
