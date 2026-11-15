import { API_MODE } from '../../services/api'
import { AddOutlined, ChatOutlined, Inventory2Outlined } from '@mui/icons-material'
import { Alert, Box, Button, Card, Chip, Grid, MenuItem, Stack, Step, StepLabel, Stepper, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCollection from '../../hooks/useCollection'
import useAuth from '../../contexts/AuthContext/useAuth'
import { catalogSeed } from '../../data/catalog'
import { logEvent } from '../../data/localStore'
import { money } from '../../data/commerce'
import { formatCLP } from '../../utils/taxonomyData'
import { confirmAction, notify } from '../../utils/feedback'
import ImagePicker from '../../components/crud2/ImagePicker'
import Purchases from './Purchases'
import ShowMore from '../../components/molecules/ShowMore/ShowMore'
import useBlocks from '../../hooks/useBlocks'

export default function OrdersReturnsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const manager = ['Vendedor', 'Admin'].includes(user.role)
  const [orders] = useCollection('orders', [])
  const [returns, setReturns] = useCollection('returns', [])
  const [catalog, setCatalog] = useCollection('catalog', catalogSeed)
  const [tab, setTab] = useState('Compras')
  const [selection, setSelection] = useState('')
  const [reason, setReason] = useState('Talla incorrecta')
  const [qty, setQty] = useState(1)
  const [images, setImages] = useState([])
  const [activeId, setActiveId] = useState('')
  const [filter, setFilter] = useState('Todas')
  const mine = orders.filter(order => manager || order.customerRut === user.rut)
  const choices = mine.filter(order => ['Entregado', 'Recibido'].includes(order.status)).flatMap(order => order.products.map((product, index) => ({ key: `${order.id}:${index}`, order, product })))
  const selected = choices.find(choice => choice.key === selection) || choices[0]
  const activeReturn = returns.find(item => item.id === activeId) || returns[0]
  const visibleReturns = returns.filter(item => (manager || item.customerRut === user.rut) && (filter === 'Todas' || item.status === filter))
  const returnBlocks = useBlocks(visibleReturns, 10, filter)
  const alreadyRequested = selected ? returns.filter(item => item.itemKey === selected.key && item.status !== 'Rechazada').reduce((sum, item) => sum + item.qty, 0) : 0
  const remaining = selected ? (selected.product.qty || 1) - alreadyRequested : 0
  const createReturn = event => {
    event.preventDefault()
    if (!selected || !Number.isInteger(Number(qty)) || qty < 1 || qty > remaining) { notify('La cantidad supera las unidades entregadas disponibles para devolución.', 'error'); return }
    const request = { id: `DEV-${crypto.randomUUID().slice(0, 8)}`, orderId: selected.order.id, itemKey: selected.key, productId: selected.product.id, sku: selected.product.sku, product: selected.product.name, image: selected.product.image, qty: Number(qty), price: money(selected.product.price) * Number(qty), reason, date: new Date().toLocaleDateString('es-CL'), createdAt: new Date().toISOString(), customerRut: selected.order.customerRut || user.rut, status: 'Solicitada', images, history: ['Solicitada'] }
    setReturns(current => [request, ...current]); setActiveId(request.id); setQty(1); setImages([])
    logEvent('Solicitar devolución', { ...request, images: images.length }); notify('Solicitud de devolución creada.')
  }
  const updateStatus = async status => {
    if (!await confirmAction(`¿Cambiar la solicitud ${activeReturn.id} a ${status}?`, 'Actualizar devolución')) return
    let restocked = activeReturn.restocked
    if (!API_MODE && status === 'Aprobada' && !restocked) {
      setCatalog(catalog.map(product => {
        if (product.id !== activeReturn.productId) return product
        return { ...product, stock: product.stock + activeReturn.qty, variantes: product.variantes?.map(variant => variant.sku === activeReturn.sku ? { ...variant, stock: variant.stock + activeReturn.qty } : variant) }
      }))
      restocked = true
    }
    setReturns(current => current.map(item => item.id === activeReturn.id ? { ...item, status, restocked, history: [...item.history, status] } : item))
    logEvent('Actualizar devolución', { id: activeReturn.id, status }); notify('Solicitud actualizada.')
  }
  return <Box sx={{ maxWidth: 1240, mx: 'auto' }}><Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>{manager ? 'Pedidos y devoluciones' : 'Mis compras y devoluciones'}</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Consulta los pedidos, solicita una devolución y sigue el reembolso.</Typography>
    <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}><Tab value="Compras" label={'Compras (' + mine.length.toLocaleString('es-CL') + ')'} /><Tab value="Devoluciones" label={'Devoluciones (' + visibleReturns.length.toLocaleString('es-CL') + ')'} /></Tabs>
    {tab === 'Compras' ? <Purchases orders={mine} onTrack={order => navigate('/pedido/' + order.id)} onReturn={order => { setTab('Devoluciones'); setSelection(order.id + ':0') }} onExplore={() => navigate('/catalogo')} /> : <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth size="small" label="Estado" value={filter} onChange={event => setFilter(event.target.value)} sx={{ mb: 2 }}>{['Todas', 'Solicitada', 'Aprobada', 'Rechazada', 'Finalizada'].map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField><Stack spacing={2}>{returnBlocks.visible.map(item => <Card key={item.id} onClick={() => setActiveId(item.id)} sx={{ p: 2, cursor: 'pointer', borderColor: activeReturn?.id === item.id ? 'primary.main' : 'divider' }}><Typography  sx={{ fontWeight: 800 }}>{item.id}</Typography><Typography>{item.product}</Typography><Typography variant="caption">Pedido {item.orderId} · {item.date}</Typography><Chip size="small" label={item.status} sx={{ display: 'flex', mt: 1, width: 'fit-content' }} /></Card>)}{!visibleReturns.length && <Alert severity="info">No hay solicitudes en esta sección.</Alert>}<ShowMore {...returnBlocks} label="solicitudes" /></Stack></Grid>
      <Grid size={{ xs: 12, md: 8 }}><Stack spacing={2.5}>
        <Card component="form" onSubmit={createReturn} sx={{ p: 3 }}><Stack direction="row"   sx={[{ gap: 1, alignItems: "center" }, { mb: 2 }]}><Inventory2Outlined color="primary" /><Typography variant="h6">Solicitar nueva devolución</Typography></Stack>{!choices.length ? <Alert severity="info">Puedes solicitar devoluciones de pedidos entregados.</Alert> : <Stack spacing={2}><TextField select fullWidth label="Producto entregado" value={selected?.key || ''} onChange={event => { setSelection(event.target.value); setQty(1) }}>{choices.map(choice => <MenuItem key={choice.key} value={choice.key}>#{choice.order.id} · {choice.product.name}</MenuItem>)}</TextField><TextField select label="Motivo" value={reason} onChange={event => setReason(event.target.value)}>{['Talla incorrecta', 'Producto con falla', 'No coincide con descripción'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField><TextField required label="Cantidad a devolver" type="number" value={qty} onChange={event => setQty(Number(event.target.value))} helperText={`${remaining} unidades disponibles para devolver`} slotProps={{ htmlInput: { min: 1, max: remaining, step: 1 } }} /><ImagePicker images={images} onChange={setImages} max={3} /><Stack direction="row"   sx={{ justifyContent: "flex-end", gap: 1 }}><Button onClick={() => { setQty(1); setImages([]); setTab('Compras') }}>Cancelar</Button><Button type="submit" variant="contained" startIcon={<AddOutlined />} disabled={remaining <= 0}>Solicitar devolución</Button></Stack></Stack>}</Card>
        {activeReturn && (manager || activeReturn.customerRut === user.rut) && <Card sx={{ p: 3 }}><Typography variant="h6">Solicitud {activeReturn.id}</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>{activeReturn.reason} · {activeReturn.qty} unidades</Typography><Stepper activeStep={activeReturn.status === 'Finalizada' ? 3 : activeReturn.status === 'Aprobada' ? 1 : 0} alternativeLabel>{['Solicitada', 'Aprobada', 'Reembolso procesado'].map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper><Box sx={{ bgcolor: 'secondary.light', borderRadius: 2, p: 2, my: 3 }}><Typography>Importe solicitado</Typography><Typography variant="h4" color="primary">{formatCLP(activeReturn.price)}</Typography><Typography variant="caption">{activeReturn.status === 'Finalizada' ? 'Reembolso simulado procesado al medio de pago original.' : 'Se informará el resultado de la revisión de tu solicitud.'}</Typography></Box><Stack direction="row"   sx={{ gap: 1, flexWrap: "wrap" }}>{manager && activeReturn.status === 'Solicitada' && <><Button variant="contained" onClick={() => updateStatus('Aprobada')}>Aprobar devolución</Button><Button color="error" variant="outlined" onClick={() => updateStatus('Rechazada')}>Rechazar</Button></>}{!API_MODE && manager && activeReturn.status === 'Aprobada' && <Button variant="contained" onClick={() => updateStatus('Finalizada')}>Procesar reembolso simulado</Button>}<Button startIcon={<ChatOutlined />} onClick={() => navigate('/mensajes')}>Contactar vendedor</Button><Button onClick={() => notify('Conserva el embalaje y contacta al vendedor para coordinar la entrega del producto.', 'info')}>Ver instrucciones</Button></Stack></Card>}
      </Stack></Grid>
    </Grid>}
  </Box>
}
