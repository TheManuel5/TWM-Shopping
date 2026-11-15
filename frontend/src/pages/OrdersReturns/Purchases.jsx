import { useState } from 'react'
import { ExpandMoreRounded, ReceiptLongOutlined, StorefrontOutlined } from '@mui/icons-material'
import { Box, Button, Card, Divider, LinearProgress, Stack, Typography } from '@mui/material'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import { money } from '../../data/commerce'
import { catalogImage } from '../../utils/catalogImages'
import { formatCLP } from '../../utils/taxonomyData'

const BLOCK = 10
const delivered = order => ['Entregado', 'Recibido'].includes(order.status)

/** Historial de pedidos mostrado por bloques: el usuario decide cuándo ver más. */
export default function Purchases({ orders, onTrack, onReturn, onExplore }) {
  const [count, setCount] = useState(BLOCK)
  if (!orders.length) return <Card sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', maxWidth: 560, mx: 'auto' }}>
    <Box sx={{ display: 'grid', placeItems: 'center', width: 72, height: 72, mx: 'auto', mb: 2, borderRadius: '50%', bgcolor: 'secondary.light', color: 'primary.main' }}><ReceiptLongOutlined sx={{ fontSize: 34 }} /></Box>
    <Typography variant="h6">Aún no hay compras</Typography>
    <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>Cuando compres, tus pedidos aparecerán aquí.</Typography>
    <Button variant="contained" onClick={onExplore}>Explorar catálogo</Button>
  </Card>

  const visible = orders.slice(0, count)
  const remaining = orders.length - visible.length
  return <Stack spacing={2}>
    {visible.map(order => <Card key={order.id} sx={{ overflow: 'hidden' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, px: { xs: 2, sm: 3 }, py: 1.75, bgcolor: '#fbfaff' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800 }}>Pedido #{order.id}</Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary', minWidth: 0 }}>
            <Typography variant="caption" noWrap>{String(order.date || '').replace('\n', ' · ')}</Typography>
            {order.store && <><Typography variant="caption">·</Typography><StorefrontOutlined sx={{ fontSize: 14 }} /><Typography variant="caption" noWrap>{order.store}</Typography></>}
          </Stack>
        </Box>
        <StatusChip status={order.status} />
      </Stack>
      <Divider />
      <Stack sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>
        {order.products.map((item, index) => <Stack key={index} direction="row" spacing={2} sx={{ alignItems: 'center', py: 1 }}>
          <Box component="img" src={catalogImage(item)} alt="" loading="lazy" sx={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 2, bgcolor: '#f4f2ff', flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{item.name}</Typography>
            <Typography variant="caption" color="text.secondary">Cantidad: {item.qty || 1}</Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCLP(money(item.price) * (item.qty || 1))}</Typography>
        </Stack>)}
      </Stack>
      <Divider />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', px: { xs: 2, sm: 3 }, py: 1.75 }}>
        <Typography>Total <Box component="span" sx={{ fontWeight: 900, fontSize: '1.15rem', ml: 0.5 }}>{formatCLP(money(order.total))}</Box></Typography>
        <Stack direction="row" spacing={1}>
          {delivered(order) && <Button variant="outlined" onClick={() => onReturn(order)}>Solicitar devolución</Button>}
          <Button variant="contained" onClick={() => onTrack(order)}>Ver seguimiento</Button>
        </Stack>
      </Stack>
    </Card>)}

    <Stack spacing={1.5} sx={{ alignItems: 'center', pt: 2 }}>
      <Typography variant="body2" color="text.secondary">Viendo {visible.length.toLocaleString('es-CL')} de {orders.length.toLocaleString('es-CL')} pedidos</Typography>
      <LinearProgress variant="determinate" value={visible.length / orders.length * 100} aria-label="Pedidos vistos" sx={{ width: 220, height: 4 }} />
      {remaining > 0 && <Button variant="outlined" size="large" endIcon={<ExpandMoreRounded />} onClick={() => setCount(count + BLOCK)} sx={{ px: 4, borderRadius: 99, bgcolor: 'background.paper' }}>Ver {Math.min(BLOCK, remaining)} más</Button>}
    </Stack>
  </Stack>
}
