import PasswordField from '../forms/PasswordField'
import useAuth from '../../contexts/AuthContext/useAuth'
import { API_MODE, fetchApi } from '../../services/api'
import { AddOutlined, BusinessOutlined, DeleteOutlineOutlined, EditOutlined, GroupOutlined, SearchOutlined } from '@mui/icons-material'
import { Avatar, Box, Button, Card, Chip, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import useCollection from '../../hooks/useCollection'
import { logEvent } from '../../data/localStore'
import { confirmAction, notify } from '../../utils/feedback'
import { emailPattern, isValidRut, phonePattern } from '../../utils/validation'

const blankUser = { name: '', rut: '', email: '', phones: [''], birthDate: '', address: '', communeId: '', roles: ['Cliente'], status: 'Activo' }
const blankCompany = { name: '', rut: '', email: '', phones: [''], website: '', address: '', comuna: '', category: '', status: 'Activa', hasPhysicalStore: true, tags: [], owner: { name: '', run: '', phone: '', email: '', address: '' } }
export default function AdminDirectory({ kind, seed }) {
  const company = kind === 'companies'
  const { user } = useAuth()
  const [geography] = useCollection('geography', { communes: [] })
  const [rows, setRows] = useCollection(kind, seed)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todos')
  const [role, setRole] = useState('Todos')
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState(seed[0]?.id)
  const [draft, setDraft] = useState(null)
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [errors, setErrors] = useState({})
  const selected = rows.find(row => row.id === selectedId)
  const filtered = rows.filter(row => (!query || [row.name, row.rut, row.email, ...row.phones].join(' ').toLowerCase().includes(query.toLowerCase())) && (status === 'Todos' || row.status === status) && (company || role === 'Todos' || row.roles.includes(role)))
  const startEdit = row => { setDraft(structuredClone(row || (company ? blankCompany : blankUser))); setErrors({}) }
  const update = (key, value) => { setDraft(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: '' })) }
  const save = event => {
    event.preventDefault()
    const nextErrors = {}
    if (draft.name.trim().length < 3) nextErrors.name = 'Ingresa al menos tres caracteres.'
    if (!isValidRut(draft.rut)) nextErrors.rut = 'Ingresa un RUT válido.'
    if (!emailPattern.test(draft.email.trim())) nextErrors.email = 'Ingresa un correo válido.'
    if (!draft.address.trim() && (!company || draft.hasPhysicalStore)) nextErrors.address = 'La dirección es obligatoria.'
    if (!draft.phones.length || draft.phones.some(phone => !phonePattern.test(phone))) nextErrors.phones = 'Ingresa teléfonos válidos.'
    if (new Set(draft.phones.map(phone => phone.replace(/\D/g, ''))).size !== draft.phones.length) nextErrors.phones = 'Los teléfonos no pueden repetirse.'
    if (!company && (!draft.birthDate || draft.birthDate > new Date().toISOString().slice(0, 10))) nextErrors.birthDate = 'Fecha de nacimiento inválida.'
    if (!company && !draft.roles.length) nextErrors.roles = 'Selecciona al menos un rol.'
    if (rows.some(row => row.id !== draft.id && row.rut.replace(/[.\s]/g, '').toUpperCase() === draft.rut.replace(/[.\s]/g, '').toUpperCase())) nextErrors.rut = 'Este RUT ya existe.'
    if (rows.some(row => row.id !== draft.id && row.email.toLowerCase() === draft.email.trim().toLowerCase())) nextErrors.email = 'Este correo ya existe.'
    if (rows.some(row => row.id !== draft.id && row.phones.some(phone => draft.phones.some(value => value.replace(/\D/g, '') === phone.replace(/\D/g, ''))))) nextErrors.phones = 'Un teléfono ya pertenece a otro registro.'
    if (company) {
      if (draft.website && !/^https?:\/\/[\w.-]+\.[a-z]{2,}/i.test(draft.website)) nextErrors.website = 'Usa una URL que comience con https://.'
      if (!draft.owner.name.trim() || !isValidRut(draft.owner.run) || !emailPattern.test(draft.owner.email) || !phonePattern.test(draft.owner.phone) || !draft.owner.address.trim()) nextErrors.owner = 'Completa los datos válidos del emprendedor: nombre, RUN, correo, teléfono y dirección.'
    }
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }
    const saved = { ...draft, id: draft.id || Date.now(), name: draft.name.trim(), email: draft.email.trim().toLowerCase(), rut: draft.rut.toUpperCase(), address: draft.address.trim() }
    setRows(current => draft.id ? current.map(row => row.id === draft.id ? saved : row) : [...current, saved])
    setSelectedId(API_MODE ? saved.rut : saved.id); setDraft(null); setPage(0)
    logEvent(`${draft.id ? 'Actualizar' : 'Crear'} ${company ? 'empresa' : 'usuario'}`, saved)
    notify(!company && !draft.id ? 'Usuario creado. Selecciónalo para configurar su contraseña.' : 'Información guardada correctamente.')
  }
  const remove = async row => {
    if (!await confirmAction(company ? `¿Eliminar ${row.name}? PostgreSQL conservará las referencias que tengan historial.` : `¿Desactivar ${row.name}? Su historial se conservará y no podrá iniciar sesión.`)) return
    setRows(current => current.filter(item => item.id !== row.id)); setSelectedId(null); setPage(0)
    logEvent(`Eliminar ${company ? 'empresa' : 'usuario'}`, { id: row.id }); notify(company ? 'Eliminación solicitada.' : 'Cuenta desactivada; se conserva el historial.')
  }
  const field = (name, label, options = {}) => <TextField size="small" fullWidth required label={label} value={draft[name]} onChange={event => update(name, event.target.value)} disabled={name === 'rut' && Boolean(draft.id)} error={Boolean(errors[name])} helperText={errors[name]} {...options} />
  const editor = draft && <Box component="form" onSubmit={save} noValidate>
    <Stack spacing={2} sx={{ py: 1 }}>
      {field('name', company ? 'Nombre de la empresa' : 'Nombre completo')}
      {field('rut', company ? 'RUT empresa' : 'RUN / RUT')}
      {field('email', 'Correo electrónico', { type: 'email' })}
      {!company && field('birthDate', 'Fecha de nacimiento', { type: 'date', slotProps: { inputLabel: { shrink: true } } })}
      {draft.phones.map((phone, index) => <Stack key={index} direction="row" spacing={1}><TextField size="small" fullWidth label={`Teléfono ${index + 1}`} value={phone} onChange={event => update('phones', draft.phones.map((value, i) => i === index ? event.target.value : value))} error={Boolean(errors.phones)} helperText={index === 0 ? errors.phones : ''} /><IconButton aria-label={`Quitar teléfono ${index + 1}`} disabled={draft.phones.length === 1} onClick={() => update('phones', draft.phones.filter((_, i) => i !== index))}><DeleteOutlineOutlined /></IconButton></Stack>)}
      <Button variant="outlined" startIcon={<AddOutlined />} onClick={() => update('phones', [...draft.phones, ''])}>Agregar teléfono</Button>
      {!company && <TextField select required label="Comuna de despacho" value={draft.communeId || ''} onChange={event => update('communeId', event.target.value)}>{geography.communes.map(commune => <MenuItem key={commune.id} value={commune.id}>{commune.nombre}</MenuItem>)}</TextField>}
      {field('address', company ? 'Dirección del local' : 'Dirección de despacho', { required: !company || draft.hasPhysicalStore })}
      {!company && <TextField select  label="Roles" value={draft.roles} onChange={event => update('roles', event.target.value)} error={Boolean(errors.roles)} helperText={errors.roles} slotProps={{ select: { multiple: true } }}><MenuItem value="Cliente">Cliente</MenuItem><MenuItem value="Emprendedor">Emprendedor</MenuItem></TextField>}
      {company && <>
        {field('website', 'Sitio web (opcional)', { required: false })}
        {field('comuna', 'Comuna')}
        <TextField select label="Tipo de tienda" value={draft.hasPhysicalStore ? 'fisica' : 'online'} onChange={event => update('hasPhysicalStore', event.target.value === 'fisica')}><MenuItem value="fisica">Con tienda física</MenuItem><MenuItem value="online">Solo en línea</MenuItem></TextField>
        <Divider /><Typography  sx={{ fontWeight: 800 }}>Datos del emprendedor</Typography>
        {errors.owner && <Typography color="error" variant="caption">{errors.owner}</Typography>}
        {[['name', 'Nombre del emprendedor'], ['run', 'RUN del emprendedor'], ['email', 'Correo del emprendedor'], ['phone', 'Teléfono del emprendedor'], ['address', 'Dirección del emprendedor']].map(([key, label]) => <TextField key={key} label={label} size="small" required slotProps={key === 'address' && draft.id ? { input: { readOnly: true } } : undefined} helperText={key === 'address' && draft.id ? 'La dirección personal se gestiona desde Perfil y direcciones.' : ''} value={draft.owner[key]} onChange={event => update('owner', { ...draft.owner, [key]: event.target.value })} />)}
      </>}
      <TextField select label="Estado" value={draft.status} onChange={event => update('status', event.target.value)}>{(company ? ['Activa', 'En revisión', 'Suspendida'] : ['Activo', 'Inactivo']).map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      <Stack direction="row" spacing={1}  sx={{ justifyContent: "flex-end" }}><Button variant="outlined" onClick={() => setDraft(null)}>Cancelar</Button><Button type="submit" variant="contained">Guardar cambios</Button></Stack>
    </Stack>
  </Box>
  return <Box sx={{ maxWidth: 1500, mx: 'auto' }}>
    <Typography variant="caption" color="text.secondary">Panel de control / {company ? 'Empresas' : 'Usuarios'}</Typography>
    <Stack direction={{ xs: 'column', sm: 'row' }}   sx={[{ justifyContent: "space-between", gap: 2 }, { my: 2 }]}><Box><Typography variant="h4">{company ? 'Empresas y emprendedores' : 'Gestión de usuarios'}</Typography><Typography color="text.secondary">Administra la información de {company ? 'las tiendas y sus emprendedores.' : 'clientes y emprendedores registrados.'}</Typography></Box><Button variant="contained" startIcon={<AddOutlined />} onClick={() => startEdit()}>{company ? 'Nueva empresa' : 'Nuevo usuario'}</Button></Stack>
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, lg: selected ? 8 : 12 }}><Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField fullWidth size="small" placeholder="Buscar por nombre, RUT, correo o teléfono" value={query} onChange={event => { setQuery(event.target.value); setPage(0) }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> } }} />
          <TextField select size="small" label="Estado" sx={{ minWidth: 150 }} value={status} onChange={event => { setStatus(event.target.value); setPage(0) }}>{['Todos', ...(company ? ['Activa', 'En revisión', 'Suspendida'] : ['Activo', 'Inactivo'])].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
          {!company && <TextField select size="small" label="Tipo" value={role} sx={{ minWidth: 150 }} onChange={event => { setRole(event.target.value); setPage(0) }}>{['Todos', 'Cliente', 'Emprendedor'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>}
        </Stack>
        <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>RUT</TableCell><TableCell>Correo / Teléfono</TableCell><TableCell>Estado</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead><TableBody>
          {filtered.slice(page * 5, page * 5 + 5).map(row => <TableRow key={row.id} hover selected={selectedId === row.id} onClick={() => setSelectedId(row.id)} sx={{ cursor: 'pointer' }}><TableCell><Stack direction="row"   sx={{ alignItems: "center", gap: 1 }}><Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', width: 34, height: 34 }}>{row.name.slice(0, 1)}</Avatar><Box><Typography variant="body2"  sx={{ fontWeight: 700 }}>{row.name}</Typography><Typography variant="caption" color="text.secondary">{company ? row.owner.name : row.roles.join(' · ')}</Typography></Box></Stack></TableCell><TableCell>{row.rut}</TableCell><TableCell>{row.email}<Typography variant="caption"  sx={{ display: "block" }}>{row.phones.join(', ')}</Typography></TableCell><TableCell><Chip size="small" label={row.status} color={['Activo', 'Activa'].includes(row.status) ? 'success' : 'default'} /></TableCell><TableCell><IconButton aria-label={`Editar ${row.name}`} onClick={event => { event.stopPropagation(); startEdit(row) }}><EditOutlined fontSize="small" /></IconButton><IconButton disabled={company && !user?.canAdmin} color="error" aria-label={`${company ? 'Eliminar' : 'Desactivar'} ${row.name}`} onClick={event => { event.stopPropagation(); remove(row) }}><DeleteOutlineOutlined fontSize="small" /></IconButton></TableCell></TableRow>)}
          {!filtered.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}>No se encontraron registros.</TableCell></TableRow>}
        </TableBody></Table></TableContainer>
        <TablePagination component="div" count={filtered.length} page={Math.min(page, Math.max(0, Math.ceil(filtered.length / 5) - 1))} onPageChange={(_, value) => setPage(value)} rowsPerPage={5} rowsPerPageOptions={[5]} labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`} />
      </Card></Grid>
      {selected && <Grid size={{ xs: 12, lg: 4 }}><Card sx={{ p: 3 }}><Stack direction="row" spacing={1}  sx={{ alignItems: "center" }}>{company ? <BusinessOutlined color="primary" /> : <GroupOutlined color="primary" />}<Typography variant="h6">{selected.name}</Typography></Stack><Divider sx={{ my: 2 }} />{[['RUT', selected.rut], ['Correo', selected.email], ['Teléfonos', selected.phones.join(', ')], ['Dirección', selected.address], ['Tipo', company ? selected.category : selected.roles.join(', ')], ['Estado', selected.status]].map(([label, value]) => <Box key={label} sx={{ mb: 1.5 }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography sx={{ overflowWrap: 'anywhere' }}>{value}</Typography></Box>)}<Button variant="contained" fullWidth startIcon={<EditOutlined />} onClick={() => startEdit(selected)}>Editar información</Button><Button fullWidth sx={{ mt: 1 }} onClick={() => setSelectedId(null)}>Cerrar detalle</Button>{!company && <Button fullWidth variant="outlined" sx={{ mt: 1 }} onClick={() => { setNewPassword(''); setPasswordDialog(true) }}>Configurar contraseña</Button>}</Card></Grid>}
    </Grid>
    <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="xs" fullWidth><DialogTitle>Configurar contraseña</DialogTitle><DialogContent><Stack spacing={2} sx={{ py: 1 }}><Typography>Cuenta seleccionada: {selected?.rut}</Typography><PasswordField label="Nueva contraseña" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} helperText="Entre 8 y 72 bytes. Se cerrarán las otras sesiones." /><Button variant="contained" disabled={passwordBusy || newPassword.length < 8} onClick={async () => { setPasswordBusy(true); try { await fetchApi(`/admin/database/accounts/${encodeURIComponent(selected.rut)}/password`, { method: 'PUT', body: JSON.stringify({ next: newPassword }) }); setPasswordDialog(false); setNewPassword(''); notify('Contraseña configurada.') } catch (error) { notify(error.message, 'error') } finally { setPasswordBusy(false) } }}>Guardar contraseña</Button><Button onClick={() => setPasswordDialog(false)}>Cancelar</Button></Stack></DialogContent></Dialog>
    <Dialog open={Boolean(draft)} onClose={() => setDraft(null)} fullWidth maxWidth="sm"><DialogTitle>{draft?.id ? 'Editar' : 'Crear'} {company ? 'empresa' : 'usuario'}</DialogTitle><DialogContent>{editor}</DialogContent></Dialog>
  </Box>
}
