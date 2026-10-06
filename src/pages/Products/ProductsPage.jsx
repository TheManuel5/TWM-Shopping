import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import InventoryIcon from '@mui/icons-material/Inventory'
import ProductFormModal from '../../components/crud2/ProductFormModal'
import PRODUCTOS_INICIALES from '../Crud2/data/productosData'
import '../../components/orders/Orders.css'

function formatPrecio(valor) {
  return `$${Number(valor).toLocaleString('es-CL')}`
}

const categoriaColors = {
  Electrónica: { background: '#dceeff', color: '#1463a6' },
  Accesorios: { background: '#eadbff', color: '#7138b6' },
  Ropa: { background: '#d8f5df', color: '#13783c' },
  Calzado: { background: '#fff0c5', color: '#956b00' },
}

export default function ProductsPage() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [filtrosAplicados, setFiltrosAplicados] = useState({ busqueda: '', categoria: 'Todas' })
  const [page, setPage] = useState(1)
  const rowsPerPage = 5
  const [formOpen, setFormOpen] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, mensaje: '' })

  const productosFiltrados = useMemo(() => {
    const texto = filtrosAplicados.busqueda.trim().toLowerCase()

    return productos.filter((producto) => {
      const matchBusqueda =
        !texto ||
        [producto.nombre, producto.categoria, producto.descripcion]
          .join(' ')
          .toLowerCase()
          .includes(texto)
      const matchCategoria =
        filtrosAplicados.categoria === 'Todas' || producto.categoria === filtrosAplicados.categoria
      return matchBusqueda && matchCategoria
    })
  }, [filtrosAplicados, productos])

  const pageCount = Math.max(1, Math.ceil(productosFiltrados.length / rowsPerPage))
  const productosEnPagina = productosFiltrados.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  )

  const categorias = [...new Set(productos.map((p) => p.categoria))]

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
      setPage(1)
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
      mensaje: `"${productoAEliminar.nombre}" fue eliminado correctamente.`,
    })
    setProductoAEliminar(null)

    const totalTrasEliminar = productosFiltrados.length - 1
    const ultimaPagina = Math.max(
      1,
      Math.ceil(totalTrasEliminar / rowsPerPage),
    )
    if (page > ultimaPagina) setPage(ultimaPagina)
  }

  const aplicarFiltros = () => {
    setFiltrosAplicados({ busqueda, categoria: filtroCategoria })
    setPage(1)
    setSnackbar({ open: true, mensaje: 'Filtros aplicados' })
  }

  return (
    <Box className="orders-page">
      <Box className="orders-main">
        {/* Breadcrumb */}
        <Box className="orders-breadcrumb">Panel de control <span>/</span> Mis productos</Box>

        {/* Encabezado */}
        <Box className="orders-heading">
          <Box className="orders-title-group">
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Nuevo producto
          </Button>
        </Box>

        {/* Filtros — mismo estilo que pedidos */}
        <Box
          className="orders-filters products-filters"
          sx={{
            gridTemplateColumns: {
              xs: '1fr !important',
              sm: 'minmax(220px, 1.5fr) minmax(180px, 1fr) !important',
              lg: 'minmax(240px, 1.5fr) minmax(180px, 1fr) max-content !important',
            },
            '& .orders-search': { gridColumn: { xs: 'auto', sm: '1 / -1', lg: 'auto' } },
            '& > button': { gridColumn: { xs: 'auto', sm: '1 / -1', lg: 'auto' } },
          }}
        >
          <TextField
            className="orders-search"
            size="small"
            placeholder="Buscar por nombre, categoría o descripción..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            inputProps={{ 'aria-label': 'Buscar productos' }}
            slotProps={{
              input: {
                endAdornment: busqueda ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Borrar búsqueda"
                      title="Borrar búsqueda"
                      onClick={() => setBusqueda('')}
                      sx={{ color: '#667089' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <TextField
            select
            size="small"
            label="Categoría"
            value={filtroCategoria}
            onChange={(event) => setFiltroCategoria(event.target.value)}
          >
            <MenuItem value="Todas">Todas</MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            startIcon={<FilterAltOutlinedIcon />}
            onClick={aplicarFiltros}
          >
            Aplicar filtros
          </Button>
        </Box>

        {/* Tabla — mismo formato que la de pedidos */}
        <TableContainer component={Paper} className="orders-table-paper" elevation={0}>
          <Table aria-label="Listado de productos" size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Acciones</TableCell>
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
                  <TableRow key={producto.id} hover className="order-row">
                    <TableCell component="th" scope="row" className="order-number">
                      #{producto.id}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600} fontSize={14}>
                        {producto.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={producto.categoria}
                        size="small"
                        sx={{
                          backgroundColor: (categoriaColors[producto.categoria] || { background: '#f1f3f8' }).background,
                          color: (categoriaColors[producto.categoria] || { color: '#263452' }).color,
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell className="order-total">
                      {formatPrecio(producto.precio)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={producto.stock}
                        size="small"
                        sx={{
                          backgroundColor: producto.stock < 15 ? '#ffdbe4' : '#d8f5df',
                          color: producto.stock < 15 ? '#b32351' : '#13783c',
                          fontWeight: 700,
                        }}
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
                          fontSize: 14,
                        }}
                      >
                        {producto.descripcion}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" className="order-actions">
                      <Tooltip title="Editar producto">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(producto)}
                          aria-label={`Editar ${producto.nombre}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar producto">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setProductoAEliminar(producto)}
                          aria-label={`Eliminar ${producto.nombre}`}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación — mismo estilo que pedidos */}
        <Box className="orders-pagination">
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            size="medium"
            aria-label="Paginación de productos"
          />
        </Box>
        <Typography className="orders-count">
          Mostrando {productosEnPagina.length} de {productosFiltrados.length} productos
        </Typography>
      </Box>

      {/* Modal crear/editar */}
      {formOpen && (
        <ProductFormModal
          open
          onClose={() => setFormOpen(false)}
          initialData={productoSeleccionado}
          onSubmitSuccess={handleSaveProduct}
        />
      )}

      {/* Dialog confirmar eliminación */}
      <Dialog
        open={Boolean(productoAEliminar)}
        onClose={() => setProductoAEliminar(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: '#000000', fontWeight: 700, textTransform: 'none' }}>
          ¿Eliminar producto #{productoAEliminar?.id}?
        </DialogTitle>
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
          <Button
            onClick={() => setProductoAEliminar(null)}
            variant="contained"
            sx={{
              textTransform: 'none',
              color: '#4b5563',
              backgroundColor: '#e5e7eb',
              '&:hover': { backgroundColor: '#d1d5db' },
              boxShadow: 'none',
              fontWeight: 700,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteProduct}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ textTransform: 'none' }}
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
    </Box>
  )
}
