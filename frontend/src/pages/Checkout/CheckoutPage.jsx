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
  CircularProgress,
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
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import chairImage from '../../assets/products/chair.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import useAuth from '../../contexts/AuthContext/useAuth'
import { apiService } from '../../services/api'
import { formatCLP } from '../../utils/taxonomyData'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Datos provenientes del Carrito o fallback seguro
  const activeVendor = location.state?.selectedVendor
  const cartItems = activeVendor?.items?.length
    ? activeVendor.items
    : [
        { id: 1, name: 'Zapatillas New Balance 574', subtitle: 'Talla: 42 · Cant: 1', price: 29990, qty: 1, image: shoeImage },
        { id: 2, name: 'Mochila urbana Everest', subtitle: 'Negro · Cant: 1', price: 17610, qty: 1, image: chairImage },
      ]

  const subtotalProducts = location.state?.subtotal ?? cartItems.reduce((acc, it) => acc + it.price * it.qty, 0)

  const [deliveryMode, setDeliveryMode] = useState('Despacho')
  const [selectedAddress, setSelectedAddress] = useState('DIR-001')
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta')
  const [cardLast4, setCardLast4] = useState('4242')
  const [transferCode, setTransferCode] = useState('TRF-20260920-8841')
  const [acceptedTerms, setAcceptedTerms] = useState(true)

  // Estado para la carga y retroalimentación de la transacción
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [validationErrors, setValidationErrors] = useState({})

  // Cálculos reales de la compra
  const shippingCost = deliveryMode === 'Despacho' ? (location.state?.shippingCost ?? 3570) : 0
  const totalBruto = subtotalProducts + shippingCost
  const valorNeto = Math.round(totalBruto / 1.19)
  const valorIva = totalBruto - valorNeto

  // Validaciones antes de procesar el pago
  const validateForm = () => {
    const errors = {}
    if (deliveryMode === 'Despacho' && !selectedAddress) {
      errors.address = 'Debes seleccionar o ingresar una dirección de entrega.'
    }
    if (paymentMethod === 'Tarjeta') {
      if (!cardLast4 || cardLast4.trim().length !== 4 || isNaN(Number(cardLast4))) {
        errors.card = 'Debes indicar los 4 dígitos finales de tu tarjeta.'
      }
    }
    if (paymentMethod === 'Transferencia') {
      if (!transferCode || transferCode.trim().length < 5) {
        errors.transfer = 'Debes ingresar el código de comprobante bancario.'
      }
    }
    if (!acceptedTerms) {
      errors.terms = 'Es obligatorio aceptar los Términos y Condiciones.'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Conexión con el endpoint de ventas en .NET (VentasController)
  const handlePayment = async () => {
    setErrorMessage('')
    if (!validateForm()) return

    setIsProcessing(true)
    try {
      const productIds = cartItems.map((it) => (typeof it.id === 'number' ? it.id : Number(it.id) || 1))

      const orderData = {
        ClienteRun: user?.run || '10000001-K',
        ValorBrutoTotal: valorNeto,
        ProductoIds: productIds.length > 0 ? productIds : [1],
      }

      const response = await apiService.createOrder(orderData)

      // Si la compra se procesó con éxito, limpiamos el carrito en localStorage
      try {
        window.localStorage.removeItem('shopping-cart')
      } catch {
        // Ignorar
      }

      if (response && response.ventaId) {
        navigate(`/pedido/${response.ventaId}`)
      } else {
        navigate('/mis-compras')
      }
    } catch (error) {
      console.error('Error al procesar la venta:', error)
      setErrorMessage(error.message || 'No se pudo procesar la transacción. Verifica tu conexión con el servidor.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Shopping &nbsp;/&nbsp; Compra segura
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <VerifiedUserOutlined color="primary" fontSize="small" />
          <Typography variant="caption">Transacción encriptada y protegida</Typography>
        </Stack>
      </Stack>

      {/* Stepper del Checkout */}
      <Stepper activeStep={1} sx={{ mb: 3 }}>
        <Step completed>
          <StepLabel>1. Entrega</StepLabel>
        </Step>
        <Step active>
          <StepLabel>2. Pago y Confirmación</StepLabel>
        </Step>
        <Step>
          <StepLabel>3. Finalizado</StepLabel>
        </Step>
      </Stepper>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Columna Izquierda: Entrega y Pago (P07) */}
        <Grid item xs={12} lg={7.5}>
          <Stack spacing={2.5}>
            {/* Aviso de cuenta / comprador */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f6ff', borderRadius: 2.5, border: '1px solid #e5e7f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Comprador: {user?.nombre ? `${user.nombre} ${user.apellido || ''}` : 'Usuario Invitado / Demo'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                RUT asociado a la boleta: <strong>{user?.run || '10000001-K'}</strong>
              </Typography>
            </Paper>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Modalidad de entrega (RF03 / RF04)
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
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
                  Retiro en local (Osorno)
                </Button>
              </Stack>

              {deliveryMode === 'Despacho' && (
                <Stack spacing={1.5}>
                  {[
                    { id: 'DIR-001', label: 'Casa', detail: 'Av. Manuel Rodríguez 1234, Osorno, Los Lagos', main: true },
                    { id: 'DIR-002', label: 'Oficina', detail: 'Av. Juan Mackenna 851, Osorno, Los Lagos', main: false },
                  ].map((addr) => (
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
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Radio checked={selectedAddress === addr.id} />
                        <HomeOutlined color="primary" />
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
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

                  {validationErrors.address && (
                    <Typography variant="caption" color="error.main">
                      {validationErrors.address}
                    </Typography>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<AddOutlined />}
                    onClick={() => navigate('/perfil')}
                    sx={{ borderStyle: 'dashed', py: 1.25 }}
                  >
                    Agregar o gestionar direcciones
                  </Button>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f6ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LocalShippingOutlined color="primary" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Despacho certificado a Los Lagos
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Entrega en 2 a 3 días hábiles
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

            {/* Medio de Pago (RF24) */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Medio de pago (RF24)
              </Typography>

              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                {[
                  { id: 'Tarjeta', title: 'Tarjeta Bancaria', sub: 'Crédito o Débito', Icon: CreditCardOutlined },
                  { id: 'Transferencia', title: 'Transferencia', sub: 'Depósito / Banco', Icon: AccountBalanceOutlined },
                ].map((m) => (
                  <Grid item xs={12} sm={6} key={m.id}>
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
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Radio checked />
                      <Chip label="VISA / MASTERCARD" size="small" color="primary" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Tarjeta registrada terminada en {cardLast4}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Últimos 4 dígitos registrados en la transacción (RF24)
                        </Typography>
                      </Box>
                    </Stack>
                    <TextField
                      size="small"
                      label="Últimos 4 dígitos"
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value.slice(0, 4))}
                      error={Boolean(validationErrors.card)}
                      helperText={validationErrors.card}
                      sx={{ width: { xs: '100%', sm: 160 } }}
                    />
                  </Stack>
                </Paper>
              ) : (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f7f6ff' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Datos de Transferencia Electrónica (RF24)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    Banco Estado · Cuenta Corriente N° 82736451 · RUT 76.123.456-7 (Shopping SpA)
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Código de comprobante de transferencia *"
                    value={transferCode}
                    onChange={(e) => setTransferCode(e.target.value)}
                    error={Boolean(validationErrors.transfer)}
                    helperText={validationErrors.transfer}
                  />
                </Paper>
              )}
            </Card>
          </Stack>
        </Grid>

        {/* Columna Derecha: Resumen de Compra (P07) */}
        <Grid item xs={12} lg={4.5}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Resumen de tu compra
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Vendedor:{' '}
              <strong>{activeVendor?.vendorName || 'Tienda Oficial'}</strong>
            </Typography>

            <Stack spacing={2} sx={{ mb: 2.5 }}>
              {cartItems.map((item) => (
                <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      component="img"
                      src={item.image || shoeImage}
                      alt={item.name}
                      sx={{ width: 56, height: 56, borderRadius: 2, objectFit: 'cover' }}
                    />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap sx={{ maxWidth: 180 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.subtitle} · Cant: {item.qty}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {formatCLP(item.price * item.qty)}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Subtotal productos
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCLP(subtotalProducts)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Costo de despacho
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCLP(shippingCost)}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Valor Neto (sin IVA)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {formatCLP(valorNeto)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  IVA (19% calculado)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {formatCLP(valorIva)}
                </Typography>
              </Stack>
            </Stack>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2.5, mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                  Total a pagar
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {formatCLP(totalBruto)}
                </Typography>
              </Stack>
            </Paper>

            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
              }
              label={
                <Typography variant="caption" color="text.secondary">
                  Acepto los Términos y Condiciones y la Política de Privacidad de Shopping.
                </Typography>
              }
              sx={{ mb: 1 }}
            />
            {validationErrors.terms && (
              <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 2 }}>
                {validationErrors.terms}
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={isProcessing}
              startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <LockOutlined />}
              onClick={handlePayment}
              sx={{ py: 1.5, fontWeight: 800 }}
            >
              {isProcessing ? 'Procesando en PostgreSQL...' : `Pagar ${formatCLP(totalBruto)}`}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}