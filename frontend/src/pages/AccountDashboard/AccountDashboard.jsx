import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, Chip, Grid, LinearProgress, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography } from '@mui/material'
import { ArrowForwardOutlined, AssessmentOutlined, BusinessOutlined, GroupOutlined, Inventory2Outlined, ShoppingBagOutlined } from '@mui/icons-material'
import useAuth from '../../contexts/AuthContext/useAuth'
import useCollection from '../../hooks/useCollection'
import { dashboardSummary } from '../../utils/dashboard'
import { formatCLP } from '../../utils/taxonomyData'
import AdminAnalytics from './AdminAnalytics'

export default function AccountDashboard({ global = false }) {
  const { user, switchRole } = useAuth(), navigate = useNavigate()
  const [orders] = useCollection('orders', []), [catalog] = useCollection('catalog', []), [users] = useCollection('users', []), [companies] = useCollection('companies', [])
  const [view, setView] = useState(user?.role === 'Vendedor' || user?.canBuy === false ? 'ventas' : 'compras')
  const seller = view === 'ventas'
  const data = dashboardSummary({ orders, catalog, users, companies, rut: user?.rut, seller, global })
  const metrics = global
    ? [['Usuarios registrados', data.users, <GroupOutlined />], ['Empresas registradas', data.companies, <BusinessOutlined />], ['Pedidos registrados', data.orders.length, <ShoppingBagOutlined />], ['Importe de ventas registrado', formatCLP(data.amount), <AssessmentOutlined />]]
    : [[seller ? 'Mis ventas' : 'Mis compras', data.orders.length, <ShoppingBagOutlined />], [seller ? 'Importe de mis ventas' : 'Importe de mis compras', formatCLP(data.amount), <AssessmentOutlined />], ['Pedidos pendientes', data.pending, <ShoppingBagOutlined />], [seller ? 'Mis publicaciones' : 'Pedidos cerrados', seller ? data.publications.length : data.orders.length - data.pending, <Inventory2Outlined />]]
  const actions = global
    ? [['Lista de usuarios', '/admin/usuarios', <GroupOutlined />], ['Empresas y emprendedores', '/admin/empresas', <BusinessOutlined />], ['Reportes y consultas', '/admin/reportes', <AssessmentOutlined />]]
    : seller ? [['Mis ventas y pedidos', '/crud-1', <ShoppingBagOutlined />], ['Mis publicaciones', '/crud-2', <Inventory2Outlined />], ['Inventario y ofertas', '/vendedor/inventario', <AssessmentOutlined />]]
      : [['Compras y devoluciones', '/mis-compras', <ShoppingBagOutlined />], ['Mis cotizaciones', '/cotizaciones', <AssessmentOutlined />], ['Mi perfil y direcciones', '/perfil', <GroupOutlined />]]
  return <Box sx={{ maxWidth: 1450, mx: 'auto' }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
      <Box><Chip size="small" label={global ? 'Administración general' : 'Solo información de tu cuenta'} sx={{ mb: 1 }} /><Typography variant="h4" component="h1">{global ? 'Panel de administración' : 'Panel de mi cuenta'}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{global ? 'Resumen de Shopping y accesos a la gestión de usuarios, empresas y reportes.' : 'Consulta tus estadísticas y gestiona tus operaciones desde un solo lugar.'}</Typography></Box>
      {global && <Button variant="contained" startIcon={<GroupOutlined />} onClick={() => navigate('/admin/usuarios')}>Ver lista de usuarios</Button>}
    </Stack>
    {!global && <Tabs value={view} onChange={(_, value) => { setView(value); switchRole(value === 'ventas' ? 'Vendedor' : 'Comprador') }} sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>{user?.canBuy !== false && <Tab value="compras" label="Mis compras" />}{user?.canSell && <Tab value="ventas" label="Mis ventas" />}</Tabs>}
    <Grid container spacing={2} sx={{ mb: 3 }}>{metrics.map(([label, value, icon]) => <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}><Card sx={{ p: 2.5, height: '100%', borderTop: '3px solid', borderTopColor: 'primary.main' }}><Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 2 }}><Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 2, bgcolor: 'secondary.main', color: 'primary.main', flexShrink: 0 }}>{icon}</Box><Typography variant="body2" color="text.secondary">{label}</Typography></Stack><Typography variant="h5" sx={{ overflowWrap: 'anywhere' }}>{typeof value === 'number' ? value.toLocaleString('es-CL') : value}</Typography></Card></Grid>)}</Grid>
    {global && <AdminAnalytics orders={data.orders} />}
    <Grid container spacing={3}>
      {!global && <Grid size={{ xs: 12, md: 8 }}><Card sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>Estado de los pedidos</Typography>{!data.states.length && <Typography color="text.secondary">Aún no hay operaciones registradas en esta vista.</Typography>}<Stack spacing={2}>{data.states.map(([status, count]) => <Box key={status}><Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}><Typography variant="body2">{status}</Typography><Typography variant="body2" fontWeight={700}>{count.toLocaleString('es-CL')}</Typography></Stack><LinearProgress variant="determinate" value={count / data.orders.length * 100} sx={{ height: 8 }} aria-label={`Pedidos ${status}`} /></Box>)}</Stack></Card></Grid>}
      <Grid size={{ xs: 12, md: global ? 12 : 4 }}><Card sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>Accesos rápidos</Typography><Stack direction={{ xs: 'column', md: global ? 'row' : 'column' }} spacing={1.5}>{actions.map(([label, path, icon], index) => <Button key={path} fullWidth variant={index === 0 ? 'contained' : 'outlined'} startIcon={icon} endIcon={<ArrowForwardOutlined />} onClick={() => navigate(path)} sx={{ justifyContent: 'flex-start', textAlign: 'left' }}>{label}</Button>)}</Stack></Card></Grid>
      <Grid size={12}><Card sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>{global ? 'Pedidos más recientes' : seller ? 'Mis ventas más recientes' : 'Mis compras más recientes'}</Typography><TableContainer><Table size="small" aria-label="Operaciones recientes"><TableHead><TableRow>{['Pedido', 'Fecha', seller || global ? 'Cliente' : 'Tienda', 'Estado', 'Total'].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{data.orders.slice(0, 5).map(order => <TableRow key={order.id}><TableCell><Button size="small" onClick={() => navigate(`/pedido/${order.id}`)}>#{order.id}</Button></TableCell><TableCell>{order.date}</TableCell><TableCell>{seller || global ? order.customer : order.store}</TableCell><TableCell>{order.status}</TableCell><TableCell>{formatCLP(order.total)}</TableCell></TableRow>)}{!data.orders.length && <TableRow><TableCell colSpan={5}>Tus operaciones aparecerán aquí cuando se registren.</TableCell></TableRow>}</TableBody></Table></TableContainer></Card></Grid>
    </Grid>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>Importes de pedidos no cancelados registrados en el sistema; no representan una confirmación de cobro bancario.</Typography>
  </Box>
}
