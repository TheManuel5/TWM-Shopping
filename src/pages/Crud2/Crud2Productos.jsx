import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TablePagination,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import PRODUCTOS_INICIALES from './data/productosData';

/**
 * Formatea un número como precio en pesos chilenos.
 * Ejemplo: 899990 → "$899.990"
 */
function formatPrecio(valor) {
  return `$${valor.toLocaleString('es-CL')}`;
}

/**
 * Devuelve el color del Chip según la categoría del producto.
 */
function getColorCategoria(categoria) {
  const colores = {
    Electrónica: 'primary',
    Accesorios: 'secondary',
    Ropa: 'success',
    Calzado: 'warning',
  };
  return colores[categoria] || 'default';
}

/**
 * Crud2Productos — Componente principal del CRUD 2 (Lectura y Borrado).
 *
 * Responsabilidad de Manuel:
 * - Tabla de productos con búsqueda y paginación
 * - Modal de confirmación de borrado
 *
 * Los formularios de Crear y Editar serán implementados por Seba.
 */
function Crud2Productos() {
  // ─── Estado ───────────────────────────────────────────────
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({ open: false, mensaje: '' });

  // ─── Filtrado por búsqueda ────────────────────────────────
  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.toLowerCase();
    return (
      producto.nombre.toLowerCase().includes(texto) ||
      producto.categoria.toLowerCase().includes(texto) ||
      producto.descripcion.toLowerCase().includes(texto)
    );
  });

  // ─── Handlers ─────────────────────────────────────────────
  const handleAbrirModal = (producto) => {
    setProductoAEliminar(producto);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setProductoAEliminar(null);
    setModalAbierto(false);
  };

  const handleEliminar = () => {
    if (!productoAEliminar) return;

    console.log('Producto eliminado:', productoAEliminar);

    setProductos((prev) =>
      prev.filter((p) => p.id !== productoAEliminar.id)
    );

    setSnackbar({
      open: true,
      mensaje: `"${productoAEliminar.nombre}" fue eliminado correctamente.`,
    });

    handleCerrarModal();

    // Ajustar página si quedó vacía
    const totalTrasEliminar = productosFiltrados.length - 1;
    const maxPage = Math.max(0, Math.ceil(totalTrasEliminar / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ─── Productos visibles en la página actual ───────────────
  const productosEnPagina = productosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ─── Render ───────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* ── Header ──────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon color="primary" fontSize="large" />
          <Typography variant="h4" fontWeight={700}>
            Productos
          </Typography>
          <Chip
            label={`${productos.length} total`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Barra de búsqueda */}
        <TextField
          size="small"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 260 }}
        />
      </Box>

      {/* ── Tabla ───────────────────────────────────────── */}
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{ borderRadius: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: 'primary.main',
                '& th': { color: 'primary.contrastText', fontWeight: 700 },
              }}
            >
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {productosEnPagina.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {busqueda
                      ? 'No se encontraron productos con esa búsqueda.'
                      : 'No hay productos disponibles.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              productosEnPagina.map((producto) => (
                <TableRow
                  key={producto.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell>{producto.id}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {producto.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={producto.categoria}
                      color={getColorCategoria(producto.categoria)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={500}>
                      {formatPrecio(producto.precio)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={producto.stock}
                      size="small"
                      color={producto.stock < 15 ? 'error' : 'success'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {producto.descripcion}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Eliminar producto" arrow>
                      <IconButton
                        color="error"
                        onClick={() => handleAbrirModal(producto)}
                        aria-label={`Eliminar ${producto.nombre}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={productosFiltrados.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
        />
      </TableContainer>

      {/* ── Modal de confirmación de borrado ─────────── */}
      <Dialog
        open={modalAbierto}
        onClose={handleCerrarModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar{' '}
            <strong>{productoAEliminar?.nombre}</strong>? Esta acción no se
            puede deshacer.
          </DialogContentText>

          {productoAEliminar && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="body2">
                <strong>ID:</strong> {productoAEliminar.id}
              </Typography>
              <Typography variant="body2">
                <strong>Categoría:</strong> {productoAEliminar.categoria}
              </Typography>
              <Typography variant="body2">
                <strong>Precio:</strong>{' '}
                {formatPrecio(productoAEliminar.precio)}
              </Typography>
              <Typography variant="body2">
                <strong>Stock:</strong> {productoAEliminar.stock} unidades
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCerrarModal} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleEliminar}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar de confirmación ─────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, mensaje: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ open: false, mensaje: '' })}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Crud2Productos;
