import { catalogImage } from '../../utils/catalogImages'
import useAuth from '../../contexts/AuthContext/useAuth'
import { ChatOutlined, ContentCopyOutlined, DescriptionOutlined, LocalShippingOutlined, ReceiptLongOutlined, ReplayOutlined } from '@mui/icons-material'
import { Box, Breadcrumbs, Button, Card, Chip, Divider, Grid, IconButton, Link, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import useCollection from '../../hooks/useCollection'
import { formatCLP } from '../../utils/taxonomyData'
import { exportReceipt } from '../../utils/pdfExport'
import { money } from '../../data/commerce'
import { notify } from '../../utils/feedback'
export default function OrderTrackingPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders] = useCollection('orders', [])
  const order = orders.find(order => String(order.id) === id)
  if (!order || (order.customerRut !== user.rut && !['Vendedor', 'Admin'].includes(user.role))) return <Card sx={{ p: 5 }}><Typography variant="h5">Pedido no encontrado</Typography><Button onClick={() => navigate('/mis-compras')}>Ver mis compras</Button></Card>
  const statuses = ['En preparación', 'Enviado', 'En reparto', 'Entregado', 'Recibido']
  const total = money(order.total)
  const net = order.net ?? Math.round(total / 1.19)
  return <Box sx={{ maxWidth: 1250, mx: 'auto' }}>
    <Breadcrumbs sx={{ mb: 2 }}><Link component="button" onClick={() => navigate('/inicio')}>Inicio</Link><Link component="button" onClick={() => navigate('/mis-compras')}>Mis compras</Link><Typography>Pedido {order.id}</Typography></Breadcrumbs>
    <Stack direction={{ xs: 'column', sm: 'row' }}   sx={[{ justifyContent: "space-between", gap: 2 }, { mb: 3 }]}><Box><Typography variant="h4">Seguimiento de pedido #{order.id}</Typography><Typography color="text.secondary">Comprado el {order.date.replace('\n', ' · ')}</Typography></Box><Chip label={order.status} color={order.status === 'Entregado' ? 'success' : 'primary'} /></Stack>
    <Card sx={{ p: { xs: 2, md: 4 }, mb: 3 }}><Typography variant="h6" sx={{ mb: 3 }}>Estado de tu pedido</Typography><Stepper alternativeLabel activeStep={Math.max(0, statuses.indexOf(order.status))}>{statuses.map((status, index) => <Step key={status} completed={statuses.indexOf(order.status) >= index}><StepLabel>{status}</StepLabel></Step>)}</Stepper></Card>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}><Stack spacing={3}>
        <Card sx={{ p: 3 }}><Typography variant="h6">Productos de tu compra</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Vendido por {order.store}</Typography>{order.products.map((item, index) => <Stack key={item.key || index} direction="row" spacing={2}  sx={[{ alignItems: "center" }, { py: 2 }]}><Box component="img" src={catalogImage(item)} alt={item.name} sx={{ width: 76, height: 76, objectFit: 'contain', borderRadius: 2 }} /><Box sx={{ flex: 1 }}><Typography  sx={{ fontWeight: 800 }}>{item.name}</Typography><Typography variant="caption" color="text.secondary">{item.detail} · Cantidad: {item.qty || 1}</Typography></Box><Typography  sx={{ fontWeight: 800 }}>{formatCLP(money(item.price) * (item.qty || 1))}</Typography></Stack>)}</Card>
        <Card sx={{ p: 3 }}><Stack direction="row"   sx={{ gap: 1, alignItems: "center" }}><LocalShippingOutlined color="primary" /><Typography variant="h6">Información del despacho</Typography></Stack><Typography sx={{ my: 2 }}>{order.address}</Typography><Typography>Transportista: {order.dispatch?.carrier || 'Pendiente de asignación'}</Typography><Stack direction="row"   sx={{ alignItems: "center", gap: 1 }}><Typography>Seguimiento: {order.dispatch?.tracking || 'Disponible cuando se despache'}</Typography>{order.dispatch?.tracking && <IconButton aria-label="Copiar seguimiento" onClick={() => navigator.clipboard.writeText(order.dispatch.tracking).then(() => notify('Seguimiento copiado.')).catch(() => notify('No se pudo copiar el seguimiento.', 'error'))}><ContentCopyOutlined fontSize="small" /></IconButton>}</Stack></Card>
        <Card sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>Historial de transacciones</Typography>{!order.history?.length && <Typography color="text.secondary">La carga no incluye el historial de cambios de este pedido.</Typography>}{(order.history || [{ date: order.createdAt || new Date().toISOString(), status: order.status }]).map((event, index) => <Stack key={index} direction="row"  sx={[{ justifyContent: "space-between" }, { py: 1 }]}><Typography variant="body2">{new Date(event.date).toLocaleString('es-CL')}</Typography><Typography  sx={{ fontWeight: 700 }}>{event.status}</Typography></Stack>)}</Card>
      </Stack></Grid>
      <Grid size={{ xs: 12, md: 4 }}><Card sx={{ p: 3 }}><Stack direction="row"   sx={{ gap: 1, alignItems: "center" }}><ReceiptLongOutlined color="primary" /><Typography variant="h6">Resumen de pago</Typography></Stack><Stack spacing={1.5} sx={{ mt: 2 }}>{[['Productos', total - (order.shipping || 0)], ['Despacho', order.shipping || 0], ['Neto sin IVA', net], ['IVA (19%)', order.iva ?? total - net]].map(([label, value]) => <Stack key={label} direction="row"  sx={{ justifyContent: "space-between" }}><Typography color="text.secondary">{label}</Typography><Typography>{formatCLP(value)}</Typography></Stack>)}<Divider /><Stack direction="row"  sx={{ justifyContent: "space-between" }}><Typography  sx={{ fontWeight: 800 }}>Total</Typography><Typography variant="h5" color="primary">{formatCLP(total)}</Typography></Stack></Stack><Typography sx={{ my: 2 }}>{order.payment} {order.cardLast4 ? '•••• ' + order.cardLast4 : order.transferCode}</Typography><Stack spacing={1.5}><Button variant="contained" startIcon={<DescriptionOutlined />} onClick={() => exportReceipt(order)}>Descargar comprobante</Button><Button variant="outlined" startIcon={<ChatOutlined />} onClick={() => navigate('/mensajes')}>Contactar vendedor</Button><Button variant="outlined" startIcon={<ReplayOutlined />} onClick={() => navigate('/catalogo')}>Seguir comprando</Button><Button onClick={() => navigate('/mis-compras')}>Mis compras y devoluciones</Button></Stack></Card></Grid>
    </Grid>
  </Box>
}
