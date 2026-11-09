import { catalogImage } from '../../utils/catalogImages'
import useSellerCollection from '../../hooks/useSellerCollection'
import { catalogSeed, asItem } from '../../data/catalog'
import { logEvent } from '../../data/localStore'
import { confirmAction, notify } from '../../utils/feedback'
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
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import StatMetricCard from '../../components/molecules/StatMetricCard/StatMetricCard'
import { formatCLP } from '../../utils/taxonomyData'

export default function InventoryOffersPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Inventario')
  const [catalog, setCatalog] = useSellerCollection('catalog', catalogSeed)
  const rows = catalog.filter(product => product.tipo !== 'Servicio').flatMap(product => (product.variantes?.length ? product.variantes : [{ sku: `PRD-${product.id}`, stock: product.stock, size: product.tamano, color: product.color, price: product.precio }]).map(variant => ({ ...asItem(product), sku: variant.sku, stock: variant.stock, price: variant.price, reserved: 0, variant: [variant.size, variant.color].filter(Boolean).join(' · '), offerPrice: product.oferta?.precio })))
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

  const handleDirectStockChange = (sku, newStock) => {
    if (!Number.isInteger(newStock) || newStock < 0) { notify('Ingresa un stock entero de cero o más.', 'error'); return }
    const row = rows.find(item => item.sku === sku)
    if (!row) return
    setCatalog(current => current.map(product => {
      if (product.id !== row.id) return product
      const variantes = product.variantes?.map(variant => variant.sku === sku ? { ...variant, stock: newStock } : variant)
      return { ...product, variantes, stock: variantes?.length ? variantes.reduce((sum, variant) => sum + variant.stock, 0) : newStock }
    }))
    logEvent('Ajustar inventario', { sku, stock: newStock, motivo: adjustReason })
    notify('Stock actualizado.')
  }

  const handleApplyAdjustment = () => {
    handleDirectStockChange(activeItem.sku, activeItem.stock + adjustmentDelta)
  }

  const filteredRows = rows.filter((r) => {
    const matchLow = !onlyLowStock || r.stock < 10
    const matchQuery =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.sku.toLowerCase().includes(search.toLowerCase())
    return matchLow && matchQuery && (tab !== 'Ofertas' || Boolean(r.offerPrice))
  })

  const lowStockCount = rows.filter((r) => r.stock > 0 && r.stock < 10).length

  if (!activeItem) return <Card sx={{ p: 4 }}><Typography variant="h5">Aún no hay productos en el inventario</Typography><Button onClick={() => navigate('/vendedor/publicar-producto')}>Publicar producto</Button></Card>
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}


        spacing={2}
        sx={[{ justifyContent: "space-between", alignItems: { xs: 'flex-start', sm: 'center' } }, { mb: 2.5 }]}
      >
        <Box>
          <Typography variant="h4">Inventario y publicaciones</Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona tu stock físico por variante, alertas críticas (&lt; 10 unidades) y ofertas temporales.
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatMetricCard
            title="Productos"
            value="12"
            subtitle="Publicados en tu catálogo"
            icon={<Inventory2Outlined />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatMetricCard
            title="Variantes"
            value="38"
            subtitle="Total de variantes activas"
            icon={<HubOutlined />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatMetricCard
            title="Stock bajo (< 10)"
            value={String(lowStockCount)}
            subtitle="Variantes en alerta crítica"
            icon={<WarningAmberOutlined />}
            iconBg="#fef3c7"
            iconColor="#b45309"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        <Grid size={{ xs: 12, lg: 8.5 }}>
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


              sx={[{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: "space-between" }, { mb: 2 }]}
            >
              <Stack direction="row" spacing={1.5}   sx={{ alignItems: "center", flexWrap: "wrap" }}>
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
                        <Stack direction="row" spacing={1.25}  sx={{ alignItems: "center" }}>
                          <Box component="img" src={catalogImage(row)} alt="" sx={{ width: 42, height: 42, borderRadius: 1.5, objectFit: 'cover' }} />
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
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row"   sx={[{ justifyContent: "space-between", alignItems: "center" }, { mb: 2 }]}>
              <Typography variant="h6">Ajustar stock</Typography>
              <IconButton aria-label="Ver catálogo" size="small" onClick={() => navigate('/crud-2')}><CloseOutlined fontSize="small" /></IconButton>
            </Stack>

            <Stack direction="row" spacing={1.5}  sx={[{ alignItems: "center" }, { mb: 2 }]}>
              <Box component="img" src={catalogImage(activeItem)} alt="" sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover' }} />
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
              <MenuItem value="Devolución aprobada">Reintegro por devolución</MenuItem>
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

            <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>Oferta de la publicación</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography  sx={{ fontWeight: 800 }}>{activeItem.offerPrice ? formatCLP(activeItem.offerPrice) : 'Sin oferta temporal'}</Typography>
              <Typography variant="caption"  sx={[{ display: "block" }, { mb: 2 }]}>Precio oficial: {formatCLP(activeItem.price)}</Typography>
              <Button fullWidth variant="outlined" onClick={() => navigate(`/vendedor/publicar-producto?editar=${activeItem.id}`)}>Editar publicación y oferta</Button>
              {activeItem.offerPrice && <Button fullWidth color="error" onClick={async () => { if (await confirmAction('¿Quitar la oferta temporal de esta publicación?', 'Quitar oferta')) { setCatalog(current => current.map(product => product.id === activeItem.id ? { ...product, oferta: null } : product)); logEvent('Eliminar oferta', { id: activeItem.id }); notify('Oferta eliminada.') } }}>Quitar oferta</Button>}
            </Paper>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
