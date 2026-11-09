import { NotificationsOutlined, SaveOutlined, SettingsOutlined } from '@mui/icons-material'
import { Box, Button, Card, Divider, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import useCollection from '../../hooks/useCollection'
import useAuth from '../../contexts/AuthContext/useAuth'
import { logEvent } from '../../data/localStore'
import { notify } from '../../utils/feedback'
export default function Settings() {
  const { user, selectedComuna, setSelectedComuna } = useAuth()
  const [saved, setSaved] = useCollection('preferences:' + user.rut, { orderNotices: true, messageNotices: true, promotions: false, reducedMotion: false })
  const [draft, setDraft] = useState(saved)
  const [comuna, setComuna] = useState(selectedComuna)
  const save = event => { event.preventDefault(); setSaved(draft); setSelectedComuna(comuna); document.documentElement.dataset.reducedMotion = String(draft.reducedMotion); logEvent('Guardar preferencias', { ...draft, comuna }); notify('Preferencias guardadas.') }
  return <Box sx={{ maxWidth: 900, mx: 'auto' }}><Stack direction="row"   sx={{ alignItems: "center", gap: 1 }}><SettingsOutlined color="primary" /><Typography variant="h4">Configuración</Typography></Stack><Typography color="text.secondary" sx={{ mb: 3, mt: 1 }}>Personaliza tus preferencias y la ubicación de entrega.</Typography><Card component="form" onSubmit={save} sx={{ p: { xs: 2, md: 4 } }}><Typography variant="h6" sx={{ mb: 2 }}>Ubicación predeterminada</Typography><TextField fullWidth select label="Comuna de entrega" value={comuna} onChange={event => setComuna(event.target.value)}>{['Osorno', 'Puerto Montt', 'Puerto Varas', 'Frutillar', 'Valdivia'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField><Divider sx={{ my: 3 }} /><Stack direction="row"  sx={{ gap: 1 }}><NotificationsOutlined color="primary" /><Typography variant="h6">Preferencias de notificaciones</Typography></Stack><Stack sx={{ my: 2 }}>{[['orderNotices', 'Novedades de pedidos y devoluciones'], ['messageNotices', 'Mensajes y respuestas del vendedor'], ['promotions', 'Ofertas y promociones'], ['reducedMotion', 'Reducir animaciones']].map(([key, label]) => <FormControlLabel key={key} label={label} control={<Switch checked={draft[key]} onChange={event => setDraft(current => ({ ...current, [key]: event.target.checked }))} />} />)}</Stack><Stack direction="row"   sx={{ gap: 1, justifyContent: "flex-end" }}><Button variant="outlined" onClick={() => { setDraft(saved); setComuna(selectedComuna) }}>Cancelar</Button><Button variant="contained" type="submit" startIcon={<SaveOutlined />}>Guardar preferencias</Button></Stack></Card></Box>
}
