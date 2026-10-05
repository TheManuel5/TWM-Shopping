import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import InventoryIcon from '@mui/icons-material/Inventory'
import SearchIcon from '@mui/icons-material/Search'
import ProductFormModal from '../../components/crud2/ProductFormModal'
import PRODUCTOS_INICIALES from '../Crud2/data/productosData'

function formatPrecio(valor) {
  return `$${Number(valor).toLocaleString('es-CL')}`
}

function getColorCategoria(categoria) {
  const colores = {
    Electrónica: 'primary',
    Accesorios: 'secondary',
    Ropa: 'success',
    Calzado: 'warning',
  }

  return colores[categoria] || 'default'
}

export default function ProductsPage() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES)
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [formOpen, setFormOpen] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, mensaje: '' })

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) return productos

    return productos.filter((producto) =>
      [producto.nombre, producto.categoria, producto.descripcion]
        .join(' ')
        .toLowerCase()
        .includes(texto),
    )
  }, [busqueda, productos])

  const productosEnPagina = productosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  )

  const handleOpenCreate = () => {
    setProductoSeleccionado(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (producto) => {
    setProductoSeleccionado(producto)
    setFormOpen(true)
  }

  const handleSaveProduct = (productoData) => {
    if (productoSeleccionado) {
      setProductos((actuales) =>
        actuales.map((producto) =>
          producto.id === productoData.id ? productoData : producto,
        ),
      )
      setSnackbar({ open: true, mensaje: 'Producto actualizado correctamente.' })
    } else {
      setProductos((actuales) => [productoData, ...actuales])
      setPage(0)
      setSnackbar({ open: true, mensaje: 'Producto creado correctamente.' })
    }
    setProductoSeleccionado(null)
  }

  const handleDeleteProduct = () => {
    if (!productoAEliminar) return

    console.log('Producto eliminado:', productoAEliminar)
    setProductos((actuales) =>
      actuales.filter((producto) => producto.id !== productoAEliminar.id),
    )
    setSnackbar({
      open: true,
      mensaje: `“${productoAEliminar.nombre}” fue eliminado correctamente.`,
    })
    setProductoAEliminar(null)

    const totalTrasEliminar = productosFiltrados.length - 1
    const ultimaPagina = Math.max(
      0,
      Math.ceil(totalTrasEliminar / rowsPerPage) - 1,
    )
    if (page > ultimaPagina) setPage(ultimaPagina)
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <InventoryIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Gestión de productos
            </Typography>
            <Typography color="text.secondary">
              Administra el catálogo, stock y precios de la tienda.
            </Typography>
          </Box>
          <Chip
            label={`${productos.length} total`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(event) => {
              setBusqueda(event.target.value)
              setPage(0)
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
            sx={{ minWidth: { sm: 260 } }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ textTransform: 'none', px: 3, whiteSpace: 'nowrap' }}
          >
            Nuevo producto
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 820 }} aria-label="Listado de productos">
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
                <TableRow key={producto.id} hover>
                  <TableCell>{producto.id}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{producto.nombre}</Typography>
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
                        maxWidth: 220,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {producto.descripcion}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Editar producto">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEdit(producto)}
                        aria-label={`Editar ${producto.nombre}`}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar producto">
                      <IconButton
                        color="error"
                        onClick={() => setProductoAEliminar(producto)}
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
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value))
            setPage(0)
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </TableContainer>

      {formOpen && (
        <ProductFormModal
          open
          onClose={() => setFormOpen(false)}
          initialData={productoSeleccionado}
          onSubmitSuccess={handleSaveProduct}
        />
      )}

      <Dialog
        open={Boolean(productoAEliminar)}
        onClose={() => setProductoAEliminar(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar{' '}
            <strong>{productoAEliminar?.nombre}</strong>? Esta acción quitará
            el producto de la lista.
          </DialogContentText>
          {productoAEliminar && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Categoría:</strong> {productoAEliminar.categoria}
              </Typography>
              <Typography variant="body2">
                <strong>Precio:</strong> {formatPrecio(productoAEliminar.precio)}
              </Typography>
              <Typography variant="body2">
                <strong>Stock:</strong> {productoAEliminar.stock} unidades
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setProductoAEliminar(null)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteProduct}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
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
    </Container>
  )
}
