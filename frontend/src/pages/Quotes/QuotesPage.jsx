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
import { jsPDF } from 'jspdf'
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
      { date: '23 ago 2026', total: 52900, reason: 'Ajuste automático semanal tras 15 días (RF22)' },
      { date: '1 ago 2026', total: 49900, reason: 'Precio inicial emitido' },
    ],
  },
]

export default function QuotesPage() {
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState(INITIAL_QUOTES)
  const [selectedId, setSelectedId] = useState('COT-024')
  const [tab, setTab] = useState('Todas')

  const activeQuote = quotes.find((q) => q.id === selectedId) || quotes[0]

  // Permiso Actualizar del Cliente en Tabla 2.3: cambiar estado a "Aceptada por el cliente"
  const handleAcceptQuote = () => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === activeQuote.id ? { ...q, status: 'Aceptada por el cliente' } : q)),
    )
  }

  // Exportación nativa PDF del Documento de Cotización (Etapa 11 - Pág. 24 del PDF)
  const handleDownloadQuotePDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`SHOPPING - DOCUMENTO DE COTIZACIÓN (${activeQuote.id})`, 14, 20)
    doc.setFontSize(10)
    doc.text(`Proveedor: ${activeQuote.vendor}   |   Estado: ${activeQuote.status}`, 14, 30)
    doc.text(`Fecha de Emisión: ${activeQuote.emittedDate}`, 14, 37)
    doc.text(`Fecha de Expiración (15 días precio fijo): ${activeQuote.validUntil}`, 14, 44)
    doc.text('Regla RF22: Vigencia 15 días -> Reajuste semanal -> Eliminación a los 45 días.', 14, 51)
    doc.line(14, 56, 196, 56)

    let y = 66
    activeQuote.items.forEach((it) => {
      doc.text(`${it.qty}x ${it.name} (${formatCLP(it.unitPrice)} c/u) = ${formatCLP(it.qty * it.unitPrice)}`, 14, y)
      y += 8
    })
    doc.line(14, y + 2, 196, y + 2)
    doc.setFontSize(13)
    doc.text(`TOTAL COTIZADO: ${formatCLP(activeQuote.total)} CLP`, 14, y + 14)

    doc.save(`Documento_Cotizacion_${activeQuote.id}.pdf`)
  }

  const visibleQuotes = quotes.filter((q) => tab === 'Todas' || q.status.startsWith(tab.slice(0, -1)))

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h4">Mis cotizaciones</Typography>
          <Typography variant="body2" color="text.secondary">
            Revisa el estado de tus cotizaciones, exporta el PDF y continúa con tu compra (RF22 / RF23).
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={() => navigate('/carrito')}>
          Nueva cotización (2 productos)
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
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar cotizaciones..."
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{q.id}</Typography>
                      <StatusChip status={q.status} />
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{q.vendor}</Typography>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
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
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center">
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
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LockClockOutlined color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Precios fijos</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>15 días iniciales</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TrendingUpOutlined color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Luego actualización</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Semanal automática</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" spacing={1} alignItems="center">
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
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box component="img" src={it.image} alt="" sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'cover' }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{it.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{it.detail}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{formatCLP(it.unitPrice)}</TableCell>
                      <TableCell align="center">{it.qty}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCLP(it.unitPrice * it.qty)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2.5, mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total de la cotización</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{formatCLP(activeQuote.total)} CLP</Typography>
              </Stack>
            </Paper>

            <Grid container spacing={2.5} alignItems="flex-end">
              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f6ff', borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                    Notas del proveedor
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Precios válidos por 15 días. Luego se actualizarán semanalmente según disponibilidad de stock hasta los 45 días.
                  </Typography>
                </Paper>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="outlined" startIcon={<PictureAsPdfOutlined />} onClick={handleDownloadQuotePDF}>
                    Exportar PDF
                  </Button>
                  <Button variant="outlined" startIcon={<ChatOutlined />} onClick={() => navigate('/mensajes')}>
                    Enviar mensaje
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartOutlined />}
                    onClick={() => {
                      handleAcceptQuote()
                      navigate('/checkout')
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
