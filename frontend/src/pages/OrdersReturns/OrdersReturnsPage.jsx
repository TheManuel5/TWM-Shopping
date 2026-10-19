import {
  AddPhotoAlternateOutlined,
  ChatOutlined,
  CheckOutlined,
  CloseOutlined,
  CreditCardOutlined,
  Inventory2Outlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import applianceImage from '../../assets/products/appliance.jpg'
import chairImage from '../../assets/products/chair.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import { formatCLP } from '../../utils/taxonomyData'

// Datos de demostración hasta que exista una integración confirmada con el backend.
const INITIAL_RETURNS = [
  { id: 'DEV-008', orderId: '#1032', product: 'Zapatillas New Balance 574', price: 29990, qty: 1, date: '22 sep 2026', approvedDate: '23 sep 2026', status: 'Aprobada', image: shoeImage },
  { id: 'DEV-007', orderId: '#1003', product: 'Audífonos Bluetooth SoundX', price: 49990, qty: 1, date: '14 sep 2026', status: 'En proceso', image: phoneImage },
  { id: 'DEV-006', orderId: '#0988', product: 'Mochila Outdoor 25L', price: 69990, qty: 1, date: '2 sep 2026', status: 'Rechazada', image: chairImage },
  { id: 'DEV-005', orderId: '#0976', product: 'Freidora de Aire 4.5L', price: 59990, qty: 1, date: '18 ago 2026', status: 'Finalizada', image: applianceImage },
]

const RETURN_LABELS = ['Solicitada', 'Aprobada', 'Producto recibido', 'Reembolso procesado']
const MAX_PHOTOS = 3
const MAX_PHOTO_SIZE = 5 * 1024 * 1024

function ReturnProgress({ returnItem }) {
  const completedCount = returnItem.status === 'Finalizada'
    ? 4
    : returnItem.status === 'Aprobada'
      ? 2
      : 1

  return (
    <Box sx={{ position: 'relative', my: 2.5 }}>
      <Box sx={{ display: { xs: 'none', sm: 'block' }, position: 'absolute', top: 11, left: '12.5%', right: '12.5%', height: 2, bgcolor: 'divider' }} />
      {completedCount > 1 && (
        <Box sx={{ display: { xs: 'none', sm: 'block' }, position: 'absolute', top: 11, left: '12.5%', width: `${(completedCount - 1) * 25}%`, height: 2, bgcolor: 'primary.main' }} />
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, columnGap: 1, rowGap: 2 }}>
        {RETURN_LABELS.map((label, index) => {
          const completed = index < completedCount
          const date = index === 0
            ? returnItem.date
            : index === 1 && completed
              ? (returnItem.approvedDate ?? 'Completada')
              : completed
                ? 'Completado'
                : 'En espera'

          return (
            <Stack key={label} alignItems="center" spacing={0.5} sx={{ minWidth: 0, textAlign: 'center', position: 'relative' }}>
              <Box sx={{ width: 23, height: 23, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: completed ? 'primary.main' : 'background.paper', color: completed ? 'primary.contrastText' : 'text.disabled', border: '2px solid', borderColor: completed ? 'primary.main' : 'divider', zIndex: 1 }}>
                {completed && <CheckOutlined sx={{ fontSize: 15 }} />}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: completed ? 800 : 500, color: completed ? 'text.primary' : 'text.secondary', lineHeight: 1.3 }}>
                {label}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.69rem', lineHeight: 1.25 }}>
                {date}
              </Typography>
            </Stack>
          )
        })}
      </Box>
      {returnItem.status === 'Rechazada' && (
        <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>
          La solicitud fue rechazada. No hay un reembolso en curso.
        </Typography>
      )}
    </Box>
  )
}

