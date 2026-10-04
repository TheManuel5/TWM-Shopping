import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

export default function OrderFilters({ filters, onChange, onApply }) {
  return (
    <Box className="orders-filters">
      <TextField
        className="orders-search"
        size="small"
        placeholder="Buscar por N° de pedido, cliente o producto..."
        value={filters.search}
        onChange={(event) => onChange('search', event.target.value)}
        inputProps={{ 'aria-label': 'Buscar pedidos' }}
      />
      <TextField
        select
        size="small"
        label="Tienda vendedora"
        value={filters.store}
        onChange={(event) => onChange('store', event.target.value)}
      >
        <MenuItem value="Todas">Todas</MenuItem>
        <MenuItem value="Tienda Sur">Tienda Sur</MenuItem>
        <MenuItem value="TechStore">TechStore</MenuItem>
        <MenuItem value="HogarPlus">HogarPlus</MenuItem>
        <MenuItem value="Moda Chile">Moda Chile</MenuItem>
      </TextField>
      <TextField
        size="small"
        label="Desde"
        type="date"
        value={filters.from}
        onChange={(event) => onChange('from', event.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        size="small"
        label="Hasta"
        type="date"
        value={filters.to}
        onChange={(event) => onChange('to', event.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <Select
        size="small"
        value={filters.status}
        onChange={(event) => onChange('status', event.target.value)}
        inputProps={{ 'aria-label': 'Filtrar por estado' }}
      >
        <MenuItem value="Todos">Todos los estados</MenuItem>
        <MenuItem value="En preparación">En preparación</MenuItem>
        <MenuItem value="Entregado">Entregado</MenuItem>
        <MenuItem value="Enviado">Enviado</MenuItem>
        <MenuItem value="Recibido">Recibido</MenuItem>
        <MenuItem value="Cancelado">Cancelado</MenuItem>
      </Select>
      <Button
        variant="contained"
        startIcon={<FilterAltOutlinedIcon />}
        onClick={onApply}
      >
        Aplicar filtros
      </Button>
    </Box>
  );
}