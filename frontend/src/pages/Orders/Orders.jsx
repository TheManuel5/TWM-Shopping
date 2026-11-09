import { API_MODE } from '../../services/api'
import useAuth from '../../contexts/AuthContext/useAuth'
import { formatCLP } from '../../utils/taxonomyData'
import { logEvent } from '../../data/localStore'
import { money } from '../../data/commerce'
import { exportReceipt } from '../../utils/pdfExport'
import useCollection from '../../hooks/useCollection'
import { useMemo, useState } from 'react';
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
import AddIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
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

export default function Orders() {
  const { user } = useAuth()
  const admin = !API_MODE && user?.canAdmin && user.role === 'Admin';
  const [orders, setOrders] = useCollection('orders', initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({ search: '', store: 'Todas', status: 'Todos', from: '', to: '' });
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
    const [day, month, year] = order.date.split('\n')[0].split('-');
    const date = `${year}-${month}-${day}`;
    return matchesSearch && matchesStore && matchesStatus && (!appliedFilters.from || date >= appliedFilters.from) && (!appliedFilters.to || date <= appliedFilters.to);
  }), [orders, appliedFilters]);

  const paginatedOrders = visibleOrders.slice((page - 1) * ordersPerPage, page * ordersPerPage);
  const pageCount = Math.max(1, Math.ceil(visibleOrders.length / ordersPerPage));
  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const openCreate = () => { if (!admin) return; setEditingOrder(null); setFormData(emptyForm); setFormErrors({}); setFormOpen(true); };
  const openEdit = (order) => {
    if (!admin) return;
    setSelectedOrder(null);
    setEditingOrder(order);
    setFormData({ customer: order.customer, email: order.email, store: order.store, status: order.status, total: String(money(order.total)), address: order.address.replaceAll('\n', ', ') });
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
    if (!formData.total.trim() || Number(formData.total) <= 0) errors.total = 'Ingresa un total mayor que cero';
    if (!formData.address.trim()) errors.address = 'Ingresa la dirección de envío';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const orderData = { ...formData, capturedAt: new Date().toISOString() };
    logEvent(editingOrder ? 'Actualizar pedido:' : 'Crear pedido:', orderData);
    if (editingOrder) {
      const updatedOrder = { ...editingOrder, ...formData, total: Number(formData.total), net: Math.round(Number(formData.total) / 1.19), iva: Number(formData.total) - Math.round(Number(formData.total) / 1.19), address: formData.address.replaceAll(', ', '\n') };
      setOrders((current) => current.map((order) => (order.id === editingOrder.id ? updatedOrder : order)));
      setSelectedOrder(updatedOrder);
      setNotice(`Pedido #${editingOrder.id} actualizado`);
    } else {
      const newOrder = { ...formData, createdAt: new Date().toISOString(), id: `PED-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, date: new Date().toLocaleDateString('en-GB').replaceAll('/', '-') + '\n' + new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }), email: formData.email || 'cliente@correo.com', phone: '+56 9 0000 0000', address: formData.address.replaceAll(', ', '\n'), products: [{ name: 'Producto nuevo', emoji: '📦', price: formData.total, detail: 'Sin detalle' }] };
      setOrders((current) => [newOrder, ...current]);
      setPage(1);
      setSelectedOrder(newOrder);
      setNotice(`Pedido #${newOrder.id} creado`);
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deletingOrder || !admin) return;
    logEvent('Eliminar pedido:', deletingOrder);
    setOrders((current) => current.filter((order) => order.id !== deletingOrder.id));
    setPage(1);
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
              <Typography variant="h4" component="h1"  sx={{ fontWeight: 700 }}>Gestión de pedidos</Typography>
              <Typography color="text.secondary">Administra y haz seguimiento a todos los pedidos de la plataforma.</Typography>
            </Box>
            <Chip label={`${orders.length} total`} size="small" color="primary" variant="outlined" />
          </Box>
          {admin && <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nuevo pedido</Button>}
        </Box>
        <OrderFilters filters={filters} onChange={updateFilter} onApply={() => { setAppliedFilters(filters); setPage(1); setNotice('Filtros aplicados'); }} />
        <OrdersTable orders={paginatedOrders} selectedId={selectedOrder?.id} onSelect={order => { setSelectedOrder(order); setDispatchData(order.dispatch || { carrier: '', tracking: '' }) }} onEdit={admin ? openEdit : undefined} onDelete={admin ? (order) => { setSelectedOrder(null); setDeletingOrder(order); setDeleteOpen(true); } : undefined} />
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
          <Box className="detail-header"><Box><Typography component="h2">Pedido #{selectedOrder.id}</Typography><Typography className="detail-date">{selectedOrder.date.replace('\n', ' · ')}</Typography></Box><IconButton aria-label="Cerrar detalle" onClick={() => setSelectedOrder(null)}><CloseIcon /></IconButton></Box>
          <Chip label={selectedOrder.status} size="small" className="detail-status" />
          <Typography className="detail-section-title">Información del cliente</Typography>
          <Box className="detail-grid"><DetailField icon={<PersonOutlineOutlinedIcon />} label="Cliente"><strong>{selectedOrder.customer}</strong><span>{selectedOrder.email}</span><span>{selectedOrder.phone}</span></DetailField><DetailField icon={<PlaceOutlinedIcon />} label="Dirección de envío"><strong>{selectedOrder.address.split('\n')[0]}</strong>{selectedOrder.address.split('\n').slice(1).map((line) => <span key={line}>{line}</span>)}</DetailField></Box>
          <Divider />
          <DetailField icon={<Inventory2OutlinedIcon />} label="Tienda vendedora"><strong>{selectedOrder.store}</strong></DetailField>
          <Divider />
          <Typography className="detail-section-title">Productos ({selectedOrder.products.length})</Typography>
          <Stack spacing={1}>{selectedOrder.products.map((product) => <Box className="detail-product" key={product.name}><span className="detail-product-emoji">{product.emoji}</span><Box><strong>{product.name}</strong><span>{product.detail}</span></Box><strong>{formatCLP(money(product.price))}</strong></Box>)}</Stack>
          <Box className="detail-totals"><span>Subtotal (neto)<strong>{formatCLP(selectedOrder.net ?? Math.round(money(selectedOrder.total) / 1.19))}</strong></span><span>IVA (19%)<strong>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(selectedOrder.iva ?? money(selectedOrder.total) - Math.round(money(selectedOrder.total) / 1.19))}</strong></span><strong>Total<strong>{formatCLP(money(selectedOrder.total))}</strong></strong></Box>
          <Box className="detail-grid payment-grid"><DetailField icon={<ReceiptLongOutlinedIcon />} label="Método de pago"><span>{selectedOrder.payment || 'Sin medio de pago registrado'} {selectedOrder.cardLast4 ? '•••• ' + selectedOrder.cardLast4 : selectedOrder.transferCode || ''}</span></DetailField><DetailField icon={<LocalShippingOutlinedIcon />} label="Envío"><span>{selectedOrder.dispatch?.carrier || 'Por asignar'}</span></DetailField></Box>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); setOrders(prev => prev.map(order => order.id === selectedOrder.id ? { ...order, status: selectedOrder.status, history: [...(order.history || []), { date: new Date().toISOString(), status: selectedOrder.status }] } : order)); logEvent('Actualizar estado del pedido:', { id: selectedOrder.id, status: selectedOrder.status }); setNotice('Estado actualizado'); }} className="status-form"><Typography className="detail-section-title">Estado del pedido</Typography><TextField size="small" select fullWidth value={selectedOrder.status} onChange={(event) => setSelectedOrder({ ...selectedOrder, status: event.target.value })}>{(API_MODE ? ['En preparación', 'Enviado', 'En reparto', 'Entregado', 'Recibido'].filter((status, index, states) => index === states.indexOf(orders.find(order => order.id === selectedOrder?.id)?.status) || index === states.indexOf(orders.find(order => order.id === selectedOrder?.id)?.status) + 1) : ['En preparación', 'Entregado', 'Enviado', 'Recibido', 'Cancelado']).map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}</TextField><Button type="submit" variant="contained">Actualizar estado</Button></Box>
          {selectedOrder.dispatch && <Box component="form" onSubmit={(event) => { event.preventDefault(); if (!dispatchData.carrier.trim() || !dispatchData.tracking.trim()) { setNotice('Completa transportista y seguimiento'); return; } setOrders(prev => prev.map(order => order.id === selectedOrder.id ? { ...order, dispatch: dispatchData } : order)); logEvent('Guardar información de despacho:', { orderId: selectedOrder.id, ...dispatchData }); setNotice('Información de despacho guardada'); }} className="dispatch-form"><Typography className="detail-section-title"><LocalShippingOutlinedIcon /> Información de despacho</Typography><TextField size="small" label="Empresa de despacho" value={dispatchData.carrier} onChange={(event) => setDispatchData({ ...dispatchData, carrier: event.target.value })} /><TextField size="small" label="Número de seguimiento" value={dispatchData.tracking} onChange={(event) => setDispatchData({ ...dispatchData, tracking: event.target.value })} /><Button type="submit" variant="contained">Guardar despacho</Button></Box>}
          <Box className="transaction-history"><Typography className="detail-section-title"><HistoryOutlinedIcon /> Historial de transacciones</Typography>{(selectedOrder.history || [{ date: selectedOrder.createdAt, status: 'Pedido creado' }]).map((event, index) => <Box key={index} className="history-item"><span>{event.date ? new Date(event.date).toLocaleString('es-CL') : selectedOrder.date.replace('\n', ' ')}</span><span>{event.status}</span></Box>)}</Box>
          <Box className="detail-actions"><Button variant="outlined" startIcon={<ReceiptLongOutlinedIcon />} onClick={() => setReceiptOpen(true)}>Ver comprobante</Button>{admin && <Button variant="outlined" color="error" onClick={() => { setDeletingOrder(selectedOrder); setSelectedOrder(null); setDeleteOpen(true); }}>Eliminar pedido</Button>}</Box>
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
                <strong>{formatCLP(money(product.price))}</strong>
              </Box>
            ))}
            <Divider />
            <Box className="receipt-total"><span>Total</span><strong>{formatCLP(money(selectedOrder?.total))}</strong></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReceiptOpen(false)} sx={{ textTransform: 'none', color: '#4b5563' }}>Cerrar</Button>
          <Button variant="contained" onClick={() => exportReceipt(selectedOrder)} sx={{ textTransform: 'none', backgroundColor: 'primary.main', boxShadow: 'none' }}>
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
              <TextField required name="customer" label="Cliente" value={formData.customer} onChange={updateForm} error={Boolean(formErrors.customer)} helperText={formErrors.customer}   slotProps={{ inputLabel: { shrink: true } }}/>
              <TextField required name="email" label="Correo electrónico" type="email" value={formData.email} onChange={updateForm} error={Boolean(formErrors.email)} helperText={formErrors.email}   slotProps={{ inputLabel: { shrink: true } }}/>
              <TextField select name="store" label="Tienda vendedora" value={formData.store} onChange={updateForm}  slotProps={{ inputLabel: { shrink: true } }}>
                <MenuItem value="Tienda Sur">Tienda Sur</MenuItem>
                <MenuItem value="TechStore">TechStore</MenuItem>
                <MenuItem value="HogarPlus">HogarPlus</MenuItem>
                <MenuItem value="Moda Chile">Moda Chile</MenuItem>
              </TextField>
              <TextField required name="total" label="Total" type="number" value={formData.total} onChange={updateForm} placeholder="0"  error={Boolean(formErrors.total)} helperText={formErrors.total}   slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' }, inputLabel: { shrink: true } }}/>
              <TextField select name="status" label="Estado" value={formData.status} onChange={updateForm}  slotProps={{ inputLabel: { shrink: true } }}>
                {(API_MODE ? ['En preparación', 'Enviado', 'En reparto', 'Entregado', 'Recibido'].filter((status, index, states) => index === states.indexOf(orders.find(order => order.id === selectedOrder?.id)?.status) || index === states.indexOf(orders.find(order => order.id === selectedOrder?.id)?.status) + 1) : ['En preparación', 'Entregado', 'Enviado', 'Recibido', 'Cancelado']).map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
              <TextField required name="address" label="Dirección de envío" value={formData.address} onChange={updateForm} multiline minRows={2} error={Boolean(formErrors.address)} helperText={formErrors.address}   slotProps={{ inputLabel: { shrink: true } }}/>
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
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
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
