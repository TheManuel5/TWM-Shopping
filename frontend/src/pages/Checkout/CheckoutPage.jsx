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
import { useNavigate } from 'react-router-dom'
import chairImage from '../../assets/products/chair.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import useAuth from '../../contexts/AuthContext/useAuth' // <-- IMPORTANTE: Importamos el contexto
import { apiService } from '../../services/api'
import { formatCLP } from '../../utils/taxonomyData'

export default function CheckoutPage() {
  const navigate = useNavigate()
  
  // <-- IMPORTANTE: Obtenemos el usuario actual que inició sesión
  const { user } = useAuth() 

  const [deliveryMode, setDeliveryMode] = useState('Despacho')
  const [selectedAddress, setSelectedAddress] = useState('DIR-001')
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta')
  const [cardLast4, setCardLast4] = useState('4242')
  const [transferCode, setTransferCode] = useState('TRF-20260920-8841')
  const [acceptedTerms, setAcceptedTerms] = useState(true)
  
  // Estado para la carga de la transacción en el backend
  const [isProcessing, setIsProcessing] = useState(false)

  // Cálculos simulados del carrito actual
  const shippingCost = deliveryMode === 'Despacho' ? 3570 : 0
  const subtotalProducts = 47600
  const totalBruto = subtotalProducts + shippingCost     // Total a pagar por el cliente
  const valorNeto = Math.round(totalBruto / 1.19)        // Valor antes de impuestos
  const valorIva = totalBruto - valorNeto                // IVA del 19% calculado

  // Función que conecta con el VentasController en .NET
  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      // Estructura que coincide exactamente con CheckoutDto en C#
      const orderData = {
        // <-- MAGIA AQUÍ: Usamos el RUT dinámico, o dejamos uno de respaldo
        ClienteRun: user?.run || "10000001-K", 
        ValorBrutoTotal: valorNeto, // Enviamos el neto, el trigger en PostgreSQL sumará el 19% de IVA
        ProductoIds: [1, 2], // IDs de los productos de prueba en el resumen
      }

      // 1. Enviamos la petición POST al backend
      const response = await apiService.createOrder(orderData)

      // 2. Si todo sale bien, la BD genera el ID y redirigimos al seguimiento real
      if (response && response.ventaId) {
        navigate(`/pedido/${response.ventaId}`)
      } else {
        navigate('/mis-compras')
      }
    } catch (error) {
      alert("Motivo del rechazo de la Base de Datos: " + error.message)
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Shopping &nbsp;/&nbsp; Compra segura
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <VerifiedUserOutlined color="primary" fontSize="small" />
          <Typography variant="caption">Tus datos están protegidos con encriptación</Typography>
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

      <Grid container spacing={3}>
        {/* Columna Izquierda: Dirección y Medio de Pago (P07) */}
        <Grid item xs={12} lg={7.5}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Dirección de entrega (RF03 / RF04)
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

                  <Button
                    variant="outlined"
                    startIcon={<AddOutlined />}
                    onClick={() => navigate('/perfil')}
                    sx={{ borderStyle: 'dashed', py: 1.25 }}
                  >
                    Agregar nueva dirección
                  </Button>

                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f6ff', display: 'flex', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LocalShippingOutlined color="primary" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Despacho por Tienda Sur (Chilexpress)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Entrega estimada: 23 de septiembre de 2026
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
                  { id: 'Tarjeta', title: 'Tarjeta', sub: 'Crédito o Débito', Icon: CreditCardOutlined },
                  { id: 'Transferencia', title: 'Transferencia', sub: 'Pago por banco', Icon: AccountBalanceOutlined },
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
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Radio checked />
                      <Chip label="VISA" size="small" color="primary" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          Visa terminada en {cardLast4}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vence 12/2027 · Últimos 4 dígitos registrados (RF24)
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
                    Datos de Transferencia Electrónica (RF24)
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
        <Grid item xs={12} lg={4.5}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Resumen de tu compra
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Vendedor: <strong>Tienda Sur</strong>
            </Typography>

            <Stack spacing={2} sx={{ mb: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box component="img" src={shoeImage} alt="" sx={{ width: 56, height: 56, borderRadius: 2, objectFit: 'cover' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Zapatillas New Balance 574
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Talla: 42 · Color: Gris · Cant: 1
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  $29.990
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box component="img" src={chairImage} alt="" sx={{ width: 56, height: 56, borderRadius: 2, objectFit: 'cover' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Mochila Columbia Trail 25L
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Color: Negro · Cant: 1
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  $17.610
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Subtotal productos</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCLP(subtotalProducts)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Costo de despacho</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCLP(shippingCost)}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Valor Neto (sin IVA)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatCLP(valorNeto)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>IVA (19%)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{formatCLP(valorIva)}</Typography>
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
              disabled={!acceptedTerms || isProcessing}
              startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <LockOutlined />}
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