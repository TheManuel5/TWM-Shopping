import { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  FormControl,
  MenuItem,
  Select,
} from '@mui/material'
import {
  TrendingUpOutlined,
  ShoppingCartOutlined,
  WarningAmberOutlined,
  DescriptionOutlined,
  HelpOutlineOutlined,
  Inventory2Outlined,
  ReplayOutlined,
  ChevronRightOutlined,
  CalendarMonthOutlined,
  StorefrontOutlined,
} from '@mui/icons-material'

import {
  metricas,
  ventasDiarias,
  accionesPendientes,
} from '../data/dashboardData'
import TransaccionesRecientes from './TransaccionesRecientes'
import ProductosMasVendidos from './ProductosMasVendidos'

const iconos = {
  1: <TrendingUpOutlined />,
  2: <ShoppingCartOutlined />,
  3: <WarningAmberOutlined />,
  4: <DescriptionOutlined />,
}

const meses = {
  '2026-09': { nombre: 'Septiembre', dias: 30 },
  '2026-08': { nombre: 'Agosto', dias: 31 },
}

// Solo septiembre de Tienda Sur utiliza los datos originales del diseño.
// Las otras combinaciones se generan como ejemplos para probar los filtros.
const factoresVentas = {
  sur: { '2026-09': 1, '2026-08': 0.82 },
  norte: { '2026-09': 0.68, '2026-08': 0.56 },
}

function obtenerVentasFiltradas(mes, tienda) {
  const factor = factoresVentas[tienda][mes]
  const datos = ventasDiarias.map(({ dia, ventas }) => ({
    dia,
    ventas: Math.round((ventas * factor) / 1000) * 1000,
  }))

  // Agosto tiene 31 días; sumamos un día de ejemplo al final.
  if (meses[mes].dias === 31) {
    datos.push({ dia: 31, ventas: Math.round((32000 * factor) / 1000) * 1000 })
  }

  return datos
}

export default function Dashboard() {
  const [mes, setMes] = useState('2026-09')
  const [tienda, setTienda] = useState('sur')

  const ventasFiltradas = useMemo(
    () => obtenerVentasFiltradas(mes, tienda),
    [mes, tienda],
  )
  const totalVentas = ventasFiltradas.reduce((acumulado, dia) => acumulado + dia.ventas, 0)
  const nombreMes = meses[mes].nombre

  return (
    <Box>
      {/* Encabezado con filtros, siguiendo el diseño de Figma */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 0.5 }}>
            Panel de control
          </Typography>
          <Typography color="text.secondary">
            Resumen de tu tienda, ventas, pedidos y actividad en Shopping.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CalendarMonthOutlined sx={{ color: 'primary.main', fontSize: 19 }} />
            <FormControl size="small">
              <Select
                value={mes}
                onChange={(evento) => setMes(evento.target.value)}
                inputProps={{ 'aria-label': 'Seleccionar mes de ventas' }}
                sx={{ bgcolor: 'background.paper', minWidth: 160, fontSize: 13 }}
              >
                <MenuItem value="2026-09">Septiembre 2026</MenuItem>
                <MenuItem value="2026-08">Agosto 2026</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <StorefrontOutlined sx={{ color: 'primary.main', fontSize: 19 }} />
            <FormControl size="small">
              <Select
                value={tienda}
                onChange={(evento) => setTienda(evento.target.value)}
                inputProps={{ 'aria-label': 'Seleccionar tienda' }}
                sx={{ bgcolor: 'background.paper', minWidth: 135, fontSize: 13 }}
              >
                <MenuItem value="sur">Tienda Sur</MenuItem>
                <MenuItem value="norte">Tienda Norte (demo)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* Indicadores: solo ventas cambia con los filtros; los otros aún son globales */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {metricas.map((metrica) => {
          const valor = metrica.id === 1 ? totalVentas : metrica.valor
          return (
            <Paper
              key={metrica.id}
              elevation={0}
              sx={{ p: 2.5, border: '1px solid #e2e0ff', borderRadius: 3, minWidth: 0 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  {metrica.titulo}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    color: 'primary.main',
                    borderRadius: 2,
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                  }}
                >
                  {iconos[metrica.id]}
                </Box>
              </Box>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                {metrica.tipo === 'moneda' ? `$${valor.toLocaleString('es-CL')}` : valor}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                {/* El porcentaje de variación original solo corresponde al filtro inicial. */}
                {metrica.id !== 1 || (mes === '2026-09' && tienda === 'sur') ? (
                  <>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ color: metrica.color === 'success' ? '#00c853' : '#ff9800' }}
                    >
                      {metrica.cambio}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {metrica.descripcion}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Datos de demostración
                  </Typography>
                )}
              </Box>
            </Paper>
          )
        })}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.65fr) minmax(0, 1fr)' },
          gap: 2,
          mt: 2.5,
          alignItems: 'stretch',
        }}
      >
        <GraficoVentas datos={ventasFiltradas} mes={nombreMes} total={totalVentas} />
        <AccionesPendientes />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.65fr) minmax(0, 1fr)' },
          gap: 2,
          mt: 2.5,
          alignItems: 'stretch',
        }}
      >
        <TransaccionesRecientes />
        <ProductosMasVendidos />
      </Box>
    </Box>
  )
}

function GraficoVentas({ datos, mes, total }) {
  const ventaMaxima = Math.max(1, ...datos.map((dia) => dia.ventas))
  const ultimoDia = datos.length
  const abreviaturaMes = mes.slice(0, 3)

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, border: '1px solid #e2e0ff', borderRadius: 3, minWidth: 0 }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          mb: 4,
        }}
      >
        <Typography fontWeight={700}>Ventas diarias</Typography>
        <Typography variant="body2" color="text.secondary">
          Total de {mes.toLowerCase()}:{' '}
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
            ${total.toLocaleString('es-CL')}
          </Box>
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: { xs: 0.4, sm: 0.7 },
          height: 220,
          borderBottom: '1px solid #e2e0ff',
          pb: 1,
        }}
      >
        {datos.map((dia) => (
          <Box
            key={dia.dia}
            title={`${dia.dia} ${abreviaturaMes}: $${dia.ventas.toLocaleString('es-CL')}`}
            sx={{
              flex: 1,
              minWidth: 0,
              height: `${(dia.ventas / ventaMaxima) * 100}%`,
              bgcolor: 'primary.main',
              borderRadius: '3px 3px 0 0',
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
        {[1, 10, 20, ultimoDia].map((dia) => (
          <Typography key={dia} variant="caption" color="text.secondary">
            {dia} {abreviaturaMes}
          </Typography>
        ))}
      </Box>
    </Paper>
  )
}

function AccionesPendientes() {
  const iconosAcciones = {
    1: <HelpOutlineOutlined />,
    2: <Inventory2Outlined />,
    3: <ReplayOutlined />,
  }

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, border: '1px solid #e2e0ff', borderRadius: 3, minWidth: 0 }}
    >
      <Typography fontWeight={700} sx={{ mb: 2.5 }}>Acciones pendientes</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {accionesPendientes.map((accion) => (
          <Box
            key={accion.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              bgcolor: '#f7f6ff',
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#eae5ff',
                color: 'primary.main',
                borderRadius: 2,
              }}
            >
              {iconosAcciones[accion.id]}
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600}>{accion.titulo}</Typography>
              <Typography variant="caption" color="text.secondary">
                {accion.descripcion}
              </Typography>
            </Box>
            <Box
              sx={{
                minWidth: 28,
                height: 28,
                px: 1,
                bgcolor: '#eae5ff',
                color: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {accion.cantidad}
            </Box>
            <ChevronRightOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
