import {
  DescriptionOutlined,
  LocalShippingOutlined,
  LocationOnOutlined,
  SearchOutlined,
  SendOutlined,
  StorefrontOutlined,
  VerifiedOutlined,
} from '@mui/icons-material'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import shoeImage from '../../assets/products/shoe.jpg'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'

const CONVERSATIONS = [
  { id: 'tienda-sur', name: 'Tienda Sur', initials: 'TS', lastMsg: 'Perfecto, entonces te reservo la talla 42...', time: '10:24', unread: 2, online: true },
  { id: 'tecno-austral', name: 'Tecnología Austral', initials: 'TA', lastMsg: 'Hola Ana, hemos despachado tu equipo...', time: 'Ayer', unread: 1, online: true },
  { id: 'audio-austral', name: 'Audio Austral', initials: 'AA', lastMsg: 'Sí, contamos con stock disponible...', time: '12 sep', unread: 0, online: false },
  { id: 'casa-hogar', name: 'Casa & Hogar Sur', initials: 'CH', lastMsg: '¡Muchas gracias por tu compra!', time: '10 sep', unread: 0, online: false },
]

const INITIAL_MESSAGES = [
  { id: 1, from: 'me', time: '10:15', text: 'Hola, quería consultar si tienen este modelo de zapatillas en talla 42. ¿Me podrían confirmar también el tiempo de entrega a Osorno?' },
  { id: 2, from: 'store', time: '10:18', text: 'Hola Ana, ¡gracias por escribirnos! Sí, tenemos stock disponible en talla 42. El tiempo de entrega a Osorno es de 2 a 3 días hábiles.' },
  { id: 3, from: 'me', time: '10:20', text: 'Genial. Ya hice la compra en el pedido #1032. ¿Me avisan cuando lo despachen?' },
  { id: 4, from: 'store', time: '10:24', text: 'Perfecto, entonces te reservo la talla 42. Te avisaremos por este mismo medio cuando tu pedido sea despachado. ¡Muchas gracias por tu compra!' },
]

