import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Pagination,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import OrderFilters from '../../components/orders/OrderFilters';
import OrdersTable from '../../components/orders/OrdersTable';
import '../../components/orders/Orders.css';

const initialOrders = [
  { id: '1032', date: '28-04-2024\n16:24', customer: 'Ana Torres', email: 'ana.torres@gmail.com', phone: '+56 9 9876 5432', store: 'Tienda Sur', address: 'Av. Pedro Montt 1234\nOsorno, Los Lagos\nChile', status: 'En preparación', total: '$51.170', products: [{ name: 'Zapatillas Deportivas Mujer Running', emoji: '👟', price: '$29.990', detail: 'Rosa / 38' }, { name: 'Mochila Urbana Unisex', emoji: '🎒', price: '$13.010', detail: 'Negro' }] },
  { id: '1031', date: '27-04-2024\n11:12', customer: 'Carlos Matus', email: 'carlos.matus@gmail.com', phone: '+56 9 8765 4321', store: 'TechStore', address: 'Pasaje Las Rosas 456\nPuerto Montt\nChile', status: 'Entregado', total: '$299.990', products: [{ name: 'Monitor portátil', emoji: '🖥️', price: '$299.990', detail: 'Full HD' }] },
  { id: '1030', date: '26-04-2024\n09:45', customer: 'Valentina Rojas', email: 'valentina.rojas@gmail.com', phone: '+56 9 7654 3210', store: 'HogarPlus', address: 'Los Alerces 789\nValdivia\nChile', status: 'Enviado', total: '$89.990', products: [{ name: 'Cafetera', emoji: '☕', price: '$59.990', detail: 'Negra' }, { name: 'Sartén', emoji: '🍳', price: '$30.000', detail: 'Antiadherente' }] },
  { id: '1029', date: '25-04-2024\n14:30', customer: 'Javier Morales', email: 'javier.morales@gmail.com', phone: '+56 9 6543 2109', store: 'Tienda Sur', address: 'Arturo Prat 102\nOsorno\nChile', status: 'Recibido', total: '$39.990', products: [{ name: 'Organizador', emoji: '📦', price: '$39.990', detail: 'Blanco' }] },
  { id: '1028', date: '24-04-2024\n10:18', customer: 'Fernanda Soto', email: 'fernanda.soto@gmail.com', phone: '+56 9 5432 1098', store: 'Moda Chile', address: 'Baquedano 333\nCastro\nChile', status: 'Cancelado', total: '$72.990', products: [{ name: 'Chaqueta', emoji: '🧥', price: '$72.990', detail: 'Talla M' }] },
];

const emptyForm = { customer: '', email: '', store: 'Tienda Sur', status: 'En preparación', total: '', address: '' };

function DetailField({ icon, label, children }) {
  return (
    <Box className="detail-field">
      <Box className="detail-icon">{icon}</Box>
      <Box><Typography className="detail-label">{label}</Typography>{children}</Box>
    </Box>
  );
}

