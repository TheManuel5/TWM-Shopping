import { useMemo, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import {
  AddOutlined,
  ArrowForwardIosOutlined,
  BusinessOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  EditOutlined,
  SearchOutlined,
} from '@mui/icons-material'
import { empresasIniciales } from '../data/businessesData'

// Esta vista trabaja solo con datos de demostración, sin llamadas al backend.
const ESTADOS = ['Activa', 'En revisión', 'Suspendida']
const POR_PAGINA = 10
const COLOR_BORDE = '#e1e5f2'
const COLOR_TEXTO_SUAVE = '#657392'

const COLORES_ESTADO = {
  Activa: { fondo: '#e3f7ed', texto: '#075c3a', punto: '#04a66a' },
  'En revisión': { fondo: '#fff3d7', texto: '#916100', punto: '#f3a800' },
  Suspendida: { fondo: '#ffe6e9', texto: '#a52237', punto: '#ef2344' },
}

// Cuatro registros visuales adicionales para completar las diez filas del Figma.
// Los totales y filtros se calculan desde los registros reales del mock.
const EMPRESAS_DEMO = [
  { id: 7, nombre: 'BellaNatur', rut: '77.444.332-1', categoria: 'Salud y Belleza', comuna: 'Osorno', estado: 'Activa', correo: 'contacto@bellanatur.cl' },
  { id: 8, nombre: 'Kids & Joy', rut: '76.321.654-0', categoria: 'Juguetes y Bebés', comuna: 'Puerto Montt', estado: 'Activa', correo: 'hola@kidsjoy.cl' },
  { id: 9, nombre: 'Sabores del Sur', rut: '77.102.334-6', categoria: 'Alimentos y Bebidas', comuna: 'Frutillar', estado: 'Activa', correo: 'ventas@saboresdelsur.cl' },
  { id: 10, nombre: 'Mundo Mascotas', rut: '76.889.221-8', categoria: 'Mascotas', comuna: 'Osorno', estado: 'Activa', correo: 'contacto@mundomascotas.cl' },
]

const EMPRESA_NUEVA = {
  nombre: '', rut: '', categoria: '', comuna: '', estado: 'En revisión',
  correo: '', telefono: '', sitioWeb: '', direccion: '',
  telefonos: [], categorias: [],
  tieneTiendaFisica: false, region: 'Los Lagos', provincia: '',
  numero: '', departamento: '', anioInicio: '',
  duenoNombre: '', duenoRut: '', duenoCorreo: '', duenoTelefono: '',
}

function normalizar(empresa) {
  const esTiendaSur = empresa.nombre === 'Tienda Sur'
  const telefonos = Array.isArray(empresa.telefonos)
    ? empresa.telefonos
    : esTiendaSur
      ? ['+56 9 9876 5432', '+56 64 223 3344']
      : empresa.telefono ? [empresa.telefono] : []
  return {
    ...EMPRESA_NUEVA,
    ...empresa,
    telefonos,
    categorias: Array.isArray(empresa.categorias)
      ? empresa.categorias
      : esTiendaSur
        ? ['Hogar y Cocina', 'Decohogar', 'Organización', 'Textiles para el hogar']
        : empresa.categoria ? [empresa.categoria] : [],
    tieneTiendaFisica: empresa.tieneTiendaFisica ?? esTiendaSur,
    region: empresa.region ?? 'Los Lagos',
    provincia: empresa.provincia ?? (empresa.comuna === 'Valdivia' ? 'Valdivia' : 'Osorno'),
    direccion: esTiendaSur ? 'Av. Manuel Rodríguez' : (empresa.direccion ?? ''),
    numero: empresa.numero ?? (esTiendaSur ? '1234' : ''),
    departamento: empresa.departamento ?? (esTiendaSur ? 'Depto. 2' : ''),
    anioInicio: empresa.anioInicio ?? (esTiendaSur ? '2023' : ''),
  }
}

function Estado({ valor }) {
  const estilo = COLORES_ESTADO[valor] ?? COLORES_ESTADO['En revisión']
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.7, px: 1.15, py: 0.5, bgcolor: estilo.fondo, color: estilo.texto, borderRadius: 5, whiteSpace: 'nowrap' }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: estilo.punto }} />
      <Typography component="span" sx={{ fontSize: 11, lineHeight: 1.1, fontWeight: 500 }}>{valor}</Typography>
    </Box>
  )
}

