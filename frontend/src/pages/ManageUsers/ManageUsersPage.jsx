import {
  AddOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LocationOnOutlined,
  PhoneOutlined,
  SearchOutlined,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'

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

export default function ManageUsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [tab, setTab] = useState('Todos')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(1)

  const activeUser = users.find((u) => u.id === selectedId) || users[0]

  const handleUpdateUser = (field, value) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === activeUser.id ? { ...u, [field]: value } : u)),
    )
  }

  const handleToggleRole = (roleName) => {
    const hasRole = activeUser.roles.includes(roleName)
    const nextRoles = hasRole
      ? activeUser.roles.filter((r) => r !== roleName)
      : [...activeUser.roles, roleName]
    if (nextRoles.length > 0) {
      handleUpdateUser('roles', nextRoles)
    }
  }

  const handleAddPhone = () => {
    handleUpdateUser('phones', [...activeUser.phones, '+56 9 5544 3322'])
  }

  const handleRemovePhone = (idx) => {
    if (activeUser.phones.length <= 1) return
    handleUpdateUser(
      'phones',
      activeUser.phones.filter((_, i) => i !== idx),
    )
  }

  // Filtro corregido (Pendiente P19): "Ambos" muestra únicamente usuarios con rol dual real
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

    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.rut.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())

    return matchTab && matchRole && matchStatus && matchSearch
  })

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Gestión de usuarios
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Administra los usuarios de la plataforma, sus roles duales (RF06), teléfonos únicos (RF31) y permisos CRUD.
      </Typography>

      <Grid container spacing={2.5}>
        {/* Tabla Principal Izquierda (P19) */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ p: 2.5 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Tab value="Todos" label={`Todos (${users.length})`} />
              <Tab value="Clientes" label={`Clientes (${users.filter((u) => u.roles.includes('Cliente')).length})`} />
              <Tab value="Emprendedores" label={`Emprendedores (${users.filter((u) => u.roles.includes('Emprendedor')).length})`} />
            </Tabs>

            <Grid container spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
              </Grid>
              <Grid item xs={6} md={2.5}>
                <Select fullWidth size="small" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <MenuItem value="Todos">Rol: Todos</MenuItem>
                  <MenuItem value="Ambos">Rol: Ambos (Dual)</MenuItem>
                  <MenuItem value="Cliente">Solo Cliente</MenuItem>
                  <MenuItem value="Emprendedor">Solo Emprendedor</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6} md={2}>
                <Select fullWidth size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="Todos">Estado: Todos</MenuItem>
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="Inactivo">Inactivo</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={2.5}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddOutlined />}
                  onClick={() => {
                    const newId = Date.now()
                    setUsers((prev) => [
                      ...prev,
                      {
                        id: newId,
                        name: 'Nuevo Usuario',
                        rut: '18.765.432-1',
                        email: 'nuevo@ulagos.cl',
                        phones: ['+56 9 8877 6655'],
                        birthDate: '2001-04-10',
                        address: 'Osorno, Los Lagos',
                        roles: ['Cliente'],
                        status: 'Activo',
                      },
                    ])
                    setSelectedId(newId)
                  }}
                >
                  Agregar
                </Button>
              </Grid>
            </Grid>

            <Table size="small">
              <TableHead sx={{ bgcolor: '#f7f6ff' }}>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>RUT</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono principal</TableCell>
                  <TableCell>Roles (RF06)</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u) => {
                  const selected = u.id === activeUser.id
                  return (
                    <TableRow
                      key={u.id}
                      hover
                      selected={selected}
                      onClick={() => setSelectedId(u.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: 'primary.main', fontSize: '0.8rem', fontWeight: 800 }}>
                            {u.name.split(' ').map((n) => n[0]).join('')}
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{u.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{u.rut}</TableCell>
                      <TableCell sx={{ fontSize: '0.78rem' }}>{u.email}</TableCell>
                      <TableCell sx={{ fontSize: '0.78rem' }}>{u.phones[0]}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {u.roles.map((r) => (
                            <Chip
                              key={r}
                              label={r}
                              size="small"
                              sx={{
                                bgcolor: r === 'Emprendedor' ? '#dbeafe' : 'secondary.main',
                                color: r === 'Emprendedor' ? '#1d4ed8' : 'primary.main',
                                fontSize: '0.7rem',
                              }}
                            />
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell><StatusChip status={u.status} /></TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => setSelectedId(u.id)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation()
                            setUsers((prev) => prev.filter((item) => item.id !== u.id))
                          }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        {/* Panel Derecho: Editar Usuario Seleccionado (P19) */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Editar usuario</Typography>
              <IconButton size="small"><CloseOutlined fontSize="small" /></IconButton>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 800 }}>
                {activeUser.name.split(' ').map((n) => n[0]).join('')}
              </Avatar>
              <Box>
                <Typography variant="h6">{activeUser.name}</Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, display: 'block' }}>
                  ● Usuario {activeUser.status.toLowerCase()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Registrado en Shopping Osorno
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1.75}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Nombre completo</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={activeUser.name}
                  onChange={(e) => handleUpdateUser('name', e.target.value)}
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>RUT (Validado con Módulo 11 - Trigger 14)</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={activeUser.rut}
                  onChange={(e) => handleUpdateUser('rut', e.target.value)}
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Email (Único por persona - RF31)</Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={activeUser.email}
                  onChange={(e) => handleUpdateUser('email', e.target.value)}
                  sx={{ mt: 0.5 }}
                />
              </Box>

              {/* Múltiples teléfonos por usuario (RF18) */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Teléfonos (RF18 / Check 8: mín. 8 dígitos)
                </Typography>
                <Stack spacing={1}>
                  {activeUser.phones.map((ph, idx) => (
                    <Stack key={idx} direction="row" spacing={1} alignItems="center">
                      <TextField
                        fullWidth
                        size="small"
                        value={ph}
                        onChange={(e) => {
                          const next = [...activeUser.phones]
                          next[idx] = e.target.value
                          handleUpdateUser('phones', next)
                        }}
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
                      <IconButton size="small" color="error" onClick={() => handleRemovePhone(idx)}>
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button variant="outlined" size="small" startIcon={<AddOutlined />} onClick={handleAddPhone}>
                    Agregar teléfono
                  </Button>
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Fecha de nacimiento (RF02 / Check 5)</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={activeUser.birthDate}
                  onChange={(e) => handleUpdateUser('birthDate', e.target.value)}
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnOutlined color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>Dirección principal</Typography>
                      <Typography variant="caption" color="text.secondary">{activeUser.address}</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Roles asignados (RF06)</Typography>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={activeUser.roles.includes('Cliente')}
                        onChange={() => handleToggleRole('Cliente')}
                      />
                    }
                    label={<Typography variant="body2">Cliente</Typography>}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={activeUser.roles.includes('Emprendedor')}
                        onChange={() => handleToggleRole('Emprendedor')}
                      />
                    }
                    label={<Typography variant="body2">Emprendedor</Typography>}
                  />
                </Stack>
              </Box>

              <Divider />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Estado de la cuenta</Typography>
                  <Typography variant="caption" color="text.secondary">Habilita o suspende el acceso</Typography>
                </Box>
                <Switch
                  checked={activeUser.status === 'Activo'}
                  onChange={(e) => handleUpdateUser('status', e.target.checked ? 'Activo' : 'Inactivo')}
                />
              </Stack>

              <Stack direction="row" spacing={1.5} pt={1}>
                <Button variant="outlined" fullWidth>Cancelar</Button>
                <Button variant="contained" fullWidth>Guardar cambios</Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}