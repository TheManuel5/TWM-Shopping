import { useNavigate, useParams } from 'react-router-dom'
import { ChatOutlined, ContentCopyOutlined, DescriptionOutlined, LocalShippingOutlined, ReceiptLongOutlined } from '@mui/icons-material'
import { Box, Breadcrumbs, Button, Card, Divider, IconButton, Link, Stack, Step, StepLabel, Stepper, Tooltip, Typography } from '@mui/material'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import useAuth from '../../contexts/AuthContext/useAuth'
import { money } from '../../data/commerce'
import useCollection from '../../hooks/useCollection'
import { API_MODE } from '../../services/api'
import { catalogImage } from '../../utils/catalogImages'
import { notify } from '../../utils/feedback'
import { exportReceipt } from '../../utils/pdfExport'
import { formatCLP } from '../../utils/taxonomyData'

// En PostgreSQL «Recibido» es la confirmación final del cliente; en modo demo es el registro inicial del pedido.
const STATUSES = API_MODE ? ['En preparación', 'Enviado', 'En reparto', 'Entregado', 'Recibido'] : ['Recibido', 'En preparación', 'Enviado', 'Entregado']

export default function OrderTrackingPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders] = useCollection('orders', [])
  const order = orders.find(order => String(order.id) === id)
  if (!order || (order.customerRut !== user.rut && !['Vendedor', 'Admin'].includes(user.role))) return <Card sx={{ p: 5, textAlign: 'center', maxWidth: 560, mx: 'auto' }}><Typography variant="h5" sx={{ mb: 2 }}>Pedido no encontrado</Typography><Button variant="contained" onClick={() => navigate('/mis-compras')}>Ver mis compras</Button></Card>

  const total = money(order.total)
  const net = order.net ?? Math.round(total / 1.19)
  const current = STATUSES.indexOf(order.status)
  const cancelled = current < 0
  const copyTracking = () => navigator.clipboard.writeText(order.dispatch.tracking).then(() => notify('Seguimiento copiado.')).catch(() => notify('No se pudo copiar el seguimiento.', 'error'))
  const payment = [['Productos', total - (order.shipping || 0)], ['Despacho', order.shipping || 0], ['Valor neto', net], ['IVA (19 %)', order.iva ?? total - net]]
  const history = order.history?.length ? order.history : [{ date: order.createdAt || new Date().toISOString(), status: order.status }]

  return <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
    <Breadcrumbs sx={{ mb: 2, fontSize: '0.85rem' }}>
      <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/inicio')}>Inicio</Link>
      <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/mis-compras')}>Mis compras</Link>
      <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>Pedido {order.id}</Typography>
    </Breadcrumbs>
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>Pedido #{order.id}</Typography>
        <Typography variant="body2" color="text.secondary">Comprado el {String(order.date || '').replace('\n', ' · ')}</Typography>
      </Box>
      <StatusChip status={order.status} />
    </Stack>

    <Card sx={{ p: { xs: 2, md: 4 }, mb: 3, overflowX: 'auto' }}>
      <Typography variant="h6" component="h2" sx={{ mb: 3 }}>Estado del pedido</Typography>
      {cancelled
        ? <Typography color="text.secondary">Este pedido está en estado «{order.status}».</Typography>
        : <Stepper alternativeLabel activeStep={current} sx={{ minWidth: 420 }}>
          {STATUSES.map((status, index) => <Step key={status} completed={index < current || (index === current && current === STATUSES.length - 1)}><StepLabel>{status}</StepLabel></Step>)}
        </Stepper>}
    </Card>

    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>
      <Stack spacing={3}>
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" component="h2">Artículos</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Vendido por {order.store}</Typography>
          <Stack divider={<Divider />}>
            {order.products.map((item, index) => <Stack key={item.key || index} direction="row" spacing={2} sx={{ alignItems: 'center', py: 1.5 }}>
              <Box component="img" src={catalogImage(item)} alt="" sx={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 2, bgcolor: '#f4f2ff', flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                <Typography variant="caption" color="text.secondary">{[item.detail, `Cantidad: ${item.qty || 1}`].filter(Boolean).join(' · ')}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800 }}>{formatCLP(money(item.price) * (item.qty || 1))}</Typography>
            </Stack>)}
          </Stack>
        </Card>

        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}><LocalShippingOutlined color="primary" /><Typography variant="h6" component="h2">Despacho</Typography></Stack>
          <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, rowGap: 1.25 }}>
            <Typography component="dt" variant="body2" color="text.secondary">Dirección</Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600 }}>{order.address || 'Retiro con el vendedor'}</Typography>
            <Typography component="dt" variant="body2" color="text.secondary">Transportista</Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 600 }}>{order.dispatch?.carrier || 'Pendiente de asignación'}</Typography>
            <Typography component="dt" variant="body2" color="text.secondary">N.º de seguimiento</Typography>
            <Stack component="dd" direction="row" spacing={0.5} sx={{ m: 0, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.dispatch?.tracking || 'Disponible cuando se despache'}</Typography>
              {order.dispatch?.tracking && <Tooltip title="Copiar"><IconButton size="small" aria-label="Copiar seguimiento" onClick={copyTracking}><ContentCopyOutlined sx={{ fontSize: 16 }} /></IconButton></Tooltip>}
            </Stack>
          </Box>
        </Card>

        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>Historial</Typography>
          <Stack divider={<Divider />}>
            {history.map((event, index) => <Stack key={index} direction="row" sx={{ justifyContent: 'space-between', gap: 2, py: 1.25 }}>
              <Typography variant="body2" color="text.secondary">{new Date(event.date).toLocaleString('es-CL')}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{event.status}</Typography>
            </Stack>)}
          </Stack>
        </Card>
      </Stack>

      <Card component="aside" aria-label="Resumen de pago" sx={{ p: 3, position: { md: 'sticky' }, top: { md: 88 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}><ReceiptLongOutlined color="primary" /><Typography variant="h6" component="h2">Resumen de pago</Typography></Stack>
        <Stack spacing={1.25}>
          {payment.map(([label, value]) => <Stack key={label} direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCLP(value)}</Typography>
          </Stack>)}
          <Divider />
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography sx={{ fontWeight: 800 }}>Total</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.02em', color: 'primary.main' }}>{formatCLP(total)}</Typography>
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{order.payment} {order.cardLast4 ? '•••• ' + order.cardLast4 : order.transferCode}</Typography>
        <Stack spacing={1.25} sx={{ mt: 2.5 }}>
          <Button variant="contained" startIcon={<DescriptionOutlined />} onClick={() => exportReceipt(order)}>Descargar comprobante</Button>
          <Button variant="outlined" startIcon={<ChatOutlined />} onClick={() => navigate('/mensajes')}>Contactar vendedor</Button>
          <Button onClick={() => navigate('/mis-compras')}>Volver a mis compras</Button>
        </Stack>
      </Card>
    </Box>
  </Box>
}
