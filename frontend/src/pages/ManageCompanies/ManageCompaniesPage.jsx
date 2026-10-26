import {
  AddOutlined,
  BusinessOutlined,
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterListOutlined,
  PersonOutlined,
  PhoneOutlined,
  SearchOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
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
   Empresa  : RUT VARCHAR(11) PK, Nombre VARCHAR(30), Giro VARCHAR(30)
   Telefono : Telefono INT PK, Empresa_id VARCHAR(11)
   Correo   : Correo VARCHAR(255) PK, Empresa_id VARCHAR(11)
   Direccion: CodPostal INT PK, Calle VARCHAR(40), Numero INT, Pasaje VARCHAR(30),
              Sector VARCHAR(30), Comuna_id INT FK
   TieneDirEmpresa: Empresa_ID, Direccion_id
   Emprendedor: RUN PK, Nombre, Apellido — linked via Empresa_id FK
──────────────────────────────────────────────────────────────────────────── */
const INITIAL_COMPANIES = [
  {
    rut: '76123456-7',
    nombre: 'Tienda Sur',
    giro: 'Comercial',
    correos: ['contacto@tiendasur.cl'],
    telefonos: ['998765432'],
    direccion: { calle: 'Av. Manuel Rodríguez', numero: '1234', pasaje: '', sector: 'Centro', comunaId: 10301 },
    emprendedor: { run: '20100001-K', nombre: 'Camila', apellido: 'Torres' },
  },
  {
    rut: '77987654-3',
    nombre: 'TecnoPatagonia',
    giro: 'Tecnologia',
    correos: ['ventas@tecnopatagonia.cl'],
    telefonos: ['977665544'],
    direccion: { calle: 'Urmeneta', numero: '540', pasaje: '', sector: '', comunaId: 10301 },
    emprendedor: { run: '20100002-K', nombre: 'Carlos', apellido: 'Moya' },
  },
  {
    rut: '78666111-9',
    nombre: 'Casa Estilo',
    giro: 'Hogar',
    correos: ['hola@casaestilo.cl'],
    telefonos: ['966554433'],
    direccion: { calle: 'Av. Alemania', numero: '890', pasaje: '', sector: '', comunaId: 10301 },
    emprendedor: { run: '20100003-K', nombre: 'Fernanda', apellido: 'Lagos' },
  },
  {
    rut: '76778990-5',
    nombre: 'Libreria Austral',
    giro: 'Educacion',
    correos: ['info@libreriaaustral.cl'],
    telefonos: ['644219988'],
    direccion: { calle: 'Ramirez', numero: '950', pasaje: '', sector: '', comunaId: 10301 },
    emprendedor: { run: '20100004-K', nombre: 'Roberto', apellido: 'Gomez' },
  },
]

const COMPANY_TEMPLATE = {
  rut: '',
  nombre: '',
  giro: '',
  correos: [''],
  telefonos: [''],
  direccion: { calle: '', numero: '', pasaje: '', sector: '', comunaId: 10301 },
  emprendedor: { run: '', nombre: '', apellido: '' },
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Sanitiza la entrada de un RUN/RUT chileno mientras el usuario escribe.
 * Formato válido final: NNNNNNN-D  o  NNNNNNNN-D  (sin puntos)
 */
function sanitizeRUN(raw) {
  const s = raw.replace(/[^\dkK-]/g, '').toUpperCase()
  const hyphenIdx = s.indexOf('-')
  if (hyphenIdx !== -1) {
    const body = s.slice(0, hyphenIdx).replace(/\D/g, '').slice(0, 8)
    const dv = s.slice(hyphenIdx + 1).replace(/[^0-9K]/g, '').slice(0, 1)
    return body.length >= 1 ? body + '-' + dv : body
  }
  return s.replace(/[^0-9]/g, '').slice(0, 8)
}

/** c
 * Algoritmo oficial de verificación de RUN/RUT chileno (módulo 11).
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

function getErrors(d) {
  const e = {}
  // RUT
  if (!d.rut.trim()) e.rut = 'El RUT es obligatorio'
  else if (!/^\d{7,8}-[0-9kK]$/.test(d.rut.trim())) e.rut = 'Formato inválido (ej: 76123456-7)'
  else if (!validarRUT(d.rut)) e.rut = 'RUT inválido — dígito verificador incorrecto'
  // Nombre / Giro
  if (!d.nombre.trim()) e.nombre = 'El nombre es obligatorio'
  else if (d.nombre.trim().length > 30) e.nombre = 'Máximo 30 caracteres'
  if (!d.giro.trim()) e.giro = 'El giro es obligatorio'
  else if (d.giro.trim().length > 30) e.giro = 'Máximo 30 caracteres'
  // Correo — VARCHAR(255)
  if (!d.correos[0]?.trim()) e.correo = 'El correo es obligatorio'
  else if (!EMAIL_REGEX.test(d.correos[0])) e.correo = 'Correo inválido'
  else if (d.correos[0].length > 255) e.correo = 'Máximo 255 caracteres'
  // Teléfono — DB: INT (máx 9 dígitos), solo dígitos
  if (!d.telefonos[0]?.trim()) e.telefono = 'El teléfono es obligatorio'
  else if (!/^\d{7,9}$/.test(d.telefonos[0].replace(/\s+/g, ''))) e.telefono = 'Teléfono chileno: 7-9 dígitos'
  // Dirección
  if (!d.direccion.calle.trim()) e.calle = 'La calle es obligatoria'
  if (!d.direccion.numero.toString().trim()) e.numero = 'El número es obligatorio'
  else if (isNaN(Number(d.direccion.numero)) || Number(d.direccion.numero) <= 0) e.numero = 'Debe ser un número positivo'
  // Emprendedor
  if (!d.emprendedor.run.trim()) e.empRun = 'El RUN del emprendedor es obligatorio'
  else if (!/^\d{7,8}-[0-9kK]$/.test(d.emprendedor.run.trim())) e.empRun = 'Formato inválido (ej: 20100001-K)'
  else if (!validarRUT(d.emprendedor.run)) e.empRun = 'RUN inválido — dígito verificador incorrecto'
  if (!d.emprendedor.nombre.trim()) e.empNombre = 'El nombre del emprendedor es obligatorio'
  else if (d.emprendedor.nombre.trim().length > 30) e.empNombre = 'Máximo 30 caracteres'
  if (!d.emprendedor.apellido.trim()) e.empApellido = 'El apellido del emprendedor es obligatorio'
  else if (d.emprendedor.apellido.trim().length > 30) e.empApellido = 'Máximo 30 caracteres'
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

export default function ManageCompaniesPage() {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES)
  const [search, setSearch] = useState('')
  const [giroFilter, setGiroFilter] = useState('Todos')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedGiro, setAppliedGiro] = useState('Todos')
  const [notice, setNotice] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingCompany, setDeletingCompany] = useState(null)
  const [editingRut, setEditingRut] = useState(null)
  const [draft, setDraft] = useState(COMPANY_TEMPLATE)
  const [detailTab, setDetailTab] = useState('empresa')
  const [formErrors, setFormErrors] = useState({})

  const GIROS = [...new Set(companies.map((c) => c.giro))].sort()

  const applyFilters = () => { setAppliedSearch(search); setAppliedGiro(giroFilter) }
  const clearFilters = () => { setSearch(''); setGiroFilter('Todos'); setAppliedSearch(''); setAppliedGiro('Todos') }

  const visible = companies.filter((c) => {
    const q = appliedSearch.toLowerCase()
    const matchSearch = !q || (
      c.rut.toLowerCase().includes(q) ||
      c.nombre.toLowerCase().includes(q) ||
      c.giro.toLowerCase().includes(q) ||
      c.emprendedor.nombre.toLowerCase().includes(q) ||
      c.emprendedor.apellido.toLowerCase().includes(q)
    )
    const matchGiro = appliedGiro === 'Todos' || c.giro === appliedGiro
    return matchSearch && matchGiro
  })

  const openEdit = (company) => {
    setEditingRut(company.rut)
    setDraft({
      ...company,
      correos: [...company.correos],
      telefonos: [...company.telefonos],
      direccion: { ...company.direccion },
      emprendedor: { ...company.emprendedor },
    })
    setFormErrors({})
    setDetailTab('empresa')
    setEditOpen(true)
  }

  const openCreate = () => {
    setEditingRut(null)
    setDraft({ ...COMPANY_TEMPLATE, correos: [''], telefonos: [''], direccion: { calle: '', numero: '', pasaje: '', sector: '', comunaId: 10301 }, emprendedor: { run: '', nombre: '', apellido: '' } })
    setFormErrors({})
    setDetailTab('empresa')
    setEditOpen(true)
  }

  const closeEdit = () => { setEditOpen(false); setEditingRut(null); setFormErrors({}) }

  const update = (field, rawValue) => {
    let value = rawValue
    if (field === 'rut') {
      value = sanitizeRUN(rawValue)
    } else if (field === 'nombre' || field === 'giro') {
      value = rawValue.slice(0, 30)
    }
    setDraft((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const updateDireccion = (field, rawValue) => {
    let value = rawValue
    if (field === 'numero') {
      value = rawValue.replace(/\D/g, '').slice(0, 6)
    } else if (field === 'calle') {
      value = rawValue.slice(0, 40)
    } else if (field === 'pasaje' || field === 'sector') {
      value = rawValue.slice(0, 30)
    }
    setDraft((prev) => ({ ...prev, direccion: { ...prev.direccion, [field]: value } }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const updateEmprendedor = (field, rawValue) => {
    let value = rawValue
    if (field === 'run') {
      value = sanitizeRUN(rawValue)
    } else if (field === 'nombre' || field === 'apellido') {
      value = rawValue.slice(0, 30)
    }
    setDraft((prev) => ({ ...prev, emprendedor: { ...prev.emprendedor, [field]: value } }))
    const key = 'emp' + field.charAt(0).toUpperCase() + field.slice(1)
    setFormErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const updateCorreo = (idx, rawValue) => {
    // Correo VARCHAR(255)
    const value = rawValue.slice(0, 255)
    setDraft((prev) => { const next = [...prev.correos]; next[idx] = value; return { ...prev, correos: next } })
    if (idx === 0) setFormErrors((prev) => ({ ...prev, correo: '' }))
  }

  const updateTelefono = (idx, rawValue) => {
    // Telefono DB: INT — solo dígitos, máx 9 (número chileno)
    const value = rawValue.replace(/\D/g, '').slice(0, 9)
    setDraft((prev) => { const next = [...prev.telefonos]; next[idx] = value; return { ...prev, telefonos: next } })
    if (idx === 0) setFormErrors((prev) => ({ ...prev, telefono: '' }))
  }

  const saveCompany = () => {
    const errors = getErrors(draft)
    setFormErrors(errors)
    if (Object.keys(errors).length) return
    if (editingRut) {
      setCompanies((prev) => prev.map((c) => c.rut === editingRut ? { ...draft } : c))
      setNotice('Empresa actualizada correctamente')
    } else {
      setCompanies((prev) => [...prev, { ...draft }])
      setNotice('Empresa creada correctamente')
    }
    closeEdit()
  }

  const confirmDelete = () => {
    if (!deletingCompany) return
    setCompanies((prev) => prev.filter((c) => c.rut !== deletingCompany.rut))
    setNotice('Empresa eliminada correctamente')
    setDeleteOpen(false)
    setDeletingCompany(null)
  }

  return (
    <Box className="orders-page">
      <Box className="orders-main">
        {/* Breadcrumb */}
        <Box className="orders-breadcrumb">Panel de control <span>/</span> Empresas y emprendedores</Box>

        {/* Encabezado */}
        <Box className="orders-heading">
          <Box className="orders-title-group">
            <BusinessOutlined color="primary" fontSize="large" />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>Empresas y emprendedores</Typography>
              <Typography color="text.secondary">
                Gestiona las empresas, su giro comercial, contactos y dirección.
              </Typography>
            </Box>
            <Chip label={`${companies.length} total`} size="small" color="primary" variant="outlined" />
          </Box>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>
            Nueva empresa
          </Button>
        </Box>

        {/* Filtros */}
        <Box className="orders-filters">
          <TextField
            className="orders-search"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por RUT, nombre, giro o emprendedor..."
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
          <Select size="small" value={giroFilter} onChange={(e) => setGiroFilter(e.target.value)} displayEmpty>
            <MenuItem value="Todos">Giro: Todos</MenuItem>
            {GIROS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
          </Select>
          <Button variant="contained" startIcon={<FilterListOutlined />} onClick={applyFilters}>Aplicar filtros</Button>
        </Box>

        {/* Tabla */}
        <Paper className="orders-table-paper orders-table-paper--fixed">
          <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '28%' }}>Empresa</TableCell>
                <TableCell align="center" sx={{ width: '14%' }}>RUT</TableCell>
                <TableCell align="center" sx={{ width: '13%' }}>Giro</TableCell>
                <TableCell align="center" sx={{ width: '21%' }}>Correo</TableCell>
                <TableCell align="center" sx={{ width: '13%' }}>Teléfono</TableCell>
                <TableCell align="center" sx={{ width: '11%', px: 2 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No hay empresas que coincidan con la búsqueda.
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((c) => (
                  <TableRow key={c.rut} hover sx={{ cursor: 'default' }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 800 }}>
                          {c.nombre.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>{c.nombre}</Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                            {c.emprendedor.nombre} {c.emprendedor.apellido}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="center" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{c.rut}</TableCell>
                    <TableCell align="center" sx={{ fontSize: 13 }}>{c.giro}</TableCell>
                    <TableCell align="center" sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.correos[0]}</TableCell>
                    <TableCell align="center" sx={{ fontSize: 12 }}>{c.telefonos[0]}</TableCell>
                    <TableCell align="center" sx={{ px: 2 }}>
                      <Tooltip title="Editar empresa">
                        <IconButton size="small" onClick={() => openEdit(c)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar empresa">
                        <IconButton size="small" color="error" onClick={() => { setDeletingCompany(c); setDeleteOpen(true) }}>
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
      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="md" scroll="paper">
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18, borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
          {editingRut ? 'Editar empresa' : 'Nueva empresa'}
        </DialogTitle>

        <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ px: 3, borderBottom: '1px solid', borderColor: 'divider', minHeight: 44 }}>
          <Tab value="empresa" icon={<BusinessOutlined fontSize="small" />} iconPosition="start" label="Datos de la empresa" sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }} />
          <Tab value="emprendedor" icon={<PersonOutlined fontSize="small" />} iconPosition="start" label="Emprendedor responsable" sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        <DialogContent sx={{ pt: 2 }}>
          {detailTab === 'empresa' ? (
            <>
              {/* ── Empresa principal ── */}
              <Typography sx={SECTION_LABEL_SX}>Tabla Empresa</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth required label="RUT" size="small" value={draft.rut}
                    onChange={(e) => update('rut', e.target.value)}
                    error={Boolean(formErrors.rut)} helperText={formErrors.rut || 'Ej: 76123456-7 (sin puntos)'}
                    InputLabelProps={{ shrink: true }} placeholder="76123456-7" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth required label="Nombre" size="small" value={draft.nombre}
                    onChange={(e) => update('nombre', e.target.value)}
                    error={Boolean(formErrors.nombre)} helperText={formErrors.nombre || `${draft.nombre.length}/30`}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth required label="Giro" size="small" value={draft.giro}
                    onChange={(e) => update('giro', e.target.value)}
                    error={Boolean(formErrors.giro)} helperText={formErrors.giro || `${draft.giro.length}/30`}
                    InputLabelProps={{ shrink: true }} placeholder="Comercial, Tecnologia..." />
                </Grid>
              </Grid>

              {/* ── Correos (tabla Correo) ── */}
              <Typography sx={{ ...SECTION_LABEL_SX, mt: 2.5 }}>Correos — tabla Correo</Typography>
              <Stack spacing={1}>
                {draft.correos.map((correo, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                    <TextField fullWidth size="small" type="email" value={correo}
                      onChange={(e) => updateCorreo(idx, e.target.value)}
                      error={idx === 0 && Boolean(formErrors.correo)} helperText={idx === 0 ? formErrors.correo : ''}
                      placeholder="empresa@ejemplo.cl" />
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
                      error={idx === 0 && Boolean(formErrors.telefono)}
                      helperText={idx === 0 ? (formErrors.telefono || `${tel.length}/9 dígitos`) : `${tel.length}/9`}
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneOutlined fontSize="small" /></InputAdornment>, inputMode: 'numeric' } }}
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

              {/* ── Dirección (tabla Direccion + TieneDirEmpresa) ── */}
              <Typography sx={{ ...SECTION_LABEL_SX, mt: 2.5 }}>Dirección — tabla Direccion / TieneDirEmpresa</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField fullWidth required label="Calle" size="small" value={draft.direccion.calle}
                    onChange={(e) => updateDireccion('calle', e.target.value)}
                    error={Boolean(formErrors.calle)} helperText={formErrors.calle}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth required label="Número" size="small" value={draft.direccion.numero}
                    onChange={(e) => updateDireccion('numero', e.target.value)}
                    error={Boolean(formErrors.numero)} helperText={formErrors.numero || 'Solo números positivos'}
                    slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Pasaje" size="small" value={draft.direccion.pasaje}
                    onChange={(e) => updateDireccion('pasaje', e.target.value)}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Sector" size="small" value={draft.direccion.sector}
                    onChange={(e) => updateDireccion('sector', e.target.value)}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth select label="Comuna_id" size="small" value={draft.direccion.comunaId}
                    onChange={(e) => updateDireccion('comunaId', Number(e.target.value))}
                    InputLabelProps={{ shrink: true }}>
                    <MenuItem value={10301}>10301 — Osorno</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Emprendedor responsable de esta empresa. Corresponde a un registro de la tabla <strong>Emprendedor</strong> cuyo campo <code>Empresa_id</code> apunta al RUT de esta empresa.
              </Alert>
              <Typography sx={SECTION_LABEL_SX}>Tabla Emprendedor</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth required label="RUN" size="small" value={draft.emprendedor.run}
                    onChange={(e) => updateEmprendedor('run', e.target.value)}
                    error={Boolean(formErrors.empRun)} helperText={formErrors.empRun || 'Ej: 20100001-K (sin puntos)'}
                    InputLabelProps={{ shrink: true }} placeholder="20100001-K" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth required label="Nombre" size="small" value={draft.emprendedor.nombre}
                    onChange={(e) => updateEmprendedor('nombre', e.target.value)}
                    error={Boolean(formErrors.empNombre)} helperText={formErrors.empNombre}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth required label="Apellido" size="small" value={draft.emprendedor.apellido}
                    onChange={(e) => updateEmprendedor('apellido', e.target.value)}
                    error={Boolean(formErrors.empApellido)} helperText={formErrors.empApellido}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </>
          )}

          {Object.keys(formErrors).length > 0 && (
            <Alert severity="error" sx={{ mt: 2.5 }}>
              Hay campos obligatorios sin completar. Revisa ambas pestañas.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={closeEdit} variant="contained" sx={CANCEL_SX}>Cancelar</Button>
          <Button variant="contained" onClick={saveCompany} sx={CONFIRM_SX}>
            {editingRut ? 'Guardar cambios' : 'Crear empresa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════ DIALOG ELIMINAR ══════════════════════ */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Eliminar empresa</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esta acción eliminará <strong>{deletingCompany?.nombre}</strong>{' '}
            (RUT: <code>{deletingCompany?.rut}</code>) de la plataforma. Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="contained" sx={CANCEL_SX}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}
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
