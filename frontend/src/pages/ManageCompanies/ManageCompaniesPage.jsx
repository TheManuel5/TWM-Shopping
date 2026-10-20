import {
  AddOutlined,
  BusinessOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterListOutlined,
  PhoneOutlined,
  SearchOutlined,
  PersonOutlined,
} from "@mui/icons-material"
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
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Snackbar,
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
  Tooltip,
  Typography,
} from "@mui/material"
import { useState } from "react"
import StatusChip from "../../components/atoms/StatusChip/StatusChip"
import "../../components/orders/Orders.css"

const INITIAL_COMPANIES = [
  {
    id: 1,
    name: "Tienda Sur",
    rut: "76.123.456-7",
    category: "Hogar y Cocina",
    comuna: "Osorno",
    status: "Activa",
    email: "contacto@tiendasur.cl",
    website: "https://www.tiendasur.cl",
    phones: ["+56 9 9876 5432"],
    hasPhysicalStore: true,
    address: "Av. Manuel Rodriguez 1234",
    tags: ["Hogar y Cocina", "Ropa y moda", "Tecnologia"],
    owner: {
      name: "Camila Torres Mancilla",
      run: "15.432.876-5",
      phone: "+56 9 9876 5432",
      email: "camila.torres@tiendasur.cl",
      address: "Pasaje Los Notros 450, Osorno",
    },
  },
  {
    id: 2,
    name: "TecnoPatagonia",
    rut: "77.987.654-3",
    category: "Tecnologia",
    comuna: "Puerto Montt",
    status: "Activa",
    email: "ventas@tecnopatagonia.cl",
    website: "",
    phones: ["+56 9 7766 5544"],
    hasPhysicalStore: true,
    address: "Urmeneta 540, Puerto Montt",
    tags: ["Computacion", "Celulares", "Electronica"],
    owner: {
      name: "Carlos Moya Soto",
      run: "13.876.543-2",
      phone: "+56 9 7766 5544",
      email: "cmoya@tecnopatagonia.cl",
      address: "Av. Austral 1200, Puerto Montt",
    },
  },
  {
    id: 3,
    name: "Casa Estilo",
    rut: "78.666.111-9",
    category: "Hogar y Cocina",
    comuna: "Valdivia",
    status: "En revision",
    email: "hola@casayestilo.cl",
    website: "https://casayestilo.cl",
    phones: ["+56 9 6655 4433"],
    hasPhysicalStore: false,
    address: "Sin tienda fisica",
    tags: ["Hogar y Cocina", "Servicios domesticos"],
    owner: {
      name: "Fernanda Lagos",
      run: "16.543.210-K",
      phone: "+56 9 6655 4433",
      email: "fernanda@casayestilo.cl",
      address: "Av. Alemania 890, Valdivia",
    },
  },
  {
    id: 4,
    name: "Libreria Austral",
    rut: "76.778.990-5",
    category: "Utiles y libreria",
    comuna: "Osorno",
    status: "Suspendida",
    email: "info@libreriaaustral.cl",
    website: "",
    phones: ["+56 64 221 9988"],
    hasPhysicalStore: true,
    address: "Ramirez 950, Osorno",
    tags: ["Utiles y libreria", "Libros"],
    owner: {
      name: "Roberto Gomez",
      run: "10.222.333-4",
      phone: "+56 9 4433 2211",
      email: "rgomez@libreriaaustral.cl",
      address: "O Higgins 640, Osorno",
    },
  },
]

