import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'

const CATEGORIAS = ['Electrónica', 'Accesorios', 'Ropa', 'Calzado', 'Otros']

export default function ProductFormModal({
  open,
  onClose,
  onSubmitSuccess,
  initialData = null,
}) {
  const isEditing = Boolean(initialData)
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    categoria: initialData?.categoria || 'Electrónica',
    precio: initialData?.precio || '',
    stock: initialData?.stock || '',
    descripcion: initialData?.descripcion || '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((actual) => ({ ...actual, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const data = {
      id: initialData?.id || Date.now(),
      nombre: formData.nombre.trim(),
      categoria: formData.categoria,
      precio: Number(formData.precio),
      stock: Number(formData.stock),
      descripcion: formData.descripcion.trim(),
    }

    console.log(
      isEditing ? '📌 [CRUD 2 - UPDATE]:' : '🚀 [CRUD 2 - CREATE]:',
      data,
    )
    onSubmitSuccess(data)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEditing ? 'Editar producto' : 'Agregar producto'}</DialogTitle>
        <DialogContent
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            pt: '12px !important',
          }}
        >
          <TextField
            autoFocus
            required
            name="nombre"
            label="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            sx={{ gridColumn: '1 / -1' }}
          />
          <TextField
            select
            required
            name="categoria"
            label="Categoría"
            value={formData.categoria}
            onChange={handleChange}
          >
            {CATEGORIAS.map((categoria) => (
              <MenuItem key={categoria} value={categoria}>
                {categoria}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            required
            name="precio"
            label="Precio"
            type="number"
            value={formData.precio}
            onChange={handleChange}
            slotProps={{ htmlInput: { min: 0 } }}
          />
          <TextField
            required
            name="stock"
            label="Stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            slotProps={{ htmlInput: { min: 0 } }}
          />
          <TextField
            required
            name="descripcion"
            label="Descripción"
            value={formData.descripcion}
            onChange={handleChange}
            multiline
            minRows={2}
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