function AvatarEmpresa({ empresa, grande = false }) {
  const colores = ['#e1e8ee', '#17264b', '#eef0f5', '#eff2f6', '#e6f0ee']
  const iniciales = empresa.nombre.split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase()
  const especial = empresa.nombre === 'Tienda Sur' ? '🏔️' : null
  return (
    <Avatar sx={{ width: grande ? 70 : 34, height: grande ? 70 : 34, bgcolor: colores[Number(empresa.id) % colores.length], color: Number(empresa.id) % colores.length === 1 ? 'white' : '#182745', fontSize: grande ? 26 : 13, fontWeight: 700, flexShrink: 0 }}>
      {especial ?? iniciales}
    </Avatar>
  )
}

function Campo({ titulo, valor, onChange, disabled = false, type = 'text', placeholder = '' }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontWeight: 600, fontSize: 11.5, mb: 0.6, color: '#101a39' }}>{titulo}</Typography>
      <TextField
        fullWidth size="small" type={type} value={valor ?? ''} placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        slotProps={{ input: { readOnly: disabled } }}
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: disabled ? '#fafbff' : '#ffffff', borderRadius: '7px', minHeight: 35 }, '& .MuiInputBase-input': { fontSize: 12.5, py: 0.85 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: COLOR_BORDE } }}
      />
    </Box>
  )
}

