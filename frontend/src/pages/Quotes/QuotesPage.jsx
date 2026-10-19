import {
  AddOutlined,
  ArrowForwardOutlined,
  CalendarTodayOutlined,
  ChatOutlined,
  ChevronRightOutlined,
  DeleteSweepOutlined,
  LockClockOutlined,
  PictureAsPdfOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import chairImage from '../../assets/products/chair.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import { formatCLP } from '../../utils/taxonomyData'

// Datos de demostración: el backend todavía no entrega las cotizaciones del usuario.
const INITIAL_QUOTES = [
  {
    id: 'COT-024',
    vendor: 'Tienda Sur',
    emittedDate: '20 de septiembre de 2026',
    shortDate: '20 sep 2026',
    validUntil: '5 de octubre de 2026',
    status: 'Respondida',
    total: 77350,
    items: [
      { id: 1, name: 'Zapatillas Deportivas Hombre Nike Air Max Excee', detail: 'Color: Negro/Blanco | Talla: 42', unitPrice: 29750, qty: 2, image: shoeImage },
      { id: 2, name: 'Mochila Nike Brasilia 24L', detail: 'Color: Negro', unitPrice: 17850, qty: 1, image: chairImage },
    ],
    history: [
      { date: '21 sep 2026', total: 77350, reason: 'Cotización respondida con descuento por volumen' },
      { date: '20 sep 2026', total: 78900, reason: 'Precio inicial al emitir la solicitud' },
    ],
  },
  {
    id: 'COT-023',
    vendor: 'Electrohogar SpA',
    emittedDate: '15 de septiembre de 2026',
    shortDate: '15 sep 2026',
    validUntil: '30 de septiembre de 2026',
    status: 'Solicitada',
    total: 124990,
    items: [
      { id: 3, name: 'Cafetera Espresso Oster PrimaLatte', detail: 'Color: Acero', unitPrice: 124990, qty: 1, image: chairImage },
    ],
    history: [{ date: '15 sep 2026', total: 124990, reason: 'Solicitud emitida por el cliente' }],
  },
  {
    id: 'COT-019',
    vendor: 'Mundo Outdoor',
    emittedDate: '1 de agosto de 2026',
    shortDate: '1 ago 2026',
    validUntil: '16 de agosto de 2026',
    status: 'Expirada',
    total: 52900,
    items: [
      { id: 4, name: 'Termo Stanley 1,2 L', detail: 'Verde', unitPrice: 52900, qty: 1, image: shoeImage },
    ],
    history: [
      { date: '23 ago 2026', total: 52900, reason: 'Ajuste automático semanal tras 15 días (RF22)' },
      { date: '1 ago 2026', total: 49900, reason: 'Precio inicial emitido' },
    ],
  },
]

const STATUS_STYLE = {
  Solicitada: { bg: '#e7f0ff', color: '#1762d0' },
  Respondida: { bg: '#f0eaff', color: '#602ff7' },
  'Aceptada por el cliente': { bg: '#dbf7e8', color: '#13784b' },
  Expirada: { bg: '#eef0f5', color: '#68738a' },
}

const TABS = [
  { value: 'Todas', label: 'Todas', status: null },
  { value: 'Solicitadas', label: 'Solicitadas', status: 'Solicitada' },
  { value: 'Respondidas', label: 'Respondidas', status: 'Respondida' },
  { value: 'Aceptadas', label: 'Aceptadas', status: 'Aceptada por el cliente' },
  { value: 'Expiradas', label: 'Expiradas', status: 'Expirada' },
]

const MONTHS = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
}

function isExpired(dateLabel) {
  const match = dateLabel.match(/^(\d{1,2}) de ([a-záéíóú]+) de (\d{4})$/i)
  if (!match) return false
  const month = MONTHS[match[2].toLowerCase()]
  if (month === undefined) return false
  const expiration = new Date(Number(match[3]), month, Number(match[1]), 23, 59, 59)
  return expiration < new Date()
}

const panelSx = {
  minWidth: 0,
  border: '1px solid #e1e5f0',
  borderRadius: '15px',
  boxShadow: 'none',
  bgcolor: 'background.paper',
}

function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.Solicitada
  return (
    <Chip
      label={status === 'Aceptada por el cliente' ? 'Aceptada' : status}
      size="small"
      sx={{
        height: 22,
        maxWidth: '100%',
        fontSize: '0.68rem',
        fontWeight: 700,
        bgcolor: style.bg,
        color: style.color,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  )
}

function CycleStage({ icon, title, value }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: '1 1 125px' }}>
      <Box sx={{
        display: 'grid', placeItems: 'center', width: 32, height: 32,
        borderRadius: 1.5, flexShrink: 0, bgcolor: '#f0ebff', color: '#602ff7',
      }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 11.5, fontWeight: 750, lineHeight: 1.35 }}>{title}</Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.35 }}>{value}</Typography>
      </Box>
    </Stack>
  )
}

