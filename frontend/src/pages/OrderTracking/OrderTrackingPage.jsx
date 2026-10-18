import {
  ChatOutlined,
  CheckCircleOutlined,
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
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import { useNavigate } from 'react-router-dom'
import chairImage from '../../assets/products/chair.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import OrderStepper from '../../components/molecules/OrderStepper/OrderStepper'

export default function OrderTrackingPage() {
  const navigate = useNavigate()

  const handleDownloadInvoicePDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('SHOPPING - COMPROBANTE DE VENTA (BOLETA)', 14, 20)
    doc.setFontSize(10)
    doc.text('Pedido N°: #1032   |   Fecha: 20 de septiembre de 2026', 14, 30)
    doc.text('Vendedor: Tienda Sur (RUT: 76.123.456-7) - Osorno', 14, 37)
    doc.text('Cliente: Ana Rodríguez (RUT: 12.345.678-9)', 14, 44)
    doc.line(14, 50, 196, 50)

    doc.text('1x Zapatillas New Balance 574 Hombre Gris (Talla 42) ..... $29.990', 14, 60)
    doc.text('1x Mochila Columbia Trail Journey 25L Negro .............. $13.010', 14, 68)
    doc.line(14, 75, 196, 75)

    doc.text('Valor Neto (sin IVA): $43.000 CLP', 14, 85)
    doc.text('IVA (19%):            $8.170 CLP', 14, 92)
    doc.setFontSize(12)
    doc.text('TOTAL PAGADO:         $51.170 CLP', 14, 102)
    doc.setFontSize(10)
    doc.text('Medio de Pago: Visa terminada en **** 4242', 14, 112)
    doc.text('Despacho: Chilexpress | N° Seguimiento: 9087654321 | Estado: En preparación', 14, 119)

    doc.save('Comprobante_Venta_Pedido_1032.pdf')
  }

  return (
    <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 2, fontSize: '0.85rem' }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/perfil')} sx={{ cursor: 'pointer' }}>
          Mi cuenta
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate('/mis-compras')} sx={{ cursor: 'pointer' }}>
          Compras
        </Link>
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
          Pedido #1032
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 52, height: 52, bgcolor: 'secondary.main', color: 'primary.main' }}>
            <CheckCircleOutlined fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4">¡Compra confirmada!</Typography>
            <Typography variant="body2" color="text.secondary">
              Tu pedido #1032 ha sido recibido correctamente.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ textAlign: { sm: 'right' } }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Realizado el
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            20 de septiembre de 2026
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'secondary.light', color: 'primary.main' }}>
              <StorefrontOutlined />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Tienda Sur</Typography>
              <Typography variant="caption" color="text.secondary">2 productos</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'secondary.light', color: 'primary.main' }}>
              <CreditCardOutlined />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Medio de pago</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Visa •••• 4242</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'secondary.light', color: 'primary.main' }}>
              <ReceiptLongOutlined />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Total pagado</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>$51.170</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2.5, mb: 2.5 }}>
        <OrderStepper activeStep={1} />
      </Card>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6.5}>
          <Card sx={{ p: 2.5, mb: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Productos de tu compra</Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box component="img" src={shoeImage} alt="" sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Zapatillas New Balance 574 Hombre Gris</Typography>
                    <Typography variant="caption" color="text.secondary">Talla: 42 | Color: Gris</Typography>
                  </Box>
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>$29.990</Typography>
                  <Typography variant="caption" color="text.secondary">Cantidad: 1</Typography>
                </Box>
              </Stack>

              <Divider />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box component="img" src={chairImage} alt="" sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Mochila Columbia Trail Journey 25L Negro</Typography>
                    <Typography variant="caption" color="text.secondary">Color: Negro</Typography>
                  </Box>
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>$13.010</Typography>
                  <Typography variant="caption" color="text.secondary">Cantidad: 1</Typography>
                </Box>
              </Stack>
            </Stack>
          </Card>

          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Resumen de pago</Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Subtotal (neto)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>$43.000</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">IVA (19%)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>$8.170</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Total pagado</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>$51.170</Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={5.5}>
          <Card sx={{ p: 2.5, mb: 2.5 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <LocalShippingOutlined color="primary" />
              <Typography variant="h6">Información de despacho</Typography>
            </Stack>
            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Transportadora</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>Chilexpress</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">N° de seguimiento</Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>9087654321</Typography>
                  <IconButton size="small" onClick={() => navigator.clipboard?.writeText('9087654321')}>
                    <ContentCopyOutlined sx={{ fontSize: 15 }} />
                  </IconButton>
                </Stack>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Estado</Typography>
                <StatusChip status="En preparación" />
              </Stack>
            </Stack>
          </Card>

          <Card sx={{ p: 2.5, mb: 2.5 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <LocationOnOutlined color="primary" />
              <Typography variant="h6">Dirección de entrega</Typography>
            </Stack>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={7}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Casa Osorno</Typography>
                <Typography variant="body2" color="text.secondary">
                  Av. Manuel Rodríguez 1234, Osorno, Los Lagos
                </Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'secondary.light', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Entrega estimada</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>23 de septiembre de 2026</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Card>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button variant="contained" startIcon={<DescriptionOutlined />} onClick={handleDownloadInvoicePDF} sx={{ flexGrow: 1 }}>
              Ver comprobante
            </Button>
            <Button variant="outlined" startIcon={<ChatOutlined />} onClick={() => navigate('/mensajes')}>
              Contactar vendedor
            </Button>
            <Button variant="outlined" startIcon={<ReplayOutlined />} onClick={() => navigate('/catalogo')}>
              Volver a comprar
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}