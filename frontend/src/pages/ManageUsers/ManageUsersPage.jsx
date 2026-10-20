import {
  AddOutlined,
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
  Checkbox,
} from '@mui/material'
import { useState } from 'react'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import '../../components/orders/Orders.css'

const INITIAL_USERS = [
  {
    id: 1,
    name: 'Ana Torres',
    rut: '12.345.678-9',
    email: 'ana.torres@gmail.com',
    phones: ['+56 9 9876 5432', '+56 9 1234 5678'],
    birthDate: '1990-03-15',
    address: 'Av. Manuel Rodríguez 1234, Osorno, Los Lagos',
    roles: ['Cliente', 'Emprendedor'],
    status: 'Activo',
  },
  {
    id: 2,
    name: 'Carlos Mena',
    rut: '11.234.567-8',
    email: 'carlos.mena@outlook.com',
    phones: ['+56 9 8765 4321'],
    birthDate: '1988-07-22',
    address: 'Calle Bilbao 567, Osorno, Los Lagos',
    roles: ['Cliente'],
    status: 'Activo',
  },
  {
    id: 3,
    name: 'Valentina Ruiz',
    rut: '16.987.654-3',
    email: 'valentina.ruiz@gmail.com',
    phones: ['+56 9 7654 3210'],
    birthDate: '1995-11-04',
    address: 'Av. Juan Mackenna 851, Osorno, Los Lagos',
    roles: ['Cliente', 'Emprendedor'],
    status: 'Activo',
  },
  {
    id: 4,
    name: 'Diego Soto',
    rut: '15.678.901-2',
    email: 'diego.soto@correo.cl',
    phones: ['+56 9 6543 2109'],
    birthDate: '1992-01-19',
    address: 'Los Carrera 1450, Osorno, Los Lagos',
    roles: ['Emprendedor'],
    status: 'Activo',
  },
  {
    id: 5,
    name: 'Javier Paredes',
    rut: '17.890.123-4',
    email: 'javier.paredes@outlook.com',
    phones: ['+56 9 9988 7766'],
    birthDate: '1985-05-30',
    address: 'Errázuriz 920, Osorno, Los Lagos',
    roles: ['Emprendedor'],
    status: 'Inactivo',
  },
]

