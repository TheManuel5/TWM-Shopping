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
import { CHILE_DPA, formatCLP } from '../../utils/taxonomyData'

const INITIAL_ZONES = [
  { id: 1, region: 'Los Lagos', provincia: 'Osorno', comuna: 'Osorno', rate: 3570 },
  { id: 2, region: 'Los Lagos', provincia: 'Llanquihue', comuna: 'Puerto Montt', rate: 4760 },
  { id: 3, region: 'Los Ríos', provincia: 'Valdivia', comuna: 'Valdivia', rate: 5950 },
]

// Estados exactos de Restricción Check 9 del PDF (En preparación, Despachado, En reparto, Entregado)
const SHIPMENTS = [
  { id: '#SH1003287', date: '22 sep 2026', carrier: 'Blue Express', tracking: '712345678901', status: 'En preparación' },
  { id: '#SH1003271', date: '21 sep 2026', carrier: 'Chilexpress', tracking: '600123456789', status: 'Despachado' },
  { id: '#SH1003254', date: '20 sep 2026', carrier: 'Starken', tracking: '990876543210', status: 'En reparto' },
  { id: '#SH1003241', date: '18 sep 2026', carrier: 'Blue Express', tracking: '712300098765', status: 'Entregado' },
]

export default function ShippingRatesPage() {
  const [calcMethod, setCalcMethod] = useState('zona')
  const [zones, setZones] = useState(INITIAL_ZONES)

  const [newRegion, setNewRegion] = useState('Los Lagos')
  const [newProvincia, setNewProvincia] = useState('Osorno')
  const [newComuna, setNewComuna] = useState('Puerto Octay')
  const [newRate, setNewRate] = useState(4200)

  // Simulador de Costo de Envío (P21)
  const [weightG, setWeightG] = useState(650)
  const [dimW, setDimW] = useState(32)
  const [dimH, setDimH] = useState(20)
  const [dimD, setDimD] = useState(12)
  const [destComuna, setDestComuna] = useState('Osorno')

  const baseZoneRate = zones.find((z) => z.comuna === destComuna)?.rate || 3570
  const volumetricKg = (dimW * dimH * dimD) / 5000
  const realKg = weightG / 1000
  const billableKg = Math.max(realKg, volumetricKg)
  const simulatedCost =
    calcMethod === 'zona'
      ? baseZoneRate
      : Math.round(baseZoneRate + billableKg * 850)

  const handleAddZone = () => {
    if (!newRate) return
    setZones((prev) => [
      ...prev,
      { id: Date.now(), region: newRegion, provincia: newProvincia, comuna: newComuna, rate: Number(newRate) },
    ])
  }

  const provinciasList = Object.keys(CHILE_DPA[newRegion] || {})
  const comunasList = CHILE_DPA[newRegion]?.[newProvincia] || []

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Despachos y costos de envío
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Configura las zonas geográficas (DPA Chile), tarifas dinámicas por volumen y seguimiento de transportistas (RF14 / RF20).
      </Typography>

      <Tabs value="Tarifas" sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab value="Seguimiento" label="Seguimiento" />
        <Tab value="Tarifas" label="Tarifas" />
      </Tabs>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Columna Izquierda: Método de cálculo y Tabla de Zonas (P21) */}
        <Grid item xs={12} lg={7.5}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Método de cálculo de envío (RF14)
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
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Por peso y dimensiones (Trigger 2)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fórmula: Tarifa Base + máx(Peso Real, Ancho×Alto×Fondo / 5000) × $850
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Zonas y tarifas</Typography>
                <Typography variant="caption" color="text.secondary">
                  Integra Región, Provincia y Comuna de Chile.sql
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
                      <IconButton size="small"><EditOutlined fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setZones((prev) => prev.filter((item) => item.id !== z.id))}>
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Formulario inferior para añadir nueva Comuna */}
            <Grid container spacing={1.5} alignItems="flex-end">
              <Grid item xs={12} sm={3}>
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
              <Grid item xs={12} sm={3}>
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
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Comuna</Typography>
                <Select fullWidth size="small" value={newComuna} onChange={(e) => setNewComuna(e.target.value)}>
                  {comunasList.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Tarifa (CLP)</Typography>
                <Stack direction="row" spacing={1}>
                  <TextField size="small" type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} />
                  <Button variant="contained" onClick={handleAddZone}>Agregar</Button>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Columna Derecha: Simulador de Costo de Envío (P21) */}
        <Grid item xs={12} lg={4.5}>
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
              <Grid item xs={4}>
                <TextField size="small" type="number" value={dimW} onChange={(e) => setDimW(Number(e.target.value))} />
              </Grid>
              <Grid item xs={4}>
                <TextField size="small" type="number" value={dimH} onChange={(e) => setDimH(Number(e.target.value))} />
              </Grid>
              <Grid item xs={4}>
                <TextField size="small" type="number" value={dimD} onChange={(e) => setDimD(Number(e.target.value))} />
              </Grid>
            </Grid>

            <Typography variant="caption" sx={{ fontWeight: 700 }}>Comuna de destino</Typography>
            <Select fullWidth size="small" value={destComuna} onChange={(e) => setDestComuna(e.target.value)} sx={{ mt: 0.5, mb: 2 }}>
              {zones.map((z) => (
                <MenuItem key={z.id} value={z.comuna}>{z.comuna}</MenuItem>
              ))}
            </Select>

            <Button variant="contained" fullWidth startIcon={<CalculateOutlined />} sx={{ mb: 2 }}>
              Calcular tarifa
            </Button>

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Costo de envío estimado ({calcMethod === 'zona' ? 'Por Zona' : 'Volumétrico Trigger 2'})
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
      </Grid>

      {/* Tabla Inferior: Despachos y asignaciones de transporte (RF20 + Check 9) */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          Despachos y asignaciones de transporte (RF20)
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Estados validados según Restricción Check 9: En preparación, Despachado, En reparto, Entregado.
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
            {SHIPMENTS.map((sh) => (
              <TableRow key={sh.id}>
                <TableCell sx={{ fontWeight: 800 }}>{sh.id}</TableCell>
                <TableCell>{sh.date}</TableCell>
                <TableCell>{sh.carrier}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{sh.tracking}</TableCell>
                <TableCell><StatusChip status={sh.status} /></TableCell>
                <TableCell align="right">
                  <Button variant="outlined" size="small">Ver detalles</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2.5 }}>
          <Button variant="contained" startIcon={<SaveOutlined />}>
            Guardar configuración
          </Button>
        </Stack>
      </Card>
    </Box>
  )
}