export default function OrdersReturnsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Devoluciones')
  const [returnsList, setReturnsList] = useState(INITIAL_RETURNS)
  const [selectedDev, setSelectedDev] = useState('DEV-008')
  const [reason, setReason] = useState('Talla incorrecta')
  const [returnQty, setReturnQty] = useState(1)
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [notice, setNotice] = useState('')
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [photos, setPhotos] = useState([])
  const photoInputRef = useRef(null)
  const photoUrlsRef = useRef(new Set())

  // Liberar las URL de previsualización cuando se cierre la página.
  useEffect(() => {
    const urls = photoUrlsRef.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

  const visibleReturns = returnsList.filter((item) => statusFilter === 'Todas' || item.status === statusFilter)
  const activeReturn = visibleReturns.find((item) => item.id === selectedDev) ?? visibleReturns[0] ?? null
  const validReturnQty = Number.isInteger(returnQty) && returnQty >= 1 && returnQty <= 2

  const resetForm = () => {
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    photoUrlsRef.current.clear()
    setPhotos([])
    setReason('Talla incorrecta')
    setReturnQty(1)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const handlePhotos = (event) => {
    const files = Array.from(event.target.files ?? [])
    const validFiles = files.filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= MAX_PHOTO_SIZE)
    const freeSlots = Math.max(0, MAX_PHOTOS - photos.length)
    if (validFiles.length !== files.length || validFiles.length > freeSlots) {
      setNotice('Puedes adjuntar hasta 3 imágenes JPG, PNG o WebP de máximo 5 MB cada una.')
    }
    const incoming = validFiles.slice(0, freeSlots).map((file) => {
      const preview = URL.createObjectURL(file)
      photoUrlsRef.current.add(preview)
      return { file, preview }
    })
    setPhotos((current) => [...current, ...incoming])
    event.target.value = ''
  }

  const removePhoto = (preview) => {
    URL.revokeObjectURL(preview)
    photoUrlsRef.current.delete(preview)
    setPhotos((current) => current.filter((photo) => photo.preview !== preview))
  }

  const handleCreateReturn = () => {
    if (!validReturnQty || !reason.trim()) {
      setNotice('Selecciona un motivo y una cantidad válida.')
      return
    }
    const id = `DEV-${Date.now()}`
    const created = {
      id,
      orderId: '#1032',
      product: 'Zapatillas New Balance 574',
      price: 29990 * returnQty,
      qty: returnQty,
      date: 'Hoy',
      status: 'En proceso',
      image: shoeImage,
    }
    console.log('Solicitud de devolución simulada (no enviada al backend):', {
      id,
      pedido: created.orderId,
      motivo: reason,
      cantidad: returnQty,
      cantidadFotos: photos.length,
    })
    setReturnsList((current) => [created, ...current])
    setStatusFilter('Todas')
    setSelectedDev(id)
    resetForm()
    setNotice('Solicitud agregada a la demostración; no se envió al servidor.')
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', minWidth: 0 }}>
      <Typography component="h1" variant="h4" sx={{ mb: 0.5, fontWeight: 800, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
        Mis compras y devoluciones
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Revisa el estado de tus pedidos y gestiona tus devoluciones de forma fácil y rápida.
      </Typography>

      <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab value="Compras" label="Compras" />
        <Tab value="Devoluciones" label="Devoluciones" />
      </Tabs>

      {tab === 'Compras' ? (
        <Card variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>Pedido #1032 — compra de ejemplo</Typography>
              <Typography variant="body2" color="text.secondary">20 sep 2026 · Tienda Sur · 2 productos</Typography>
              <Typography variant="caption" color="text.secondary">El historial real está pendiente de integración con el backend.</Typography>
            </Box>
            <Button variant="outlined" onClick={() => navigate('/pedido/1032')}>Ver seguimiento de ejemplo</Button>
          </Stack>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(240px,0.95fr) minmax(0,2fr)' }, gap: 2, alignItems: 'start' }}>
          {/* Lista de devoluciones, fiel a la columna izquierda de Figma. */}
          <Box sx={{ minWidth: 0 }}>
            <Select fullWidth size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} sx={{ bgcolor: 'background.paper', mb: 1.5 }}>
              <MenuItem value="Todas">Todas las devoluciones</MenuItem>
              {['Aprobada', 'En proceso', 'Rechazada', 'Finalizada'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </Select>
            <Stack spacing={1.25}>
              {visibleReturns.map((item) => (
                <Card
                  key={item.id}
                  component="button"
                  type="button"
                  onClick={() => setSelectedDev(item.id)}
                  variant="outlined"
                  sx={{ p: 1.5, width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: 2.5, borderColor: activeReturn?.id === item.id ? 'primary.main' : 'divider', bgcolor: activeReturn?.id === item.id ? 'secondary.light' : 'background.paper', display: 'flex', gap: 1.5, alignItems: 'center', color: 'inherit', font: 'inherit' }}
                >
                  <Box component="img" src={item.image} alt="" sx={{ width: 57, height: 57, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 0.25 }}>
                      <Typography variant="subtitle2" fontWeight={900}>{item.id}</Typography>
                      <StatusChip status={item.status} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Pedido {item.orderId}</Typography>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{item.product}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.5 }}>
                      {formatCLP(item.price)} · {item.qty} {item.qty === 1 ? 'unidad' : 'unidades'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>Solicitada: {item.date}</Typography>
                  </Box>
                  <Typography color="primary.main" aria-hidden="true">›</Typography>
                </Card>
              ))}
              {visibleReturns.length === 0 && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                  <Typography variant="body2" color="text.secondary">No hay devoluciones con este estado.</Typography>
                </Paper>
              )}
            </Stack>
          </Box>

          <Stack spacing={1.5} sx={{ minWidth: 0 }}>
            <Card variant="outlined" sx={{ p: { xs: 2, sm: 2.25 }, borderRadius: 2.5, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'secondary.main', color: 'primary.main', flexShrink: 0 }}>
                  <Inventory2Outlined fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>Solicitar nueva devolución</Typography>
                  <Typography variant="caption" color="text.secondary">Completa la información de tu devolución. Esta solicitud será simulada.</Typography>
                </Box>
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,0.88fr) minmax(0,1.15fr)' }, gap: 2 }}>
                <Stack direction="row" alignItems="flex-start" spacing={1.25} sx={{ minWidth: 0 }}>
                  <Box component="img" src={shoeImage} alt="Zapatillas New Balance 574" sx={{ width: 58, height: 58, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.3 }}>Zapatillas New Balance 574</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Pedido #1032 · Talla 42 · Gris</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Vendido por Tienda Sur</Typography>
                    <Typography variant="subtitle1" fontWeight={900}>$29.990</Typography>
                  </Box>
                </Stack>

                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'minmax(0,1.4fr) minmax(95px,0.7fr)' }, gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>Motivo de la devolución</Typography>
                      <Select fullWidth size="small" value={reason} onChange={(event) => setReason(event.target.value)}>
                        <MenuItem value="Talla incorrecta">Talla incorrecta</MenuItem>
                        <MenuItem value="Producto con falla">Producto con falla de fábrica</MenuItem>
                        <MenuItem value="No coincide con descripción">No coincide con la descripción</MenuItem>
                      </Select>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>Cantidad</Typography>
                      <QuantityInput value={returnQty} max={2} onChange={setReturnQty} />
                    </Box>
                  </Box>

                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>Fotos de respaldo (opcional)</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                    {photos.map((photo) => (
                      <Box key={photo.preview} sx={{ position: 'relative' }}>
                        <Box component="img" src={photo.preview} alt={`Foto adjunta: ${photo.file.name}`} sx={{ display: 'block', width: 57, height: 57, borderRadius: 1.5, objectFit: 'cover' }} />
                        <IconButton size="small" color="error" aria-label={`Quitar foto ${photo.file.name}`} onClick={() => removePhoto(photo.preview)} sx={{ position: 'absolute', top: -7, right: -7, bgcolor: 'background.paper', p: 0.25, '&:hover': { bgcolor: 'background.paper' } }}>
                          <CloseOutlined sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Box>
                    ))}
                    <input ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={handlePhotos} />
                    <Box
                      component="button"
                      type="button"
                      disabled={photos.length >= MAX_PHOTOS}
                      onClick={() => photoInputRef.current?.click()}
                      sx={{ width: 93, height: 57, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'primary.main', color: 'primary.main', cursor: photos.length >= MAX_PHOTOS ? 'not-allowed' : 'pointer', opacity: photos.length >= MAX_PHOTOS ? 0.5 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <AddPhotoAlternateOutlined sx={{ fontSize: 19 }} />
                      <Typography variant="caption" sx={{ fontSize: '0.66rem', fontWeight: 700 }}>Agregar fotos</Typography>
                    </Box>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.69rem', mb: 1.75 }}>JPG, PNG o WebP. Máximo 3 imágenes de 5 MB.</Typography>

                  <Stack direction="row" spacing={1} justifyContent="flex-end" useFlexGap flexWrap="wrap">
                    <Button variant="outlined" size="small" onClick={resetForm}>Cancelar</Button>
                    <Button variant="contained" size="small" disabled={!validReturnQty || !reason} onClick={handleCreateReturn}>Solicitar devolución</Button>
                  </Stack>
                </Box>
              </Box>
            </Card>

            {activeReturn ? (
              <Card variant="outlined" sx={{ p: { xs: 2, sm: 2.25 }, borderRadius: 2.5, minWidth: 0 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>Solicitud de devolución {activeReturn.id}</Typography>
                    <Typography variant="caption" color="text.secondary">Pedido {activeReturn.orderId} · Solicitada el {activeReturn.date}</Typography>
                  </Box>
                  <StatusChip status={activeReturn.status} />
                </Stack>
                <ReturnProgress returnItem={activeReturn} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0,1fr))' }, gap: 1.5, mt: 2 }}>
                  <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2, minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
                      <CreditCardOutlined color="primary" sx={{ fontSize: 18 }} />
                      <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase' }}>Resumen del reembolso</Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight={900}>{formatCLP(activeReturn.price)}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Monto de demostración, sin devolución bancaria real.</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Medio de pago de ejemplo: Visa •••• 4242</Typography>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" useFlexGap flexWrap="wrap" spacing={0.5} sx={{ mb: 0.75 }}>
                      <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase' }}>Estado del reembolso</Typography>
                      <StatusChip status={activeReturn.status === 'Finalizada' ? 'Completado' : activeReturn.status === 'Rechazada' ? 'Rechazada' : 'En proceso'} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
                      {activeReturn.status === 'Rechazada'
                        ? 'La solicitud de ejemplo fue rechazada.'
                        : 'Estado demostrativo. No está conectado a pagos reales.'}
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75}>
                      <Button size="small" variant="outlined" fullWidth onClick={() => setInstructionsOpen(true)}>Ver instrucciones</Button>
                      <Button size="small" variant="outlined" fullWidth startIcon={<ChatOutlined />} onClick={() => navigate('/mensajes')}>Contactar vendedor</Button>
                    </Stack>
                  </Paper>
                </Box>
              </Card>
            ) : (
              <Card variant="outlined" sx={{ p: 3, borderRadius: 2.5 }}>
                <Typography color="text.secondary">No hay devoluciones con el filtro seleccionado.</Typography>
              </Card>
            )}
          </Stack>
        </Box>
      )}

      <Dialog open={instructionsOpen} onClose={() => setInstructionsOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Instrucciones de devolución</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Esta pantalla es una demostración. Las instrucciones reales de despacho o entrega deberán provenir del backend cuando esté disponible.</Typography>
        </DialogContent>
        <DialogActions><Button onClick={() => setInstructionsOpen(false)}>Cerrar</Button></DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice('')} message={notice} />
    </Box>
  )
}
