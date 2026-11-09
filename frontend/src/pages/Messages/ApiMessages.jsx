import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Alert, Avatar, Box, Button, Card, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { SendOutlined } from '@mui/icons-material'
import useAuth from '../../contexts/AuthContext/useAuth'
import useCollection from '../../hooks/useCollection'
import { logEvent, flushPersistence, getPersistenceStatus, loadRemoteState, writeCollections } from '../../data/localStore'
import { notify } from '../../utils/feedback'
export default function ApiMessages() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [catalog] = useCollection('catalog', [])
  const [conversations] = useCollection('conversations', [])
  const [messages] = useCollection('messages', [])
  const [orders] = useCollection('orders', [])
  const [active, setActive] = useState('')
  const [seller, setSeller] = useState(params.get('vendedor') || '')
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const stores = [...new Map(catalog.map(item => [item.ownerRut, { rut: item.ownerRut, name: item.vendedor, productId: item.id }])).values()]
  const thread = conversations.find(item => item.id === active) || conversations[0]
  const threadMessages = messages.filter(message => message.conversationId === thread?.id)
  const related = orders.filter(order => order.customerRut === thread?.customerRut && order.sellerRut === thread?.sellerRut)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden && !getPersistenceStatus().pending) loadRemoteState().catch(error => notify(error.message, 'error'))
    }, 10000)
    return () => clearInterval(timer)
  }, [])
  const start = async () => {
    const store = stores.find(item => item.rut === seller) || stores[0]
    if (!store) return
    const existing = conversations.find(item => item.customerRut === user.rut && item.sellerRut === store.rut)
    if (existing) { setActive(existing.id); return }
    const conversation = { id: `${store.productId.split('-')[0]}:${store.productId.split('-')[1]}:${user.rut}:${store.rut}`, name: store.name, initials: store.name.slice(0, 2), customerName: user.nombre, customerRut: user.rut, sellerRut: store.rut, productId: store.productId, lastMsg: '', time: 'Ahora', unread: 0 }
    setBusy(true)
    try { writeCollections({ conversations: [...conversations, conversation] }); await flushPersistence(); setActive(conversation.id) }
    catch (error) { notify(error.message, 'error') } finally { setBusy(false) }
  }
  const send = async event => {
    event.preventDefault()
    if (!thread || !text.trim() || text.trim().length > 2000 || busy) return
    const message = { id: crypto.randomUUID(), conversationId: thread.id, text: text.trim(), time: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }), from: user.rut === thread.sellerRut ? 'store' : 'me', senderRut: user.rut, customerRut: thread.customerRut, sellerRut: thread.sellerRut }
    setBusy(true)
    try {
      writeCollections({ messages: [...messages, message], conversations: conversations.map(item => item.id === thread.id ? { ...item, lastMsg: message.text, time: 'Ahora' } : item) })
      await flushPersistence(); logEvent('Mensaje guardado', { id: message.id, conversationId: thread.id }); setText('')
    } catch (error) { notify(error.message, 'error') } finally { setBusy(false) }
  }
  return <Box sx={{ maxWidth: 1320, mx: 'auto' }}><Typography variant="h4">Mensajes</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Consulta sobre productos y pedidos. Las conversaciones se actualizan cada 10 segundos.</Typography>
    <Card sx={{ p: 0 }}><Grid container sx={{ minHeight: 600 }}>
      <Grid size={{ xs: 12, md: 3.5 }} sx={{ p: 2, borderRight: '1px solid', borderColor: 'divider' }}><Stack spacing={2}>
        <TextField size="small" label="Buscar conversaciones" value={search} onChange={event => setSearch(event.target.value)} />
        <TextField select size="small" label="Tienda" value={seller || stores[0]?.rut || ''} onChange={event => setSeller(event.target.value)}>{stores.map(store => <MenuItem key={store.rut} value={store.rut}>{store.name}</MenuItem>)}</TextField>
        <Button variant="contained" disabled={busy || !stores.length} onClick={start}>Nueva conversación</Button>
        {conversations.filter(item => `${item.name} ${item.customerName}`.toLowerCase().includes(search.toLowerCase())).map(item => <Button key={item.id} variant={item.id === thread?.id ? 'outlined' : 'text'} onClick={() => setActive(item.id)} sx={{ p: 2, justifyContent: 'flex-start', textAlign: 'left' }}><Avatar sx={{ mr: 1, bgcolor: 'secondary.main', color: 'primary.main' }}>{item.initials}</Avatar><Box><Typography fontWeight={700}>{user.rut === item.customerRut ? item.name : item.customerName}</Typography><Typography variant="caption" color="text.secondary">{item.lastMsg || 'Sin mensajes'}</Typography></Box></Button>)}
      </Stack></Grid>
      <Grid size={{ xs: 12, md: 5.5 }} sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>{thread ? user.rut === thread.customerRut ? thread.name : thread.customerName : 'Selecciona una conversación'}</Typography>
        <Stack spacing={2} sx={{ p: 3, bgcolor: '#fbfaff', flex: 1, maxHeight: 600, overflowY: 'auto' }}>{!threadMessages.length && <Alert severity="info">{thread ? 'Escribe para iniciar la conversación.' : 'Elige una tienda y crea una conversación.'}</Alert>}{threadMessages.map(message => <Box key={message.id} sx={{ alignSelf: message.senderRut === user.rut ? 'flex-end' : 'flex-start', maxWidth: '85%' }}><Box sx={{ bgcolor: message.senderRut === user.rut ? 'secondary.main' : 'background.paper', borderRadius: 3, p: 2, overflowWrap: 'anywhere' }}><Typography>{message.text}</Typography></Box><Typography variant="caption" color="text.secondary">{message.time}</Typography></Box>)}</Stack>
        <Stack component="form" onSubmit={send} direction="row" spacing={1} sx={{ p: 2 }}><TextField size="small" fullWidth label="Escribe tu mensaje" value={text} disabled={!thread || busy} onChange={event => setText(event.target.value)} slotProps={{ htmlInput: { maxLength: 2000 } }} /><Button type="submit" variant="contained" disabled={!thread || busy || !text.trim()} startIcon={<SendOutlined />}>Enviar</Button></Stack>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }} sx={{ p: 2 }}><Typography variant="h6" sx={{ mb: 2 }}>Pedidos relacionados</Typography><Stack spacing={2}>{related.map(order => <Card key={order.id} sx={{ p: 2 }}><Typography fontWeight={700}>#{order.id}</Typography><Chip size="small" label={order.status} sx={{ my: 1 }} /><Typography>{order.products.map(item => item.name).join(', ')}</Typography><Button href={`/pedido/${order.id}`}>Ver pedido</Button></Card>)}{!related.length && <Typography color="text.secondary">No hay pedidos asociados a esta conversación.</Typography>}</Stack></Grid>
    </Grid></Card>
  </Box>
}
