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
  InputAdornment,
  MenuItem,
  Pagination,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import ClearIcon from '@mui/icons-material/ClearOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FilterListIcon from '@mui/icons-material/FilterListOutlined';
import OrderFilters from '../../components/orders/OrderFilters';
import StatusChip from '../../components/atoms/StatusChip/StatusChip';
import '../../components/orders/Orders.css';

/* ─── Datos alineados a DB ───────────────────────────────────────────────────
   Venta   : ID, ValorBruto, IVA (=19.00), Descuento, Total, Descripcion,
             Despacho FK(Envio.Seguimiento), Estado
   Estado  : 'En Preparación' | 'Despachado' | 'En reparto' |
             'Entregado' | 'Recibido' | 'Cancelada'
   Envio   : Seguimiento, FechaSalida, FechaLlegada, Empresa, Valor,
             Peso, Altura, Ancho, Fondo
   MedioPago: Tipo, Marca, Digitos
   Cliente : RUN, Nombre, Apellido
   Comprar : Producto_id, Venta_id, Cliente_id
──────────────────────────────────────────────────────────────────────────── */
const ESTADOS = ['En Preparación', 'Despachado', 'En reparto', 'Entregado', 'Recibido', 'Cancelada'];

const initialOrders = [
  {
    id: 1032,
    valorBruto: 43000,
    iva: 19.00,
    descuento: 0,
    total: 51170,
    descripcion: 'Pedido de zapatillas y mochila',
    estado: 'En Preparación',
    envio: { seguimiento: 1032, fechaSalida: '2024-04-28', fechaLlegada: '2024-05-02', empresa: 'Chilexpress', valor: 3500, peso: 1.5, altura: 30.0, ancho: 25.0, fondo: 15.0 },
    medioPago: { tipo: 'Tarjeta', marca: 'Visa', digitos: 4242 },
    cliente: { run: '10100001-K', nombre: 'Ana', apellido: 'Torres' },
    productos: [{ id: 1, nombre: 'Zapatillas Deportivas Mujer Running', emoji: '👟', precio: 29990, detalle: 'Rosa / 38' }, { id: 2, nombre: 'Mochila Urbana Unisex', emoji: '🎒', precio: 13010, detalle: 'Negro' }],
  },
  {
    id: 1031,
    valorBruto: 252100,
    iva: 19.00,
    descuento: 0,
    total: 299990,
    descripcion: 'Monitor portátil Full HD',
    estado: 'Entregado',
    envio: { seguimiento: 1031, fechaSalida: '2024-04-27', fechaLlegada: '2024-05-01', empresa: 'Starken', valor: 4800, peso: 2.0, altura: 35.0, ancho: 28.0, fondo: 8.0 },
    medioPago: { tipo: 'Débito', marca: 'Redbank', digitos: 1234 },
    cliente: { run: '10100002-K', nombre: 'Carlos', apellido: 'Mena' },
    productos: [{ id: 3, nombre: 'Monitor portátil', emoji: '🖥️', precio: 299990, detalle: 'Full HD' }],
  },
  {
    id: 1030,
    valorBruto: 75622,
    iva: 19.00,
    descuento: 0,
    total: 89990,
    descripcion: 'Cafetera y sartén antiadherente',
    estado: 'Despachado',
    envio: { seguimiento: 1030, fechaSalida: '2024-04-26', fechaLlegada: '2024-04-30', empresa: 'Chilexpress', valor: 2900, peso: 3.2, altura: 25.0, ancho: 20.0, fondo: 20.0 },
    medioPago: { tipo: 'Tarjeta', marca: 'Mastercard', digitos: 5678 },
    cliente: { run: '10100003-K', nombre: 'Valentina', apellido: 'Ruiz' },
    productos: [{ id: 4, nombre: 'Cafetera', emoji: '☕', precio: 59990, detalle: 'Negra' }, { id: 5, nombre: 'Sartén', emoji: '🍳', precio: 30000, detalle: 'Antiadherente' }],
  },
  {
    id: 1029,
    valorBruto: 33605,
    iva: 19.00,
    descuento: 0,
    total: 39990,
    descripcion: 'Organizador de escritorio',
    estado: 'Recibido',
    envio: { seguimiento: 1029, fechaSalida: '2024-04-25', fechaLlegada: '2024-04-29', empresa: 'Correos Chile', valor: 1800, peso: 0.8, altura: 15.0, ancho: 20.0, fondo: 10.0 },
    medioPago: { tipo: 'Tarjeta', marca: 'Visa', digitos: 9999 },
    cliente: { run: '10100004-K', nombre: 'Diego', apellido: 'Soto' },
    productos: [{ id: 6, nombre: 'Organizador', emoji: '📦', precio: 39990, detalle: 'Blanco' }],
  },
  {
    id: 1028,
    valorBruto: 61336,
    iva: 19.00,
    descuento: 0,
    total: 72990,
    descripcion: 'Chaqueta talla M',
    estado: 'Cancelada',
    envio: { seguimiento: 1028, fechaSalida: '2024-04-24', fechaLlegada: '2024-04-28', empresa: 'Starken', valor: 3200, peso: 0.6, altura: 40.0, ancho: 30.0, fondo: 5.0 },
    medioPago: { tipo: 'Débito', marca: 'Redbank', digitos: 3333 },
    cliente: { run: '10100005-K', nombre: 'Javier', apellido: 'Paredes' },
    productos: [{ id: 7, nombre: 'Chaqueta', emoji: '🧥', precio: 72990, detalle: 'Talla M' }],
  },
];

