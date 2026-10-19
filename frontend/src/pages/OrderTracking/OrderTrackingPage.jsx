import {
  ChatOutlined,
  CheckCircleOutlined,
  ChevronRightOutlined,
  ContentCopyOutlined,
  CreditCardOutlined,
  DescriptionOutlined,
  LocalShippingOutlined,
  LocationOnOutlined,
  ReceiptLongOutlined,
  ReplayOutlined,
  StorefrontOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import chairImage from '../../assets/products/chair.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import OrderStepper from '../../components/molecules/OrderStepper/OrderStepper'

// Datos de prueba. No se presenta este pedido como una compra real del usuario.
const DEMO_ORDER = {
  id: '1032',
  date: '20 de septiembre de 2026',
  store: 'Tienda Sur',
  payment: 'Visa •••• 4242',
  subtotal: 43000,
  tax: 8170,
  total: 51170,
  carrier: 'Chilexpress',
  trackingNumber: '9087654321',
  deliveryDate: '23 de septiembre de 2026',
  products: [
    {
      id: 1,
      name: 'Zapatillas New Balance 574 Hombre Gris',
      description: 'Talla: 42 | Color: Gris',
      price: 29990,
      quantity: 1,
      image: shoeImage,
    },
    {
      id: 2,
      name: 'Mochila Columbia Trail Journey 25L Negro',
      description: 'Color: Negro',
      price: 13010,
      quantity: 1,
      image: chairImage,
    },
  ],
}

const formatCLP = (amount) => `$${Number(amount).toLocaleString('es-CL')}`

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  minWidth: 0,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2.5,
  boxShadow: 'none',
  bgcolor: 'background.paper',
}

function OverviewCard({ icon, title, value, href }) {
  return (
    <Card
      component="a"
      href={href}
      sx={{
        ...panelSx,
        p: { xs: 1.5, sm: 2 },
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': { borderColor: 'primary.main' },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: 'secondary.main',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {title}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>
          {value}
        </Typography>
      </Box>
      <ChevronRightOutlined fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
    </Card>
  )
}

function PaymentRow({ label, value, bold = false }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'baseline',
        columnGap: 2,
      }}
    >
      <Typography variant={bold ? 'subtitle2' : 'body2'} color={bold ? 'text.primary' : 'text.secondary'} fontWeight={bold ? 800 : 400}>
        {label}
      </Typography>
      <Typography
        variant={bold ? 'h6' : 'body2'}
        color={bold ? 'primary.main' : 'text.primary'}
        sx={{ fontWeight: bold ? 900 : 700, whiteSpace: 'nowrap' }}
      >
        {value}
      </Typography>
    </Box>
  )
}