function generateReceiptPdf(order) {
  if (!order) return;

  const pdf = new jsPDF();
  const margin = 20;
  let y = 24;

  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(`Comprobante de pedido #${order.id}`, margin, y);
  y += 12;
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Fecha: ${order.date.replace('\n', ', ')}`, margin, y);
  y += 7;
  pdf.text(`Cliente: ${order.customer}`, margin, y);
  y += 7;
  pdf.text(`Correo: ${order.email}`, margin, y);
  y += 12;
  pdf.line(margin, y, 190, y);
  y += 9;

  pdf.setFont(undefined, 'bold');
  pdf.text('Productos', margin, y);
  y += 8;
  pdf.setFont(undefined, 'normal');
  order.products.forEach((product) => {
    const productName = pdf.splitTextToSize(product.name, 130);
    pdf.text(productName, margin, y);
    pdf.text(product.price, 190, y, { align: 'right' });
    y += Math.max(7, productName.length * 5);
  });

  y += 3;
  pdf.line(margin, y, 190, y);
  y += 10;
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(13);
  pdf.text('Total', margin, y);
  pdf.text(order.total, 190, y, { align: 'right' });
  pdf.save(`comprobante-pedido-${order.id}.pdf`);
}

export default function Orders() {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({ search: '', store: 'Todas', status: 'Todos', from: '2024-04-01', to: '2024-04-30' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [dispatchData, setDispatchData] = useState({ carrier: 'Chilexpress', tracking: '9087654321' });
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const ordersPerPage = 5;

  const visibleOrders = useMemo(() => orders.filter((order) => {
    const query = appliedFilters.search.toLowerCase();
    const matchesSearch = !query || [order.id, order.customer, order.store, ...order.products.map((product) => product.name)].join(' ').toLowerCase().includes(query);
    const matchesStore = appliedFilters.store === 'Todas' || order.store === appliedFilters.store;
    const matchesStatus = appliedFilters.status === 'Todos' || order.status === appliedFilters.status;
    return matchesSearch && matchesStore && matchesStatus;
  }), [orders, appliedFilters]);

  const paginatedOrders = visibleOrders.slice((page - 1) * ordersPerPage, page * ordersPerPage);
  const pageCount = Math.max(1, Math.ceil(visibleOrders.length / ordersPerPage));
  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const openCreate = () => { setEditingOrder(null); setFormData(emptyForm); setFormErrors({}); setFormOpen(true); };
  const openEdit = (order) => {
    setSelectedOrder(null);
    setEditingOrder(order);
    setFormData({ customer: order.customer, email: order.email, store: order.store, status: order.status, total: order.total.replace(/\D/g, ''), address: order.address.replaceAll('\n', ', ') });
    setFormErrors({});
    setFormOpen(true);
  };
  const updateForm = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'total' ? value.replace(/\D/g, '') : value;
    setFormData((current) => ({ ...current, [name]: nextValue }));
    setFormErrors((current) => ({ ...current, [name]: '' }));
  };

  const submitOrder = (event) => {
    event.preventDefault();
    const errors = {};
    if (!formData.customer.trim()) errors.customer = 'Ingresa el nombre del cliente';
    if (!formData.email.trim()) errors.email = 'Ingresa el correo electrónico';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Ingresa un correo válido';
    if (!formData.total.trim()) errors.total = 'Ingresa el total del pedido';
    if (!formData.address.trim()) errors.address = 'Ingresa la dirección de envío';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const orderData = { ...formData, capturedAt: new Date().toISOString() };
    console.log(editingOrder ? 'Actualizar pedido:' : 'Crear pedido:', orderData);
    if (editingOrder) {
      const updatedOrder = { ...editingOrder, ...formData, address: formData.address.replaceAll(', ', '\n') };
      setOrders((current) => current.map((order) => (order.id === editingOrder.id ? updatedOrder : order)));
      setSelectedOrder(updatedOrder);
      setNotice(`Pedido #${editingOrder.id} actualizado`);
    } else {
      const newOrder = { ...formData, id: String(Number(orders[0]?.id || 1031) + 1), date: '04-05-2024\n12:00', email: formData.email || 'cliente@correo.com', phone: '+56 9 0000 0000', address: formData.address.replaceAll(', ', '\n'), products: [{ name: 'Producto nuevo', emoji: '📦', price: formData.total, detail: 'Sin detalle' }] };
      setOrders((current) => [newOrder, ...current]);
      setPage(1);
      setSelectedOrder(newOrder);
      setNotice(`Pedido #${newOrder.id} creado`);
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deletingOrder) return;
    console.log('Eliminar pedido:', deletingOrder);
    setOrders((current) => current.filter((order) => order.id !== deletingOrder.id));
    setDeleteOpen(false);
    setDeletingOrder(null);
    setNotice(`Pedido #${deletingOrder.id} eliminado`);
  };

  return (
    <Box className={`orders-page${selectedOrder ? ' orders-page--with-detail' : ''}`}>
      <Box className="orders-main">
        <Box className="orders-breadcrumb">Panel de control <span>/</span> Ventas y pedidos</Box>
        <Box className="orders-heading">
          <Box className="orders-title-group">
            <ShoppingBagOutlinedIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>Gestión de pedidos</Typography>
              <Typography color="text.secondary">Administra y haz seguimiento a todos los pedidos de la plataforma.</Typography>
            </Box>
            <Chip label={`${orders.length} total`} size="small" color="primary" variant="outlined" />
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nuevo pedido</Button>
        </Box>
        <OrderFilters filters={filters} onChange={updateFilter} onApply={() => { setAppliedFilters(filters); setPage(1); setNotice('Filtros aplicados'); }} />
        <OrdersTable orders={paginatedOrders} selectedId={selectedOrder?.id} onSelect={setSelectedOrder} onEdit={openEdit} onDelete={(order) => { setSelectedOrder(null); setDeletingOrder(order); setDeleteOpen(true); }} />
        <Box className="orders-pagination">
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            size="medium"
            aria-label="Paginación de pedidos"
          />
        </Box>
        <Typography className="orders-count">Mostrando {visibleOrders.length} de {orders.length} pedidos</Typography>
      </Box>

      {selectedOrder && <Box className="order-detail-panel">
        <>
          <Box className="detail-header"><Box><Typography component="h2">Pedido #{selectedOrder.id}</Typography><Typography className="detail-date">28 abr 2024, 16:24</Typography></Box><IconButton aria-label="Cerrar detalle" onClick={() => setSelectedOrder(null)}><CloseIcon /></IconButton></Box>
          <Chip label={selectedOrder.status} size="small" className="detail-status" />
          <Typography className="detail-section-title">Información del cliente</Typography>
          <Box className="detail-grid"><DetailField icon={<PersonOutlineOutlinedIcon />} label="Cliente"><strong>{selectedOrder.customer}</strong><span>{selectedOrder.email}</span><span>{selectedOrder.phone}</span></DetailField><DetailField icon={<PlaceOutlinedIcon />} label="Dirección de envío"><strong>{selectedOrder.address.split('\n')[0]}</strong>{selectedOrder.address.split('\n').slice(1).map((line) => <span key={line}>{line}</span>)}</DetailField></Box>
          <Divider />
          <DetailField icon={<Inventory2OutlinedIcon />} label="Tienda vendedora"><strong>{selectedOrder.store}</strong></DetailField>
          <Divider />
          <Typography className="detail-section-title">Productos ({selectedOrder.products.length})</Typography>
          <Stack spacing={1}>{selectedOrder.products.map((product) => <Box className="detail-product" key={product.name}><span className="detail-product-emoji">{product.emoji}</span><Box><strong>{product.name}</strong><span>{product.detail}</span></Box><strong>{product.price}</strong></Box>)}</Stack>
          <Box className="detail-totals"><span>Subtotal (neto)<strong>{selectedOrder.total}</strong></span><span>IVA (19%)<strong>$8.170</strong></span><strong>Total<strong>{selectedOrder.total}</strong></strong></Box>
          <Box className="detail-grid payment-grid"><DetailField icon={<ReceiptLongOutlinedIcon />} label="Método de pago"><span>Visa terminada en 4242</span></DetailField><DetailField icon={<LocalShippingOutlinedIcon />} label="Envío"><span>Chilexpress</span></DetailField></Box>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); console.log('Actualizar estado del pedido:', { id: selectedOrder.id, status: selectedOrder.status }); setNotice('Estado actualizado'); }} className="status-form"><Typography className="detail-section-title">Estado del pedido</Typography><TextField size="small" select fullWidth value={selectedOrder.status} onChange={(event) => setSelectedOrder({ ...selectedOrder, status: event.target.value })}>{['En preparación', 'Entregado', 'Enviado', 'Recibido', 'Cancelado'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField><Button type="submit" variant="contained">Actualizar estado</Button></Box>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); console.log('Guardar información de despacho:', { orderId: selectedOrder.id, ...dispatchData }); setNotice('Información de despacho guardada'); }} className="dispatch-form"><Typography className="detail-section-title"><LocalShippingOutlinedIcon /> Información de despacho</Typography><TextField size="small" label="Empresa de despacho" value={dispatchData.carrier} onChange={(event) => setDispatchData({ ...dispatchData, carrier: event.target.value })} /><TextField size="small" label="Número de seguimiento" value={dispatchData.tracking} onChange={(event) => setDispatchData({ ...dispatchData, tracking: event.target.value })} /><Button type="submit" variant="contained">Guardar despacho</Button></Box>
          <Box className="transaction-history"><Typography className="detail-section-title"><HistoryOutlinedIcon /> Historial de transacciones</Typography><Box className="history-item"><span>28-04-2024 16:24</span><span>Pedido creado</span></Box><Box className="history-item"><span>28-04-2024 16:27</span><span>Pago confirmado</span></Box><Box className="history-item"><span>29-04-2024 10:12</span><span>Estado cambiado a En preparación</span></Box></Box>
          <Box className="detail-actions"><Button variant="outlined" startIcon={<ReceiptLongOutlinedIcon />} onClick={() => setReceiptOpen(true)}>Ver comprobante</Button><Button variant="outlined" color="error" onClick={() => { setDeletingOrder(selectedOrder); setSelectedOrder(null); setDeleteOpen(true); }}>Eliminar pedido</Button></Box>
        </>
      </Box>}

      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle className="receipt-title">Comprobante del pedido #{selectedOrder?.id}</DialogTitle>
        <DialogContent>
          <Box className="receipt-content">
            <Typography className="receipt-muted">Fecha: {selectedOrder?.date.replace('\n', ', ')}</Typography>
            <Typography className="receipt-customer">{selectedOrder?.customer}</Typography>
            <Typography className="receipt-muted">{selectedOrder?.email}</Typography>
            <Divider />
            <Typography className="receipt-section-title">Productos</Typography>
            {selectedOrder?.products.map((product) => (
              <Box className="receipt-line" key={product.name}>
                <span>{product.name}</span>
                <strong>{product.price}</strong>
              </Box>
            ))}
            <Divider />
            <Box className="receipt-total"><span>Total</span><strong>{selectedOrder?.total}</strong></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReceiptOpen(false)} sx={{ textTransform: 'none', color: '#4b5563' }}>Cerrar</Button>
          <Button variant="contained" onClick={() => generateReceiptPdf(selectedOrder)} sx={{ textTransform: 'none', backgroundColor: '#6430df', boxShadow: 'none' }}>
            Generar PDF
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={submitOrder}>
          <DialogTitle sx={{ color: '#000000', fontWeight: 700, textTransform: 'none' }}>
            {editingOrder ? `Editar pedido #${editingOrder.id}` : 'Crear nuevo pedido'}
          </DialogTitle>
          <DialogContent>
            <Box className="order-form-grid">
              <TextField required name="customer" label="Cliente" value={formData.customer} onChange={updateForm} error={Boolean(formErrors.customer)} helperText={formErrors.customer} InputLabelProps={{ shrink: true }} />
              <TextField required name="email" label="Correo electrónico" type="email" value={formData.email} onChange={updateForm} error={Boolean(formErrors.email)} helperText={formErrors.email} InputLabelProps={{ shrink: true }} />
              <TextField select name="store" label="Tienda vendedora" value={formData.store} onChange={updateForm} InputLabelProps={{ shrink: true }}>
                <MenuItem value="Tienda Sur">Tienda Sur</MenuItem>
                <MenuItem value="TechStore">TechStore</MenuItem>
                <MenuItem value="HogarPlus">HogarPlus</MenuItem>
                <MenuItem value="Moda Chile">Moda Chile</MenuItem>
              </TextField>
              <TextField required name="total" label="Total" type="number" value={formData.total} onChange={updateForm} placeholder="0" inputProps={{ min: 0, inputMode: 'numeric' }} error={Boolean(formErrors.total)} helperText={formErrors.total} InputLabelProps={{ shrink: true }} />
              <TextField select name="status" label="Estado" value={formData.status} onChange={updateForm} InputLabelProps={{ shrink: true }}>
                {['En preparación', 'Entregado', 'Enviado', 'Recibido', 'Cancelado'].map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
              <TextField required name="address" label="Dirección de envío" value={formData.address} onChange={updateForm} multiline minRows={2} error={Boolean(formErrors.address)} helperText={formErrors.address} InputLabelProps={{ shrink: true }} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setFormOpen(false)} variant="contained" sx={{ textTransform: 'none', color: '#4b5563', backgroundColor: '#e5e7eb', '&:hover': { backgroundColor: '#d1d5db' }, boxShadow: 'none', fontWeight: 700 }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                textTransform: 'none',
                backgroundColor: '#6430df',
                '&:hover': {
                  backgroundColor: '#5324c4',
                },
                fontWeight: 700,
                boxShadow: 'none',
              }}
            >
              {editingOrder ? 'Guardar cambios' : 'Crear pedido'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#000000', fontWeight: 700, textTransform: 'none' }}>
          ¿Eliminar pedido #{deletingOrder?.id}?
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Esta acción quitará el pedido de la lista. Puedes cancelar para conservarlo.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
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
          <Button color="error" variant="contained" onClick={confirmDelete} sx={{ textTransform: 'none' }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notice)} autoHideDuration={2800} onClose={() => setNotice('')}><Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert></Snackbar>
    </Box>
  );
}
