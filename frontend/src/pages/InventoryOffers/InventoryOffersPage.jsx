import {
  AddOutlined,
  CloseOutlined,
  EditOutlined,
  HubOutlined,
  Inventory2Outlined,
  LocalOfferOutlined,
  SearchOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import chairImage from '../../assets/products/chair.jpg'
import laptopImage from '../../assets/products/laptop.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import StatMetricCard from '../../components/molecules/StatMetricCard/StatMetricCard'
import { formatCLP } from '../../utils/taxonomyData'

const INITIAL_INVENTORY = [
  { id: 1, name: 'Zapatillas Urban Run', category: 'Deporte y outdoor', sku: 'UR-001', variant: 'Talla 42 · Negro', stock: 8, reserved: 2, price: 39990, offerPrice: 31992, image: shoeImage },
  { id: 2, name: 'Zapatillas Urban Run', category: 'Deporte y outdoor', sku: 'UR-002', variant: 'Talla 43 · Negro', stock: 18, reserved: 1, price: 39990, offerPrice: null, image: shoeImage },
  { id: 3, name: 'Zapatillas Urban Run', category: 'Deporte y outdoor', sku: 'UR-003', variant: 'Talla 42 · Blanco', stock: 12, reserved: 0, price: 39990, offerPrice: null, image: shoeImage },
  { id: 4, name: 'Notebook Pro 14"', category: 'Tecnología', sku: 'NBP-014', variant: '16 GB · Gris', stock: 5, reserved: 1, price: 699990, offerPrice: 599990, image: laptopImage },
  { id: 5, name: 'Audífonos Bluetooth X1', category: 'Tecnología', sku: 'AUD-X1', variant: 'Negro', stock: 25, reserved: 3, price: 29990, offerPrice: 24990, image: phoneImage },
  { id: 6, name: 'Mochila Travel 25L', category: 'Ropa, moda y calzado', sku: 'MOCH-25', variant: 'Azul', stock: 0, reserved: 0, price: 24990, offerPrice: null, image: chairImage },
]

export default function InventoryOffersPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Inventario')
  const [rows, setRows] = useState(INITIAL_INVENTORY)
  const [onlyLowStock, setOnlyLowStock] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedSku, setSelectedSku] = useState('UR-001')
  const [adjustmentDelta, setAdjustmentDelta] = useState(10)
  const [adjustReason, setAdjustReason] = useState('Reposición')

  const activeItem = rows.find((r) => r.sku === selectedSku) || rows[0]

  const getStatus = (stock) => {
    if (stock === 0) return 'Sin stock'
    if (stock < 10) return 'Stock bajo' // Alerta crítica < 10 unidades (Etapa 11)
    return 'Activo'
  }

  // SIMULACIÓN DE ACTUALIZACIÓN RÁPIDA DE STOCK (INLINE)
  const handleDirectStockChange = (sku, newStock) => {
    console.log(`Simulando petición PUT a /api/inventario/${sku} con datos:`, { stockTotal: Math.max(0, newStock) })
    setRows((prev) => prev.map((r) => (r.sku === sku ? { ...r, stock: Math.max(0, newStock) } : r)))
  }

  // SIMULACIÓN DE AJUSTE DETALLADO DE STOCK CON MOTIVO
  const handleApplyAdjustment = () => {
    const newStock = activeItem.stock + adjustmentDelta
    const payload = {
      sku: activeItem.sku,
      stockAnterior: activeItem.stock,
      nuevoStock: newStock,
      cantidadAjuste: adjustmentDelta,
      motivo: adjustReason
    }
    
    console.log(`Simulando petición POST a /api/inventario/${activeItem.sku}/ajuste con datos:`, payload)
    handleDirectStockChange(activeItem.sku, newStock)
  }

  const filteredRows = rows.filter((r) => {
    const matchLow = !onlyLowStock || r.stock < 10
    const matchQuery =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.sku.toLowerCase().includes(search.toLowerCase())
    return matchLow && matchQuery
  })

  const lowStockCount = rows.filter((r) => r.stock > 0 && r.stock < 10).length

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h4">Inventario y publicaciones</Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona tu stock físico por variante, alertas críticas (&lt; 10 unidades) y ofertas temporales (RF17 / RF27).
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/vendedor/publicar-producto')}
        >
          Nueva variante / producto
        </Button>
      </Stack>

      {/* 4 KPIs Superiores (P17) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatMetricCard
            title="Productos"
            value="12"
            subtitle="Publicados en tu catálogo"
            icon={<Inventory2Outlined />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatMetricCard
            title="Variantes"
            value="38"
            subtitle="Total de variantes activas"
            icon={<HubOutlined />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatMetricCard
            title="Stock bajo (< 10)"
            value={String(lowStockCount)}
            subtitle="Variantes en alerta crítica"
            icon={<WarningAmberOutlined />}
            iconBg="#fef3c7"
            iconColor="#b45309"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatMetricCard
            title="Ofertas activas"
            value="3"
            subtitle="Productos en promoción"
            icon={<LocalOfferOutlined />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Tabla Principal de Inventario por Variante (P17) */}
        <Grid item xs={12} lg={8.5}>
          <Card sx={{ p: 2.5 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Tab value="Productos" label="Productos" onClick={() => navigate('/crud-2')} />
              <Tab value="Servicios" label="Servicios" onClick={() => navigate('/vendedor/publicar-servicio')} />
              <Tab value="Inventario" label="Inventario" />
              <Tab value="Ofertas" label="Ofertas" />
            </Tabs>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Select size="small" value="Todas" sx={{ minWidth: 165 }}>
                  <MenuItem value="Todas">Todas las categorías</MenuItem>
                </Select>
                <FormControlLabel
                  control={<Checkbox size="small" checked={onlyLowStock} onChange={(e) => setOnlyLowStock(e.target.checked)} />}
                  label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Solo stock bajo (&lt; 10)</Typography>}
                />
              </Stack>

              <TextField
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto o SKU..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>

            <Table size="small">
              <TableHead sx={{ bgcolor: '#f7f6ff' }}>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Variante</TableCell>
                  <TableCell align="center">Stock total</TableCell>
                  <TableCell align="center">Reservado</TableCell>
                  <TableCell align="center">Disponible</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => {
                  const status = getStatus(row.stock)
                  const available = Math.max(0, row.stock - row.reserved)
                  const selected = row.sku === activeItem.sku
                  return (
                    <TableRow
                      key={row.sku}
                      hover
                      selected={selected}
                      onClick={() => setSelectedSku(row.sku)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Box component="img" src={row.image} alt="" sx={{ width: 42, height: 42, borderRadius: 1.5, objectFit: 'cover' }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{row.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.category}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{row.sku}</TableCell>
                      <TableCell>{row.variant}</TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <QuantityInput
                          value={row.stock}
                          min={0}
                          max={500}
                          onChange={(val) => handleDirectStockChange(row.sku, val)}
                        />
                      </TableCell>
                      <TableCell align="center">{row.reserved}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 800 }}>{available}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCLP(row.price)}</TableCell>
                      <TableCell>
                        <StatusChip status={status} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => setSelectedSku(row.sku)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        {/* Panel Derecho: Ajustar Stock y Oferta Activa (P17) */}
        <Grid item xs={12} lg={3.5}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Ajustar stock</Typography>
              <IconButton size="small"><CloseOutlined fontSize="small" /></IconButton>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Box component="img" src={activeItem.image} alt="" sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover' }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{activeItem.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  SKU: {activeItem.sku} · {activeItem.variant}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{formatCLP(activeItem.price)}</Typography>
              </Box>
            </Stack>

            <Paper elevation={0} sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 2.5, mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Stock actual
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                {activeItem.stock}
              </Typography>
            </Paper>

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.75 }}>
              Ajuste de stock (unidades a sumar)
            </Typography>
            <Box sx={{ mb: 2 }}>
              <QuantityInput value={adjustmentDelta} min={1} max={100} onChange={setAdjustmentDelta} size="medium" />
            </Box>

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              Motivo del ajuste
            </Typography>
            <Select fullWidth size="small" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} sx={{ mb: 2 }}>
              <MenuItem value="Reposición">Reposición de proveedor</MenuItem>
              <MenuItem value="Devolución aprobada">Reintegro por devolución (Trigger 10)</MenuItem>
              <MenuItem value="Auditoría">Ajuste de inventario físico</MenuItem>
            </Select>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2.5, mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Nuevo stock total proyectado
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                {activeItem.stock + adjustmentDelta}
              </Typography>
            </Paper>

            <Button variant="contained" fullWidth size="large" onClick={handleApplyAdjustment} sx={{ mb: 3 }}>
              Guardar ajuste
            </Button>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
              Oferta activa en este producto (RF10)
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <LocalOfferOutlined color="primary" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>20% de descuento</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                    $31.992{' '}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      $39.990
                    </Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Válida desde 20/09/2026 hasta 31/10/2026
                  </Typography>
                </Box>
              </Stack>
              <Button variant="outlined" fullWidth size="small" onClick={() => navigate('/vendedor/publicar-producto')}>
                Editar oferta
              </Button>
            </Paper>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}