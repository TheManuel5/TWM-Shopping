import {
  AddPhotoAlternateOutlined,
  ChatOutlined,
  CreditCardOutlined,
  Inventory2Outlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import applianceImage from '../../assets/products/appliance.jpg'
import chairImage from '../../assets/products/chair.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import OrderStepper from '../../components/molecules/OrderStepper/OrderStepper'
import { formatCLP } from '../../utils/taxonomyData'

const INITIAL_RETURNS = [
  { id: 'DEV-008', orderId: '#1032', product: 'Zapatillas New Balance 574', price: 29990, qty: 1, date: '22 sep 2026', status: 'Aprobada', image: shoeImage },
  { id: 'DEV-007', orderId: '#1003', product: 'Audífonos Bluetooth SoundX', price: 49990, qty: 1, date: '14 sep 2026', status: 'En proceso', image: phoneImage },
  { id: 'DEV-006', orderId: '#0988', product: 'Mochila Outdoor 25L', price: 69990, qty: 1, date: '2 sep 2026', status: 'Rechazada', image: chairImage },
  { id: 'DEV-005', orderId: '#0976', product: 'Freidora de Aire 4.5L', price: 59990, qty: 1, date: '18 ago 2026', status: 'Finalizada', image: applianceImage },
]

const RETURN_STEPS = [
  { label: 'Solicitada', description: '22 sep 2026' },
  { label: 'Aprobada', description: '23 sep 2026' },
  { label: 'Producto recibido', description: 'En espera' },
  { label: 'Reembolso procesado', description: 'En espera' },
]

export default function OrdersReturnsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Devoluciones')
  const [returnsList, setReturnsList] = useState(INITIAL_RETURNS)
  const [selectedDev, setSelectedDev] = useState('DEV-008')
  const [reason, setReason] = useState('Talla incorrecta')
  const [returnQty, setReturnQty] = useState(1)

  const activeReturn = returnsList.find((r) => r.id === selectedDev) || returnsList[0]

  const handleCreateReturn = () => {
    const newId = `DEV-00${returnsList.length + 5}`
    const created = {
      id: newId,
      orderId: '#1032',
      product: 'Zapatillas New Balance 574',
      price: 29990 * returnQty,
      qty: returnQty,
      date: 'Hoy',
      status: 'En proceso',
      image: shoeImage,
    }
    setReturnsList((prev) => [created, ...prev])
    setSelectedDev(newId)
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Mis compras y devoluciones
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Revisa el estado de tus pedidos y gestiona tus solicitudes de devolución y reembolso (RF29 / RF30).
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab value="Compras" label="Compras" onClick={() => navigate('/pedido/1032')} />
        <Tab value="Devoluciones" label="Devoluciones" />
      </Tabs>

      <Grid container spacing={2.5}>
        {/* Columna Izquierda: Listado de Expedientes DEV (P14) */}
        <Grid item xs={12} md={4}>
          <Select fullWidth size="small" value="Todas" sx={{ bgcolor: 'background.paper', mb: 2 }}>
            <MenuItem value="Todas">Todas las devoluciones</MenuItem>
          </Select>

          <Stack spacing={1.5}>
            {returnsList.map((dev) => {
              const selected = dev.id === activeReturn.id
              return (
                <Card
                  key={dev.id}
                  onClick={() => setSelectedDev(dev.id)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: selected ? 'secondary.light' : 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box component="img" src={dev.image} alt="" sx={{ width: 62, height: 62, borderRadius: 2, objectFit: 'cover' }} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{dev.id}</Typography>
                      <StatusChip status={dev.status} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Pedido {dev.orderId}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                      {dev.product}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatCLP(dev.price)} · {dev.qty} unidad · Solicitada: {dev.date}
                    </Typography>
                  </Box>
                </Card>
              )
            })}
          </Stack>
        </Grid>

        {/* Columna Derecha: Crear Solicitud + Seguimiento de Reembolso (P14) */}
        <Grid item xs={12} md={8}>
          <Stack spacing={2.5}>
            {/* Bloque Superior: Solicitar nueva devolución */}
            <Card sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Inventory2Outlined color="primary" />
                <Box>
                  <Typography variant="h6">Solicitar nueva devolución</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completa la información de tu devolución para aumentar el stock tras su aprobación (Trigger 10).
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2.5} alignItems="center">
                <Grid item xs={12} md={5}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box component="img" src={shoeImage} alt="" sx={{ width: 72, height: 72, borderRadius: 2, objectFit: 'cover' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Zapatillas New Balance 574
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Pedido #1032 · Talla 42 · Gris
                        <br />
                        Vendido por Tienda Sur
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        $29.990
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Grid container spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={7}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                        Motivo de la devolución
                      </Typography>
                      <Select fullWidth size="small" value={reason} onChange={(e) => setReason(e.target.value)}>
                        <MenuItem value="Talla incorrecta">Talla incorrecta</MenuItem>
                        <MenuItem value="Producto con falla">Producto con falla de fábrica</MenuItem>
                        <MenuItem value="No coincide con descripción">No coincide con la descripción</MenuItem>
                      </Select>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                        Cantidad
                      </Typography>
                      <QuantityInput value={returnQty} max={2} onChange={setReturnQty} />
                    </Grid>
                  </Grid>

                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                    Fotos de respaldo (opcional)
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    {[shoeImage, chairImage].map((img, i) => (
                      <Box key={i} component="img" src={img} alt="" sx={{ width: 58, height: 58, borderRadius: 2, objectFit: 'cover' }} />
                    ))}
                    <Paper
                      variant="outlined"
                      sx={{
                        width: 110,
                        height: 58,
                        borderStyle: 'dashed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <AddPhotoAlternateOutlined fontSize="small" color="primary" />
                      <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>Agregar fotos</Typography>
                    </Paper>
                  </Stack>

                  <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                    <Button variant="outlined">Cancelar</Button>
                    <Button variant="contained" onClick={handleCreateReturn}>
                      Solicitar devolución
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Card>

            {/* Bloque Inferior: Seguimiento del Expediente y Reembolso (P14) */}
            <Card sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6">Solicitud de devolución {activeReturn.id}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pedido {activeReturn.orderId} · Solicitada el {activeReturn.date}
                  </Typography>
                </Box>
                <StatusChip status={activeReturn.status} />
              </Stack>

              <OrderStepper
                activeStep={activeReturn.status === 'Finalizada' ? 4 : 2}
                steps={RETURN_STEPS}
              />

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f6ff', borderRadius: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                      Resumen del reembolso
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
                      {formatCLP(activeReturn.price)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Se devolverá al medio de pago original registrado en la venta:
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CreditCardOutlined fontSize="small" color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Visa •••• 4242</Typography>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f6ff', borderRadius: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Estado del reembolso
                      </Typography>
                      <StatusChip status={activeReturn.status === 'Finalizada' ? 'Completado' : 'En proceso'} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Tu reembolso se está gestionando. Te avisaremos apenas se haya acreditado en tu cuenta.
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" fullWidth>
                        Ver instrucciones
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<ChatOutlined />}
                        onClick={() => navigate('/mensajes')}
                      >
                        Contactar vendedor
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}