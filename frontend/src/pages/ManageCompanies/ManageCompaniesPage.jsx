import {
  AddOutlined,
  BusinessOutlined,
  PersonOutlined,
  SearchOutlined,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  FormControlLabel,
  Grid,
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

const INITIAL_COMPANIES = [
  {
    id: 1,
    name: 'Tienda Sur',
    rut: '76.123.456-7',
    category: 'Hogar y Cocina',
    comuna: 'Osorno',
    status: 'Activa',
    email: 'contacto@tiendasur.cl',
    website: 'https://www.tiendasur.cl',
    phones: ['+56 9 9876 5432', '+56 64 223 3344'],
    hasPhysicalStore: true,
    address: 'Av. Manuel Rodríguez 1234, Depto. 2',
    tags: ['Hogar y Cocina', 'Ropa, moda y calzado', 'Tecnología'],
    owner: {
      name: 'Camila Torres Mancilla',
      run: '15.432.876-5',
      phone: '+56 9 9876 5432',
      email: 'camila.torres@tiendasur.cl',
      address: 'Pasaje Los Notros 450, Osorno',
    },
  },
  {
    id: 2,
    name: 'TecnoPatagonia',
    rut: '77.987.654-3',
    category: 'Tecnología',
    comuna: 'Puerto Montt',
    status: 'Activa',
    email: 'ventas@tecnopatagonia.cl',
    website: '', // Permite probar Consulta Validación Demográfica 5 (sin web corporativa)
    phones: ['+56 9 7766 5544'],
    hasPhysicalStore: true,
    address: 'Urmeneta 540, Puerto Montt',
    tags: ['Computación', 'Celulares', 'Electrónica y Televisión'],
    owner: {
      name: 'Carlos Moya Soto',
      run: '13.876.543-2',
      phone: '+56 9 7766 5544',
      email: 'cmoya@tecnopatagonia.cl',
      address: 'Av. Austral 1200, Puerto Montt',
    },
  },
  {
    id: 3,
    name: 'Casa & Estilo',
    rut: '78.666.111-9',
    category: 'Hogar y Cocina',
    comuna: 'Valdivia',
    status: 'En revisión',
    email: 'hola@casayestilo.cl',
    website: 'https://casayestilo.cl',
    phones: ['+56 9 6655 4433'],
    hasPhysicalStore: false,
    address: 'Sin tienda física',
    tags: ['Hogar y Cocina', 'Servicios domésticos'],
    owner: {
      name: 'Fernanda Lagos',
      run: '16.543.210-K',
      phone: '+56 9 6655 4433',
      email: 'fernanda@casayestilo.cl',
      address: 'Av. Alemania 890, Valdivia',
    },
  },
  {
    id: 4,
    name: 'Librería Austral',
    rut: '76.778.990-5',
    category: 'Útiles y librería',
    comuna: 'Osorno',
    status: 'Suspendida',
    email: 'info@libreriaaustral.cl',
    website: '',
    phones: ['+56 64 221 9988'],
    hasPhysicalStore: true,
    address: 'Ramírez 950, Osorno',
    tags: ['Útiles y librería', 'Libros e instrumentos musicales'],
    owner: {
      name: 'Roberto Gómez',
      run: '10.222.333-4',
      phone: '+56 9 4433 2211',
      email: 'rgomez@libreriaaustral.cl',
      address: 'O’Higgins 640, Osorno',
    },
  },
]

export default function ManageCompaniesPage() {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES)
  const [selectedId, setSelectedId] = useState(1)
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [search, setSearch] = useState('')
  const [detailTab, setDetailTab] = useState('empresa')

  const activeCompany = companies.find((c) => c.id === selectedId) || companies[0]

  const handleUpdateCompany = (field, value) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === activeCompany.id ? { ...c, [field]: value } : c)),
    )
  }

  const handleUpdateOwner = (field, value) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === activeCompany.id ? { ...c, owner: { ...c.owner, [field]: value } } : c,
      ),
    )
  }

  const visibleCompanies = companies.filter((c) => {
    const matchStatus = statusFilter === 'Todas' || c.status === statusFilter
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.rut.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h4">Empresas y emprendedores</Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona las tiendas, marcas y datos del emprendedor dueño que venden en Shopping (RF01 / RF07).
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => {
            const newId = Date.now()
            setCompanies((prev) => [
              ...prev,
              {
                id: newId,
                name: 'Nuevo Emprendimiento Sur',
                rut: '78.111.222-3',
                category: 'Alimentación',
                comuna: 'Osorno',
                status: 'Activa',
                email: 'contacto@nuevosur.cl',
                website: '',
                phones: ['+56 9 8877 1122'],
                hasPhysicalStore: true,
                address: 'Av. República 420, Osorno',
                tags: ['Alimentación'],
                owner: {
                  name: 'Emprendedor ULagos',
                  run: '19.876.543-1',
                  phone: '+56 9 8877 1122',
                  email: 'emprendedor@ulagos.cl',
                  address: 'Osorno, Los Lagos',
                },
              },
            ])
            setSelectedId(newId)
          }}
        >
          Nueva empresa
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        {/* Tabla Izquierda de Empresas (P20) */}
        <Grid item xs={12} lg={6.5}>
          <Card sx={{ p: 2.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar empresa, emprendedor o RUT..."
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
              <Select size="small" value="Todas" sx={{ minWidth: 180 }}>
                <MenuItem value="Todas">Todas las categorías</MenuItem>
              </Select>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              {['Todas', 'Activa', 'En revisión', 'Suspendida'].map((st) => (
                <Chip
                  key={st}
                  label={st === 'Todas' ? `Todas (${companies.length})` : st}
                  color={statusFilter === st ? 'primary' : 'default'}
                  onClick={() => setStatusFilter(st)}
                />
              ))}
            </Stack>

            <Table size="small">
              <TableHead sx={{ bgcolor: '#f7f6ff' }}>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>RUT Empresa</TableCell>
                  <TableCell>Categoría oficial</TableCell>
                  <TableCell>Comuna</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleCompanies.map((c) => {
                  const selected = c.id === activeCompany.id
                  return (
                    <TableRow
                      key={c.id}
                      hover
                      selected={selected}
                      onClick={() => setSelectedId(c.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'text.primary', fontSize: '0.78rem', fontWeight: 800 }}>
                            {c.name.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{c.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{c.rut}</TableCell>
                      <TableCell>{c.category}</TableCell>
                      <TableCell>{c.comuna}</TableCell>
                      <TableCell><StatusChip status={c.status} /></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        {/* Ficha Derecha: Datos de la Empresa + Pestaña Emprendedor / Dueño (RF01 - P20) */}
        <Grid item xs={12} lg={5.5}>
          <Card sx={{ p: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1.5}
              sx={{ mb: 2.5 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 52, height: 52, bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 900 }}>
                  {activeCompany.name.slice(0, 2).toUpperCase()}
                </Avatar>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">{activeCompany.name}</Typography>
                    <StatusChip status={activeCompany.status} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {activeCompany.category} · {activeCompany.comuna} · Dueño: {activeCompany.owner.name}
                  </Typography>
                </Box>
              </Stack>

              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ minHeight: 36 }}>
                <Tab value="empresa" icon={<BusinessOutlined fontSize="small" />} iconPosition="start" label="Empresa" sx={{ minHeight: 36, py: 0.5 }} />
                <Tab value="dueno" icon={<PersonOutlined fontSize="small" />} iconPosition="start" label="Emprendedor / Dueño" sx={{ minHeight: 36, py: 0.5 }} />
              </Tabs>
            </Stack>

            {detailTab === 'empresa' ? (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Nombre de la empresa *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={activeCompany.name}
                      onChange={(e) => handleUpdateCompany('name', e.target.value)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>RUT de la empresa *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={activeCompany.rut}
                      onChange={(e) => handleUpdateCompany('rut', e.target.value)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Email de contacto *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={activeCompany.email}
                      onChange={(e) => handleUpdateCompany('email', e.target.value)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Sitio web (opcional - RF01)</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Sin sitio web (NULL)"
                      value={activeCompany.website}
                      onChange={(e) => handleUpdateCompany('website', e.target.value)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                    Teléfonos de contacto (RF01 / RF18)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {activeCompany.phones.map((p, i) => (
                      <Chip
                        key={i}
                        label={p}
                        color="secondary"
                        onDelete={() =>
                          handleUpdateCompany(
                            'phones',
                            activeCompany.phones.filter((_, idx) => idx !== i),
                          )
                        }
                        sx={{ color: 'primary.main', fontWeight: 700 }}
                      />
                    ))}
                  </Stack>
                </Box>

                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f7f6ff', borderRadius: 2.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={activeCompany.hasPhysicalStore}
                        onChange={(e) => handleUpdateCompany('hasPhysicalStore', e.target.checked)}
                      />
                    }
                    label={<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Tiene tienda física (RF01)</Typography>}
                  />
                  {activeCompany.hasPhysicalStore && (
                    <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Región</Typography>
                        <Select fullWidth size="small" value="Los Lagos">
                          <MenuItem value="Los Lagos">Los Lagos</MenuItem>
                        </Select>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Provincia</Typography>
                        <Select fullWidth size="small" value="Osorno">
                          <MenuItem value="Osorno">Osorno</MenuItem>
                        </Select>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Comuna</Typography>
                        <Select
                          fullWidth
                          size="small"
                          value={activeCompany.comuna}
                          onChange={(e) => handleUpdateCompany('comuna', e.target.value)}
                        >
                          <MenuItem value="Osorno">Osorno</MenuItem>
                          <MenuItem value="Puerto Montt">Puerto Montt</MenuItem>
                          <MenuItem value="Valdivia">Valdivia</MenuItem>
                        </Select>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Dirección del local</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={activeCompany.address}
                          onChange={(e) => handleUpdateCompany('address', e.target.value)}
                          sx={{ mt: 0.5 }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Paper>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={7}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
                      Categorías oficiales que ofrece (RF07)
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {activeCompany.tags.map((t) => (
                        <Chip key={t} label={t} size="small" color="secondary" sx={{ color: 'primary.main', fontWeight: 700 }} />
                      ))}
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                      Estado de la empresa
                    </Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={activeCompany.status}
                      onChange={(e) => handleUpdateCompany('status', e.target.value)}
                    >
                      <MenuItem value="Activa">● Activa</MenuItem>
                      <MenuItem value="En revisión">● En revisión</MenuItem>
                      <MenuItem value="Suspendida">● Suspendida</MenuItem>
                    </Select>
                  </Grid>
                </Grid>
              </Stack>
            ) : (
              /* Pestaña Emprendedor / Dueño (RF01: nombre, run, teléfono, correo, dirección) */
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fbfaff' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                  Datos del Emprendedor / Dueño (RF01)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Nombre del Emprendedor *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={activeCompany.owner.name}
                      onChange={(e) => handleUpdateOwner('name', e.target.value)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>RUN del Emprendedor *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={activeCompany.owner.run}
                      onChange={(e) => handleUpdateOwner('run', e.target.value)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Teléfono personal *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={activeCompany.owner.phone}
                      onChange={(e) => handleUpdateOwner('phone', e.target.value)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Correo personal *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={activeCompany.owner.email}
                      onChange={(e) => handleUpdateOwner('email', e.target.value)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Dirección particular del Emprendedor *</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={activeCompany.owner.address}
                      onChange={(e) => handleUpdateOwner('address', e.target.value)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
              <Button variant="outlined">Cancelar</Button>
              <Button variant="contained">Guardar cambios</Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}