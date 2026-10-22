import {
  AddOutlined,
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterListOutlined,
  GroupOutlined,
  PhoneOutlined,
  SearchOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import '../../components/orders/Orders.css'

/* ─── Datos iniciales alineados al esquema de DB ─────────────────────────────
   Cliente  : RUN, Nombre, Apellido, FechaNac, Passwd
   Emprendedor: RUN, Nombre, Apellido, FechaNac, Passwd, Web, Empresa_id
   Correo   : Correo (PK), [Cliente_id | Emprendedor_id]
   Telefono : Telefono (PK), [Emprendedor_id | Cliente_id]
   Direccion: CodPostal, Calle, Numero, Pasaje, Sector, Comuna_id
   RUNs verificados con algoritmo módulo 11
──────────────────────────────────────────────────────────────────────────── */
const INITIAL_USERS = [
  {
    run: '12345678-5',          // válido: mod11 → DV=5
    nombre: 'Ana',
    apellido: 'Torres',
    fechaNac: '1990-03-15',
    passwd: 'clave123',
    web: 'https://anatienda.cl',
    empresaId: '77987654-3',    // válido: mod11 → DV=3
    correos: ['ana.torres@gmail.com'],
    telefonos: ['998765432'],
    direccion: { calle: 'Av. Manuel Rodríguez', numero: '1234', pasaje: '', sector: 'Centro', comunaId: 10301 },
    roles: ['Cliente', 'Emprendedor'],
  },
  {
    run: '11111111-1',          // válido: mod11 → DV=1
    nombre: 'Carlos',
    apellido: 'Mena',
    fechaNac: '1988-07-22',
    passwd: 'clave123',
    web: '',
    empresaId: '',
    correos: ['carlos.mena@outlook.com'],
    telefonos: ['987654321'],
    direccion: { calle: 'Calle Bilbao', numero: '567', pasaje: '', sector: '', comunaId: 10301 },
    roles: ['Cliente'],
  },
  {
    run: '98765432-5',          // válido: mod11 → DV=5
    nombre: 'Valentina',
    apellido: 'Ruiz',
    fechaNac: '1995-11-04',
    passwd: 'clave123',
    web: 'https://vruiz.cl',
    empresaId: '78901234-2',    // válido: mod11 → DV=2
    correos: ['valentina.ruiz@gmail.com'],
    telefonos: ['976543210'],
    direccion: { calle: 'Av. Juan Mackenna', numero: '851', pasaje: '', sector: '', comunaId: 10301 },
    roles: ['Cliente', 'Emprendedor'],
  },
  {
    run: '76543210-3',          // válido: mod11 → DV=3
    nombre: 'Diego',
    apellido: 'Soto',
    fechaNac: '1992-01-19',
    passwd: 'clave123',
    web: 'https://diegosoto.cl',
    empresaId: '76543219-7',    // válido: mod11 → DV=7
    correos: ['diego.soto@correo.cl'],
    telefonos: ['965432109'],
    direccion: { calle: 'Los Carrera', numero: '1450', pasaje: '', sector: '', comunaId: 10301 },
    roles: ['Emprendedor'],
  },
  {
    run: '55555555-5',          // válido: mod11 → DV=5
    nombre: 'Javier',
    apellido: 'Paredes',
    fechaNac: '1985-05-30',
    passwd: 'clave123',
    web: '',
    empresaId: '79012345-K',    // válido: mod11 → DV=K
    correos: ['javier.paredes@outlook.com'],
    telefonos: ['999887766'],
    direccion: { calle: 'Errázuriz', numero: '920', pasaje: '', sector: '', comunaId: 10301 },
    roles: ['Emprendedor'],
  },
]

const USER_TEMPLATE = {
  run: '',
  nombre: '',
  apellido: '',
  fechaNac: '',
  passwd: '',
  web: '',
  empresaId: '',
  correos: [''],
  telefonos: [''],
  direccion: { calle: '', numero: '', pasaje: '', sector: '', comunaId: 10301 },
  roles: ['Cliente'],
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TODAY = new Date().toISOString().split('T')[0]
const MIN_DATE = '1940-01-01'

/**
 * Algoritmo oficial de verificación de RUN/RUT chileno (módulo 11).
 * Acepta formato: 12345678-5 | 1234567-K | 76543210-3
 * (sin puntos, con guión obligatorio)
 */
function validarRUT(input) {
  if (!input || typeof input !== 'string') return false
  const clean = input.replace(/[.\s]/g, '').toUpperCase()
  if (!/^\d{7,9}-[0-9K]$/.test(clean)) return false
  const dash = clean.lastIndexOf('-')
  const body = clean.slice(0, dash)
  const dv = clean.slice(dash + 1)
  let sum = 0, mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const result = 11 - (sum % 11)
  const expected = result === 11 ? '0' : result === 10 ? 'K' : String(result)
  return dv === expected
}

function getValidationErrors(d) {
  const e = {}
  // RUN — obligatorio y verificado con módulo 11
  if (!d.run.trim()) e.run = 'El RUN es obligatorio'
  else if (!/^\d{7,8}-[0-9kK]$/.test(d.run.trim())) e.run = 'Formato inválido (ej: 12345678-5 o 1234567-K)'
  else if (!validarRUT(d.run)) e.run = 'RUN inválido — dígito verificador incorrecto'
  // Nombre / Apellido
  if (!d.nombre.trim()) e.nombre = 'El nombre es obligatorio'
  else if (d.nombre.trim().length > 30) e.nombre = 'Máximo 30 caracteres'
  if (!d.apellido.trim()) e.apellido = 'El apellido es obligatorio'
  else if (d.apellido.trim().length > 30) e.apellido = 'Máximo 30 caracteres'
  // FechaNac — DB: >= 1940-01-01 y <= hoy
  if (!d.fechaNac) e.fechaNac = 'La fecha de nacimiento es obligatoria'
  else if (d.fechaNac < MIN_DATE) e.fechaNac = 'La fecha debe ser posterior a 1940'
  else if (d.fechaNac > TODAY) e.fechaNac = 'La fecha no puede ser futura'
  // Passwd
  if (!d.passwd.trim()) e.passwd = 'La contraseña es obligatoria'
  else if (d.passwd.trim().length < 6) e.passwd = 'Mínimo 6 caracteres'
  // Correo
  if (!d.correos[0]?.trim()) e.correo = 'El correo es obligatorio'
  else if (!EMAIL_REGEX.test(d.correos[0])) e.correo = 'Correo inválido'
  // Teléfono — DB: INT, solo dígitos
  if (!d.telefonos[0]?.trim()) e.telefono = 'El teléfono es obligatorio'
  else if (!/^\d{7,15}$/.test(d.telefonos[0].replace(/\s+/g, ''))) e.telefono = 'Solo dígitos, mínimo 7'
  // Roles
  if (!d.roles.length) e.roles = 'Selecciona al menos un rol'
  // Empresa_id: si está relleno, validar con módulo 11
  if (d.roles.includes('Emprendedor') && d.empresaId.trim()) {
    if (!/^\d{7,9}-[0-9kK]$/.test(d.empresaId.trim())) e.empresaId = 'Formato RUT inválido (ej: 77987654-3)'
    else if (!validarRUT(d.empresaId)) e.empresaId = 'RUT empresa inválido — dígito verificador incorrecto'
  }
  // Dirección
  if (!d.direccion.calle.trim()) e.calle = 'La calle es obligatoria'
  if (!d.direccion.numero.toString().trim()) e.numero = 'El número es obligatorio'
  else if (isNaN(Number(d.direccion.numero)) || Number(d.direccion.numero) <= 0) e.numero = 'Debe ser un número positivo'
  return e
}

const CANCEL_SX = {
  textTransform: 'none', color: '#4b5563', backgroundColor: '#e5e7eb',
  '&:hover': { backgroundColor: '#d1d5db' }, boxShadow: 'none', fontWeight: 700,
}
const CONFIRM_SX = {
  textTransform: 'none', backgroundColor: '#6430df',
  '&:hover': { backgroundColor: '#5324c4' }, boxShadow: 'none', fontWeight: 700,
}
const SECTION_LABEL_SX = {
  fontWeight: 700, display: 'block', mb: 1, mt: 2,
  color: '#6430df', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem',
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [tab, setTab] = useState('Todos')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedRole, setAppliedRole] = useState('Todos')
  const [appliedTab, setAppliedTab] = useState('Todos')
  const [notice, setNotice] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingRun, setEditingRun] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [draft, setDraft] = useState(USER_TEMPLATE)
  const [formErrors, setFormErrors] = useState({})

  const applyFilters = () => {
    setAppliedSearch(search)
    setAppliedRole(roleFilter)
    setAppliedTab(tab)
  }

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('Todos')
    setTab('Todos')
    setAppliedSearch('')
    setAppliedRole('Todos')
    setAppliedTab('Todos')
  }

  const filteredUsers = users.filter((u) => {
    const matchTab =
      appliedTab === 'Todos' ||
      (appliedTab === 'Clientes' && u.roles.includes('Cliente')) ||
      (appliedTab === 'Emprendedores' && u.roles.includes('Emprendedor'))
    const matchRole =
      appliedRole === 'Todos' ||
      (appliedRole === 'Ambos' && u.roles.includes('Cliente') && u.roles.includes('Emprendedor')) ||
      (appliedRole === 'Cliente' && u.roles.includes('Cliente')) ||
      (appliedRole === 'Emprendedor' && u.roles.includes('Emprendedor'))
    const needle = appliedSearch.toLowerCase()
    const matchSearch =
      !needle ||
      u.run.toLowerCase().includes(needle) ||
      u.nombre.toLowerCase().includes(needle) ||
      u.apellido.toLowerCase().includes(needle) ||
      u.correos.some((c) => c.toLowerCase().includes(needle))
    return matchTab && matchRole && matchSearch
  })

  const openEditModal = (user) => {
    setEditingRun(user.run)
    setDraft({
      ...user,
      correos: [...user.correos],
      telefonos: [...user.telefonos],
      roles: [...user.roles],
      direccion: { ...user.direccion },
    })
    setFormErrors({})
    setEditOpen(true)
  }

  const openCreate = () => {
    setEditingRun(null)
    setDraft({ ...USER_TEMPLATE, correos: [''], telefonos: [''], roles: ['Cliente'], direccion: { calle: '', numero: '', pasaje: '', sector: '', comunaId: 10301 } })
    setFormErrors({})
    setEditOpen(true)
  }

  const closeEditModal = () => { setEditOpen(false); setEditingRun(null); setFormErrors({}) }

  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const updateDireccion = (field, value) => {
    setDraft((prev) => ({ ...prev, direccion: { ...prev.direccion, [field]: value } }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const updateCorreo = (idx, value) => {
    setDraft((prev) => { const next = [...prev.correos]; next[idx] = value; return { ...prev, correos: next } })
    if (idx === 0) setFormErrors((prev) => ({ ...prev, correo: '' }))
  }

  const updateTelefono = (idx, value) => {
    setDraft((prev) => { const next = [...prev.telefonos]; next[idx] = value; return { ...prev, telefonos: next } })
    if (idx === 0) setFormErrors((prev) => ({ ...prev, telefono: '' }))
  }

  const toggleRole = (role) => {
    setDraft((prev) => {
      const has = prev.roles.includes(role)
      return { ...prev, roles: has ? prev.roles.filter((r) => r !== role) : [...prev.roles, role] }
    })
    setFormErrors((prev) => ({ ...prev, roles: '' }))
  }

  const saveUser = (event) => {
    event.preventDefault()
    const errors = getValidationErrors(draft)
    setFormErrors(errors)
    if (Object.keys(errors).length) return
    if (editingRun) {
      setUsers((prev) => prev.map((u) => u.run === editingRun ? { ...draft } : u))
      setNotice('Usuario actualizado correctamente')
    } else {
      setUsers((prev) => [...prev, { ...draft }])
      setNotice('Usuario creado correctamente')
    }
    closeEditModal()
  }

  const confirmDeleteUser = () => {
    if (!deletingUser) return
    setUsers((prev) => prev.filter((u) => u.run !== deletingUser.run))
    setNotice('Usuario eliminado correctamente')
    setDeleteOpen(false)
    setDeletingUser(null)
  }

  return (
    <Box className="orders-page">
      <Box className="orders-main">
        {/* Breadcrumb */}
        <Box className="orders-breadcrumb">Panel de control <span>/</span> Gestión de usuarios</Box>

        {/* Encabezado */}
        <Box className="orders-heading">
          <Box className="orders-title-group">
            <GroupOutlined color="primary" fontSize="large" />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>Gestión de usuarios</Typography>
              <Typography color="text.secondary">
                Administra clientes y emprendedores: datos, correos, teléfonos y direcciones.
              </Typography>
            </Box>
            <Chip label={`${users.length} total`} size="small" color="primary" variant="outlined" />
          </Box>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>
            Agregar usuario
          </Button>
        </Box>

        {/* Filtros */}
        <Box className="orders-filters">
          <TextField
            className="orders-search"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por RUN, nombre, apellido o correo..."
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment>,
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')} edge="end" sx={{ color: 'text.secondary' }}>
                      <ClearOutlined fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <Select size="small" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} displayEmpty>
            <MenuItem value="Todos">Rol: Todos</MenuItem>
            <MenuItem value="Ambos">Ambos (Dual)</MenuItem>
            <MenuItem value="Cliente">Solo Cliente</MenuItem>
            <MenuItem value="Emprendedor">Solo Emprendedor</MenuItem>
          </Select>
          <Button variant="contained" startIcon={<FilterListOutlined />} onClick={applyFilters}>Aplicar filtros</Button>
        </Box>

        {/* Tabs */}
        <Tabs value={appliedTab} onChange={(_, v) => { setTab(v); setAppliedTab(v) }} sx={{ mb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }} variant="fullWidth">
          <Tab value="Todos" label={`Todos (${users.length})`} />
          <Tab value="Clientes" label={`Clientes (${users.filter((u) => u.roles.includes('Cliente')).length})`} />
          <Tab value="Emprendedores" label={`Emprendedores (${users.filter((u) => u.roles.includes('Emprendedor')).length})`} />
        </Tabs>

        {/* Tabla */}
        <Paper className="orders-table-paper orders-table-paper--fixed">
          <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '13%' }}>RUN</TableCell>
                <TableCell sx={{ width: '12%' }}>Nombre</TableCell>
                <TableCell sx={{ width: '12%' }}>Apellido</TableCell>
                <TableCell align="center" sx={{ width: '23%' }}>Correo</TableCell>
                <TableCell align="center" sx={{ width: '15%' }}>Teléfono</TableCell>
                <TableCell align="center" sx={{ width: '14%' }}>Roles</TableCell>
                <TableCell align="center" sx={{ width: '11%', px: 2 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No hay usuarios que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.run} hover sx={{ cursor: 'default' }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.run}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{u.nombre}</TableCell>
                    <TableCell>{u.apellido}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.correos[0]}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.82rem' }}>{u.telefonos[0]}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap justifyContent="center">
                        {u.roles.map((role) => (
                          <Chip key={role} label={role} size="small" sx={{ fontSize: '0.7rem' }} />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="center" sx={{ px: 2 }}>
                      <Tooltip title="Editar usuario">
                        <IconButton size="small" onClick={() => openEditModal(u)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar usuario">
                        <IconButton size="small" color="error" onClick={() => { setDeletingUser(u); setDeleteOpen(true) }}>
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* ══════════════════════ DIALOG EDITAR / CREAR ══════════════════════ */}
      <Dialog open={editOpen} onClose={closeEditModal} fullWidth maxWidth="md" scroll="paper">
        <Box component="form" onSubmit={saveUser}>
          <DialogTitle sx={{ fontWeight: 700, color: '#000', borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
            {editingRun ? 'Actualizar datos de usuario' : 'Nuevo usuario'}
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            {/* ── Identificación ── */}
            <Typography sx={SECTION_LABEL_SX}>Identificación (Cliente / Emprendedor)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField required label="RUN" size="small" value={draft.run}
                onChange={(e) => updateDraft('run', e.target.value)}
                error={Boolean(formErrors.run)} helperText={formErrors.run}
                InputLabelProps={{ shrink: true }} placeholder="12345678-K" />
              <TextField required label="Nombre" size="small" value={draft.nombre}
                onChange={(e) => updateDraft('nombre', e.target.value)}
                error={Boolean(formErrors.nombre)} helperText={formErrors.nombre}
                InputLabelProps={{ shrink: true }} />
              <TextField required label="Apellido" size="small" value={draft.apellido}
                onChange={(e) => updateDraft('apellido', e.target.value)}
                error={Boolean(formErrors.apellido)} helperText={formErrors.apellido}
                InputLabelProps={{ shrink: true }} />
              <TextField required type="date" label="Fecha de nacimiento" size="small" value={draft.fechaNac}
                onChange={(e) => updateDraft('fechaNac', e.target.value)}
                error={Boolean(formErrors.fechaNac)} helperText={formErrors.fechaNac}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: MIN_DATE, max: TODAY } }} />
              <TextField required type="password" label="Passwd" size="small" value={draft.passwd}
                onChange={(e) => updateDraft('passwd', e.target.value)}
                error={Boolean(formErrors.passwd)} helperText={formErrors.passwd}
                InputLabelProps={{ shrink: true }} />
            </Box>

            {/* ── Roles ── */}
            <Typography sx={{ ...SECTION_LABEL_SX, mt: 2.5 }}>Roles</Typography>
            <Stack direction="row" spacing={1}>
              <FormControlLabel
                control={<Checkbox size="small" checked={draft.roles.includes('Cliente')} onChange={() => toggleRole('Cliente')} />}
                label="Cliente" />
              <FormControlLabel
                control={<Checkbox size="small" checked={draft.roles.includes('Emprendedor')} onChange={() => toggleRole('Emprendedor')} />}
                label="Emprendedor" />
            </Stack>
            {formErrors.roles && <Typography variant="caption" color="error">{formErrors.roles}</Typography>}

            {/* ── Datos Emprendedor (condicional) ── */}
            {draft.roles.includes('Emprendedor') && (
              <>
                <Typography sx={{ ...SECTION_LABEL_SX, mt: 2.5 }}>Datos de Emprendedor</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField label="Web" size="small" value={draft.web}
                    onChange={(e) => updateDraft('web', e.target.value)}
                    InputLabelProps={{ shrink: true }} placeholder="https://..." />
                  <TextField label="Empresa_id (RUT empresa)" size="small" value={draft.empresaId}
                    onChange={(e) => updateDraft('empresaId', e.target.value)}
                    InputLabelProps={{ shrink: true }} placeholder="00000001-K" />
                </Box>
              </>
            )}

            {/* ── Correos (tabla Correo) ── */}
            <Typography sx={{ ...SECTION_LABEL_SX, mt: 2.5 }}>Correos — tabla Correo</Typography>
            <Stack spacing={1}>
              {draft.correos.map((correo, idx) => (
                <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                  <TextField fullWidth size="small" type="email" value={correo}
                    onChange={(e) => updateCorreo(idx, e.target.value)}
                    error={idx === 0 && Boolean(formErrors.correo)} helperText={idx === 0 ? formErrors.correo : ''}
                    placeholder="correo@ejemplo.com" />
                  <IconButton size="small" color="error" disabled={draft.correos.length <= 1}
                    onClick={() => setDraft((prev) => ({ ...prev, correos: prev.correos.filter((_, i) => i !== idx) }))}>
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Button size="small" variant="outlined" startIcon={<AddOutlined />} sx={{ alignSelf: 'flex-start' }}
                onClick={() => setDraft((prev) => ({ ...prev, correos: [...prev.correos, ''] }))}>
                Agregar correo
              </Button>
            </Stack>

            {/* ── Teléfonos (tabla Telefono) ── */}
            <Typography sx={{ ...SECTION_LABEL_SX, mt: 2.5 }}>Teléfonos — tabla Telefono</Typography>
            <Stack spacing={1}>
              {draft.telefonos.map((tel, idx) => (
                <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                  <TextField fullWidth size="small" value={tel}
                    onChange={(e) => updateTelefono(idx, e.target.value)}
                    error={idx === 0 && Boolean(formErrors.telefono)} helperText={idx === 0 ? formErrors.telefono : ''}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlined fontSize="small" /></InputAdornment> } }}
                    placeholder="912345678" />
                  <IconButton size="small" color="error" disabled={draft.telefonos.length <= 1}
                    onClick={() => setDraft((prev) => ({ ...prev, telefonos: prev.telefonos.filter((_, i) => i !== idx) }))}>
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Button size="small" variant="outlined" startIcon={<AddOutlined />} sx={{ alignSelf: 'flex-start' }}
                onClick={() => setDraft((prev) => ({ ...prev, telefonos: [...prev.telefonos, ''] }))}>
                Agregar teléfono
              </Button>
            </Stack>

            {/* ── Dirección (tabla Direccion) ── */}
            <Typography sx={{ ...SECTION_LABEL_SX, mt: 2.5 }}>Dirección — tabla Direccion</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField required label="Calle" size="small" value={draft.direccion.calle}
                onChange={(e) => updateDireccion('calle', e.target.value)}
                error={Boolean(formErrors.calle)} helperText={formErrors.calle}
                InputLabelProps={{ shrink: true }} sx={{ gridColumn: 'span 2' }} />
              <TextField required label="Número" size="small" value={draft.direccion.numero}
                onChange={(e) => updateDireccion('numero', e.target.value)}
                error={Boolean(formErrors.numero)} helperText={formErrors.numero}
                InputLabelProps={{ shrink: true }} />
              <TextField label="Pasaje" size="small" value={draft.direccion.pasaje}
                onChange={(e) => updateDireccion('pasaje', e.target.value)}
                InputLabelProps={{ shrink: true }} />
              <TextField label="Sector" size="small" value={draft.direccion.sector}
                onChange={(e) => updateDireccion('sector', e.target.value)}
                InputLabelProps={{ shrink: true }} />
              <TextField select label="Comuna_id" size="small" value={draft.direccion.comunaId}
                onChange={(e) => updateDireccion('comunaId', Number(e.target.value))}
                InputLabelProps={{ shrink: true }}>
                <MenuItem value={10301}>10301 — Osorno</MenuItem>
              </TextField>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={closeEditModal} variant="contained" sx={CANCEL_SX}>Cancelar</Button>
            <Button type="submit" variant="contained" sx={CONFIRM_SX}>
              {editingRun ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ══════════════════════ DIALOG ELIMINAR ══════════════════════ */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>¿Eliminar usuario?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esta acción eliminará a <strong>{deletingUser?.nombre} {deletingUser?.apellido}</strong>
            {' '}(RUN: <code>{deletingUser?.run}</code>) del sistema.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="contained" sx={CANCEL_SX}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmDeleteUser}
            sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={2600} onClose={() => setNotice('')}>
        <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>
      </Snackbar>
    </Box>
  )
}
