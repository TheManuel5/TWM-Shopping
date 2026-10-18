import { useRef, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import {
  AccessTimeOutlined,
  AddOutlined,
  CloseOutlined,
  ComputerOutlined,
  HomeOutlined,
  InfoOutlined,
  LocationOnOutlined,
  PersonOutlineOutlined,
  SaveOutlined,
  StorefrontOutlined,
} from '@mui/icons-material'
import {
  categoriasServicio,
  comunasPorRegion,
  fotosIniciales,
  servicioInicial,
} from '../data/publishServiceData'

const CLAVE_BORRADOR = 'shopping-martin-publicar-servicio-borrador'
const PRECIO_MAXIMO = 999999999

const formatoCLP = (precio) => `$${Number(precio || 0).toLocaleString('es-CL')}`

const estiloTarjeta = {
  p: { xs: 2, sm: 2.25 },
  bgcolor: '#ffffff',
  border: '1px solid #e1e4f1',
  borderRadius: 2.5,
  boxShadow: 'none',
  minWidth: 0,
}

const tituloCampo = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  mb: 0.75,
  color: 'text.primary',
}

const estilosInput = {
  '& .MuiInputBase-root': { fontSize: 13, bgcolor: '#fff' },
  '& .MuiInputBase-input': { py: 1.1 },
}

function leerBorrador() {
  try {
    const guardado = window.localStorage.getItem(CLAVE_BORRADOR)
    const datos = guardado ? JSON.parse(guardado) : null
    if (datos && typeof datos === 'object' && !Array.isArray(datos)) {
      return {
        ...servicioInicial,
        ...datos,
        comunas: Array.isArray(datos.comunas) ? datos.comunas : servicioInicial.comunas,
      }
    }
  } catch {
    // Si no se puede leer localStorage, usamos los datos de ejemplo.
  }
  return { ...servicioInicial, comunas: [...servicioInicial.comunas] }
}

// Muestra un recuadro con icono cuando una foto remota no logra cargar.
function Foto({ foto, altura = '100%', objectFit = 'cover' }) {
  const [fallo, setFallo] = useState(false)
  if (!foto || fallo) {
    return (
      <Box sx={{ height: altura, width: '100%', display: 'grid', placeItems: 'center', bgcolor: '#eeebff', color: 'primary.main' }}>
        <ComputerOutlined sx={{ fontSize: 34 }} />
      </Box>
    )
  }
  return (
    <Box
      component="img"
      src={foto.src}
      alt={foto.nombre}
      onError={() => setFallo(true)}
      sx={{ display: 'block', width: '100%', height: altura, objectFit, borderRadius: 'inherit' }}
    />
  )
}

function Etiqueta({ children, required = false }) {
  return <Typography component="label" sx={tituloCampo}>{children}{required ? ' *' : ''}</Typography>
}

