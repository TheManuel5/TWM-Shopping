import { catalogImage } from '../../utils/catalogImages'
import { API_MODE, apiService } from '../../services/api'
import { catalogSeed } from '../../data/catalog'
import useCollection from '../../hooks/useCollection'
import { checkout } from '../../data/commerce'
import {
  AccountBalanceOutlined,
  AddOutlined,
  CreditCardOutlined,
  HomeOutlined,
  LocalShippingOutlined,
  LockOutlined,
  StorefrontOutlined,
  VerifiedUserOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Skeleton,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'


import useAuth from '../../contexts/AuthContext/useAuth' // <-- IMPORTANTE: Importamos el contexto

import { formatCLP } from '../../utils/taxonomyData'

export default function CheckoutPage() {
  const navigate = useNavigate()

  // <-- IMPORTANTE: Obtenemos el usuario actual que inició sesión
  const { user } = useAuth()

  const [deliveryMode, setDeliveryMode] = useState('Despacho')
  const [selectedAddress, setSelectedAddress] = useState('DIR-001')
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta')
  const [cardLast4, setCardLast4] = useState('')
  const [transferCode, setTransferCode] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Estado para la carga de la transacción en el backend
  const [isProcessing, setIsProcessing] = useState(false)

  const [cart] = useCollection('cart', [])
  const [vendor] = useCollection('selectedVendor', '')
  const items = cart.filter(item => item.seller === vendor)
  const [addresses] = useCollection('addresses:' + user?.rut, [{ id: 'DIR-001', name: 'Casa', street: user?.direccion || 'Av. Manuel Rodríguez', number: '1234', commune: 'Osorno', region: 'Los Lagos', primary: true }])
  const address = addresses.find(row => String(row.id) === String(selectedAddress)) || addresses.find(row => row.primary) || addresses[0]
  const [zones] = useCollection('zones', [{ comuna: 'Osorno', rate: 3570 }])
  const [savedMethod] = useCollection('shippingMethod', 'zona')
  const method = API_MODE ? items[0]?.shippingMethod || 'zona' : savedMethod
  const [catalog] = useCollection('catalog', catalogSeed)
  const baseRate = zones.find(zone => zone.comuna === address?.commune && (!zone.ownerRut || zone.ownerRut === items[0]?.ownerRut))?.rate ?? 5950
  const billableKg = items.reduce((sum, item) => { const product = catalog.find(product => product.id === item.id); const dimensions = product?.dimensiones; return sum + Math.max((product?.peso || 0) / 1000, dimensions ? dimensions.ancho * dimensions.alto * dimensions.fondo / 5000 : 0) * item.qty }, 0)
  const localShippingCost = deliveryMode === 'Despacho' ? baseRate + (method === 'volumen' ? Math.round(billableKg * 850) : 0) : 0
  const subtotalProducts = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const localTotal = subtotalProducts + localShippingCost
  const localNet = Math.round(localTotal / 1.19)
  const localIva = localTotal - localNet
  const [requestId] = useState(() => crypto.randomUUID())
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)
  const [previewBusy, setPreviewBusy] = useState(false)
  const previewPayload = JSON.stringify({ requestId, items, vendor, address, deliveryMode, payment: paymentMethod, cardLast4, transferCode })
  useEffect(() => {
    const payload = JSON.parse(previewPayload)
    if (!API_MODE || !payload.items.length || (payload.deliveryMode === 'Despacho' && !payload.address)) return
    let active = true
    const timer = setTimeout(() => {
      setPreviewBusy(true)
      apiService.preview(payload).then(value => { if (active) { setPreview(value); setError('') } }).catch(error => { if (active) { setPreview(null); setError(error.message) } }).finally(() => { if (active) setPreviewBusy(false) })
    }, 150)
    return () => { active = false; clearTimeout(timer) }
  }, [previewPayload])
  const shippingCost = API_MODE ? preview?.shipping || 0 : localShippingCost
  const totalBruto = API_MODE ? preview?.total || 0 : localTotal
  const valorNeto = API_MODE ? preview?.net || 0 : localNet
  const valorIva = API_MODE ? preview?.iva || 0 : localIva

  const handlePayment = async () => {
    if (isProcessing) return
    setError('')
    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return }
    if (!items.length || !acceptedTerms) { setError('Selecciona artículos y acepta las condiciones para continuar.'); return }
    if (deliveryMode === 'Despacho' && !address) { setError('Agrega una dirección de despacho.'); return }
    if (paymentMethod === 'Tarjeta' && !/^\d{4}$/.test(cardLast4)) { setError('Ingresa los últimos cuatro dígitos de la tarjeta.'); return }
    if (paymentMethod === 'Transferencia' && transferCode.trim().length < 5) { setError('Ingresa un código de transferencia válido.'); return }
    setIsProcessing(true)
    try {
      const order = await checkout({ requestId, items, user, vendor, address, shipping: shippingCost, payment: paymentMethod, cardLast4, transferCode, deliveryMode })
      navigate(`/pedido/${order.id}`)
    } catch (error) { setError(error.message) }
    finally { setIsProcessing(false) }
  }
  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      <Stack direction="row"   sx={[{ justifyContent: "space-between", alignItems: "center" }, { mb: 2 }]}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Shopping &nbsp;/&nbsp; Confirmar compra
        </Typography>
        <Stack direction="row" spacing={1}  sx={[{ alignItems: "center" }, { color: 'text.secondary' }]}>
          <VerifiedUserOutlined color="primary" fontSize="small" />
          <Typography variant="caption">Registro de compra en el sistema</Typography>
        </Stack>
      </Stack>

      <Stepper activeStep={1} sx={{ mb: 3 }}>
        <Step completed>
          <StepLabel>1. Entrega</StepLabel>
        </Step>
        <Step>
          <StepLabel>2. Pago</StepLabel>
        </Step>
        <Step>
          <StepLabel>3. Confirmación</StepLabel>
        </Step>
      </Stepper>

      {API_MODE && preview?.discount > 0 && <Alert severity="info" sx={{ mb: 2 }}>Descuento aplicado por PostgreSQL: {formatCLP(preview.discount)}</Alert>}
      {previewBusy && <Skeleton variant="rounded" height={64} sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!items.length && <Alert severity="info" sx={{ mb: 2 }}>Tu carrito está vacío. Agrega artículos desde el catálogo.</Alert>}
      <Grid container spacing={3}>
        {/* Columna Izquierda: Dirección y Medio de Pago (P07) */}
        <Grid size={{ xs: 12, lg: 7.5 }}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Dirección de entrega
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
                <Button
                  fullWidth
                  variant={deliveryMode === 'Despacho' ? 'contained' : 'outlined'}
                  startIcon={<LocalShippingOutlined />}
                  onClick={() => setDeliveryMode('Despacho')}
                >
                  Despacho a domicilio
                </Button>
                <Button
                  fullWidth
                  variant={deliveryMode === 'Retiro' ? 'contained' : 'outlined'}
                  startIcon={<StorefrontOutlined />}
                  onClick={() => setDeliveryMode('Retiro')}
                >
                  Retiro en tienda (Osorno)
                </Button>
              </Stack>

              {deliveryMode === 'Despacho' && (
                <Stack spacing={1.5}>
                  {addresses.map(row => ({ id: row.id, label: row.name, detail: [row.street, row.number, row.commune, row.region].filter(Boolean).join(', '), main: row.primary })).map((addr) => (
                    <Paper
                      key={addr.id}
                      variant="outlined"
                      onClick={() => setSelectedAddress(addr.id)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderColor: selectedAddress === addr.id ? 'primary.main' : 'divider',
                        bgcolor: selectedAddress === addr.id ? 'secondary.light' : 'background.paper',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Stack direction="row" spacing={1.5}  sx={{ alignItems: "center" }}>
                        <Radio checked={selectedAddress === addr.id} />
                        <HomeOutlined color="primary" />
                        <Box>
                          <Stack direction="row" spacing={1}  sx={{ alignItems: "center" }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {addr.label} ({addr.id})
                            </Typography>
                            {addr.main && (
                              <Chip label="Dirección principal" size="small" color="secondary" />
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {addr.detail}
                          </Typography>
                        </Box>
                      </Stack>
                      <Button size="small" onClick={() => navigate('/perfil')}>
                        Editar
                      </Button>
                    </Paper>
                  ))}

                  <Button
                    variant="outlined"
                    startIcon={<AddOutlined />}
                    onClick={() => navigate('/perfil')}
                    sx={{ borderStyle: 'dashed', py: 1.25 }}
                  >
                    Agregar nueva dirección
                  </Button>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f6ff', display: 'flex', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5}  sx={{ alignItems: "center" }}>
                      <LocalShippingOutlined color="primary" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Despacho por {vendor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Entrega estimada: 2 a 3 días hábiles
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      {formatCLP(shippingCost)}
                    </Typography>
                  </Paper>
                </Stack>
              )}
            </Card>

            {/* Medio de Pago */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Medio de pago
              </Typography>

              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                {[
                  { id: 'Tarjeta', title: 'Tarjeta', sub: 'Crédito o Débito', Icon: CreditCardOutlined },
                  { id: 'Transferencia', title: 'Transferencia', sub: 'Pago por banco', Icon: AccountBalanceOutlined },
                ].map((m) => (
                  <Grid key={m.id} size={{ xs: 12, sm: 6 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => setPaymentMethod(m.id)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderColor: paymentMethod === m.id ? 'primary.main' : 'divider',
                        bgcolor: paymentMethod === m.id ? 'secondary.light' : 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Radio checked={paymentMethod === m.id} />
                      <m.Icon color="primary" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {m.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {m.sub}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {paymentMethod === 'Tarjeta' ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row"   sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Stack direction="row" spacing={1.5}  sx={{ alignItems: "center" }}>
                      <Radio checked />
                      <Chip label="Tarjeta" size="small" color="primary" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Visa terminada en {cardLast4}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                           · Últimos 4 dígitos registrados
                        </Typography>
                      </Box>
                    </Stack>
                    <TextField
                      size="small"
                      label="Últimos 4 dígitos"
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value.slice(0, 4))}
                      sx={{ width: 140 }}
                    />
                  </Stack>
                </Paper>
              ) : (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f7f6ff' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Datos de Transferencia Electrónica
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    Banco Estado · Cuenta Corriente N° 82736451 · RUT 76.123.456-7 (Tienda Sur)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Código de comprobante de transferencia *"
                    value={transferCode}
                    onChange={(e) => setTransferCode(e.target.value)}
                  />
                </Paper>
              )}
            </Card>
          </Stack>
        </Grid>

        {/* Columna Derecha: Resumen con Neto + IVA 19% + Total (P07) */}
        <Grid size={{ xs: 12, lg: 4.5 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Resumen de tu compra
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Vendedor: <strong>{vendor}</strong>
            </Typography>

            <Stack spacing={2} sx={{ mb: 2.5 }}>{items.map(item => <Stack key={item.key} direction="row" spacing={2}  sx={{ alignItems: "center" }}><Box component="img" src={catalogImage(item)} alt={item.name} sx={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 2 }} /><Box sx={{ flex: 1 }}><Typography  sx={{ fontWeight: 700 }}>{item.name}</Typography><Typography variant="caption">Cantidad: {item.qty} · {item.sku || item.talla}</Typography></Box><Typography>{formatCLP(item.price * item.qty)}</Typography></Stack>)}</Stack>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row"  sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Subtotal productos</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCLP(API_MODE ? preview?.subtotal || 0 : subtotalProducts)}</Typography>
              </Stack>
              <Stack direction="row"  sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Costo de despacho</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCLP(shippingCost)}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row"  sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Valor Neto (sin IVA)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatCLP(valorNeto)}</Typography>
              </Stack>
              <Stack direction="row"  sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>IVA (19%)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatCLP(valorIva)}</Typography>
              </Stack>
            </Stack>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2.5, mb: 2 }}>
              <Stack direction="row"   sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                  Total a pagar
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {formatCLP(totalBruto)}
                </Typography>
              </Stack>
            </Paper>

            <FormControlLabel
              control={<Checkbox checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />}
              label={
                <Typography variant="caption" color="text.secondary">
                  Acepto los Términos y Condiciones y la Política de Privacidad de Shopping.
                </Typography>
              }
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!acceptedTerms || isProcessing || !items.length || (API_MODE && (!preview || previewBusy))}
              startIcon={isProcessing ? <Skeleton variant="rounded" width={20} height={20} /> : <LockOutlined />}
              onClick={handlePayment}
            >
              {isProcessing ? 'Procesando pago...' : `Pagar ${formatCLP(totalBruto)}`}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
