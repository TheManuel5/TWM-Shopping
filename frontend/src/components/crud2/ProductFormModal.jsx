import { validateOffer } from '../../utils/validation'
import { dateKey } from '../../utils/dates'
import { useState } from 'react'
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, MenuItem, TextField } from '@mui/material'
import useCollection from '../../hooks/useCollection'
import { flattenCategories } from '../../utils/categories'
import useAuth from '../../contexts/AuthContext/useAuth'
import { logEvent } from '../../data/localStore'
import ImagePicker from './ImagePicker'

export default function ProductFormModal({ open, onClose, onSubmitSuccess, initialData = null }) {
  const { user } = useAuth()
  const [catalog] = useCollection('catalog', [])
  const [tree] = useCollection('categories', { Productos: [], Servicios: [] })
  const categoryNames = flattenCategories(tree).map(category => category.name)
  const [form, setForm] = useState({ tipo: 'Producto', nombre: '', categoria: '', precio: '', stock: '', descripcion: '', tamano: '', peso: '', color: '', material: '', duracion: '60 minutos', edad: 0, vendedor: user.nombre, estado: 'Publicado', relacionados: [], ...initialData })
  const [images, setImages] = useState(initialData?.imagenes?.length ? initialData.imagenes : initialData?.imagen ? [initialData.imagen] : [])
  const [hasOffer, setHasOffer] = useState(Boolean(initialData?.oferta))
  const [offer, setOffer] = useState(initialData?.oferta || { precio: '', inicio: dateKey(), fin: dateKey() })
  const [errors, setErrors] = useState({})
  const update = event => { const { name, value } = event.target; setForm(current => ({ ...current, [name]: value })); setErrors(current => ({ ...current, [name]: '' })) }
  const save = event => {
    event.preventDefault()
    const nextErrors = {}
    for (const field of ['nombre', 'categoria', 'descripcion', 'vendedor', ...(form.tipo === 'Producto' ? ['tamano', 'color', 'material'] : ['duracion'])]) if (!String(form[field]).trim()) nextErrors[field] = 'Campo obligatorio.'
    if (!Number.isFinite(Number(form.precio)) || Number(form.precio) <= 0) nextErrors.precio = 'Ingresa un precio mayor que cero.'
    if (form.tipo !== 'Servicio' && (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0 || form.stock === '')) nextErrors.stock = 'El stock debe ser un entero de cero o más.'
    if (form.tipo === 'Producto' && !(Number(form.peso) > 0)) nextErrors.peso = 'El peso debe ser mayor que cero.'
    if (form.tipo === 'Servicio' && (!Number.isInteger(Number(form.edad)) || Number(form.edad) < 0 || Number(form.edad) > 120)) nextErrors.edad = 'Ingresa una edad válida.'
    if (!images.length) nextErrors.imagen = 'Agrega al menos una imagen.'
    if (hasOffer) { const message = validateOffer(form.precio, offer.precio, offer.inicio, offer.fin); if (message) nextErrors.oferta = message }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const product = { ...form, id: initialData?.id || Date.now(), nombre: form.nombre.trim(), descripcion: form.descripcion.trim(), precio: Number(form.precio), peso: Number(form.peso), stock: Number(form.stock), edad: Number(form.edad), imagen: images[0], imagenes: images, oferta: hasOffer ? { ...offer, precio: Number(offer.precio) } : null, talla: form.tamano || 'Única' }
    if (product.variantes?.length) {
      if (product.stock !== product.variantes.reduce((sum, variant) => sum + variant.stock, 0)) { setErrors({ stock: 'Ajusta el stock por variante desde Inventario.' }); return }
    }
    if (initialData && Number(form.precio) !== initialData.precio && product.variantes?.length) product.variantes = product.variantes.map(variant => ({ ...variant, price: Number(form.precio) }))
    try { onSubmitSuccess(product); logEvent(initialData ? 'Actualizar publicación' : 'Crear publicación', product); onClose() } catch (error) { setErrors({ general: error.message }) }
  }
  const input = (name, label, options = {}) => <TextField name={name} label={label} fullWidth required value={form[name]} onChange={update} error={Boolean(errors[name])} helperText={errors[name]} {...options} />
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"><Box component="form" onSubmit={save} noValidate sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
    <DialogTitle>{initialData ? 'Editar publicación' : 'Agregar producto o servicio'}</DialogTitle>
    <DialogContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: '12px !important' }}>
      {errors.general && <Alert severity="error">{errors.general}</Alert>}
      {input('tipo', 'Tipo', { select: true, children: [<MenuItem key="p" value="Producto">Producto</MenuItem>, <MenuItem key="s" value="Servicio">Servicio</MenuItem>] })}
      {input('estado', 'Estado', { select: true, children: ['Publicado', 'Borrador'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>) })}
      {input('nombre', 'Nombre', { sx: { gridColumn: '1 / -1' } })}
      {input('categoria', 'Categoría', { select: true, children: [...new Set([form.categoria, ...categoryNames])].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>) })}
      {form.tipo === 'Producto' && <TextField select fullWidth label="Productos relacionados" value={form.relacionados || []} onChange={event => setForm(current => ({ ...current, relacionados: event.target.value }))} slotProps={{ select: { multiple: true, MenuProps: { slotProps: { paper: { sx: { maxHeight: 280 } } } } } }} helperText="Asocia otras publicaciones de tu tienda para mostrarlas en el detalle.">{catalog.filter(item => item.tipo !== 'Servicio' && item.id !== initialData?.id && item.ownerRut === user.rut).map(item => <MenuItem key={item.id} value={item.id}>{item.nombre}</MenuItem>)}</TextField>}
      {input('vendedor', 'Vendedor')}
      {input('precio', 'Precio (CLP)', { type: 'number' })}
      {form.tipo !== 'Servicio' && input('stock', 'Stock', { type: 'number' })}
      {form.tipo === 'Producto' ? <>{input('tamano', 'Tamaño')}{input('peso', 'Peso (g)', { type: 'number' })}{input('color', 'Color')}{input('material', 'Material principal')}</> : <>{input('duracion', 'Duración')}{input('edad', 'Edad mínima', { type: 'number' })}</>}
      <Box sx={{ gridColumn: '1 / -1' }}><FormControlLabel label="Oferta temporal" control={<Switch checked={hasOffer} onChange={event => setHasOffer(event.target.checked)} />} />{hasOffer && <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, my: 2 }}><TextField type="number" label="Precio oferta" value={offer.precio} onChange={event => setOffer(current => ({ ...current, precio: event.target.value }))} /><TextField type="date" label="Inicio oferta" value={offer.inicio} onChange={event => setOffer(current => ({ ...current, inicio: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} /><TextField type="date" label="Fin oferta" value={offer.fin} onChange={event => setOffer(current => ({ ...current, fin: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} /></Box>}{errors.oferta && <Alert severity="error">{errors.oferta}</Alert>}</Box>
      {input('descripcion', 'Descripción', { multiline: true, minRows: 2, sx: { gridColumn: '1 / -1' } })}
      <Box sx={{ gridColumn: '1 / -1' }}><ImagePicker images={images} onChange={setImages} />{errors.imagen && <Alert severity="error">{errors.imagen}</Alert>}</Box>
    </DialogContent><DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={onClose}>Cancelar</Button><Button type="submit" variant="contained">{initialData ? 'Guardar cambios' : 'Crear publicación'}</Button></DialogActions>
  </Box></Dialog>
}