const COMPANY_TEMPLATE = {
  name: "",
  rut: "",
  category: "Hogar y Cocina",
  comuna: "Osorno",
  status: "Activa",
  email: "",
  website: "",
  phones: [""],
  hasPhysicalStore: false,
  address: "",
  tags: [],
  owner: { name: "", run: "", phone: "", email: "", address: "" },
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RUT_REGEX = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/

function getCompanyErrors(d) {
  const e = {}
  if (!d.name.trim()) e.name = "El nombre es obligatorio"
  if (!d.rut.trim()) e.rut = "El RUT es obligatorio"
  else if (!RUT_REGEX.test(d.rut)) e.rut = "Ingresa un RUT valido (ej: 76.123.456-7)"
  if (!d.email.trim()) e.email = "El email es obligatorio"
  else if (!EMAIL_REGEX.test(d.email)) e.email = "Ingresa un correo valido"
  if (!d.owner.name.trim()) e.ownerName = "El nombre del emprendedor es obligatorio"
  if (!d.owner.run.trim()) e.ownerRun = "El RUN es obligatorio"
  if (!d.owner.email.trim()) e.ownerEmail = "El correo del emprendedor es obligatorio"
  else if (!EMAIL_REGEX.test(d.owner.email)) e.ownerEmail = "Ingresa un correo valido"
  if (d.hasPhysicalStore && !d.address.trim()) e.address = "La direccion es obligatoria"
  return e
}

export default function ManageCompaniesPage() {
  const [companies, setCompanies] = useState(INITIAL_COMPANIES)
  const [statusFilter, setStatusFilter] = useState("Todas")
  const [search, setSearch] = useState("")
  const [notice, setNotice] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingCompany, setDeletingCompany] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(COMPANY_TEMPLATE)
  const [detailTab, setDetailTab] = useState("empresa")
  const [formErrors, setFormErrors] = useState({})

  const visibleCompanies = companies.filter((c) => {
    const matchStatus = statusFilter === "Todas" || c.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.rut.toLowerCase().includes(q) ||
      c.owner.name.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const openEdit = (company) => {
    setEditingId(company.id)
    setDraft({
      ...company,
      phones: company.phones.length ? [...company.phones] : [""],
      owner: { ...company.owner },
    })
    setFormErrors({})
    setDetailTab("empresa")
    setEditOpen(true)
  }

  const openCreate = () => {
    setEditingId(null)
    setDraft({ ...COMPANY_TEMPLATE, phones: [""], owner: { ...COMPANY_TEMPLATE.owner } })
    setFormErrors({})
    setDetailTab("empresa")
    setEditOpen(true)
  }

  const closeEdit = () => {
    setEditOpen(false)
    setEditingId(null)
    setFormErrors({})
  }

  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const updateOwner = (field, value) => {
    setDraft((prev) => ({ ...prev, owner: { ...prev.owner, [field]: value } }))
    const key = "owner" + field.charAt(0).toUpperCase() + field.slice(1)
    setFormErrors((prev) => ({ ...prev, [key]: "" }))
  }

  const updatePhone = (idx, value) => {
    setDraft((prev) => {
      const next = [...prev.phones]
      next[idx] = value
      return { ...prev, phones: next }
    })
  }

  const saveCompany = () => {
    const errors = getCompanyErrors(draft)
    setFormErrors(errors)
    if (Object.keys(errors).length) return

    if (editingId) {
      setCompanies((prev) => prev.map((c) => (c.id === editingId ? { ...draft, id: editingId } : c)))
      setNotice("Empresa actualizada correctamente")
    } else {
      const newId = Date.now()
      setCompanies((prev) => [...prev, { ...draft, id: newId }])
      setNotice("Empresa creada correctamente")
    }
    closeEdit()
  }

  const confirmDelete = () => {
    if (!deletingCompany) return
    setCompanies((prev) => prev.filter((c) => c.id !== deletingCompany.id))
    setNotice("Empresa eliminada correctamente")
    setDeleteOpen(false)
    setDeletingCompany(null)
  }

  return (
    <Box className="orders-page">
      <Box className="orders-main">
        <Box className="orders-breadcrumb">Panel de control <span>/</span> Empresas y emprendedores</Box>

        <Box className="orders-heading">
          <Box className="orders-title-group">
            <BusinessOutlined color="primary" fontSize="large" />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>Empresas y emprendedores</Typography>
              <Typography color="text.secondary">
                Gestiona las tiendas, marcas y datos del emprendedor dueno que venden en Shopping.
              </Typography>
            </Box>
            <Chip label={`${companies.length} total`} size="small" color="primary" variant="outlined" />
          </Box>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>
            Nueva empresa
          </Button>
        </Box>

        <Box className="orders-filters">
          <TextField
            className="orders-search"
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
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty>
            <MenuItem value="Todas">Todas las empresas</MenuItem>
            <MenuItem value="Activa">Activa</MenuItem>
            <MenuItem value="En revision">En revision</MenuItem>
            <MenuItem value="Suspendida">Suspendida</MenuItem>
          </Select>
          <Button variant="contained" startIcon={<FilterListOutlined />}>
            Aplicar filtros
          </Button>
        </Box>

        <Paper className="orders-table-paper">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell align="center">RUT Empresa</TableCell>
                <TableCell align="center">Categoria</TableCell>
                <TableCell align="center">Comuna</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No hay empresas que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              ) : (
                visibleCompanies.map((c) => (
                  <TableRow key={c.id} hover sx={{ cursor: "default" }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.78rem", fontWeight: 800 }}>
                          {c.name.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{c.name}</Typography>
                          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{c.owner.name}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="center" sx={{ fontFamily: "monospace", fontSize: 13 }}>{c.rut}</TableCell>
                    <TableCell align="center" sx={{ fontSize: 14 }}>{c.category}</TableCell>
                    <TableCell align="center" sx={{ fontSize: 14 }}>{c.comuna}</TableCell>
                    <TableCell align="center"><StatusChip status={c.status} /></TableCell>
                    <TableCell align="right" className="order-actions">
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

      {/* ====== MODAL EDITAR / CREAR ====== */}
      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="md" scroll="paper">
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18, borderBottom: "1px solid", borderColor: "divider", pb: 1.5 }}>
          {editingId ? "Editar empresa" : "Nueva empresa"}
        </DialogTitle>

        <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ px: 3, borderBottom: "1px solid", borderColor: "divider", minHeight: 44 }}>
          <Tab value="empresa" icon={<BusinessOutlined fontSize="small" />} iconPosition="start" label="Datos de la empresa" sx={{ minHeight: 44, textTransform: "none", fontWeight: 600 }} />
          <Tab value="dueno" icon={<PersonOutlined fontSize="small" />} iconPosition="start" label="Emprendedor / Dueno" sx={{ minHeight: 44, textTransform: "none", fontWeight: 600 }} />
        </Tabs>

        <DialogContent sx={{ pt: 3 }}>
          {detailTab === "empresa" ? (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre de la empresa *"
                  size="small"
                  value={draft.name}
                  onChange={(e) => updateDraft("name", e.target.value)}
                  error={Boolean(formErrors.name)}
                  helperText={formErrors.name}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="RUT de la empresa *"
                  size="small"
                  placeholder="76.123.456-7"
                  value={draft.rut}
                  onChange={(e) => updateDraft("rut", e.target.value)}
                  error={Boolean(formErrors.rut)}
                  helperText={formErrors.rut}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email de contacto *"
                  size="small"
                  value={draft.email}
                  onChange={(e) => updateDraft("email", e.target.value)}
                  error={Boolean(formErrors.email)}
                  helperText={formErrors.email}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sitio web (opcional)"
                  size="small"
                  placeholder="https://..."
                  value={draft.website}
                  onChange={(e) => updateDraft("website", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Categoria principal"
                  size="small"
                  value={draft.category}
                  onChange={(e) => updateDraft("category", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                >
                  {["Hogar y Cocina","Tecnologia","Ropa y moda","Alimentacion","Utiles y libreria","Servicios","Electronica"].map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Estado"
                  size="small"
                  value={draft.status}
                  onChange={(e) => updateDraft("status", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value="Activa">Activa</MenuItem>
                  <MenuItem value="En revision">En revision</MenuItem>
                  <MenuItem value="Suspendida">Suspendida</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Telefonos de contacto</Typography>
                <Stack spacing={1}>
                  {draft.phones.map((p, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                      <TextField
                        fullWidth
                        size="small"
                        value={p}
                        onChange={(e) => updatePhone(i, e.target.value)}
                        placeholder="+56 9 ..."
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
                      <IconButton size="small" color="error" disabled={draft.phones.length <= 1}
                        onClick={() => setDraft((prev) => ({ ...prev, phones: prev.phones.filter((_, idx) => idx !== i) }))}>
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
                <Button size="small" startIcon={<AddOutlined />} sx={{ mt: 1 }}
                  onClick={() => setDraft((prev) => ({ ...prev, phones: [...prev.phones, ""] }))}>
                  Agregar telefono
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: "#f7f6ff", borderRadius: 2 }}>
                  <FormControlLabel
                    control={<Switch checked={draft.hasPhysicalStore} onChange={(e) => updateDraft("hasPhysicalStore", e.target.checked)} />}
                    label={<Typography fontWeight={700} fontSize={14}>Tiene tienda fisica</Typography>}
                  />
                  {draft.hasPhysicalStore && (
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth select label="Region" size="small" value="Los Lagos" InputLabelProps={{ shrink: true }}>
                          <MenuItem value="Los Lagos">Los Lagos</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth select label="Comuna" size="small"
                          value={draft.comuna}
                          onChange={(e) => updateDraft("comuna", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        >
                          <MenuItem value="Osorno">Osorno</MenuItem>
                          <MenuItem value="Puerto Montt">Puerto Montt</MenuItem>
                          <MenuItem value="Valdivia">Valdivia</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Direccion del local *"
                          size="small"
                          value={draft.address}
                          onChange={(e) => updateDraft("address", e.target.value)}
                          error={Boolean(formErrors.address)}
                          helperText={formErrors.address}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 1 }}>Datos personales del dueno / emprendedor responsable de esta empresa.</Alert>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre del emprendedor *"
                  size="small"
                  value={draft.owner.name}
                  onChange={(e) => updateOwner("name", e.target.value)}
                  error={Boolean(formErrors.ownerName)}
                  helperText={formErrors.ownerName}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="RUN del emprendedor *"
                  size="small"
                  placeholder="15.432.876-5"
                  value={draft.owner.run}
                  onChange={(e) => updateOwner("run", e.target.value)}
                  error={Boolean(formErrors.ownerRun)}
                  helperText={formErrors.ownerRun}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefono personal *"
                  size="small"
                  value={draft.owner.phone}
                  onChange={(e) => updateOwner("phone", e.target.value)}
                  InputLabelProps={{ shrink: true }}
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo personal *"
                  size="small"
                  value={draft.owner.email}
                  onChange={(e) => updateOwner("email", e.target.value)}
                  error={Boolean(formErrors.ownerEmail)}
                  helperText={formErrors.ownerEmail}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Direccion particular *"
                  size="small"
                  value={draft.owner.address}
                  onChange={(e) => updateOwner("address", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}

          {/* Resumen de errores */}
          {Object.keys(formErrors).length > 0 && (
            <Alert severity="error" sx={{ mt: 2.5 }}>
              Hay campos obligatorios sin completar. Revisa ambas pestanas antes de guardar.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Button onClick={closeEdit}>Cancelar</Button>
          <Button variant="contained" onClick={saveCompany}>
            {editingId ? "Guardar cambios" : "Crear empresa"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====== MODAL ELIMINAR ====== */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Eliminar empresa</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esta accion eliminara a <strong>{deletingCompany?.name}</strong> de la plataforma. Esta accion no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={2600} onClose={() => setNotice("")}>
        <Alert severity="success" onClose={() => setNotice("")}>{notice}</Alert>
      </Snackbar>
    </Box>
  )
}