export default function MessagesPage() {
  const navigate = useNavigate()
  const [activeConv, setActiveConv] = useState('tienda-sur')
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [text, setText] = useState('')
  const [filterChip, setFilterChip] = useState('Todos')

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: 'me', time: 'Ahora', text: text.trim() },
    ])
    setText('')
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Mensajes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Conversa directamente con las tiendas sobre tus pedidos, productos y cotizaciones (RF19).
      </Typography>

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        <Grid container sx={{ minHeight: 620 }}>
          {/* Columna 1: Lista de Conversaciones (P12) */}
          <Grid item xs={12} md={3.5} sx={{ borderRight: '1px solid', borderColor: 'divider', p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar conversaciones..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 1.5 }}
            />

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              {['Todos', 'No leídos (2)', 'Pedidos'].map((f) => (
                <Chip
                  key={f}
                  label={f}
                  size="small"
                  color={filterChip === f ? 'primary' : 'default'}
                  onClick={() => setFilterChip(f)}
                />
              ))}
            </Stack>

            <Stack spacing={1}>
              {CONVERSATIONS.map((c) => {
                const selected = c.id === activeConv
                return (
                  <Paper
                    key={c.id}
                    elevation={0}
                    onClick={() => setActiveConv(c.id)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      borderRadius: 2.5,
                      bgcolor: selected ? 'secondary.main' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'text.primary', fontWeight: 800 }}>{c.initials}</Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                          {c.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.time}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 160 }}>
                          {c.lastMsg}
                        </Typography>
                        {c.unread > 0 && <Badge badgeContent={c.unread} color="primary" sx={{ mr: 1 }} />}
                      </Stack>
                    </Box>
                  </Paper>
                )
              })}
            </Stack>
          </Grid>

          {/* Columna 2: Ventana de Chat Activa (P12) */}
          <Grid item xs={12} md={5.5} sx={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'text.primary', fontWeight: 800 }}>TS</Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Tienda Sur</Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>● En línea</Typography>
              </Box>
            </Box>

            <Box sx={{ p: 2.5, flexGrow: 1, bgcolor: '#fbfaff', overflowY: 'auto' }}>
              <Stack spacing={2}>
                {messages.map((m) => {
                  const isMe = m.from === 'me'
                  return (
                    <Box
                      key={m.id}
                      sx={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.75,
                          borderRadius: 3,
                          bgcolor: isMe ? 'secondary.main' : 'background.paper',
                          border: isMe ? 'none' : '1px solid #e5e7f0',
                        }}
                      >
                        <Typography variant="body2">{m.text}</Typography>
                      </Paper>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.4, textAlign: isMe ? 'right' : 'left' }}>
                        {m.time}
                      </Typography>
                    </Box>
                  )
                })}

                {/* Tarjeta Embebida del Pedido #1032 alineada con Talla 42 (P12) */}
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box component="img" src={shoeImage} alt="" sx={{ width: 54, height: 54, borderRadius: 2, objectFit: 'cover' }} />
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Pedido #1032</Typography>
                        <StatusChip status="En preparación" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Zapatillas New Balance 574 · Talla 42 · Gris
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>$29.990</Typography>
                    </Box>
                  </Stack>
                  <Button variant="outlined" size="small" onClick={() => navigate('/pedido/1032')}>
                    Ver pedido →
                  </Button>
                </Paper>
              </Stack>
            </Box>

            {/* Respuestas rápidas e Input de Mensaje */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<StorefrontOutlined fontSize="small" />}
                  label="Consultar disponibilidad"
                  variant="outlined"
                  color="primary"
                  onClick={() => setText('¿Tienen stock disponible para retiro hoy en Osorno?')}
                />
                <Chip
                  icon={<LocalShippingOutlined fontSize="small" />}
                  label="Consultar envío"
                  variant="outlined"
                  color="primary"
                  onClick={() => setText('¿Cuál es el número de seguimiento de mi despacho?')}
                />
                <Chip
                  icon={<DescriptionOutlined fontSize="small" />}
                  label="Solicitar cotización"
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/cotizaciones')}
                />
              </Stack>

              <Stack component="form" onSubmit={handleSend} direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe un mensaje para Tienda Sur..."
                />
                <IconButton type="submit" sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}>
                  <SendOutlined fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </Grid>

          {/* Columna 3: Información de la tienda y Producto en conversación (P12) */}
          <Grid item xs={12} md={3} sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Información de la tienda
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'text.primary', fontWeight: 800 }}>TS</Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Tienda Sur</Typography>
                <Typography variant="caption">★ <strong>4,8</strong> (1.256 reseñas)</Typography>
              </Box>
            </Stack>

            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnOutlined fontSize="small" color="primary" />
                <Typography variant="caption">Osorno, Los Lagos</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocalShippingOutlined fontSize="small" color="primary" />
                <Typography variant="caption">Despachos a todo Chile</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedOutlined fontSize="small" color="primary" />
                <Typography variant="caption">Tienda verificada</Typography>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
              Producto en conversación
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Box component="img" src={shoeImage} alt="" sx={{ width: 52, height: 52, borderRadius: 2, objectFit: 'cover' }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                    Zapatillas New Balance 574
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>$29.990</Typography>
                </Box>
              </Stack>
              <Select fullWidth size="small" value="42" sx={{ mb: 1 }}>
                <MenuItem value="42">Talla: 42</MenuItem>
              </Select>
              <Select fullWidth size="small" value="Gris" sx={{ mb: 1.5 }}>
                <MenuItem value="Gris">Color: Gris</MenuItem>
              </Select>
              <Button variant="outlined" fullWidth size="small" onClick={() => navigate('/producto/1')}>
                Ver producto
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Card>
    </Box>
  )
}