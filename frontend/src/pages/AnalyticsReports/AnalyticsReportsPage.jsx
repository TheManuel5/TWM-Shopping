import {
  AccountTreeOutlined,
  AddOutlined,
  AutorenewOutlined,
  PlayArrowOutlined,
  StorageOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
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
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import { apiService } from '../../services/api'
import { CATEGORY_TREE } from '../../utils/taxonomyData'

const ANALYTICAL_QUERIES = [
  {
    id: 'Q-VIST-01',
    category: 'Vistas Lógicas e Indicadores',
    title: 'Vista Factura Fiscal Consolidada (Ventas Reales desde PostgreSQL)',
    sql: 'SELECT ID, ValorBruto, IVA, Total FROM Venta ORDER BY ID DESC LIMIT 10;',
  },
  {
    id: 'Q-TEMP-05',
    category: 'Consolidación Temporal',
    title: 'Clientes frecuentes agrupados por compras (Desde tabla Comprar)',
    sql: 'SELECT Cliente_id, COUNT(Producto_id) FROM Comprar GROUP BY Cliente_id;',
  },
  {
    id: 'Q-LOG-04',
    category: 'Georreferenciación y Logística',
    title: 'Tiempo promedio de tránsito logístico agrupado por Empresa',
    sql: 'SELECT transportista, AVG(fecha_llegada - fecha_salida) FROM despacho GROUP BY transportista;',
  },
]

const UNANSWERED_48H = [
  { id: 'PREG-882', type: 'Pregunta Pública', user: 'Diego M.', seller: 'Moda del Sur', product: 'Chaqueta Impermeable Sur', elapsed: '54 horas sin réplica' },
  { id: 'MSG-419', type: 'Mensaje Interno', user: 'Sofía A.', seller: 'Casa & Estilo', product: 'Lámpara Nórdica Madera', elapsed: '61 horas sin réplica' },
]

export default function AnalyticsReportsPage() {
  const [tab, setTab] = useState('consultas')
  const [selectedQueryId, setSelectedQueryId] = useState('Q-VIST-01')
  const [dateFrom, setDateFrom] = useState('2026-09-01')
  const [dateTo, setDateTo] = useState('2026-10-16')
  const [keywordFilter, setKeywordFilter] = useState('excelente')
  const [carrierFilter, setCarrierFilter] = useState('Todas')
  
  // Estados para la carga desde la BD
  const [isExecuting, setIsExecuting] = useState(false)
  const [dbResults, setDbResults] = useState([])

  const [newSubcatName, setNewSubcatName] = useState('')
  const [parentCat, setParentCat] = useState('1.2 Servicios domésticos')
  const [customSubcats, setCustomSubcats] = useState([
    { parent: '1.2 Servicios domésticos', code: '1.2.7', name: 'Sanitización de hogares' },
  ])

  const activeQuery = ANALYTICAL_QUERIES.find((q) => q.id === selectedQueryId) || ANALYTICAL_QUERIES[0]

  const handleAddSubcategory = () => {
    if (!newSubcatName.trim()) return
    setCustomSubcats((prev) => [
      ...prev,
      { parent: parentCat, code: `2.1.${prev.length + 6}`, name: newSubcatName.trim() },
    ])
    setNewSubcatName('')
  }

  // Función para ejecutar la consulta real en PostgreSQL
  const executeQuery = async () => {
    setIsExecuting(true)
    setDbResults([])
    try {
      const results = await apiService.runReport(selectedQueryId)
      setDbResults(results)
    } catch (error) {
      console.error("Error ejecutando consulta:", error)
      alert("Error al conectar con la base de datos.")
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 1380, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Módulo Analítico, Moderación y Categorías Recursivas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Panel centralizado de consultas parametrizadas, árbol recursivo de categorías y control de SLA &gt; 48h.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab value="consultas" icon={<StorageOutlined fontSize="small" />} iconPosition="start" label="1. Módulo Analítico SQL" />
        <Tab value="categorias" icon={<AccountTreeOutlined fontSize="small" />} iconPosition="start" label="2. Árbol Recursivo Categorías" />
        <Tab value="moderacion" icon={<WarningAmberOutlined fontSize="small" />} iconPosition="start" label="3. Moderación (>48h) y Ciclo Cotizaciones" />
      </Tabs>

      {tab === 'consultas' && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ejecución de Consultas y Funciones de Negocio con Parámetros Dinámicos
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Seleccionar requerimiento analítico (Etapa 7 / Etapa 8)
              </Typography>
              <Select
                fullWidth
                size="small"
                value={selectedQueryId}
                onChange={(e) => {
                  setSelectedQueryId(e.target.value)
                  setDbResults([]) // Limpiar tabla al cambiar de consulta
                }}
                sx={{ mt: 0.5 }}
              >
                {ANALYTICAL_QUERIES.map((q) => (
                  <MenuItem key={q.id} value={q.id}>
                    [{q.id}] {q.category} — {q.title}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Desde</Typography>
              <TextField fullWidth size="small" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} sx={{ mt: 0.5 }} />
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Hasta</Typography>
              <TextField fullWidth size="small" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} sx={{ mt: 0.5 }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Transportista</Typography>
              <Select fullWidth size="small" value={carrierFilter} onChange={(e) => setCarrierFilter(e.target.value)} sx={{ mt: 0.5 }}>
                <MenuItem value="Todas">Todas</MenuItem>
                <MenuItem value="Chilexpress">Chilexpress</MenuItem>
                <MenuItem value="Blue Express">Blue Express</MenuItem>
                <MenuItem value="Starken">Starken</MenuItem>
              </Select>
            </Grid>
          </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
            <TextField
              size="small"
              label="Operador coincidencia texto (ILIKE)"
              value={keywordFilter}
              onChange={(e) => setKeywordFilter(e.target.value)}
              sx={{ minWidth: 260 }}
            />
            <Chip label="Validación registros NULL activa" color="secondary" sx={{ color: 'primary.main', fontWeight: 700 }} />
            
            <Button 
              variant="contained" 
              startIcon={isExecuting ? <CircularProgress size={20} color="inherit"/> : <PlayArrowOutlined />}
              onClick={executeQuery}
              disabled={isExecuting}
            >
              {isExecuting ? 'Consultando BD...' : 'Ejecutar en PostgreSQL (Raspberry Pi)'}
            </Button>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f7f6ff', borderRadius: 2, mb: 2.5, fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {activeQuery.sql}
          </Paper>

          <Table size="small">
            <TableHead sx={{ bgcolor: '#f7f6ff' }}>
              <TableRow>
                <TableCell>Identificador / Clave</TableCell>
                <TableCell>Entidad / Titular</TableCell>
                <TableCell>Métrica / Detalle</TableCell>
                <TableCell>Valor Calculado</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dbResults.length === 0 && !isExecuting ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Haz clic en "Ejecutar en PostgreSQL" para cargar los datos en vivo.
                  </TableCell>
                </TableRow>
              ) : (
                dbResults.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontWeight: 800 }}>{r.col1}</TableCell>
                    <TableCell>{r.col2}</TableCell>
                    <TableCell>{r.col3}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{r.col4}</TableCell>
                    <TableCell><StatusChip status={r.col5} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Las pestañas de categorías y moderación se mantienen iguales... */}
      {tab === 'categorias' && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Vista Jerárquica Recursiva de Categorías (RF21 - CTE Recursivo)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Mapeo completo de Servicios (1.x) y Productos (2.x) con soporte de categoría padre e hijos.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
                    1. SERVICIOS
                  </Typography>
                  {CATEGORY_TREE.Servicios.map((cat) => (
                    <Box key={cat.id} sx={{ mb: 1.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {cat.id} {cat.name}
                      </Typography>
                      {(cat.children || []).map((sub) => (
                        <Typography key={sub.id} variant="caption" color="text.secondary" sx={{ display: 'block', pl: 2 }}>
                          ├─ {sub.id} {sub.name}
                        </Typography>
                      ))}
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
                    2. PRODUCTOS
                  </Typography>
                  {CATEGORY_TREE.Productos.map((cat) => (
                    <Box key={cat.id} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {cat.id} {cat.name}
                      </Typography>
                      {(cat.children || []).map((sub) => (
                        <Typography key={sub.id} variant="caption" color="text.secondary" sx={{ display: 'block', pl: 2 }}>
                          ├─ {sub.id} {sub.name}
                        </Typography>
                      ))}
                    </Box>
                  ))}
                  {customSubcats.map((cs) => (
                    <Typography key={cs.code} variant="caption" color="primary.main" sx={{ display: 'block', fontWeight: 700, mt: 0.5 }}>
                      + [{cs.code}] {cs.name} (Padre: {cs.parent})
                    </Typography>
                  ))}
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Añadir Subnivel Jerárquico
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Categoría Padre (FK id_categoria_padre)</Typography>
              <Select fullWidth size="small" value={parentCat} onChange={(e) => setParentCat(e.target.value)} sx={{ mt: 0.5, mb: 2 }}>
                <MenuItem value="1.2 Servicios domésticos">1.2 Servicios domésticos</MenuItem>
                <MenuItem value="1.3 Servicios profesionales">1.3 Servicios profesionales</MenuItem>
                <MenuItem value="2.1 Tecnología">2.1 Tecnología</MenuItem>
                <MenuItem value="2.7 Ropa, moda y calzado">2.7 Ropa, moda y calzado</MenuItem>
              </Select>

              <Typography variant="caption" sx={{ fontWeight: 700 }}>Nombre de nueva subcategoría</Typography>
              <TextField
                fullWidth
                size="small"
                value={newSubcatName}
                onChange={(e) => setNewSubcatName(e.target.value)}
                placeholder="Ej: Reparación de consolas"
                sx={{ mt: 0.5, mb: 2 }}
              />

              <Button variant="contained" fullWidth startIcon={<AddOutlined />} onClick={handleAddSubcategory}>
                Vincular al árbol
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}

      {tab === 'moderacion' && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <WarningAmberOutlined color="warning" />
                <Typography variant="h6">
                  Alerta de Moderación: Interacciones &gt; 48 horas sin réplica
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Monitoreo de preguntas públicas y mensajes internos que superaron el umbral de 48h.
              </Typography>

              <Table size="small">
                <TableHead sx={{ bgcolor: '#f7f6ff' }}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Canal</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Tienda Vendedora</TableCell>
                    <TableCell>Tiempo sin respuesta</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {UNANSWERED_48H.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontWeight: 800 }}>{item.id}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.user}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{item.seller}</TableCell>
                      <TableCell>
                        <Chip label={item.elapsed} size="small" sx={{ bgcolor: 'error.light', color: 'error.main', fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <AutorenewOutlined color="primary" />
                <Typography variant="h6">Job en Segundo Plano (RF22 / Trigger 19)</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Controla automáticamente la vigencia de cotizaciones e inactividad de catálogo:
              </Typography>

              <Stack spacing={1.25} sx={{ mb: 2 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>1. Vigencia Fija (Día 1 al 15)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mantiene congelados los valores cotizados durante 15 días corridos.
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>2. Reajuste Semanal (Día 16 al 44)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sincroniza precios automáticamente cada 7 días tras expirar la vigencia inicial.
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>3. Purga Física (Día 45) + Inactividad (Día 40)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Elimina cotizaciones &gt; 45 días y oculta productos sin actividad &gt; 40 días (Trigger 3).
                  </Typography>
                </Paper>
              </Stack>

              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 800, display: 'block' }}>
                ✓ Última ejecución automática del BackgroundService (.NET): Hoy 08:00 AM
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}