import { useState } from 'react'
import { AddPhotoAlternateOutlined, DeleteOutlineOutlined, PhotoOutlined, StarOutlineRounded } from '@mui/icons-material'
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { notify } from '../../utils/feedback'
const realImages = images => images.filter(src => src && !src.includes('/catalog/placeholder.svg'))
export default function ImagePicker({ images, onChange, max = 5 }) {
  const [busy, setBusy] = useState(false), [dragging, setDragging] = useState(false)
  const photos = realImages(images)
  const addFiles = async files => {
    if (busy) return
    setBusy(true)
    const result = [...photos]
    try {
      for (const file of Array.from(files)) {
        if (result.length >= max) { notify(`Puedes agregar hasta ${max} imágenes.`, 'warning'); break }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { notify('Usa imágenes JPG, PNG o WEBP de hasta 5 MB.', 'error'); continue }
        try {
          const bitmap = await createImageBitmap(file)
          const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale))
          canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
          result.push(canvas.toDataURL('image/webp', 0.8)); bitmap.close()
        } catch { notify(`No se pudo abrir ${file.name}. Prueba con otra imagen.`, 'error') }
      }
      onChange(result)
    } finally { setBusy(false); setDragging(false) }
  }
  return <Box onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); addFiles(event.dataTransfer.files) }} sx={{ border: '1px dashed', borderColor: dragging ? 'primary.main' : 'divider', bgcolor: dragging ? 'secondary.light' : 'background.paper', borderRadius: 3, p: 2 }}>
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}><Typography variant="subtitle2">Fotos de la publicación</Typography><Chip size="small" label={`${photos.length} / ${max}`} /></Stack>
    {!photos.length && <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2, color: 'text.secondary' }}><PhotoOutlined sx={{ fontSize: 36, color: 'primary.light' }} /><Typography variant="body2">Todavía no hay fotos. Agrega una imagen para que aparezca en el catálogo.</Typography></Stack>}
    <Stack direction="row" useFlexGap spacing={1.5} sx={{ flexWrap: 'wrap', mb: 1.5 }}>
      {photos.map((src, index) => <Box key={src.slice(0, 60) + index} sx={{ width: 112, height: 130, position: 'relative', border: '1px solid', borderColor: index ? 'divider' : 'primary.main', borderRadius: 2, overflow: 'hidden', bgcolor: 'secondary.light' }}>
        <Box component="img" src={src} alt={`Foto ${index + 1} de la publicación`} sx={{ width: '100%', height: 100, objectFit: 'contain' }} />
        {index === 0 ? <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'primary.main', fontWeight: 700 }}>Principal</Typography> : <Button size="small" fullWidth disabled={busy} onClick={() => onChange([photos[index], ...photos.filter((_, i) => i !== index)])} startIcon={<StarOutlineRounded />} sx={{ fontSize: 10 }}>Principal</Button>}
        <Tooltip title="Quitar foto"><IconButton size="small" disabled={busy} aria-label={`Eliminar imagen ${index + 1}`} onClick={() => onChange(photos.filter((_, i) => i !== index))} sx={{ position: 'absolute', right: 3, top: 3, bgcolor: 'background.paper' }}><DeleteOutlineOutlined fontSize="small" /></IconButton></Tooltip>
      </Box>)}
    </Stack>
    {photos.length < max && <Button component="label" disabled={busy} variant="outlined" startIcon={<AddPhotoAlternateOutlined />} sx={{ mb: 1 }}>{busy ? 'Preparando fotos…' : 'Seleccionar fotos'}<input aria-label="Seleccionar imágenes" type="file" hidden multiple disabled={busy} accept="image/jpeg,image/png,image/webp" onChange={event => { addFiles(event.target.files); event.target.value = '' }} /></Button>}
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>JPG, PNG o WEBP · Máximo 5 MB por foto. Puedes arrastrarlas aquí. Al guardar, tus fotos reemplazan la imagen referencial del catálogo.</Typography>
  </Box>
}
