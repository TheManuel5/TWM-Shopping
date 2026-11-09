import { AdminPanelSettingsOutlined, ShoppingCartOutlined, StorefrontOutlined } from '@mui/icons-material'
import { Box, FormControl, InputLabel, MenuItem, Select, Stack, Tooltip, Typography } from '@mui/material'
import { useId } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../contexts/AuthContext/useAuth'
export default function RoleSwitcher({ showAdmin = true }) {
  const { user, switchRole } = useAuth(), navigate = useNavigate(), id = useId()
  const modes = [
    ...(user?.canBuy !== false ? [{ value: 'Comprador', label: 'Comprador', icon: <ShoppingCartOutlined fontSize="small" />, path: '/perfil' }] : []),
    ...(user?.canSell || user?.serverRole === 'Vendedor' || !user?.serverRole && user?.role === 'Vendedor' ? [{ value: 'Vendedor', label: 'Vendedor', icon: <StorefrontOutlined fontSize="small" />, path: '/vendedor/dashboard' }] : []),
    ...(showAdmin && user?.canAdmin ? [{ value: 'Admin', label: 'Administrador', icon: <AdminPanelSettingsOutlined fontSize="small" />, path: '/admin/usuarios' }] : []),
  ]
  const selected = modes.some(mode => mode.value === user?.role) ? user.role : modes[0]?.value || ''
  return <Box sx={{ width: '100%' }}><FormControl size="small" fullWidth><InputLabel id={id}>Modo de uso</InputLabel><Select labelId={id} label="Modo de uso" value={selected} onChange={event => { if (!user) { navigate('/login'); return } const mode = modes.find(mode => mode.value === event.target.value); switchRole(mode.value); navigate(mode.path) }} sx={{ bgcolor: 'secondary.light', borderRadius: 2 }}>{modes.map(mode => <MenuItem key={mode.value} value={mode.value}><Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: mode.value === selected ? 'primary.main' : 'text.primary' }}>{mode.icon}<Typography variant="body2" fontWeight={600}>{mode.label}</Typography></Stack></MenuItem>)}</Select></FormControl><Tooltip title="Puedes comprar y vender con la misma cuenta. Administrador solo está disponible si se te asignó ese permiso."><Typography component="p" variant="caption" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.4 }}>Elige la vista que necesitas.</Typography></Tooltip></Box>
}