const USER_TEMPLATE = {
  name: '',
  rut: '',
  email: '',
  phones: [''],
  birthDate: '',
  address: '',
  roles: ['Cliente'],
  status: 'Activo',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RUT_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/

const buildDraft = (user) => ({
  ...USER_TEMPLATE,
  ...user,
  phones: user?.phones?.length ? [...user.phones] : [''],
  roles: user?.roles?.length ? [...user.roles] : ['Cliente'],
})

function getValidationErrors(userDraft) {
  const errors = {}

  if (!userDraft.name.trim()) errors.name = 'El nombre es obligatorio'
  if (!userDraft.rut.trim()) errors.rut = 'El RUT es obligatorio'
  else if (!RUT_REGEX.test(userDraft.rut)) errors.rut = 'Ingresa un RUT válido'

  if (!userDraft.email.trim()) errors.email = 'El email es obligatorio'
  else if (!EMAIL_REGEX.test(userDraft.email)) errors.email = 'Ingresa un correo válido'

  if (!userDraft.address.trim()) errors.address = 'La dirección es obligatoria'

  const phoneErrors = userDraft.phones.map((phone) => {
    if (!phone.trim()) return 'El teléfono es obligatorio'
    if (phone.replace(/\D/g, '').length < 8) return 'Debe tener al menos 8 dígitos'
    return ''
  })

  if (phoneErrors.some(Boolean)) errors.phones = phoneErrors
  if (!userDraft.roles.length) errors.roles = 'Selecciona al menos un rol'

  return errors
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [tab, setTab] = useState('Todos')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(INITIAL_USERS[0].id)
  const [notice, setNotice] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [draftUser, setDraftUser] = useState(buildDraft(INITIAL_USERS[0]))
  const [formErrors, setFormErrors] = useState({})

  const activeUser = users.find((u) => u.id === selectedId) || users[0]

  const filteredUsers = users.filter((u) => {
    const matchTab =
      tab === 'Todos' ||
      (tab === 'Clientes' && u.roles.includes('Cliente')) ||
      (tab === 'Emprendedores' && u.roles.includes('Emprendedor'))

    const matchRole =
      roleFilter === 'Todos' ||
      (roleFilter === 'Ambos' && u.roles.includes('Cliente') && u.roles.includes('Emprendedor')) ||
      (roleFilter === 'Cliente' && u.roles.includes('Cliente')) ||
      (roleFilter === 'Emprendedor' && u.roles.includes('Emprendedor'))

    const matchStatus = statusFilter === 'Todos' || u.status === statusFilter
    const needle = search.toLowerCase()
    const matchSearch =
      u.name.toLowerCase().includes(needle) ||
      u.rut.toLowerCase().includes(needle) ||
      u.email.toLowerCase().includes(needle)

    return matchTab && matchRole && matchStatus && matchSearch
  })

  const openEditModal = (user) => {
    setSelectedId(user.id)
    setEditingUserId(user.id)
    setDraftUser(buildDraft(user))
    setFormErrors({})
    setEditOpen(true)
  }

  const closeEditModal = () => {
    setEditOpen(false)
    setEditingUserId(null)
    setFormErrors({})
  }

  const updateDraft = (field, value) => {
    setDraftUser((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const updateDraftPhone = (idx, value) => {
    setDraftUser((prev) => {
      const nextPhones = [...prev.phones]
      nextPhones[idx] = value
      return { ...prev, phones: nextPhones }
    })
    setFormErrors((prev) => {
      if (!prev.phones) return prev
      const next = [...prev.phones]
      next[idx] = ''
      return { ...prev, phones: next }
    })
  }

  const addDraftPhone = () => {
    setDraftUser((prev) => ({ ...prev, phones: [...prev.phones, ''] }))
  }

  const removeDraftPhone = (idx) => {
    setDraftUser((prev) => {
      if (prev.phones.length <= 1) return prev
      return { ...prev, phones: prev.phones.filter((_, index) => index !== idx) }
    })
  }

  const toggleDraftRole = (role) => {
    setDraftUser((prev) => {
      const hasRole = prev.roles.includes(role)
      const nextRoles = hasRole ? prev.roles.filter((r) => r !== role) : [...prev.roles, role]
      return { ...prev, roles: nextRoles }
    })
    setFormErrors((prev) => ({ ...prev, roles: '' }))
  }

  const saveEditedUser = (event) => {
    event.preventDefault()
    const errors = getValidationErrors(draftUser)
    setFormErrors(errors)

    if (Object.keys(errors).length) return

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUserId ? { ...u, ...draftUser, phones: [...draftUser.phones], roles: [...draftUser.roles] } : u)),
    )
    setNotice('Usuario actualizado correctamente')
    closeEditModal()
  }

  const confirmDeleteUser = () => {
    if (!deletingUser) return
    if (users.length <= 1) {
      setNotice('No puedes eliminar el último usuario')
      setDeleteOpen(false)
      setDeletingUser(null)
      return
    }

    const nextUsers = users.filter((u) => u.id !== deletingUser.id)
    setUsers(nextUsers)

    if (selectedId === deletingUser.id) {
      setSelectedId(nextUsers[0]?.id || 0)
    }

    setNotice('Usuario eliminado correctamente')
    setDeleteOpen(false)
    setDeletingUser(null)
  }

  const handleAddUser = () => {
    const newId = Date.now()
    const newUser = {
      id: newId,
      name: 'Nuevo Usuario',
      rut: '18.765.432-1',
      email: 'nuevo@ulagos.cl',
      phones: ['+56 9 8877 6655'],
      birthDate: '2001-04-10',
      address: 'Osorno, Los Lagos',
      roles: ['Cliente'],
      status: 'Activo',
    }

    setUsers((prev) => [...prev, newUser])
    openEditModal(newUser)
  }

  return (
    <Box className="orders-page">
      <Box className="orders-main">
        {/* Breadcrumb */}
        <Box className="orders-breadcrumb">Panel de control <span>/</span> Gestión de usuarios</Box>

        {/* Encabezado estilo Gestión de pedidos */}
        <Box className="orders-heading">
          <Box className="orders-title-group">
            <GroupOutlined color="primary" fontSize="large" />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>Gestión de usuarios</Typography>
              <Typography color="text.secondary">
                Administra usuarios, roles, estados y credenciales de contacto.
              </Typography>
            </Box>
            <Chip label={`${users.length} total`} size="small" color="primary" variant="outlined" />
          </Box>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={handleAddUser}>
            Agregar usuario
          </Button>
        </Box>

        {/* Barra de filtros horizontal estilo Orders */}
        <Box className="orders-filters">
          <TextField
            className="orders-search"
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, email o RUT..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Select size="small" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} displayEmpty>
            <MenuItem value="Todos">Rol: Todos</MenuItem>
            <MenuItem value="Ambos">Rol: Ambos (Dual)</MenuItem>
            <MenuItem value="Cliente">Solo Cliente</MenuItem>
            <MenuItem value="Emprendedor">Solo Emprendedor</MenuItem>
          </Select>
          <Select size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} displayEmpty>
            <MenuItem value="Todos">Todos los estados</MenuItem>
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
          </Select>
          <Button variant="contained" startIcon={<FilterListOutlined />}>
            Aplicar filtros
          </Button>
        </Box>

        {/* Tabs de categoría */}
        <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tab value="Todos" label={`Todos (${users.length})`} />
          <Tab value="Clientes" label={`Clientes (${users.filter((u) => u.roles.includes('Cliente')).length})`} />
          <Tab value="Emprendedores" label={`Emprendedores (${users.filter((u) => u.roles.includes('Emprendedor')).length})`} />
        </Tabs>

        <Paper className="orders-table-paper">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell align="center">RUT</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Teléfono principal</TableCell>
                <TableCell align="center">Roles</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
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
                  <TableRow
                    key={u.id}
                    hover
                    selected={u.id === activeUser?.id}
                    onClick={() => setSelectedId(u.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: 800 }}>{u.name}</TableCell>
                    <TableCell align="center" sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{u.rut}</TableCell>
                    <TableCell align="center">{u.email}</TableCell>
                    <TableCell align="center">{u.phones[0]}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap justifyContent="center">
                        {u.roles.map((role) => (
                          <Chip key={role} label={role} size="small" sx={{ fontSize: '0.7rem' }} />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip status={u.status} />
                    </TableCell>
                    <TableCell align="right" className="order-actions">
                      <Tooltip title="Editar usuario">
                        <IconButton
                          size="small"
                          aria-label={`Editar usuario ${u.name}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            openEditModal(u)
                          }}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar usuario">
                        <IconButton
                          size="small"
                          color="error"
                          aria-label={`Eliminar usuario ${u.name}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            setDeletingUser(u)
                            setDeleteOpen(true)
                          }}
                        >
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

      <Dialog open={editOpen} onClose={closeEditModal} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={saveEditedUser}>
          <DialogTitle sx={{ fontWeight: 700, color: '#000' }}>
            Actualizar datos de usuario
          </DialogTitle>
          <DialogContent>
            <Box className="order-form-grid">
              <TextField
                required
                label="Nombre completo"
                value={draftUser.name}
                onChange={(event) => updateDraft('name', event.target.value)}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                required
                label="RUT"
                value={draftUser.rut}
                onChange={(event) => updateDraft('rut', event.target.value)}
                error={Boolean(formErrors.rut)}
                helperText={formErrors.rut}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                required
                type="email"
                label="Correo electrónico"
                value={draftUser.email}
                onChange={(event) => updateDraft('email', event.target.value)}
                error={Boolean(formErrors.email)}
                helperText={formErrors.email}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                required
                type="date"
                label="Fecha de nacimiento"
                value={draftUser.birthDate}
                onChange={(event) => updateDraft('birthDate', event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                required
                label="Dirección"
                value={draftUser.address}
                onChange={(event) => updateDraft('address', event.target.value)}
                error={Boolean(formErrors.address)}
                helperText={formErrors.address}
                InputLabelProps={{ shrink: true }}
              />
              <Select
                value={draftUser.status}
                onChange={(event) => updateDraft('status', event.target.value)}
                displayEmpty
                size="small"
              >
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
              </Select>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                Teléfonos
              </Typography>
              <Stack spacing={1}>
                {draftUser.phones.map((phone, idx) => (
                  <Stack key={`${editingUserId}-phone-${idx}`} direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      fullWidth
                      size="small"
                      value={phone}
                      onChange={(event) => updateDraftPhone(idx, event.target.value)}
                      error={Boolean(formErrors.phones?.[idx])}
                      helperText={formErrors.phones?.[idx]}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneOutlined fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeDraftPhone(idx)}
                      disabled={draftUser.phones.length <= 1}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
              <Button variant="outlined" size="small" startIcon={<AddOutlined />} onClick={addDraftPhone} sx={{ mt: 1.25 }}>
                Agregar teléfono
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                Roles
              </Typography>
              <Stack direction="row" spacing={1}>
                <FormControlLabel
                  control={<Checkbox checked={draftUser.roles.includes('Cliente')} onChange={() => toggleDraftRole('Cliente')} />}
                  label="Cliente"
                />
                <FormControlLabel
                  control={<Checkbox checked={draftUser.roles.includes('Emprendedor')} onChange={() => toggleDraftRole('Emprendedor')} />}
                  label="Emprendedor"
                />
              </Stack>
              {formErrors.roles ? (
                <Typography variant="caption" color="error">
                  {formErrors.roles}
                </Typography>
              ) : null}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeEditModal}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Guardar cambios
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>
          ¿Eliminar usuario?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esta acción eliminará a <strong>{deletingUser?.name}</strong> de la gestión de usuarios.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmDeleteUser}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={2600} onClose={() => setNotice('')}>
        <Alert severity="success" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  )
}
