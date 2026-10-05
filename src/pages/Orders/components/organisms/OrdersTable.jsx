import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const statusColors = {
  'En preparación': { background: '#fff0c5', color: '#956b00' },
  Entregado: { background: '#d8f5df', color: '#13783c' },
  Enviado: { background: '#dceeff', color: '#1463a6' },
  Recibido: { background: '#eadbff', color: '#7138b6' },
  Cancelado: { background: '#ffdbe4', color: '#b32351' },
};

export default function OrdersTable({ orders, selectedId, onSelect, onEdit, onDelete }) {
  return (
    <TableContainer component={Paper} className="orders-table-paper" elevation={0}>
      <Table aria-label="Listado de pedidos" size="small">
        <TableHead>
          <TableRow>
            <TableCell>N° pedido</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Tienda vendedora</TableCell>
            <TableCell>Productos</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              hover
              key={order.id}
              selected={selectedId === order.id}
              onClick={() => onSelect(order)}
              className="order-row"
            >
              <TableCell component="th" scope="row" className="order-number">
                #{order.id}
              </TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.store}</TableCell>
              <TableCell>
                <div className="product-stack">
                  {order.products.slice(0, 2).map((product) => (
                    <span key={product.name} className="product-thumb" title={product.name}>
                      {product.emoji}
                    </span>
                  ))}
                  {order.products.length > 2 && <span className="product-more">+{order.products.length - 2}</span>}
                </div>
              </TableCell>
              <TableCell className="order-total">{order.total}</TableCell>
              <TableCell>
                <Chip
                  label={order.status}
                  size="small"
                  sx={{
                    backgroundColor: statusColors[order.status].background,
                    color: statusColors[order.status].color,
                    fontWeight: 700,
                  }}
                />
              </TableCell>
              <TableCell align="right" className="order-actions">
                <Tooltip title="Editar pedido">
                  <IconButton
                    size="small"
                    aria-label={`Editar pedido ${order.id}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(order);
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar pedido">
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`Eliminar pedido ${order.id}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(order);
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}