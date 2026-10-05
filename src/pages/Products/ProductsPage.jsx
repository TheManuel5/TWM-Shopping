import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ProductFormModal from '../../components/crud2/ProductFormModal';

const PRODUCTOS_INICIALES = [
  { id: 1, nombre: 'Notebook Gamer Pro', categoria: 'Electrónica', precio: 899990, stock: 10, descripcion: '16GB RAM, RTX 4060' },
  { id: 2, nombre: 'Audífonos Bluetooth ANC', categoria: 'Accesorios', precio: 59990, stock: 25, descripcion: 'Cancelación activa de ruido' },
  { id: 3, nombre: 'Polerón Hoodie Oversize', categoria: 'Ropa', precio: 29990, stock: 40, descripcion: '100% Algodón' }
];

export default function ProductsPage() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const handleOpenCreate = () => {
    setProductoSeleccionado(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setProductoSeleccionado(prod);
    setModalOpen(true);
  };

  const handleSaveProduct = (productoData) => {
    if (productoSeleccionado) {
      setProductos((prev) =>
        prev.map((item) => (item.id === productoData.id ? productoData : item))
      );
    } else {
      setProductos((prev) => [...prev, productoData]);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Gestión de Productos
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Módulo CRUD 2 - Catálogo de Tienda
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ textTransform: 'none', px: 3 }}
        >
          Nuevo Producto
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Categoría</strong></TableCell>
              <TableCell align="right"><strong>Precio ($)</strong></TableCell>
              <TableCell align="center"><strong>Stock</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.map((prod) => (
              <TableRow key={prod.id} hover>
                <TableCell>{prod.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{prod.nombre}</Typography>
                  <Typography variant="caption" color="text.secondary">{prod.descripcion}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={prod.categoria} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell align="right">${prod.precio.toLocaleString('es-CL')}</TableCell>
                <TableCell align="center">{prod.stock}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenEdit(prod)} title="Editar">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" title="Eliminar (A cargo de Manuel)">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={productoSeleccionado}
        onSubmitSuccess={handleSaveProduct}
      />
    </Container>
  );
}   