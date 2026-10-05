import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';

export default function ProductFormModal({ open, onClose, onSubmitSuccess, initialData = null }) {
  const isEditing = Boolean(initialData);
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [precio, setPrecio] = useState(initialData?.precio || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      id: initialData?.id || Date.now(),
      nombre,
      precio: Number(precio),
    };

    if (isEditing) {
      console.log('📌 [CRUD 2 - UPDATE]:', data);
    } else {
      console.log('🚀 [CRUD 2 - CREATE]:', data);
    }

    if (onSubmitSuccess) onSubmitSuccess(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle>{isEditing ? 'Editar producto' : 'Agregar producto'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Precio"
            type="number"
            fullWidth
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
