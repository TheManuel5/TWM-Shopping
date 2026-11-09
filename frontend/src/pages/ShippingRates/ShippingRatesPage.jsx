import useGeography from '../../hooks/useGeography'
import useSellerCollection from '../../hooks/useSellerCollection'
import { useNavigate } from 'react-router-dom'
import { confirmAction, notify } from '../../utils/feedback'
import { logEvent } from '../../data/localStore'
import useCollection from '../../hooks/useCollection'
import {
  AddOutlined,
  CalculateOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
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
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import { formatCLP } from '../../utils/taxonomyData'

const INITIAL_ZONES = [
  { id: 1, region: 'Los Lagos', provincia: 'Osorno', comuna: 'Osorno', rate: 3570 },
  { id: 2, region: 'Los Lagos', provincia: 'Llanquihue', comuna: 'Puerto Montt', rate: 4760 },
  { id: 3, region: 'Los Ríos', provincia: 'Valdivia', comuna: 'Valdivia', rate: 5950 },
]

// Estados exactos de Restricción Check 9 del PDF (En preparación, Despachado, En reparto, Entregado)
export default function ShippingRatesPage() {
  const navigate = useNavigate()
  const CHILE_DPA = useGeography()
  const [tab, setTab] = useState('Tarifas')
  const [editingId, setEditingId] = useState(null)
  const [orders] = useCollection('orders', [])
  const [calcMethod, setCalcMethod] = useCollection('shippingMethod', 'zona')
  const [zones, setZones] = useSellerCollection('zones', INITIAL_ZONES)

  const [newRegion, setNewRegion] = useState(Object.keys(CHILE_DPA)[0] || '')
  const [newProvincia, setNewProvincia] = useState('')
  const [newComuna, setNewComuna] = useState('')
  const [newRate, setNewRate] = useState(4200)

  // Simulador de Costo de Envío (P21)
  const [weightG, setWeightG] = useState(650)
  const [dimW, setDimW] = useState(32)
  const [dimH, setDimH] = useState(20)
  const [dimD, setDimD] = useState(12)
  const [destComuna, setDestComuna] = useState('')

  const baseZoneRate = zones.find((z) => z.comuna === destComuna)?.rate ?? 0
  const volumetricKg = (dimW * dimH * dimD) / 5000
  const simulatedCost =
    calcMethod === 'zona'
      ? baseZoneRate
      : Math.round(2000 + dimW * dimH * dimD * 0.25)

  const handleAddZone = () => {
    if (!Number.isInteger(Number(newRate)) || Number(newRate) < 0 || !CHILE_DPA[newRegion]?.[newProvincia]?.includes(newComuna)) { notify('Selecciona una comuna válida y una tarifa entera de cero o más.', 'error'); return }
    if (zones.some(zone => zone.comuna === newComuna && zone.id !== editingId)) { notify('Ya hay una tarifa para esta comuna. Usa Editar.', 'warning'); return }
    const zone = { id: editingId || Date.now(), region: newRegion, provincia: newProvincia, comuna: newComuna, rate: Number(newRate) }
    setZones(current => editingId ? current.map(row => row.id === editingId ? zone : row) : [...current, zone])
    logEvent(editingId ? 'Actualizar tarifa' : 'Crear tarifa', zone); setEditingId(null); notify('Tarifa guardada.')
  }

  const provinciasList = Object.keys(CHILE_DPA[newRegion] || {})
  const comunasList = CHILE_DPA[newRegion]?.[newProvincia] || []

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Despachos y costos de envío
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Configura las zonas geográficas (DPA Chile), tarifas dinámicas por volumen y seguimiento de transportistas.
      </Typography>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab value="Seguimiento" label="Seguimiento" />
        <Tab value="Tarifas" label="Tarifas" />
      </Tabs>

      {tab === 'Tarifas' && <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Columna Izquierda: Método de cálculo y Tabla de Zonas (P21) */}
        <Grid size={{ xs: 12, lg: 7.5 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Método de cálculo de envío
            </Typography>
            <RadioGroup
              row
              value={calcMethod}
              onChange={(e) => setCalcMethod(e.target.value)}
              sx={{ mb: 3, gap: 3 }}
            >
              <FormControlLabel
                value="zona"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Por zona geográfica</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Configura tarifas fijas por región, provincia y comuna.
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="volumen"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Por peso y dimensiones</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fórmula: Tarifa Base + máx(Peso Real, Ancho×Alto×Fondo / 5000) × $850
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>

            <Stack direction="row"   sx={[{ justifyContent: "space-between", alignItems: "center" }, { mb: 1.5 }]}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Zonas y tarifas</Typography>
                <Typography variant="caption" color="text.secondary">
                  Define tarifas para cada comuna.
                </Typography>
              </Box>
              <Button variant="contained" size="small" startIcon={<AddOutlined />} onClick={handleAddZone}>
                Agregar zona
              </Button>
            </Stack>

            <Table size="small" sx={{ mb: 2.5 }}>
              <TableHead sx={{ bgcolor: '#f7f6ff' }}>
                <TableRow>
                  <TableCell>Región</TableCell>
                  <TableCell>Provincia</TableCell>
                  <TableCell>Comuna</TableCell>
                  <TableCell align="right">Tarifa (CLP)</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {zones.map((z) => (
                  <TableRow key={z.id}>
                    <TableCell>{z.region}</TableCell>
                    <TableCell>{z.provincia}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{z.comuna}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCLP(z.rate)}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label={`Editar tarifa ${z.comuna}`} size="small" onClick={() => { setEditingId(z.id); setNewRegion(z.region); setNewProvincia(z.provincia); setNewComuna(z.comuna); setNewRate(z.rate) }}><EditOutlined fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" aria-label={`Eliminar tarifa ${z.comuna}`} onClick={async () => { if (await confirmAction(`¿Eliminar la tarifa de ${z.comuna}?`)) { setZones(prev => prev.filter(item => item.id !== z.id)); logEvent('Eliminar tarifa', { id: z.id }); notify('Tarifa eliminada.') } }}>
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Formulario inferior para añadir nueva Comuna */}
            <Grid container spacing={1.5}  sx={{ alignItems: "flex-end" }}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Región</Typography>
                <Select
                  fullWidth
                  size="small"
                  value={newRegion}
                  onChange={(e) => {
                    const reg = e.target.value
                    setNewRegion(reg)
                    const firstProv = Object.keys(CHILE_DPA[reg])[0]
                    setNewProvincia(firstProv)
                    setNewComuna(CHILE_DPA[reg][firstProv][0])
                  }}
                >
                  {Object.keys(CHILE_DPA).map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Provincia</Typography>
                <Select
                  fullWidth
                  size="small"
                  value={newProvincia}
                  onChange={(e) => {
                    const prov = e.target.value
                    setNewProvincia(prov)
                    setNewComuna(CHILE_DPA[newRegion][prov][0])
                  }}
                >
                  {provinciasList.map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Comuna</Typography>
                <Select fullWidth size="small" value={newComuna} onChange={(e) => setNewComuna(e.target.value)}>
                  {comunasList.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Tarifa (CLP)</Typography>
                <Stack direction="row" spacing={1}>
                  <TextField size="small" type="number" label="Tarifa" value={newRate} onChange={(e) => setNewRate(e.target.value)} />
                  <Button variant="contained" onClick={handleAddZone}>{editingId ? 'Guardar' : 'Agregar'}</Button>{editingId && <Button onClick={() => setEditingId(null)}>Cancelar</Button>}
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Columna Derecha: Simulador de Costo de Envío (P21) */}
        <Grid size={{ xs: 12, lg: 4.5 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Simulador de costo de envío
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Ingresa las características del paquete y la comuna de destino para calcular el costo proyectado.
            </Typography>

            <Typography variant="caption" sx={{ fontWeight: 700 }}>Peso del paquete (g)</Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={weightG}
              onChange={(e) => setWeightG(Math.max(1, Number(e.target.value)))}
              sx={{ mt: 0.5, mb: 2 }}
            />

            <Typography variant="caption" sx={{ fontWeight: 700 }}>Dimensiones del paquete (Ancho × Alto × Fondo cm)</Typography>
            <Grid container spacing={1} sx={{ mt: 0.25, mb: 2 }}>
              <Grid size={{ xs: 4 }}>
                <TextField size="small" type="number" value={dimW} onChange={(e) => setDimW(Number(e.target.value))} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField size="small" type="number" value={dimH} onChange={(e) => setDimH(Number(e.target.value))} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField size="small" type="number" value={dimD} onChange={(e) => setDimD(Number(e.target.value))} />
              </Grid>
            </Grid>

            <Typography variant="caption" sx={{ fontWeight: 700 }}>Comuna de destino</Typography>
            <Select fullWidth size="small" value={destComuna} onChange={(e) => setDestComuna(e.target.value)} sx={{ mt: 0.5, mb: 2 }}>
              {zones.map((z) => (
                <MenuItem key={z.id} value={z.comuna}>{z.comuna}</MenuItem>
              ))}
            </Select>

            <Button onClick={() => { logEvent('Simular envío', { weightG, dimW, dimH, dimD, destComuna, simulatedCost }); notify(`Costo estimado: ${formatCLP(simulatedCost)}`, 'info') }} variant="contained" fullWidth startIcon={<CalculateOutlined />} sx={{ mb: 2 }}>
              Calcular tarifa
            </Button>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Costo de envío estimado ({calcMethod === 'zona' ? 'Por Zona' : 'Volumétrico'})
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, my: 0.5 }}>
                {formatCLP(simulatedCost)} CLP
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Destino: {destComuna} · Peso: {weightG} g · Dimensiones: {dimW}×{dimH}×{dimD} cm ({volumetricKg.toFixed(2)} kg vol.)
              </Typography>
            </Paper>
          </Card>
        </Grid>
      </Grid>}

      {/* Tabla Inferior: Despachos y asignaciones de transporte (RF20 + Check 9) */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Despachos y asignaciones de transporte
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Estados de despacho: En preparación, Despachado, En reparto, Entregado.
        </Typography>

        <Table size="small">
          <TableHead sx={{ bgcolor: '#f7f6ff' }}>
            <TableRow>
              <TableCell>N° de pedido</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Transportista</TableCell>
              <TableCell>N° de seguimiento</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.filter(order => order.dispatch).map(order => ({ id: order.id, date: order.date.replace('\n', ' '), carrier: order.dispatch.carrier, tracking: order.dispatch.tracking, status: order.status })).map((sh) => (
              <TableRow key={sh.id}>
                <TableCell sx={{ fontWeight: 800 }}>{sh.id}</TableCell>
                <TableCell>{sh.date}</TableCell>
                <TableCell>{sh.carrier}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{sh.tracking}</TableCell>
                <TableCell><StatusChip status={sh.status} /></TableCell>
                <TableCell align="right">
                  <Button onClick={() => navigate(`/pedido/${sh.id}`)} variant="outlined" size="small">Ver detalles</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Stack direction="row"  sx={[{ justifyContent: "flex-end" }, { mt: 2.5 }]}>
          <Button onClick={() => { logEvent('Guardar configuración de despacho', { calcMethod, zones }); notify('Configuración de despacho guardada.') }} variant="contained" startIcon={<SaveOutlined />}>
            Guardar configuración
          </Button>
        </Stack>
      </Card>
    </Box>
  )
}