export default function PublishService() {
  const [form, setForm] = useState(leerBorrador)
  const [fotos, setFotos] = useState(fotosIniciales)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [publicadoDemo, setPublicadoDemo] = useState(false)
  const archivoRef = useRef(null)

  const actualizar = (campo, valor) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }))
    setError('')
    setPublicadoDemo(false)
  }

  const cambiarRegion = (region) => {
    setForm((anterior) => ({ ...anterior, region, comunas: [] }))
    setError('')
  }

  const precioVista = form.ofertaActiva && Number(form.precioOferta) > 0
    ? Number(form.precioOferta)
    : Number(form.precio)
  const hayDescuento = form.ofertaActiva && Number(form.precioOferta) > 0 && Number(form.precioOferta) < Number(form.precio)

  const agregarFotos = async (evento) => {
    const entradas = Array.from(evento.target.files ?? [])
    evento.target.value = ''
    if (!entradas.length) return
    const validas = entradas.filter((archivo) => archivo.type.startsWith('image/') && archivo.size <= 5 * 1024 * 1024)
    const cupos = Math.max(0, 8 - fotos.length)
    if (cupos === 0) {
      setMensaje({ tipo: 'warning', texto: 'Puedes agregar hasta 8 fotografías. Elimina alguna para añadir otra.' })
      return
    }
    if (validas.length !== entradas.length || validas.length > cupos) {
      setMensaje({ tipo: 'warning', texto: 'Solo se agregaron imágenes válidas de hasta 5 MB, dentro del límite de 8 fotos.' })
    }
    const nuevas = await Promise.all(validas.slice(0, cupos).map((archivo, indice) => new Promise((resolve) => {
      const lector = new FileReader()
      lector.onload = () => resolve({ id: `${Date.now()}-${indice}`, nombre: archivo.name, src: String(lector.result) })
      lector.onerror = () => resolve(null)
      lector.readAsDataURL(archivo)
    })))
    setFotos((actuales) => [...actuales, ...nuevas.filter(Boolean)].slice(0, 8))
    setError('')
  }

  const quitarFoto = (id) => setFotos((actuales) => actuales.filter((foto) => foto.id !== id))

  const guardarBorrador = () => {
    try {
      // Se guarda solo el formulario: las fotos subidas no se conservan al recargar.
      window.localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(form))
      setMensaje({ tipo: 'success', texto: 'Borrador guardado en este navegador. Las fotos subidas no se guardan.' })
    } catch {
      setMensaje({ tipo: 'error', texto: 'No fue posible guardar el borrador en este navegador.' })
    }
  }

  const validar = () => {
    if (!form.nombre.trim()) return 'Ingresa el nombre del servicio.'
    if (!form.categoria) return 'Selecciona una categoría.'
    if (!fotos.length) return 'Agrega por lo menos una fotografía.'
    if (!form.duracion || !form.edadMinima || !form.modalidad) return 'Completa la duración, edad mínima y modalidad.'
    if (!form.region || !form.comunas.length) return 'Selecciona al menos una comuna de cobertura.'
    if (form.descripcion.trim().length < 20) return 'La descripción debe tener al menos 20 caracteres.'
    if (!(Number(form.precio) > 0) || Number(form.precio) > PRECIO_MAXIMO) return 'Ingresa un precio original válido.'
    if (form.ofertaActiva) {
      if (!(Number(form.precioOferta) > 0) || Number(form.precioOferta) >= Number(form.precio)) return 'El precio de oferta debe ser mayor que cero y menor que el precio original.'
      if (!form.fechaInicio || !form.fechaFin || form.fechaFin < form.fechaInicio) return 'Revisa las fechas de inicio y término de la oferta.'
    }
    return ''
  }

  const publicar = (evento) => {
    evento.preventDefault()
    const problema = validar()
    if (problema) {
      setError(problema)
      return
    }
    setError('')
    setPublicadoDemo(true)
    setMensaje({ tipo: 'success', texto: '¡Publicación simulada! El servicio no fue enviado a un servidor.' })
  }

  return (
    <Box component="form" onSubmit={publicar} sx={{ pb: 4 }}>
      {/* Encabezado: AppLayout ya aporta el Navbar y el Sidebar. */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, mb: 1.25 }}>
            Catálogo&nbsp; › &nbsp;Publicar servicio
          </Typography>
          <Typography variant="h4" component="h1" fontWeight={800} sx={{ fontSize: { xs: 25, sm: 30 }, lineHeight: 1.2 }}>
            Publicar servicio
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.35 }}>
            Completa la información de tu servicio para que sea visible en Shopping.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 34, height: 34, bgcolor: '#e5e3f8', borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, color: 'primary.main' }}>CM</Box>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Carlos Moya</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Vendedor · ejemplo</Typography>
          </Box>
        </Box>
      </Box>

      {/* Esta pantalla está dedicada a Servicios; Producto corresponde a otro flujo. */}
      <Box sx={{ display: 'inline-flex', border: '1px solid #e1e4f1', borderRadius: 1.5, overflow: 'hidden', mb: 1.5 }}>
        <Button type="button" disabled sx={{ borderRadius: 0, minWidth: 113, fontSize: 12 }}>Producto</Button>
        <Button type="button" variant="contained" disableElevation sx={{ borderRadius: 0, minWidth: 113, fontSize: 12 }}>Servicios</Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.65fr) minmax(0, 0.8fr) minmax(0, 1fr)' }, gap: 1.5, alignItems: 'stretch' }}>
        {/* 1. Información principal */}
        <Paper sx={estiloTarjeta}>
          <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 2 }}>Información principal</Typography>
          <Box sx={{ mb: 1.8 }}>
            <Etiqueta required>Nombre del servicio</Etiqueta>
            <TextField fullWidth size="small" value={form.nombre} onChange={(e) => actualizar('nombre', e.target.value)} slotProps={{ htmlInput: { maxLength: 90 } }} sx={estilosInput} />
          </Box>
          <Box sx={{ mb: 1.8 }}>
            <Etiqueta required>Categoría</Etiqueta>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1.15fr' }, gap: 1.25 }}>
              <TextField select fullWidth size="small" value="Servicios" sx={estilosInput} slotProps={{ input: { readOnly: true } }}>
                <MenuItem value="Servicios">Servicios</MenuItem>
              </TextField>
              <TextField select fullWidth size="small" value={form.categoria} onChange={(e) => actualizar('categoria', e.target.value)} sx={estilosInput}>
                {categoriasServicio.map((categoria) => <MenuItem key={categoria} value={categoria}>{categoria}</MenuItem>)}
              </TextField>
            </Box>
          </Box>

          <Box sx={{ mb: 1.8 }}>
            <Etiqueta required>Fotos del servicio</Etiqueta>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 0.75 }}>
              {fotos.map((foto) => (
                <Box key={foto.id} sx={{ aspectRatio: '1 / 1', borderRadius: 1.4, border: '1px solid #dedff1', overflow: 'hidden', position: 'relative', minWidth: 0 }}>
                  <Foto key={foto.id} foto={foto} />
                  <IconButton aria-label={`Quitar ${foto.nombre}`} title="Quitar imagen" size="small" onClick={() => quitarFoto(foto.id)} sx={{ position: 'absolute', top: 2, right: 2, width: 22, height: 22, bgcolor: 'rgba(255,255,255,0.94)', '&:hover': { bgcolor: '#fff' } }}>
                    <CloseOutlined sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>
              ))}
              {fotos.length < 8 && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => archivoRef.current?.click()}
                  sx={{ aspectRatio: '1 / 1', minWidth: 0, px: 0.5, border: '1px dashed #8e70ff', borderRadius: 1.4, display: 'flex', flexDirection: 'column', gap: 0.4, fontSize: 10, textAlign: 'center', lineHeight: 1.1 }}
                >
                  <AddOutlined fontSize="small" /> Agregar fotos
                </Button>
              )}
            </Box>
            <input ref={archivoRef} type="file" accept="image/*" multiple hidden onChange={agregarFotos} />
            <Typography sx={{ mt: 0.6, fontSize: 10.5, color: 'text.secondary' }}>Puedes agregar hasta 8 fotos (máx. 5 MB cada una). Utiliza imágenes reales de tu servicio.</Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 1.8 }}>
            <Box>
              <Etiqueta required>Duración del servicio</Etiqueta>
              <TextField select fullWidth size="small" value={form.duracion} onChange={(e) => actualizar('duracion', e.target.value)} sx={estilosInput}>
                {['30 minutos', '60 minutos', '90 minutos', '120 minutos', '3 horas', 'Jornada completa'].map((opcion) => <MenuItem key={opcion} value={opcion}>{opcion}</MenuItem>)}
              </TextField>
            </Box>
            <Box>
              <Etiqueta required>Restricción de edad</Etiqueta>
              <TextField select fullWidth size="small" value={form.edadMinima} onChange={(e) => actualizar('edadMinima', e.target.value)} sx={estilosInput}>
                {['Sin restricción', '14 años', '16 años', '18 años'].map((opcion) => <MenuItem key={opcion} value={opcion}>{opcion}</MenuItem>)}
              </TextField>
            </Box>
          </Box>

          <Box sx={{ mb: 1.8 }}>
            <Etiqueta required>Modalidad de atención</Etiqueta>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
              {[
                { nombre: 'En local', icono: <StorefrontOutlined sx={{ fontSize: 17 }} /> },
                { nombre: 'A domicilio', icono: <HomeOutlined sx={{ fontSize: 17 }} /> },
                { nombre: 'Remoto', icono: <ComputerOutlined sx={{ fontSize: 17 }} /> },
              ].map((opcion) => (
                <Button
                  key={opcion.nombre}
                  type="button"
                  variant="outlined"
                  startIcon={opcion.icono}
                  onClick={() => actualizar('modalidad', opcion.nombre)}
                  sx={{ minWidth: 0, px: 0.7, py: 1, textTransform: 'none', fontSize: 11.5, whiteSpace: 'nowrap', borderColor: form.modalidad === opcion.nombre ? 'primary.main' : '#e0e5f1', color: form.modalidad === opcion.nombre ? 'primary.main' : 'text.primary', bgcolor: form.modalidad === opcion.nombre ? '#eeeaff' : '#fff', '&:hover': { bgcolor: '#f4f0ff' } }}
                >
                  {opcion.nombre}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 1.8 }}>
            <Etiqueta required>Región y comunas de cobertura</Etiqueta>
            <Box sx={{ border: '1px solid #dce1ee', borderRadius: 1.7, p: 1, minHeight: 74 }}>
              <TextField select fullWidth size="small" value={form.region} onChange={(e) => cambiarRegion(e.target.value)} sx={{ ...estilosInput, mb: 1, '& .MuiOutlinedInput-notchedOutline': { border: 0 } }}>
                {Object.keys(comunasPorRegion).map((region) => <MenuItem key={region} value={region}>{region}</MenuItem>)}
              </TextField>
              <Autocomplete
                multiple
                size="small"
                options={comunasPorRegion[form.region] ?? []}
                value={form.comunas}
                onChange={(_, valor) => actualizar('comunas', valor)}
                renderTags={(value, getTagProps) => value.map((opcion, index) => {
                  const { key, ...propiedades } = getTagProps({ index })
                  return <Chip key={key} label={opcion} size="small" sx={{ bgcolor: '#ebedfa', fontSize: 11, height: 23 }} {...propiedades} />
                })}
                renderInput={(params) => <TextField {...params} placeholder={form.comunas.length ? '' : 'Elegir comunas'} sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 0 }, '& .MuiInputBase-input': { fontSize: 12 } }} />}
              />
            </Box>
          </Box>

          <Box>
            <Etiqueta required>Descripción del servicio</Etiqueta>
            <TextField fullWidth multiline minRows={3} maxRows={6} value={form.descripcion} onChange={(e) => actualizar('descripcion', e.target.value)} slotProps={{ htmlInput: { maxLength: 500 } }} sx={{ '& .MuiInputBase-root': { fontSize: 12.5, lineHeight: 1.4 } }} />
            <Typography sx={{ textAlign: 'right', fontSize: 10.5, color: 'text.secondary', mt: 0.3 }}>{form.descripcion.length}/500</Typography>
          </Box>
        </Paper>

        {/* 2. Precio y disponibilidad */}
        <Paper sx={estiloTarjeta}>
          <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 2 }}>Precio y disponibilidad</Typography>
          <Box sx={{ mb: 1.7 }}>
            <Etiqueta required>Precio oficial (CLP)</Etiqueta>
            <TextField fullWidth size="small" type="number" value={form.precio} onChange={(e) => actualizar('precio', e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }, htmlInput: { min: 0, max: PRECIO_MAXIMO } }} sx={estilosInput} />
          </Box>
          <FormControlLabel
            label={<Typography sx={{ fontSize: 12 }}>Activar oferta temporal</Typography>}
            labelPlacement="start"
            control={<Switch checked={form.ofertaActiva} onChange={(e) => actualizar('ofertaActiva', e.target.checked)} size="small" />}
            sx={{ width: '100%', justifyContent: 'space-between', mx: 0, mb: 1.5 }}
          />
          {form.ofertaActiva && (
            <>
              <Box sx={{ mb: 1.7 }}>
                <Etiqueta required>Precio en oferta (CLP)</Etiqueta>
                <TextField fullWidth size="small" type="number" value={form.precioOferta} onChange={(e) => actualizar('precioOferta', e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> }, htmlInput: { min: 0, max: PRECIO_MAXIMO } }} sx={estilosInput} />
              </Box>
              <Box sx={{ mb: 1.7 }}>
                <Etiqueta required>Desde</Etiqueta>
                <TextField fullWidth size="small" type="date" value={form.fechaInicio} onChange={(e) => actualizar('fechaInicio', e.target.value)} sx={estilosInput} />
              </Box>
              <Box>
                <Etiqueta required>Hasta</Etiqueta>
                <TextField fullWidth size="small" type="date" value={form.fechaFin} onChange={(e) => actualizar('fechaFin', e.target.value)} slotProps={{ htmlInput: { min: form.fechaInicio || undefined } }} sx={estilosInput} />
              </Box>
            </>
          )}
          <Box sx={{ mt: 2.5, p: 1.4, borderRadius: 1.5, bgcolor: '#f7f6ff' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 11 }}>Precio mostrado en la vista previa</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: 18, color: 'primary.main' }}>{formatoCLP(precioVista)}</Typography>
          </Box>
        </Paper>

        {/* 3. Vista previa pública */}
        <Paper sx={estiloTarjeta}>
          <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 2 }}>Vista previa pública</Typography>
          <Box sx={{ height: { xs: 180, lg: 168 }, overflow: 'hidden', borderRadius: 1.5, mb: 1.5 }}>
            <Foto key={fotos[0]?.id ?? 'sin-foto'} foto={fotos[0]} />
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3, mb: 1.2 }}>{form.nombre || 'Nombre del servicio'}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
            <Typography sx={{ fontSize: 24, fontWeight: 800, color: 'primary.main' }}>{formatoCLP(precioVista)}</Typography>
            {hayDescuento && <Typography sx={{ fontSize: 11, color: 'text.secondary', textDecoration: 'line-through' }}>{formatoCLP(form.precio)}</Typography>}
            {hayDescuento && <Chip label="Oferta" size="small" sx={{ height: 21, bgcolor: '#ffdfed', color: '#c32568', fontSize: 10.5 }} />}
          </Box>
          {[
            { icono: <AccessTimeOutlined sx={{ fontSize: 17 }} />, texto: `Duración: ${form.duracion || 'Por definir'}` },
            { icono: <PersonOutlineOutlined sx={{ fontSize: 17 }} />, texto: `Restricción de edad: ${form.edadMinima || 'Por definir'}` },
            { icono: <StorefrontOutlined sx={{ fontSize: 17 }} />, texto: `Modalidad: ${form.modalidad || 'Por definir'}` },
            { icono: <LocationOnOutlined sx={{ fontSize: 17 }} />, texto: `Cobertura: ${form.region || 'Por definir'}${form.comunas.length ? ` · ${form.comunas.join(', ')}` : ''}` },
          ].map((detalle) => (
            <Box key={detalle.texto} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
              <Box sx={{ color: '#66718f', mt: 0.15 }}>{detalle.icono}</Box>
              <Typography sx={{ fontSize: 12.3, lineHeight: 1.5 }}>{detalle.texto}</Typography>
            </Box>
          ))}
          <Box sx={{ mt: 2.3, display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.25, borderRadius: 1.5, bgcolor: '#f0eaff', color: 'primary.main' }}>
            <InfoOutlined sx={{ fontSize: 18, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11.5, lineHeight: 1.5 }}>Así se verá tu servicio en Shopping. Podrás editar la información en cualquier momento.</Typography>
          </Box>
          {publicadoDemo && <Alert severity="success" sx={{ mt: 2, fontSize: 12 }}>Publicación simulada correctamente.</Alert>}
        </Paper>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap', mt: 2.5 }}>
        <Button type="button" variant="outlined" startIcon={<SaveOutlined />} onClick={guardarBorrador} sx={{ minWidth: 160 }}>Guardar borrador</Button>
        <Button type="submit" variant="contained" startIcon={<AddOutlined />} sx={{ minWidth: 160 }}>Publicar servicio</Button>
      </Box>
      <Snackbar open={Boolean(mensaje)} autoHideDuration={4500} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} onClose={() => setMensaje(null)}>
        <Alert severity={mensaje?.tipo ?? 'info'} variant="filled" onClose={() => setMensaje(null)}>{mensaje?.texto}</Alert>
      </Snackbar>
    </Box>
  )
}
