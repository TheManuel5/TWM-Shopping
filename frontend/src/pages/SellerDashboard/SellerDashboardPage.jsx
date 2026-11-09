import { catalogImage } from '../../utils/catalogImages'
import useSellerCollection from '../../hooks/useSellerCollection'
import { collectionEntries } from '../../data/localStore'
import { dateKey } from '../../utils/dates'
import { AssignmentReturnOutlined, BarChartOutlined, ChatOutlined, DescriptionOutlined, FileDownloadOutlined, Inventory2Outlined, ShoppingCartOutlined, WarningAmberOutlined } from '@mui/icons-material'
import { Box, Button, Card, Chip, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCollection from '../../hooks/useCollection'
import { catalogSeed } from '../../data/catalog'
import { money } from '../../data/commerce'
import { formatCLP } from '../../utils/taxonomyData'
import { exportDocument } from '../../utils/pdfExport'
import StatMetricCard from '../../components/molecules/StatMetricCard/StatMetricCard'

export default function SellerDashboardPage() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => dateKey().slice(0, 7))
  const [orders] = useCollection('orders', [])
  const [catalog] = useSellerCollection('catalog', catalogSeed)
  const [quotes] = useCollection('quotes', [])
  const [returns] = useCollection('returns', [])
  const selected = orders.filter(order => order.createdAt && dateKey(order.createdAt).startsWith(month))
  const sales = selected.filter(order => order.status !== 'Cancelado')
  const total = sales.reduce((sum, order) => sum + money(order.total), 0)
  const low = catalog.filter(product => product.tipo !== 'Servicio' && product.stock < 10)
  const pendingQuotes = quotes.filter(quote => quote.status === 'Solicitada')
  const pendingOrders = orders.filter(order => ['En preparación', 'Enviado', 'En reparto'].includes(order.status))
  const pendingReturns = returns.filter(item => item.status === 'Solicitada')
  const days = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate() || 31
  const bars = Array.from({ length: days }, (_, index) => ({ day: index + 1, amount: sales.filter(order => Number(dateKey(order.createdAt).slice(8, 10)) === index + 1).reduce((sum, order) => sum + money(order.total), 0) }))
  const max = Math.max(1, ...bars.map(bar => bar.amount))
  const reviews = collectionEntries().filter(([key]) => key.startsWith('reviews:')).flatMap(([, values]) => values)
  const satisfaction = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '—'
  const refunds = returns.filter(item => item.status === 'Aprobada')
  const exportHistory = () => exportDocument('SHOPPING - HISTORIAL TRANSACCIONAL', [
    `Periodo: ${month} | Ingresos: ${formatCLP(total)}`,
    ...selected.map(order => `${order.id} | ${order.customer} | ${formatCLP(money(order.total))} | ${order.status}`),
    'Devoluciones y reembolsos:',
    ...returns.map(item => `${item.id} | Pedido ${item.orderId} | ${item.reason} | ${item.status} | ${formatCLP(item.price)}`),
    `Capital reintegrado: ${formatCLP(refunds.reduce((sum, item) => sum + item.price, 0))}`,
  ], `historial-${month}.pdf`)
  return <Box sx={{ maxWidth: 1450, mx: 'auto' }}><Stack direction={{ xs: 'column', sm: 'row' }}   sx={[{ justifyContent: "space-between", gap: 2 }, { mb: 3 }]}><Box><Typography variant="h4">Panel de control</Typography><Typography color="text.secondary">Resumen comercial, inventario y operaciones de tu tienda.</Typography></Box><TextField type="month" label="Periodo" value={month} onChange={event => { if (event.target.value) setMonth(event.target.value) }} slotProps={{ inputLabel: { shrink: true } }} /></Stack>
    <Grid container spacing={2} sx={{ mb: 3 }}>{[{ title: 'Ventas del mes', value: formatCLP(total), icon: <BarChartOutlined /> }, { title: 'Pedidos', value: String(selected.length), icon: <ShoppingCartOutlined /> }, { title: 'Stock bajo', value: String(low.length), icon: <WarningAmberOutlined /> }, { title: 'Cotizaciones pendientes', value: String(pendingQuotes.length), icon: <DescriptionOutlined /> }].map(metric => <Grid key={metric.title} size={{ xs: 12, sm: 6, lg: 3 }}><StatMetricCard {...metric} subtitle={metric.title === 'Stock bajo' ? 'Menos de 10 unidades' : 'Datos de la demostración'} /></Grid>)}</Grid>
    <Grid container spacing={3} sx={{ mb: 3 }}><Grid size={{ xs: 12, lg: 8 }}><Card sx={{ p: 3, height: '100%' }}><Stack direction="row"  sx={{ justifyContent: "space-between" }}><Typography variant="h6">Ventas diarias</Typography><Typography  sx={{ fontWeight: 800 }}>{formatCLP(total)}</Typography></Stack><Box role="img" aria-label={`Ventas por día de ${month}. Total ${formatCLP(total)}`} sx={{ display: 'flex', alignItems: 'flex-end', height: 250, gap: { xs: 0.3, md: 0.8 }, borderBottom: '1px solid', borderColor: 'divider', mt: 3 }}>{bars.map(bar => <Tooltip key={bar.day} title={`Día ${bar.day}: ${formatCLP(bar.amount)}`}><Box sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}><Box sx={{ height: Math.max(2, bar.amount / max * 200), bgcolor: 'primary.main', borderRadius: '5px 5px 0 0' }} /><Typography variant="caption" sx={{ fontSize: 10 }}>{bar.day % 5 === 0 || bar.day === 1 ? bar.day : ''}</Typography></Box></Tooltip>)}</Box>{!sales.length && <Typography color="text.secondary" sx={{ mt: 2 }}>Sin ventas en el periodo seleccionado.</Typography>}</Card></Grid><Grid size={{ xs: 12, lg: 4 }}><Card sx={{ p: 3, height: '100%' }}><Typography variant="h6" sx={{ mb: 2 }}>Acciones pendientes</Typography><Stack spacing={2}>{[{ title: 'Preparar pedidos', count: pendingOrders.length, icon: <Inventory2Outlined />, path: '/crud-1' }, { title: 'Responder cotizaciones', count: pendingQuotes.length, icon: <ChatOutlined />, path: '/cotizaciones' }, { title: 'Revisar devoluciones', count: pendingReturns.length, icon: <AssignmentReturnOutlined />, path: '/mis-compras' }].map(action => <Button key={action.title} variant="outlined" onClick={() => navigate(action.path)} startIcon={action.icon} sx={{ py: 2, justifyContent: 'space-between' }}>{action.title}<Chip size="small" label={action.count} /></Button>)}</Stack><Typography variant="subtitle2" sx={{ mt: 3 }}>Pedidos entregados</Typography><Typography variant="h4" color="primary">{orders.filter(order => order.status === 'Entregado').length}</Typography><Typography variant="caption" color="text.secondary">Reembolsos procesados: {formatCLP(refunds.reduce((sum, item) => sum + item.price, 0))}</Typography></Card></Grid></Grid>
    <Grid container spacing={3}><Grid size={{ xs: 12, lg: 8 }}><Card sx={{ p: 3 }}><Stack direction="row"    sx={[{ justifyContent: "space-between", flexWrap: "wrap", gap: 2 }, { mb: 2 }]}><Typography variant="h6">Historial de transacciones</Typography><Button variant="outlined" startIcon={<FileDownloadOutlined />} onClick={exportHistory}>Exportar historial PDF</Button></Stack><TableContainer><Table size="small"><TableHead><TableRow>{['Pedido', 'Fecha', 'Cliente', 'Total', 'Estado'].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{selected.map(order => <TableRow hover key={order.id} onClick={() => navigate(`/pedido/${order.id}`)} sx={{ cursor: 'pointer' }}><TableCell>{order.id}</TableCell><TableCell>{order.date.replace('\n', ' ')}</TableCell><TableCell>{order.customer}</TableCell><TableCell>{formatCLP(money(order.total))}</TableCell><TableCell><Chip size="small" label={order.status} /></TableCell></TableRow>)}{!selected.length && <TableRow><TableCell colSpan={5}>No hay transacciones en este periodo.</TableCell></TableRow>}</TableBody></Table></TableContainer></Card></Grid><Grid size={{ xs: 12, lg: 4 }}><Card sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>Alertas de inventario</Typography><Stack spacing={2}>{low.map(product => <Stack direction="row" key={product.id}   sx={{ gap: 1, alignItems: "center" }}><Box component="img" src={catalogImage(product)} alt={product.nombre} sx={{ width: 48, height: 48, objectFit: 'contain' }} /><Typography variant="body2" sx={{ flex: 1 }}>{product.nombre}</Typography><Chip label={product.stock} color="warning" size="small" /></Stack>)}{!low.length && <Typography color="text.secondary">El inventario no presenta alertas.</Typography>}<Button onClick={() => navigate('/vendedor/inventario')}>Ver inventario</Button></Stack></Card></Grid></Grid>
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12, md: 6 }}><Card sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>Distribución de pedidos</Typography>{['Recibido', 'En preparación', 'Enviado', 'Entregado', 'Cancelado'].map(status => { const count = selected.filter(order => order.status === status).length; return <Box key={status} sx={{ mb: 1.5 }}><Stack direction="row" sx={{ justifyContent: 'space-between' }}><Typography variant="body2">{status}</Typography><Typography variant="body2">{count}</Typography></Stack><Box role="meter" aria-label={status} aria-valuenow={count} aria-valuemin={0} aria-valuemax={selected.length || 1} sx={{ height: 8, bgcolor: 'secondary.light', borderRadius: 1, mt: 0.5 }}><Box sx={{ width: `${count / Math.max(1, selected.length) * 100}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 1 }} /></Box></Box> })}</Card></Grid>
      <Grid size={{ xs: 12, md: 6 }}><Card sx={{ p: 3 }}><Stack direction="row" sx={{ justifyContent: 'space-between', mb: 2 }}><Typography variant="h6">Satisfacción de compradores</Typography><Typography color="primary" sx={{ fontWeight: 800 }}>{satisfaction} / 5</Typography></Stack>{[5, 4, 3, 2, 1].map(stars => { const count = reviews.filter(review => Math.round(review.rating) === stars).length; return <Box key={stars} sx={{ mb: 1.5 }}><Stack direction="row" sx={{ justifyContent: 'space-between' }}><Typography variant="body2">{stars} estrellas</Typography><Typography variant="body2">{count}</Typography></Stack><Box sx={{ height: 8, bgcolor: 'secondary.light', borderRadius: 1, mt: 0.5 }}><Box sx={{ width: `${count / Math.max(1, reviews.length) * 100}%`, height: '100%', bgcolor: 'warning.main', borderRadius: 1 }} /></Box></Box> })}{!reviews.length && <Typography variant="caption" color="text.secondary">Se mostrará la información cuando existan reseñas.</Typography>}</Card></Grid>
    </Grid>
  </Box>
}