export default function OrderTrackingPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [notice, setNotice] = useState('')
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)

  const isExampleOrder = !id || id === DEMO_ORDER.id

  const handleCopyTracking = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_ORDER.trackingNumber)
      setNotice('Número de seguimiento copiado')
    } catch {
      setNotice('No se pudo copiar el número de seguimiento')
    }
  }

  const handleDownloadInvoicePDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('SHOPPING - RESUMEN DE COMPRA (DEMO)', 14, 20)
    doc.setFontSize(10)
    doc.text('Pedido N°: #1032   |   Fecha: 20 de septiembre de 2026', 14, 30)
    doc.text('Vendedor: Tienda Sur - Osorno', 14, 37)
    doc.text('Cliente: datos ficticios; no corresponde a una sesión real', 14, 44)
    doc.line(14, 50, 196, 50)
    doc.text('1x Zapatillas New Balance 574 Hombre Gris ...... $29.990', 14, 60)
    doc.text('1x Mochila Columbia Trail Journey 25L ........... $13.010', 14, 68)
    doc.line(14, 75, 196, 75)
    doc.text('Valor neto: $43.000 CLP', 14, 85)
    doc.text('IVA (19%): $8.170 CLP', 14, 92)
    doc.setFontSize(12)
    doc.text('TOTAL PAGADO: $51.170 CLP', 14, 102)
    doc.setFontSize(10)
    doc.text('Medio de pago: Visa terminada en 4242 (demo)', 14, 112)
    doc.text('Chilexpress | Seguimiento: 9087654321 | En preparación', 14, 119)
    doc.text('DOCUMENTO DEMOSTRATIVO - NO ES BOLETA TRIBUTARIA', 14, 136)
    doc.save('Resumen_Demo_Pedido_1032.pdf')
    console.log('Descarga simulada del resumen del pedido:', DEMO_ORDER.id)
  }

  if (!isExampleOrder) {
    return (
      <Card sx={{ ...panelSx, maxWidth: 720, mx: 'auto' }}>
        <Typography variant="h5" fontWeight={800}>Pedido no disponible</Typography>
        <Typography color="text.secondary" sx={{ my: 2 }}>
          No hay datos de demostración para el pedido #{id}. El seguimiento real necesita el endpoint del backend.
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/mis-compras')}>Volver a mis compras</Button>
      </Card>
    )
  }

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto', width: '100%', minWidth: 0, pb: 4 }}>
      <Breadcrumbs sx={{ mb: 2, fontSize: '0.8rem' }}>
        <Link component="button" type="button" underline="hover" color="inherit" onClick={() => navigate('/perfil')}>
          Mi cuenta
        </Link>
        <Link component="button" type="button" underline="hover" color="inherit" onClick={() => navigate('/mis-compras')}>
          Compras
        </Link>
        <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700 }}>
          Pedido #1032
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2.5,
        }}
      >
        <Stack direction="row" spacing={1.75} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: '#fff' }}>
            <CheckCircleOutlined fontSize="large" />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 850, fontSize: { xs: '1.65rem', sm: '2rem' } }}>
              ¡Compra confirmada!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tu pedido #1032 ha sido recibido correctamente.
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, flexShrink: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Realizado el</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{DEMO_ORDER.date}</Typography>
        </Box>
      </Box>

      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, mb: 2.5 }}
      >
        <OverviewCard icon={<StorefrontOutlined />} title={DEMO_ORDER.store} value="2 productos" href="#productos-compra" />
        <OverviewCard icon={<CreditCardOutlined />} title="Medio de pago" value={DEMO_ORDER.payment} href="#resumen-pago" />
        <OverviewCard icon={<ReceiptLongOutlined />} title="Total pagado" value={formatCLP(DEMO_ORDER.total)} href="#resumen-pago" />
      </Box>

      <Card sx={{ ...panelSx, mb: 2.5 }}>
        <OrderStepper activeStep={1} />
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Card id="productos-compra" sx={panelSx}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>Productos de tu compra</Typography>
            <Stack divider={<Divider flexItem />} spacing={1.75}>
              {DEMO_ORDER.products.map((product) => (
                <Box
                  key={product.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    gap: 1.25,
                    alignItems: 'start',
                    minWidth: 0,
                  }}
                >
                  <Stack direction="row" spacing={1.25} sx={{ minWidth: 0 }}>
                    <Box
                      component="img"
                      src={product.image}
                      alt="Imagen de demostración"
                      sx={{ width: 54, height: 54, flexShrink: 0, borderRadius: 1.5, objectFit: 'cover' }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, overflowWrap: 'anywhere', lineHeight: 1.35 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {product.description}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                      {formatCLP(product.price)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Cantidad: {product.quantity}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Card>

          <Card id="resumen-pago" sx={panelSx}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 800 }}>Resumen de pago</Typography>
            <Stack spacing={1.15}>
              <PaymentRow label="Subtotal (neto)" value={formatCLP(DEMO_ORDER.subtotal)} />
              <PaymentRow label="IVA (19%)" value={formatCLP(DEMO_ORDER.tax)} />
              <Divider />
              <PaymentRow label="Total pagado" value={formatCLP(DEMO_ORDER.total)} bold />
            </Stack>
          </Card>
        </Stack>

        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Card id="informacion-despacho" sx={panelSx}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocalShippingOutlined color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Información de despacho</Typography>
              </Stack>
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary' }}>Chilexpress</Typography>
            </Stack>
            <Stack spacing={1.25}>
              <PaymentRow label="Transportadora" value={DEMO_ORDER.carrier} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">N° de seguimiento</Typography>
                <Stack direction="row" spacing={0.3} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{DEMO_ORDER.trackingNumber}</Typography>
                  <IconButton size="small" aria-label="Copiar número de seguimiento" onClick={handleCopyTracking}>
                    <ContentCopyOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Estado</Typography>
                <StatusChip status="En preparación" />
              </Box>
              <Button variant="outlined" fullWidth onClick={() => setTrackingDialogOpen(true)}>
                Ver seguimiento
              </Button>
            </Stack>
          </Card>

          <Card sx={panelSx}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <LocationOnOutlined color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Dirección de entrega</Typography>
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' },
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={800}>Casa Osorno</Typography>
                <Typography variant="body2" color="text.secondary">
                  Av. Manuel Rodríguez 1234
                </Typography>
                <Typography variant="body2" color="text.secondary">Osorno, Los Lagos, Chile</Typography>
              </Box>
              <Paper sx={{ p: 1.5, bgcolor: 'secondary.main', borderRadius: 2, boxShadow: 'none' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Entrega estimada</Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>
                  {DEMO_ORDER.deliveryDate}
                </Typography>
              </Paper>
            </Box>
          </Card>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="contained" startIcon={<DescriptionOutlined />} onClick={handleDownloadInvoicePDF} sx={{ flexGrow: 1 }}>
              Ver comprobante (demo)
            </Button>
            <Button variant="outlined" startIcon={<ChatOutlined />} onClick={() => navigate('/mensajes')}>
              Contactar vendedor
            </Button>
            <Button variant="outlined" startIcon={<ReplayOutlined />} onClick={() => navigate('/catalogo')}>
              Volver a comprar
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Alert severity="info" sx={{ mt: 2.5, fontSize: '0.8rem' }}>
        Pantalla de demostración: el pedido, la dirección, el medio de pago y el número de seguimiento son ficticios. No se consultó una compra real ni el sistema de Chilexpress.
      </Alert>

      <Dialog open={trackingDialogOpen} onClose={() => setTrackingDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Seguimiento de demostración</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>Transportadora: <strong>{DEMO_ORDER.carrier}</strong></Typography>
          <Typography sx={{ mb: 1 }}>Código: <strong>{DEMO_ORDER.trackingNumber}</strong></Typography>
          <Typography sx={{ mb: 2 }}>Estado: <strong>En preparación</strong></Typography>
          <Alert severity="info">Estos datos son ilustrativos. El seguimiento real requiere la integración con la transportadora.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopyTracking}>Copiar código</Button>
          <Button variant="contained" onClick={() => setTrackingDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} message={notice} autoHideDuration={3000} onClose={() => setNotice('')} />
    </Box>
  )
}
