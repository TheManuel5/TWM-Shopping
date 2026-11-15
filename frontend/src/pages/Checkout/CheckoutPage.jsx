import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccountBalanceOutlined, AddOutlined, CreditCardOutlined, LocalShippingOutlined, LockOutlined, PlaceOutlined, StorefrontOutlined } from '@mui/icons-material'
import { Alert, Box, Button, Card, Checkbox, Chip, Divider, FormControlLabel, LinearProgress, Radio, Skeleton, Stack, TextField, Typography } from '@mui/material'
import useAuth from '../../contexts/AuthContext/useAuth'
import { catalogSeed } from '../../data/catalog'
import { checkout } from '../../data/commerce'
import useCollection from '../../hooks/useCollection'
import { API_MODE, apiService } from '../../services/api'
import { catalogImage } from '../../utils/catalogImages'
import { formatCLP } from '../../utils/taxonomyData'

function Section({ step, title, children }) {
  return <Card component="section" sx={{ p: { xs: 2, sm: 3 } }}>
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
      <Box sx={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{step}</Box>
      <Typography variant="h6" component="h2">{title}</Typography>
    </Stack>
    {children}
  </Card>
}

/** Opción seleccionable con apariencia de tarjeta (entrega, dirección, medio de pago). */
function Option({ selected, onSelect, icon, title, detail, action, label }) {
  return <Stack
    direction="row" spacing={1.25} component="label"
    sx={{ alignItems: 'center', p: 1.5, pr: 2, borderRadius: 2.5, cursor: 'pointer', border: '1px solid', borderColor: selected ? 'primary.main' : 'divider', bgcolor: selected ? 'secondary.light' : 'background.paper', boxShadow: selected ? '0 0 0 1px #602ff7' : 'none', transition: 'border-color 150ms ease, background-color 150ms ease', minWidth: 0 }}
  >
    <Radio size="small" checked={selected} onChange={onSelect} slotProps={{ input: { 'aria-label': label || title } }} />
    <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography component="div" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{title}</Typography>
      {detail && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{detail}</Typography>}
    </Box>
    {action}
  </Stack>
}

function Row({ label, value, strong, busy }) {
  return <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
    <Typography variant="body2" color={strong ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: strong ? 700 : 400 }}>{label}</Typography>
    {busy ? <Skeleton width={70} /> : <Typography variant="body2" sx={{ fontWeight: strong ? 800 : 600 }}>{value}</Typography>}
  </Stack>
}

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
  const loadingTotals = API_MODE && items.length > 0 && (previewBusy || (!preview && !error))
  const twoColumns = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }

  return (
    <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>Confirmar compra</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Revisa la entrega y el pago antes de registrar tu pedido.</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!items.length && <Alert severity="info" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => navigate('/catalogo')}>Ir al catálogo</Button>}>Tu carrito está vacío. Agrega artículos desde el catálogo.</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 400px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={2.5}>
          <Section step={1} title="Entrega">
            <Box sx={twoColumns}>
              <Option selected={deliveryMode === 'Despacho'} onSelect={() => setDeliveryMode('Despacho')} icon={<LocalShippingOutlined />} title="Despacho a domicilio" detail="Según las tarifas del vendedor" />
              <Option selected={deliveryMode === 'Retiro'} onSelect={() => setDeliveryMode('Retiro')} icon={<StorefrontOutlined />} title="Retiro con el vendedor" detail="Sin costo de despacho" />
            </Box>

            {deliveryMode === 'Despacho' && <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem' }}>Dirección de despacho</Typography>
              {addresses.map(row => <Option
                key={row.id} selected={String(address?.id) === String(row.id)} onSelect={() => setSelectedAddress(row.id)} icon={<PlaceOutlined />}
                label={`Enviar a ${row.name}`}
                title={<>{row.name}{row.primary && <Chip label="Principal" size="small" color="secondary" sx={{ ml: 1, height: 20, color: 'primary.dark' }} />}</>}
                detail={[row.street, row.number, row.commune, row.region].filter(Boolean).join(', ')}
                action={<Button size="small" onClick={() => navigate('/perfil')}>Editar</Button>}
              />)}
              <Button variant="outlined" startIcon={<AddOutlined />} onClick={() => navigate('/perfil')} sx={{ borderStyle: 'dashed', py: 1.25 }}>Agregar una dirección</Button>
            </Stack>}
          </Section>

          <Section step={2} title="Medio de pago">
            <Box sx={twoColumns}>
              <Option selected={paymentMethod === 'Tarjeta'} onSelect={() => setPaymentMethod('Tarjeta')} icon={<CreditCardOutlined />} title="Tarjeta" detail="Crédito o débito" />
              <Option selected={paymentMethod === 'Transferencia'} onSelect={() => setPaymentMethod('Transferencia')} icon={<AccountBalanceOutlined />} title="Transferencia" detail="Con código de comprobante" />
            </Box>
            <Box sx={{ mt: 2.5 }}>
              {paymentMethod === 'Tarjeta'
                ? <TextField label="Últimos 4 dígitos de la tarjeta" required value={cardLast4} onChange={event => setCardLast4(event.target.value.replace(/\D/g, '').slice(0, 4))} helperText="Solo se registran los últimos cuatro dígitos; no se guarda el número completo." sx={{ width: { xs: '100%', sm: 320 } }} slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 4, autoComplete: 'off' } }} />
                : <TextField label="Código del comprobante de transferencia" required fullWidth value={transferCode} onChange={event => setTransferCode(event.target.value)} helperText="Transfiere al vendedor y registra aquí el código de tu comprobante." slotProps={{ htmlInput: { autoComplete: 'off' } }} />}
            </Box>
          </Section>
        </Stack>

        <Card component="aside" aria-label="Resumen de la compra" sx={{ p: { xs: 2, sm: 3 }, position: { xs: 'relative', lg: 'sticky' }, top: { lg: 88 }, overflow: 'hidden' }}>
          {(previewBusy || isProcessing) && <LinearProgress aria-label={isProcessing ? 'Registrando la compra' : 'Calculando totales'} sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: 0 }} />}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', fontWeight: 800, fontSize: 14 }}>3</Box>
            <Typography variant="h6" component="h2">Resumen</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2, color: 'text.secondary' }}><StorefrontOutlined fontSize="small" /><Typography variant="body2" noWrap>{vendor}</Typography></Stack>

          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {items.map(item => <Stack key={item.key} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box component="img" src={catalogImage(item)} alt="" sx={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 2, bgcolor: '#f4f2ff', flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{item.name}</Typography>
                <Typography variant="caption" color="text.secondary">{item.qty} × {formatCLP(item.price)}</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCLP(item.price * item.qty)}</Typography>
            </Stack>)}
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1}>
            <Row label="Subtotal" value={formatCLP(API_MODE ? preview?.subtotal || 0 : subtotalProducts)} busy={loadingTotals} />
            <Row label={deliveryMode === 'Despacho' ? `Despacho${address?.commune ? ` a ${address.commune}` : ''}` : 'Retiro con el vendedor'} value={shippingCost ? formatCLP(shippingCost) : 'Sin costo'} busy={loadingTotals} />
            {API_MODE && preview?.discount > 0 && <Row label="Descuento" value={`– ${formatCLP(preview.discount)}`} busy={loadingTotals} />}
            <Divider />
            <Row label="Valor neto" value={formatCLP(valorNeto)} busy={loadingTotals} />
            <Row label="IVA (19 %)" value={formatCLP(valorIva)} busy={loadingTotals} />
          </Stack>

          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mt: 2, p: 2, borderRadius: 2.5, bgcolor: 'secondary.light' }}>
            <Typography sx={{ fontWeight: 800 }}>Total</Typography>
            {loadingTotals ? <Skeleton width={120} height={36} /> : <Typography sx={{ fontWeight: 900, fontSize: '1.7rem', letterSpacing: '-0.02em', color: 'primary.main' }}>{formatCLP(totalBruto)}</Typography>}
          </Stack>

          <FormControlLabel
            control={<Checkbox checked={acceptedTerms} onChange={event => setAcceptedTerms(event.target.checked)} />}
            label={<Typography variant="body2" color="text.secondary">Confirmo que los datos de entrega y pago son correctos.</Typography>}
            sx={{ my: 1.5, alignItems: 'flex-start', '& .MuiCheckbox-root': { pt: 0.25 } }}
          />
          <Button variant="contained" size="large" fullWidth disabled={!acceptedTerms || isProcessing || !items.length || (API_MODE && (!preview || previewBusy))} startIcon={<LockOutlined />} onClick={handlePayment} sx={{ minHeight: 50 }}>
            {isProcessing ? 'Registrando compra…' : loadingTotals ? 'Calculando total…' : `Confirmar y pagar ${formatCLP(totalBruto)}`}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, textAlign: 'center' }}>El pago queda registrado en el sistema; no se cobra a través de una pasarela bancaria.</Typography>
        </Card>
      </Box>
    </Box>
  )
}