function QuoteCard({ quote, selected, onSelect }) {
  return (
    <ButtonBase
      onClick={onSelect}
      aria-pressed={selected}
      sx={{
        display: 'block', width: '100%', textAlign: 'left', border: '1px solid',
        borderColor: selected ? 'primary.main' : '#e0e5f0',
        borderRadius: '12px',
        bgcolor: selected ? '#f2efff' : '#fff',
        p: 1.75,
        transition: 'background 140ms, border-color 140ms',
        '&:hover': { bgcolor: '#f7f4ff' },
        '&:focus-visible': { outline: '2px solid #602ff7', outlineOffset: 2 },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 0.6 }}>
        <Typography fontWeight={800} sx={{ fontSize: 15, color: '#0a1736' }}>{quote.id}</Typography>
        <StatusBadge status={quote.status} />
      </Stack>
      <Typography sx={{ fontSize: 13, fontWeight: 750, mb: 0.4 }}>{quote.vendor}</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        {quote.items.length} {quote.items.length === 1 ? 'producto' : 'productos'}
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mt: 1.1 }}>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{quote.shortDate}</Typography>
        <ChevronRightOutlined fontSize="small" color="primary" />
      </Stack>
    </ButtonBase>
  )
}

export default function QuotesPage() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState(INITIAL_QUOTES)
  const [tab, setTab] = useState('Todas')
  const [selectedId, setSelectedId] = useState('COT-024')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  const tabInfo = TABS.find((item) => item.value === tab)
  const visibleQuotes = quotes.filter((quote) => {
    const statusMatches = !tabInfo?.status || quote.status === tabInfo.status
    const query = search.trim().toLocaleLowerCase('es-CL')
    const searchMatches = `${quote.id} ${quote.vendor} ${quote.status}`.toLocaleLowerCase('es-CL').includes(query)
    return statusMatches && searchMatches
  })
  const activeQuote = visibleQuotes.find((quote) => quote.id === selectedId) ?? visibleQuotes[0] ?? null
  const expiredSelection = activeQuote ? isExpired(activeQuote.validUntil) : false
  const canAccept = Boolean(activeQuote && activeQuote.status === 'Respondida' && !expiredSelection)

  const handleAcceptQuote = () => {
    if (!canAccept || !activeQuote) return
    setQuotes((current) => current.map((quote) => quote.id === activeQuote.id
      ? { ...quote, status: 'Aceptada por el cliente' }
      : quote))
    console.log('Cotización aceptada (simulación, sin pago ni compra):', { id: activeQuote.id })
    setNotice('Aceptación simulada: no se creó un pedido ni se realizó un pago.')
  }

  const handleDownloadQuotePDF = () => {
    if (!activeQuote) return
    const pdf = new jsPDF()
    pdf.setFontSize(16)
    pdf.text(`SHOPPING - COTIZACIÓN DE DEMOSTRACIÓN (${activeQuote.id})`, 14, 20)
    pdf.setFontSize(10)
    pdf.text(`Proveedor: ${activeQuote.vendor} | Estado: ${activeQuote.status}`, 14, 30)
    pdf.text(`Emitida: ${activeQuote.emittedDate}`, 14, 37)
    pdf.text(`Válida hasta: ${activeQuote.validUntil}`, 14, 44)
    pdf.text('RF22: precios fijos 15 días, ajuste semanal y eliminación a los 45 días.', 14, 51)
    pdf.line(14, 56, 196, 56)
    let y = 66
    activeQuote.items.forEach((item) => {
      const line = `${item.qty} x ${item.name} - ${formatCLP(item.unitPrice * item.qty)}`
      const wrapped = pdf.splitTextToSize(line, 178)
      pdf.text(wrapped, 14, y)
      y += wrapped.length * 6 + 2
    })
    pdf.line(14, y + 2, 196, y + 2)
    pdf.setFontSize(13)
    pdf.text(`TOTAL: ${formatCLP(activeQuote.total)} CLP`, 14, y + 13)
    pdf.setFontSize(9)
    pdf.text('Documento de ejemplo; no corresponde a una transacción real.', 14, y + 23)
    pdf.save(`Cotizacion_Demo_${activeQuote.id}.pdf`)
  }

  return (
    <Box sx={{ maxWidth: 1270, mx: 'auto', px: { xs: 1.5, sm: 2, lg: 1 }, pb: 4, minWidth: 0 }}>
      {/* Encabezado: como en Figma, el botón queda alineado a la derecha. */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        sx={{ mb: 2.5 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h1" sx={{ fontSize: { xs: 25, sm: 31 }, fontWeight: 800, color: '#091637', lineHeight: 1.2 }}>
            Mis cotizaciones
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 0.6 }}>
            Revisa el estado de tus cotizaciones y continúa con tu compra.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/carrito')}
          sx={{ flexShrink: 0, minHeight: 40, borderRadius: 2.5, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
        >
          Nueva cotización (2 productos)
        </Button>
      </Stack>

      {/* Filtros por estado: pestañas con contadores reales. */}
      <Tabs
        value={tab}
        onChange={(_, next) => setTab(next)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Filtrar cotizaciones por estado"
        sx={{
          mb: 2.5, minHeight: 45,
          border: '1px solid #e3e6ef',
          bgcolor: 'background.paper', borderRadius: 2.5,
          '& .MuiTab-root': { minHeight: 44, minWidth: 0, px: { xs: 1.25, sm: 2 }, fontSize: 12, textTransform: 'none', fontWeight: 650 },
          '& .Mui-selected': { bgcolor: '#f2efff', borderRadius: 1.5 },
          '& .MuiTabs-indicator': { height: 2 },
        }}
      >
        {TABS.map((item) => {
          const count = item.status ? quotes.filter((quote) => quote.status === item.status).length : quotes.length
          return <Tab key={item.value} value={item.value} label={`${item.label} (${count})`} />
        })}
      </Tabs>

      {/* El MUI Grid antiguo hacía que el detalle saltara debajo. CSS Grid conserva las dos columnas. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(245px, 275px) minmax(0, 1fr)' },
          alignItems: 'start', gap: 2.25, minWidth: 0,
        }}
      >
        {/* Lista izquierda */}
        <Box sx={{ minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar cotizaciones..."
            inputProps={{ 'aria-label': 'Buscar cotizaciones' }}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> } }}
            sx={{ mb: 1.3, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Stack spacing={1.15}>
            {visibleQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                selected={activeQuote?.id === quote.id}
                onSelect={() => setSelectedId(quote.id)}
              />
            ))}
            {visibleQuotes.length === 0 && (
              <Paper sx={{ ...panelSx, p: 2.5 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay cotizaciones que coincidan con este filtro o búsqueda.
                </Typography>
                <Button sx={{ mt: 1 }} size="small" onClick={() => { setTab('Todas'); setSearch('') }}>
                  Limpiar filtros
                </Button>
              </Paper>
            )}
          </Stack>
        </Box>

        {/* Detalle derecho */}
        {activeQuote ? (
          <Paper sx={{ ...panelSx, p: { xs: 2, sm: 2.5 }, minWidth: 0 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
              gap={1.5}
              sx={{ mb: 2.5 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  <Typography component="h2" sx={{ fontSize: 23, fontWeight: 800, color: '#091637' }}>{activeQuote.id}</Typography>
                  <StatusBadge status={activeQuote.status} />
                </Stack>
                <Typography sx={{ fontSize: 13.5, fontWeight: 750, mt: 0.35 }}>{activeQuote.vendor}</Typography>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.4 }}>
                  Emitida el {activeQuote.emittedDate}
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                  <CalendarTodayOutlined sx={{ fontSize: 15, color: '#602ff7' }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 750 }}>Válida hasta el {activeQuote.validUntil}</Typography>
                </Stack>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.35 }}>Precios fijos por 15 días</Typography>
              </Box>
            </Stack>

            {/* Franja de las tres etapas */}
            <Box sx={{
              p: 1.6, mb: 2.6, border: '1px solid #e1e5ef', borderRadius: 2.5, bgcolor: '#fafbfe',
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.25,
            }}>
              <CycleStage icon={<LockClockOutlined fontSize="small" />} title="Precios fijos" value="15 días iniciales" />
              <ArrowForwardOutlined sx={{ color: 'text.secondary', fontSize: 17, display: { xs: 'none', md: 'block' } }} />
              <CycleStage icon={<TrendingUpOutlined fontSize="small" />} title="Luego actualización" value="Semanal automática" />
              <ArrowForwardOutlined sx={{ color: 'text.secondary', fontSize: 17, display: { xs: 'none', md: 'block' } }} />
              <CycleStage icon={<DeleteSweepOutlined fontSize="small" />} title="Eliminación a los" value="45 días" />
            </Box>

            <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1 }}>Productos cotizados</Typography>
            <TableContainer sx={{ border: '1px solid #e0e5f0', borderRadius: 2, mb: 1.8, overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 485 }}>
                <TableHead sx={{ bgcolor: '#f7f8fc' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>Producto</TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>Precio unitario</TableCell>
                    <TableCell align="center" sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>Cantidad</TableCell>
                    <TableCell align="right" sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeQuote.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ py: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Box component="img" src={item.image} alt="" sx={{ width: 42, height: 42, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 11.5, fontWeight: 800, lineHeight: 1.25 }}>{item.name}</Typography>
                            <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{item.detail}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 11.5, whiteSpace: 'nowrap' }}>{formatCLP(item.unitPrice)}</TableCell>
                      <TableCell align="center" sx={{ fontSize: 11.5 }}>{item.qty}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 11.5, fontWeight: 750, whiteSpace: 'nowrap' }}>{formatCLP(item.unitPrice * item.qty)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Total separado, como en Figma */}
            <Box sx={{
              p: 1.6, mb: 2.6, borderRadius: 2, bgcolor: '#f7f8fc',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap',
            }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 700 }}>Total de la cotización</Typography>
              <Stack direction="row" spacing={0.5} alignItems="baseline">
                <Typography sx={{ fontSize: 20, fontWeight: 900, color: '#091637' }}>{formatCLP(activeQuote.total)}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>CLP</Typography>
              </Stack>
            </Box>

            {/* Historial y notas: dos columnas de igual altura en escritorio */}
            <Box sx={{
              display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
              gap: 1.6, alignItems: 'start', mb: 2,
            }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 1 }}>Historial de precios</Typography>
                <TableContainer sx={{ border: '1px solid #e1e5ef', borderRadius: 2, overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 330 }}>
                    <TableHead sx={{ bgcolor: '#f7f8fc' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: 10.5, px: 1 }}>Fecha</TableCell>
                        <TableCell sx={{ fontSize: 10.5, px: 1 }}>Precio total</TableCell>
                        <TableCell sx={{ fontSize: 10.5, px: 1 }}>Motivo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeQuote.history.map((row, index) => (
                        <TableRow key={`${row.date}-${index}`}>
                          <TableCell sx={{ fontSize: 10.5, px: 1, whiteSpace: 'nowrap' }}>{row.date}</TableCell>
                          <TableCell sx={{ fontSize: 10.5, px: 1, fontWeight: 750, whiteSpace: 'nowrap' }}>{formatCLP(row.total)}</TableCell>
                          <TableCell sx={{ fontSize: 10.5, px: 1 }}>{row.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, mb: 1 }}>Notas del proveedor</Typography>
                <Box sx={{ p: 1.8, bgcolor: '#f7f8fc', border: '1px solid #e1e5ef', borderRadius: 2 }}>
                  <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.6 }}>
                    Precios válidos por 15 días. Luego se actualizarán semanalmente según disponibilidad de stock hasta los 45 días.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Funciones extra: conservamos PDF, mensajes y aceptación simulada. */}
            <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1.5 }}>
              <Button size="small" variant="outlined" startIcon={<PictureAsPdfOutlined />} onClick={handleDownloadQuotePDF} sx={{ textTransform: 'none', borderRadius: 1.75 }}>
                Exportar PDF
              </Button>
              <Button size="small" variant="outlined" startIcon={<ChatOutlined />} onClick={() => navigate('/mensajes')} sx={{ textTransform: 'none', borderRadius: 1.75 }}>
                Enviar mensaje
              </Button>
              <Button
                size="small" variant="contained" startIcon={<ShoppingCartOutlined />}
                disabled={!canAccept}
                onClick={handleAcceptQuote}
                sx={{ textTransform: 'none', borderRadius: 1.75, boxShadow: 'none' }}
              >
                Aceptar cotización (simulado)
              </Button>
            </Stack>
            {expiredSelection && activeQuote.status === 'Respondida' && (
              <Alert severity="warning" sx={{ mt: 1.5, py: 0.25 }}>
                Esta cotización de demostración ya venció: no puede aceptarse ni generar una compra real.
              </Alert>
            )}
          </Paper>
        ) : (
          <Paper sx={{ ...panelSx, p: 3 }}>
            <Typography color="text.secondary">Selecciona una cotización para revisar su detalle.</Typography>
          </Paper>
        )}
      </Box>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={() => setNotice('')}
        message={notice}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}