const emptyForm = {
  clienteRun: '', clienteNombre: '', clienteApellido: '',
  valorBruto: '', descuento: '0',
  descripcion: '',
  estado: 'En Preparación',
  // Envio
  envioEmpresa: 'Chilexpress', envioFechaSalida: '', envioFechaLlegada: '',
  envioValor: '0', envioPeso: '0', envioAltura: '0', envioAncho: '0', envioFondo: '0',
  // MedioPago
  medioPagoTipo: 'Tarjeta', medioPagoMarca: 'Visa', medioPagoDigitos: '',
};

const IVA = 19.00;
const fmt = (n) => `$${Number(n).toLocaleString('es-CL')}`;

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
  pdf.text(`Comprobante de Venta #${order.id}`, margin, y);
  y += 12;
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Cliente: ${order.cliente.nombre} ${order.cliente.apellido} (RUN: ${order.cliente.run})`, margin, y); y += 7;
  pdf.text(`Estado: ${order.estado}`, margin, y); y += 7;
  pdf.text(`Despacho: ${order.envio.empresa} — N° ${order.envio.seguimiento}`, margin, y); y += 12;
  pdf.line(margin, y, 190, y); y += 9;
  pdf.setFont(undefined, 'bold');
  pdf.text('Productos', margin, y); y += 8;
  pdf.setFont(undefined, 'normal');
  order.productos.forEach((p) => {
    const lines = pdf.splitTextToSize(p.nombre, 130);
    pdf.text(lines, margin, y);
    pdf.text(fmt(p.precio), 190, y, { align: 'right' });
    y += Math.max(7, lines.length * 5);
  });
  y += 3;
  pdf.line(margin, y, 190, y); y += 8;
  pdf.text(`Valor Bruto`, margin, y); pdf.text(fmt(order.valorBruto), 190, y, { align: 'right' }); y += 7;
  pdf.text(`IVA (${order.iva}%)`, margin, y); pdf.text(fmt(order.total - order.valorBruto), 190, y, { align: 'right' }); y += 7;
  if (order.descuento > 0) { pdf.text('Descuento', margin, y); pdf.text(`-${fmt(order.descuento)}`, 190, y, { align: 'right' }); y += 7; }
  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(13);
  pdf.text('Total', margin, y);
  pdf.text(fmt(order.total), 190, y, { align: 'right' });
  pdf.save(`venta-${order.id}.pdf`);
}

const CANCEL_SX = { textTransform: 'none', color: '#4b5563', backgroundColor: '#e5e7eb', '&:hover': { backgroundColor: '#d1d5db' }, boxShadow: 'none', fontWeight: 700 };
const CONFIRM_SX = { textTransform: 'none', backgroundColor: '#6430df', '&:hover': { backgroundColor: '#5324c4' }, fontWeight: 700, boxShadow: 'none' };
const SECTION_SX = { fontWeight: 700, display: 'block', mb: 0.75, mt: 2, color: '#6430df', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' };

export default function Orders() {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);
  const ordersPerPage = 5;

  const visibleOrders = useMemo(() => orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [
      String(o.id),
      o.cliente.run,
      o.cliente.nombre,
      o.cliente.apellido,
      o.estado,
    ].join(' ').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'Todos' || o.estado === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter]);

  const paginatedOrders = visibleOrders.slice((page - 1) * ordersPerPage, page * ordersPerPage);
  const pageCount = Math.max(1, Math.ceil(visibleOrders.length / ordersPerPage));

  const calcTotal = (vb, desc) => {
    const bruto = Number(vb) || 0;
    const dsc = Number(desc) || 0;
    return Math.round((bruto - dsc) * (1 + IVA / 100));
  };

  const updateForm = (e) => {
    const { name, value } = e.target;
    setFormData((cur) => ({ ...cur, [name]: value }));
    setFormErrors((cur) => ({ ...cur, [name]: '' }));
  };

  const openCreate = () => {
    setEditingOrder(null);
    setFormData(emptyForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (order) => {
    setSelectedOrder(null);
    setEditingOrder(order);
    setFormData({
      clienteRun: order.cliente.run,
      clienteNombre: order.cliente.nombre,
      clienteApellido: order.cliente.apellido,
      valorBruto: String(order.valorBruto),
      descuento: String(order.descuento),
      descripcion: order.descripcion,
      estado: order.estado,
      envioEmpresa: order.envio.empresa,
      envioFechaSalida: order.envio.fechaSalida,
      envioFechaLlegada: order.envio.fechaLlegada,
      envioValor: String(order.envio.valor),
      envioPeso: String(order.envio.peso),
      envioAltura: String(order.envio.altura),
      envioAncho: String(order.envio.ancho),
      envioFondo: String(order.envio.fondo),
      medioPagoTipo: order.medioPago.tipo,
      medioPagoMarca: order.medioPago.marca,
      medioPagoDigitos: String(order.medioPago.digitos),
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const submitOrder = (event) => {
    event.preventDefault();
    const errors = {};
    // Cliente
    const runRx = /^\d{7,8}-[\dkK]$/;
    if (!formData.clienteRun.trim()) errors.clienteRun = 'El RUN del cliente es obligatorio';
    else if (!runRx.test(formData.clienteRun.trim())) errors.clienteRun = 'Formato inválido (ej: 12345678-K)';
    if (!formData.clienteNombre.trim()) errors.clienteNombre = 'El nombre es obligatorio';
    if (!formData.clienteApellido.trim()) errors.clienteApellido = 'El apellido es obligatorio';
    // Venta
    const vb = Number(formData.valorBruto);
    const dsc = Number(formData.descuento);
    if (!formData.valorBruto.trim() || vb <= 0) errors.valorBruto = 'Debe ser mayor que 0';
    if (dsc < 0) errors.descuento = 'No puede ser negativo';
    else if (vb > 0 && dsc >= vb) errors.descuento = 'Descuento no puede igualar o superar el valor bruto';
    // Envío
    if (!formData.envioFechaSalida) errors.envioFechaSalida = 'Fecha de salida obligatoria';
    if (!formData.envioFechaLlegada) errors.envioFechaLlegada = 'Fecha de llegada obligatoria';
    else if (formData.envioFechaSalida && formData.envioFechaLlegada < formData.envioFechaSalida)
      errors.envioFechaLlegada = 'La llegada no puede ser antes que la salida';
    if (Number(formData.envioValor) < 0) errors.envioValor = 'No puede ser negativo';
    if (Number(formData.envioPeso) < 0) errors.envioPeso = 'No puede ser negativo';
    if (Number(formData.envioAltura) < 0) errors.envioAltura = 'No puede ser negativo';
    if (Number(formData.envioAncho) < 0) errors.envioAncho = 'No puede ser negativo';
    if (Number(formData.envioFondo) < 0) errors.envioFondo = 'No puede ser negativo';
    // MedioPago
    const dig = Number(formData.medioPagoDigitos);
    if (!formData.medioPagoDigitos.trim()) errors.medioPagoDigitos = 'Últimos 4 dígitos obligatorios';
    else if (!Number.isInteger(dig) || dig < 1000 || dig > 9999) errors.medioPagoDigitos = 'Debe ser exactamente 4 dígitos (1000–9999)';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    const bruto = Number(formData.valorBruto);
    const desc = Number(formData.descuento) || 0;
    const total = calcTotal(bruto, desc);

    const built = {
      valorBruto: bruto, iva: IVA, descuento: desc, total,
      descripcion: formData.descripcion,
      estado: formData.estado,
      cliente: { run: formData.clienteRun, nombre: formData.clienteNombre, apellido: formData.clienteApellido },
      envio: {
        seguimiento: editingOrder ? editingOrder.envio.seguimiento : Date.now(),
        fechaSalida: formData.envioFechaSalida, fechaLlegada: formData.envioFechaLlegada,
        empresa: formData.envioEmpresa, valor: Number(formData.envioValor) || 0,
        peso: Number(formData.envioPeso) || 0, altura: Number(formData.envioAltura) || 0,
        ancho: Number(formData.envioAncho) || 0, fondo: Number(formData.envioFondo) || 0,
      },
      medioPago: { tipo: formData.medioPagoTipo, marca: formData.medioPagoMarca, digitos: Number(formData.medioPagoDigitos) },
    };

    if (editingOrder) {
      const updated = { ...editingOrder, ...built };
      setOrders((cur) => cur.map((o) => o.id === editingOrder.id ? updated : o));
      setSelectedOrder(updated);
      setNotice(`Venta #${editingOrder.id} actualizada`);
    } else {
      const newOrder = { ...built, id: Math.max(...orders.map((o) => o.id)) + 1, productos: [] };
      setOrders((cur) => [newOrder, ...cur]);
      setPage(1);
      setSelectedOrder(newOrder);
      setNotice(`Venta #${newOrder.id} creada`);
    }
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deletingOrder) return;
    setOrders((cur) => cur.filter((o) => o.id !== deletingOrder.id));
    setDeleteOpen(false);
    setDeletingOrder(null);
    setNotice(`Venta #${deletingOrder.id} eliminada`);
  };

  const updateOrderStatus = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setOrders((cur) => cur.map((o) => o.id === selectedOrder.id ? { ...o, estado: selectedOrder.estado } : o));
    setNotice(`Estado de Venta #${selectedOrder.id} actualizado`);
  };

  return (
    <Box className={`orders-page${selectedOrder ? ' orders-page--with-detail' : ''}`}>
      <Box className="orders-main">
        <Box className="orders-breadcrumb">Panel de control <span>/</span> Ventas y pedidos</Box>
        <Box className="orders-heading">
          <Box className="orders-title-group">
            <ShoppingBagOutlinedIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>Gestión de ventas</Typography>
              <Typography color="text.secondary">Administra ventas, despachos y medios de pago.</Typography>
            </Box>
            <Chip label={`${orders.length} total`} size="small" color="primary" variant="outlined" />
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Nueva venta</Button>
        </Box>

        {/* Filtros */}
        <Box className="orders-filters">
          <TextField
            className="orders-search" size="small" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por ID, RUN cliente, nombre o estado..."
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')} edge="end" sx={{ color: 'text.secondary' }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <TextField select size="small" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <MenuItem value="Todos">Todos los estados</MenuItem>
            {ESTADOS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <Button variant="contained" startIcon={<FilterListIcon />}>Aplicar filtros</Button>
        </Box>

        {/* Tabla Venta */}
        <Box className="orders-table-paper" component="div" sx={{ border: '1px solid #e1e5ef', borderRadius: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 14, fontWeight: 800, color: '#13234d', background: '#fff', whiteSpace: 'nowrap' }}>ID</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontSize: 14, fontWeight: 800, color: '#13234d', background: '#fff' }}>Cliente</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#13234d', background: '#fff' }}>Valor Bruto</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontSize: 14, fontWeight: 800, color: '#13234d', background: '#fff' }}>Total</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#13234d', background: '#fff' }}>Estado</th>
                <th style={{ padding: '12px 20px 12px 10px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#13234d', background: '#fff' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 10px', color: '#667089' }}>No hay ventas que coincidan.</td></tr>
              ) : paginatedOrders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrder(o.id === selectedOrder?.id ? null : o)}
                  style={{ cursor: 'pointer', background: o.id === selectedOrder?.id ? '#eee8ff' : 'transparent', transition: 'background 120ms' }}
                  onMouseEnter={(e) => { if (o.id !== selectedOrder?.id) e.currentTarget.style.background = '#f5f2ff'; }}
                  onMouseLeave={(e) => { if (o.id !== selectedOrder?.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '11px 16px', fontWeight: 800, color: '#13234d', fontSize: 14, whiteSpace: 'nowrap' }}>#{o.id}</td>
                  <td style={{ padding: '11px 10px', fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{o.cliente.nombre} {o.cliente.apellido}</div>
                    <div style={{ color: '#667089', fontSize: 11 }}>{o.cliente.run}</div>
                  </td>
                  <td style={{ padding: '11px 10px', textAlign: 'right', fontSize: 13 }}>{fmt(o.valorBruto)}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{fmt(o.total)}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'center' }}>
                    <StatusChip status={o.estado} />
                  </td>
                  <td style={{ padding: '11px 20px 11px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <Tooltip title="Editar venta">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(o); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar venta">
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setSelectedOrder(null); setDeletingOrder(o); setDeleteOpen(true); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Box className="orders-pagination">
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" size="medium" />
        </Box>
        <Typography className="orders-count">Mostrando {visibleOrders.length} de {orders.length} ventas</Typography>
      </Box>

      {/* ══════════════ PANEL LATERAL DE DETALLE ══════════════ */}
      {selectedOrder && (
        <Box className="order-detail-panel">
          <Box className="detail-header">
            <Box>
              <Typography component="h2">Venta #{selectedOrder.id}</Typography>
              <Typography className="detail-date">Salida: {selectedOrder.envio.fechaSalida}</Typography>
            </Box>
            <IconButton aria-label="Cerrar detalle" onClick={() => setSelectedOrder(null)}><CloseIcon /></IconButton>
          </Box>

          <Chip label={selectedOrder.estado} size="small" className="detail-status" />

          <Typography className="detail-section-title">Cliente</Typography>
          <Box className="detail-grid">
            <DetailField icon={<PersonOutlineOutlinedIcon />} label="RUN">
              <strong>{selectedOrder.cliente.run}</strong>
              <span>{selectedOrder.cliente.nombre} {selectedOrder.cliente.apellido}</span>
            </DetailField>
          </Box>
          <Divider />

          <Typography className="detail-section-title">Productos ({selectedOrder.productos.length})</Typography>
          <Stack spacing={1}>
            {selectedOrder.productos.map((p) => (
              <Box className="detail-product" key={p.id}>
                <span className="detail-product-emoji">{p.emoji}</span>
                <Box><strong>{p.nombre}</strong><span>{p.detalle}</span></Box>
                <strong>{fmt(p.precio)}</strong>
              </Box>
            ))}
          </Stack>

          <Box className="detail-totals">
            <span>ValorBruto<strong>{fmt(selectedOrder.valorBruto)}</strong></span>
            <span>IVA ({selectedOrder.iva}%)<strong>{fmt(selectedOrder.total - selectedOrder.valorBruto)}</strong></span>
            {selectedOrder.descuento > 0 && <span>Descuento<strong>-{fmt(selectedOrder.descuento)}</strong></span>}
            <strong>Total<strong>{fmt(selectedOrder.total)}</strong></strong>
          </Box>
          <Divider sx={{ mt: 1 }} />

          <DetailField icon={<ReceiptLongOutlinedIcon />} label="MedioPago">
            <span>{selectedOrder.medioPago.tipo} — {selectedOrder.medioPago.marca} ****{selectedOrder.medioPago.digitos}</span>
          </DetailField>
          <Divider />

          <Typography className="detail-section-title"><LocalShippingOutlinedIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />Envío (Despacho)</Typography>
          <Box className="detail-grid">
            <DetailField icon={<Inventory2OutlinedIcon />} label="Empresa despacho">
              <strong>{selectedOrder.envio.empresa}</strong>
              <span>N° {selectedOrder.envio.seguimiento}</span>
            </DetailField>
            <DetailField icon={<PlaceOutlinedIcon />} label="Fechas">
              <span>Salida: {selectedOrder.envio.fechaSalida}</span>
              <span>Llegada: {selectedOrder.envio.fechaLlegada}</span>
            </DetailField>
          </Box>
          <Box sx={{ fontSize: 11, color: '#667089', mt: 0.5 }}>
            Peso: {selectedOrder.envio.peso} kg · {selectedOrder.envio.altura}×{selectedOrder.envio.ancho}×{selectedOrder.envio.fondo} cm · Valor: {fmt(selectedOrder.envio.valor)}
          </Box>
          <Divider sx={{ mt: 1 }} />

          {/* Cambiar estado */}
          <Box component="form" onSubmit={updateOrderStatus} className="status-form">
            <Typography className="detail-section-title">Estado (Venta.Estado)</Typography>
            <TextField size="small" select fullWidth value={selectedOrder.estado}
              onChange={(e) => setSelectedOrder({ ...selectedOrder, estado: e.target.value })}>
              {ESTADOS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <Button type="submit" variant="contained">Actualizar</Button>
          </Box>

          <Box className="transaction-history">
            <Typography className="detail-section-title"><HistoryOutlinedIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />Historial</Typography>
            <Box className="history-item"><span>{selectedOrder.envio.fechaSalida}</span><span>Venta creada</span></Box>
          </Box>

          <Box className="detail-actions">
            <Button variant="outlined" startIcon={<ReceiptLongOutlinedIcon />} onClick={() => setReceiptOpen(true)}>Comprobante</Button>
            <Button variant="outlined" color="error" onClick={() => { setDeletingOrder(selectedOrder); setSelectedOrder(null); setDeleteOpen(true); }}>Eliminar</Button>
          </Box>
        </Box>
      )}

      {/* ══════════════ DIALOG COMPROBANTE ══════════════ */}
      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle className="receipt-title">Comprobante Venta #{selectedOrder?.id}</DialogTitle>
        <DialogContent>
          <Box className="receipt-content">
            <Typography className="receipt-customer">{selectedOrder?.cliente.nombre} {selectedOrder?.cliente.apellido}</Typography>
            <Typography className="receipt-muted">RUN: {selectedOrder?.cliente.run}</Typography>
            <Divider />
            <Typography className="receipt-section-title">Productos</Typography>
            {selectedOrder?.productos.map((p) => (
              <Box className="receipt-line" key={p.id}>
                <span>{p.nombre}</span><strong>{fmt(p.precio)}</strong>
              </Box>
            ))}
            <Divider />
            <Box className="receipt-line"><span>ValorBruto</span><strong>{fmt(selectedOrder?.valorBruto)}</strong></Box>
            <Box className="receipt-line"><span>IVA (19%)</span><strong>{fmt((selectedOrder?.total || 0) - (selectedOrder?.valorBruto || 0))}</strong></Box>
            <Box className="receipt-total"><span>Total</span><strong>{fmt(selectedOrder?.total)}</strong></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReceiptOpen(false)} variant="contained" sx={CANCEL_SX}>Cerrar</Button>
          <Button variant="contained" onClick={() => generateReceiptPdf(selectedOrder)} sx={CONFIRM_SX}>Generar PDF</Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════ DIALOG CREAR / EDITAR VENTA ══════════════ */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="md" scroll="paper">
        <Box component="form" onSubmit={submitOrder}>
          <DialogTitle sx={{ color: '#000', fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
            {editingOrder ? `Editar Venta #${editingOrder.id}` : 'Nueva Venta'}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>

            {/* ── Cliente ── */}
            <Typography sx={SECTION_SX}>Cliente (tabla Cliente)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField required name="clienteRun" label="RUN" size="small" value={formData.clienteRun} onChange={updateForm}
                error={Boolean(formErrors.clienteRun)} helperText={formErrors.clienteRun}
                slotProps={{ inputLabel: { shrink: true } }} placeholder="12345678-K" />
              <TextField required name="clienteNombre" label="Nombre" size="small" value={formData.clienteNombre} onChange={updateForm}
                error={Boolean(formErrors.clienteNombre)} helperText={formErrors.clienteNombre}
                slotProps={{ inputLabel: { shrink: true } }} />
              <TextField required name="clienteApellido" label="Apellido" size="small" value={formData.clienteApellido} onChange={updateForm}
                error={Boolean(formErrors.clienteApellido)} helperText={formErrors.clienteApellido}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Box>

            {/* ── Venta ── */}
            <Typography sx={SECTION_SX}>Venta</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2 }}>
              <TextField required name="valorBruto" label="ValorBruto ($)" type="number" size="small" value={formData.valorBruto} onChange={updateForm}
                error={Boolean(formErrors.valorBruto)} helperText={formErrors.valorBruto}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 1 } }} />
              <TextField name="iva" label="IVA (%)" size="small" value="19.00"
                slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }} />
              <TextField name="descuento" label="Descuento ($)" type="number" size="small" value={formData.descuento} onChange={updateForm}
                error={Boolean(formErrors.descuento)} helperText={formErrors.descuento}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 0 } }} />
              <TextField label="Total (auto)" size="small" value={fmt(calcTotal(formData.valorBruto, formData.descuento))}
                slotProps={{ inputLabel: { shrink: true }, input: { readOnly: true } }}
                sx={{ '& input': { fontWeight: 700, color: '#6430df' } }} />
            </Box>
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField name="descripcion" label="Descripcion" size="small" value={formData.descripcion} onChange={updateForm}
                slotProps={{ inputLabel: { shrink: true } }} multiline minRows={2} />
              <TextField select name="estado" label="Estado" size="small" value={formData.estado} onChange={updateForm}
                slotProps={{ inputLabel: { shrink: true } }}>
                {ESTADOS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Box>

            {/* ── MedioPago ── */}
            <Typography sx={SECTION_SX}>MedioPago</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <TextField select name="medioPagoTipo" label="Tipo" size="small" value={formData.medioPagoTipo} onChange={updateForm}
                slotProps={{ inputLabel: { shrink: true } }}>
                <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                <MenuItem value="Débito">Débito</MenuItem>
                <MenuItem value="Transferencia">Transferencia</MenuItem>
              </TextField>
              <TextField name="medioPagoMarca" label="Marca" size="small" value={formData.medioPagoMarca} onChange={updateForm}
                slotProps={{ inputLabel: { shrink: true } }} />
              <TextField required name="medioPagoDigitos" label="Dígitos (4)" type="number" size="small" value={formData.medioPagoDigitos} onChange={updateForm}
                error={Boolean(formErrors.medioPagoDigitos)} helperText={formErrors.medioPagoDigitos}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 1000, max: 9999 } }} />
            </Box>

            {/* ── Envio ── */}
            <Typography sx={SECTION_SX}>Envío — tabla Envio</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 1.5 }}>
              <TextField name="envioEmpresa" label="Empresa despacho" size="small" value={formData.envioEmpresa} onChange={updateForm}
                slotProps={{ inputLabel: { shrink: true } }} />
              <TextField required name="envioFechaSalida" label="Fecha Salida" type="date" size="small" value={formData.envioFechaSalida} onChange={updateForm}
                error={Boolean(formErrors.envioFechaSalida)} helperText={formErrors.envioFechaSalida}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: '1995-01-01' } }} />
              <TextField required name="envioFechaLlegada" label="Fecha Llegada" type="date" size="small" value={formData.envioFechaLlegada} onChange={updateForm}
                error={Boolean(formErrors.envioFechaLlegada)} helperText={formErrors.envioFechaLlegada}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: formData.envioFechaSalida || '1995-01-01' } }} />
              <TextField name="envioValor" label="Costo envío ($)" type="number" size="small" value={formData.envioValor} onChange={updateForm}
                error={Boolean(formErrors.envioValor)} helperText={formErrors.envioValor}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 0 } }} />
              <TextField name="envioPeso" label="Peso (kg)" type="number" size="small" value={formData.envioPeso} onChange={updateForm}
                error={Boolean(formErrors.envioPeso)} helperText={formErrors.envioPeso}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 0, step: 0.1 } }} />
              <TextField name="envioAltura" label="Altura (cm)" type="number" size="small" value={formData.envioAltura} onChange={updateForm}
                error={Boolean(formErrors.envioAltura)} helperText={formErrors.envioAltura}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 0, step: 0.1 } }} />
              <TextField name="envioAncho" label="Ancho (cm)" type="number" size="small" value={formData.envioAncho} onChange={updateForm}
                error={Boolean(formErrors.envioAncho)} helperText={formErrors.envioAncho}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 0, step: 0.1 } }} />
              <TextField name="envioFondo" label="Fondo (cm)" type="number" size="small" value={formData.envioFondo} onChange={updateForm}
                error={Boolean(formErrors.envioFondo)} helperText={formErrors.envioFondo}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 0, step: 0.1 } }} />
            </Box>

          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => setFormOpen(false)} variant="contained" sx={CANCEL_SX}>Cancelar</Button>
            <Button type="submit" variant="contained" sx={CONFIRM_SX}>
              {editingOrder ? 'Guardar cambios' : 'Crear venta'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ══════════════ DIALOG ELIMINAR ══════════════ */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#000', fontWeight: 700 }}>¿Eliminar Venta #{deletingOrder?.id}?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Esta acción quitará la venta de la lista. No se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="contained" sx={CANCEL_SX}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={2800} onClose={() => setNotice('')}>
        <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>
      </Snackbar>
    </Box>
  );
}