export default function Businesses() {
  const [empresas, setEmpresas] = useState(() => {
    const originales = empresasIniciales.map(normalizar)
    return [...originales, ...EMPRESAS_DEMO.filter((demo) => !originales.some((e) => e.nombre === demo.nombre)).map(normalizar)]
  })
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todas')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas las categorías')
  const [pagina, setPagina] = useState(1)
  const [seleccionId, setSeleccionId] = useState(empresasIniciales[0]?.id ?? null)
  const [modo, setModo] = useState('ver') // ver | editar | crear
  const [pestana, setPestana] = useState('empresa')
  const [borrador, setBorrador] = useState({ ...EMPRESA_NUEVA })
  const [telefonoNuevo, setTelefonoNuevo] = useState('')
  const [categoriaNueva, setCategoriaNueva] = useState('')
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  const seleccionada = empresas.find((e) => e.id === seleccionId) ?? null
  const editando = modo !== 'ver'
  const datos = editando ? borrador : seleccionada
  const categoriasDisponibles = useMemo(() => [...new Set(empresas.map((e) => e.categoria).filter(Boolean))].sort(), [empresas])

  const filtradas = useMemo(() => empresas.filter((e) => {
    const texto = busqueda.trim().toLowerCase()
    return (e.nombre.toLowerCase().includes(texto) || e.rut.toLowerCase().includes(texto))
      && (filtroEstado === 'Todas' || e.estado === filtroEstado)
      && (filtroCategoria === 'Todas las categorías' || e.categoria === filtroCategoria)
  }), [empresas, busqueda, filtroEstado, filtroCategoria])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)
  const inicio = filtradas.length === 0 ? 0 : (paginaActual - 1) * POR_PAGINA + 1
  const fin = Math.min(paginaActual * POR_PAGINA, filtradas.length)

  const actualizar = (campo, valor) => setBorrador((anterior) => ({ ...anterior, [campo]: valor }))
  const seleccionar = (empresa) => {
    setSeleccionId(empresa.id)
    setModo('ver')
    setPestana('empresa')
    setError('')
  }
  const editar = () => {
    if (!seleccionada) return
    setBorrador({ ...seleccionada, telefonos: [...seleccionada.telefonos], categorias: [...seleccionada.categorias] })
    setModo('editar')
    setError('')
  }
  const crear = () => {
    setBorrador({ ...EMPRESA_NUEVA, telefonos: [], categorias: [] })
    setTelefonoNuevo('')
    setCategoriaNueva('')
    setModo('crear')
    setPestana('empresa')
    setError('')
  }
  const cancelar = () => { setModo('ver'); setError(''); setTelefonoNuevo(''); setCategoriaNueva('') }

  const guardar = () => {
    const nombre = borrador.nombre.trim()
    const rut = borrador.rut.trim()
    if (!nombre || !rut) { setError('Debes completar nombre de la empresa y RUT.'); return }
    if (empresas.some((e) => e.rut.trim().toLowerCase() === rut.toLowerCase() && (modo === 'crear' || e.id !== seleccionId))) {
      setError('Ya existe una empresa con ese RUT.'); return
    }
    const telefonos = borrador.telefonos.filter(Boolean)
    const categorias = borrador.categorias.filter(Boolean)
    const final = { ...borrador, nombre, rut, telefonos, telefono: telefonos[0] ?? '', categorias, categoria: borrador.categoria || categorias[0] || '' }
    if (modo === 'crear') {
      const nueva = { ...final, id: Date.now() }
      setEmpresas((actuales) => [...actuales, nueva])
      setSeleccionId(nueva.id)
      setBusqueda('')
      setFiltroEstado('Todas')
      setFiltroCategoria('Todas las categorías')
      setPagina(Math.ceil((empresas.length + 1) / POR_PAGINA))
      setAviso('Empresa creada en los datos de prueba.')
    } else {
      setEmpresas((actuales) => actuales.map((e) => e.id === seleccionId ? { ...e, ...final } : e))
      setAviso('Cambios guardados en los datos de prueba.')
    }
    setModo('ver')
    setError('')
  }

  const agregarTelefono = () => {
    const t = telefonoNuevo.trim()
    if (!t) return
    if (borrador.telefonos.includes(t)) { setError('Ese teléfono ya fue agregado.'); return }
    actualizar('telefonos', [...borrador.telefonos, t])
    setTelefonoNuevo('')
    setError('')
  }
  const agregarCategoria = () => {
    const c = categoriaNueva.trim()
    if (!c) return
    if (borrador.categorias.some((item) => item.toLowerCase() === c.toLowerCase())) return
    setBorrador((actual) => ({ ...actual, categoria: actual.categoria || c, categorias: [...actual.categorias, c] }))
    setCategoriaNueva('')
  }

  return (
    <Box sx={{ pb: 2 }}>
      {/* Encabezado de la página */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
        <Box>
          <Typography component="h1" sx={{ fontSize: { xs: 24, lg: 28 }, fontWeight: 750, lineHeight: 1.2, color: '#0c1636' }}>Empresas y emprendedores</Typography>
          <Typography sx={{ color: COLOR_TEXTO_SUAVE, fontSize: 13, mt: 0.4 }}>Gestiona las tiendas, marcas y emprendedores que venden en Shopping.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={crear} sx={{ minHeight: 38, px: 2.5 }}>Nueva empresa</Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', xl: 'minmax(0, 1.02fr) minmax(0, 1fr)' }, gap: 1.5, alignItems: 'stretch' }}>
        {/* Listado izquierdo */}
        <Paper elevation={0} sx={{ p: 1.5, border: `1px solid ${COLOR_BORDE}`, borderRadius: 2, minWidth: 0, minHeight: { xl: 745 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 160px' }, gap: 1, mb: 1.4 }}>
            <TextField size="small" placeholder="Buscar empresa, emprendedor o RUT..." value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPagina(1) }}
              slotProps={{ input: { startAdornment: <SearchOutlined sx={{ fontSize: 18, color: COLOR_TEXTO_SUAVE, mr: 0.8 }} /> } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '7px' }, '& .MuiInputBase-input': { fontSize: 12.5 } }} />
            <TextField select size="small" value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setPagina(1) }}
              aria-label="Filtrar empresas por categoría" sx={{ '& .MuiInputBase-input': { fontSize: 12 }, '& .MuiOutlinedInput-root': { borderRadius: '7px' } }}>
              <MenuItem value="Todas las categorías">Todas las categorías</MenuItem>
              {categoriasDisponibles.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', mb: 1.4 }}>
            {['Todas', ...ESTADOS].map((estado) => {
              const activo = filtroEstado === estado
              const cantidad = estado === 'Todas' ? empresas.length : empresas.filter((e) => e.estado === estado).length
              return (
                <Button key={estado} size="small" variant="outlined" onClick={() => { setFiltroEstado(estado); setPagina(1) }}
                  sx={{ fontSize: 11, minWidth: 0, px: 1.1, py: 0.45, borderRadius: 8, lineHeight: 1.25, borderColor: activo ? 'primary.main' : COLOR_BORDE, bgcolor: activo ? '#f0ebff' : '#fff', color: activo ? 'primary.main' : '#24314e', '&:hover': { bgcolor: '#f0ebff' } }}>
                  {estado === 'Todas' ? null : <Box component="span" sx={{ width: 6, height: 6, bgcolor: '#16213f', borderRadius: '50%', mr: 0.7 }} />}
                  {estado} <Box component="span" sx={{ ml: 0.8, color: COLOR_TEXTO_SUAVE }}>{cantidad}</Box>
                </Button>
              )
            })}
          </Box>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 525, tableLayout: 'fixed', '& .MuiTableCell-root': { borderColor: '#e8ebf4' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f4f6fb' }}>
                  <TableCell sx={{ ...cabeceraTabla, width: '28%' }}>Nombre</TableCell>
                  <TableCell sx={{ ...cabeceraTabla, width: '19%' }}>RUT</TableCell>
                  <TableCell sx={{ ...cabeceraTabla, width: '24%' }}>Categoría</TableCell>
                  <TableCell sx={{ ...cabeceraTabla, width: '15%' }}>Comuna</TableCell>
                  <TableCell sx={{ ...cabeceraTabla, width: '14%' }}>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibles.map((e) => (
                  <TableRow key={e.id} hover selected={modo !== 'crear' && seleccionId === e.id} onClick={() => seleccionar(e)}
                    sx={{ cursor: 'pointer', height: 48, '&.Mui-selected, &.Mui-selected:hover': { bgcolor: '#eee9ff' } }}>
                    <TableCell sx={{ py: 0.6, px: 0.8 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, minWidth: 0 }}>
                        <AvatarEmpresa empresa={e} />
                        <Typography noWrap sx={{ fontSize: 11.4, fontWeight: 650, color: '#111b36' }}>{e.nombre}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={textoTabla}>{e.rut}</TableCell>
                    <TableCell sx={textoTabla}><Typography noWrap sx={{ fontSize: 11 }}>{e.categoria || '—'}</Typography></TableCell>
                    <TableCell sx={textoTabla}><Typography noWrap sx={{ fontSize: 11 }}>{e.comuna || '—'}</Typography></TableCell>
                    <TableCell sx={{ py: 0.5, px: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Estado valor={e.estado} />
                        <ArrowForwardIosOutlined sx={{ fontSize: 10, ml: 'auto', color: '#667795' }} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {visibles.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: COLOR_TEXTO_SUAVE }}>No se encontraron empresas.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.4, gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 11, color: COLOR_TEXTO_SUAVE }}>Mostrando {inicio} a {fin} de {filtradas.length} empresas</Typography>
            <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
              <IconButton size="small" disabled={paginaActual === 1} onClick={() => setPagina((p) => Math.max(1, p - 1))} sx={botonPagina}><ChevronLeftOutlined fontSize="small" /></IconButton>
              {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => i + 1).map((num) => (
                <Button key={num} onClick={() => setPagina(num)} size="small" variant={num === paginaActual ? 'contained' : 'outlined'}
                  sx={{ minWidth: 29, width: 29, height: 29, p: 0, fontSize: 11, borderColor: COLOR_BORDE }}>{num}</Button>
              ))}
              <IconButton size="small" disabled={paginaActual === totalPaginas} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} sx={botonPagina}><ChevronRightOutlined fontSize="small" /></IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Panel derecho: ficha y formulario */}
        <Paper elevation={0} sx={{ p: 1.5, border: `1px solid ${COLOR_BORDE}`, borderRadius: 2, minWidth: 0, minHeight: { xl: 745 }, display: 'flex', flexDirection: 'column' }}>
          {datos ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.2 }}>
                <AvatarEmpresa empresa={datos} grande />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 19, fontWeight: 750, color: '#111b36' }}>{modo === 'crear' ? 'Nueva empresa' : datos.nombre}</Typography>
                    <Estado valor={datos.estado} />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: COLOR_TEXTO_SUAVE, mt: 0.2 }}>{[datos.categoria, datos.comuna].filter(Boolean).join(' · ') || 'Completa los datos de la empresa'}</Typography>
                  <Typography sx={{ fontSize: 11, color: COLOR_TEXTO_SUAVE, mt: 0.3 }}>{datos.anioInicio ? `Vende desde ${datos.anioInicio}` : 'Información de empresa'}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5, gap: 0.7, flexWrap: 'wrap' }}>
                {['empresa', 'dueno'].map((tab) => (
                  <Button key={tab} variant="outlined" size="small" onClick={() => setPestana(tab)}
                    sx={{ borderRadius: '6px', fontSize: 11, px: 1.7, minHeight: 32, bgcolor: pestana === tab ? '#f0ebff' : 'white', color: pestana === tab ? 'primary.main' : '#111827', borderColor: pestana === tab ? 'primary.main' : COLOR_BORDE }}>
                    {tab === 'empresa' ? 'Datos de la empresa' : 'Emprendedor / Dueño'}
                  </Button>
                ))}
              </Box>

              {pestana === 'empresa' ? (
                <>
                  <Box sx={seccionPanel}>
                    <Typography sx={tituloSeccion}>Información de la empresa</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1.1fr) minmax(0, 0.9fr)' }, gap: 1.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                        <Campo titulo="Nombre de la empresa" valor={datos.nombre} disabled={!editando} onChange={(v) => actualizar('nombre', v)} />
                        <Campo titulo="RUT de la empresa" valor={datos.rut} disabled={!editando} onChange={(v) => actualizar('rut', v)} />
                        <Campo titulo="Email de contacto" type="email" valor={datos.correo} disabled={!editando} onChange={(v) => actualizar('correo', v)} />
                        <Campo titulo="Sitio web (opcional)" valor={datos.sitioWeb} disabled={!editando} onChange={(v) => actualizar('sitioWeb', v)} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 11.5, mb: 0.7 }}>Teléfonos de contacto</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, alignItems: 'center' }}>
                          {(datos.telefonos ?? []).map((telefono, i) => (
                            <Chip key={`${telefono}-${i}`} label={telefono} size="small" onDelete={editando ? () => actualizar('telefonos', borrador.telefonos.filter((_, idx) => idx !== i)) : undefined}
                              sx={{ bgcolor: '#f0ebff', color: '#602ff7', fontSize: 11, '& .MuiChip-deleteIcon': { color: '#602ff7' } }} />
                          ))}
                          {(!datos.telefonos || datos.telefonos.length === 0) && <Typography sx={{ fontSize: 11.5, color: COLOR_TEXTO_SUAVE }}>Sin teléfonos registrados</Typography>}
                        </Box>
                        {editando && (
                          <Box sx={{ display: 'flex', gap: 0.6, mt: 1.2, flexWrap: 'wrap' }}>
                            <TextField size="small" placeholder="Nuevo teléfono" value={telefonoNuevo} onChange={(e) => setTelefonoNuevo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarTelefono() } }} sx={{ flex: 1, minWidth: 130, '& .MuiInputBase-input': { fontSize: 12 } }} />
                            <Button onClick={agregarTelefono} variant="outlined" size="small" startIcon={<AddOutlined />}>Agregar</Button>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ bgcolor: '#f8f6ff', p: 1.25, borderRadius: 2, mt: 1.6 }}>
                      <FormControlLabel control={<Switch size="small" checked={Boolean(datos.tieneTiendaFisica)} onChange={(e) => actualizar('tieneTiendaFisica', e.target.checked)} disabled={!editando} />} label={<Typography sx={{ fontSize: 12, fontWeight: 650 }}>Tiene tienda física</Typography>} sx={{ m: 0, mb: 0.7 }} />
                      {datos.tieneTiendaFisica && (
                        <>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
                            <Campo titulo="Región" valor={datos.region} disabled={!editando} onChange={(v) => actualizar('region', v)} />
                            <Campo titulo="Provincia" valor={datos.provincia} disabled={!editando} onChange={(v) => actualizar('provincia', v)} />
                            <Campo titulo="Comuna" valor={datos.comuna} disabled={!editando} onChange={(v) => actualizar('comuna', v)} />
                          </Box>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1.5fr) minmax(0, 0.55fr) minmax(0, 0.9fr)' }, gap: 1, mt: 1 }}>
                            <Campo titulo="Dirección" valor={datos.direccion} disabled={!editando} onChange={(v) => actualizar('direccion', v)} />
                            <Campo titulo="Número" valor={datos.numero} disabled={!editando} onChange={(v) => actualizar('numero', v)} />
                            <Campo titulo="Departamento (opcional)" valor={datos.departamento} disabled={!editando} onChange={(v) => actualizar('departamento', v)} />
                          </Box>
                        </>
                      )}
                      {!datos.tieneTiendaFisica && <Typography sx={{ fontSize: 11, color: COLOR_TEXTO_SUAVE }}>La empresa no registra una tienda física.</Typography>}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1.4fr) minmax(0, 0.8fr)' }, gap: 1, mt: 1 }}>
                    <Box sx={seccionPanel}>
                      <Typography sx={tituloSeccion}>Categorías de productos o servicios que ofrece</Typography>
                      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {(datos.categorias ?? []).map((categoria, i) => (
                          <Chip key={`${categoria}-${i}`} size="small" label={categoria} onDelete={editando ? () => {
                            const proximas = borrador.categorias.filter((_, j) => j !== i)
                            setBorrador((anterior) => ({ ...anterior, categorias: proximas, categoria: proximas[0] ?? '' }))
                          } : undefined} sx={{ bgcolor: '#f0ebff', color: '#602ff7', fontSize: 11 }} />
                        ))}
                        {(!datos.categorias || datos.categorias.length === 0) && <Typography sx={{ color: COLOR_TEXTO_SUAVE, fontSize: 11 }}>Sin categorías registradas</Typography>}
                      </Box>
                      {editando && <Box sx={{ mt: 1, display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                        <TextField size="small" placeholder="Nueva categoría" value={categoriaNueva} onChange={(e) => setCategoriaNueva(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarCategoria() } }} sx={{ flex: 1, minWidth: 120, '& .MuiInputBase-input': { fontSize: 12 } }} />
                        <Button variant="outlined" size="small" onClick={agregarCategoria} startIcon={<AddOutlined />}>Agregar</Button>
                      </Box>}
                    </Box>
                    <Box sx={seccionPanel}>
                      <Typography sx={tituloSeccion}>Estado de la empresa</Typography>
                      <TextField select fullWidth size="small" value={datos.estado} disabled={!editando} onChange={(e) => actualizar('estado', e.target.value)}
                        sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}>
                        {ESTADOS.map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}
                      </TextField>
                      <Typography sx={{ mt: 0.9, color: COLOR_TEXTO_SUAVE, fontSize: 11 }}>La empresa puede vender en la plataforma si está activa.</Typography>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box sx={seccionPanel}>
                  <Typography sx={tituloSeccion}>Información del emprendedor / dueño</Typography>
                  <Typography sx={{ fontSize: 12, color: COLOR_TEXTO_SUAVE, mb: 2 }}>Esta información es de prueba y puede completarse desde el modo edición.</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                    <Campo titulo="Nombre completo" valor={datos.duenoNombre} disabled={!editando} onChange={(v) => actualizar('duenoNombre', v)} />
                    <Campo titulo="RUT del dueño" valor={datos.duenoRut} disabled={!editando} onChange={(v) => actualizar('duenoRut', v)} />
                    <Campo titulo="Correo electrónico" valor={datos.duenoCorreo} disabled={!editando} onChange={(v) => actualizar('duenoCorreo', v)} type="email" />
                    <Campo titulo="Teléfono" valor={datos.duenoTelefono} disabled={!editando} onChange={(v) => actualizar('duenoTelefono', v)} />
                  </Box>
                </Box>
              )}

              {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto', pt: 2, gap: 1, flexWrap: 'wrap' }}>
                {modo === 'ver' ? (
                  <Button variant="outlined" startIcon={<EditOutlined />} onClick={editar} sx={{ minWidth: 130 }}>Editar empresa</Button>
                ) : (
                  <>
                    <Button variant="outlined" color="inherit" onClick={cancelar} sx={{ minWidth: 95 }}>Cancelar</Button>
                    <Button variant="contained" onClick={guardar} sx={{ minWidth: 130 }}>{modo === 'crear' ? 'Crear empresa' : 'Guardar cambios'}</Button>
                  </>
                )}
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 250, color: COLOR_TEXTO_SUAVE }}><Typography>Selecciona una empresa para ver su información.</Typography></Box>
          )}
        </Paper>
      </Box>
      <Snackbar open={Boolean(aviso)} autoHideDuration={3300} onClose={() => setAviso('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" onClose={() => setAviso('')}>{aviso}</Alert>
      </Snackbar>
    </Box>
  )
}

const cabeceraTabla = { py: 1.2, px: 0.8, fontWeight: 700, fontSize: 10.5, color: '#111a36' }
const textoTabla = { py: 0.8, px: 0.7, color: '#697695', fontSize: 10.7, whiteSpace: 'nowrap' }
const botonPagina = { width: 29, height: 29, border: `1px solid ${COLOR_BORDE}`, borderRadius: '6px' }
const tituloSeccion = { fontWeight: 700, fontSize: 13, color: '#101a39', mb: 1.1 }
const seccionPanel = { p: 1.2, border: `1px solid ${COLOR_BORDE}`, borderRadius: 2, minWidth: 0 }
