
import { Box, Typography, Paper } from '@mui/material'

import {
  TrendingUpOutlined,
  ShoppingCartOutlined,
  WarningAmberOutlined,
  DescriptionOutlined,
  HelpOutlineOutlined,
  Inventory2Outlined,
  ReplayOutlined,
} from '@mui/icons-material'

import {
  metricas,
  ventasDiarias,
  accionesPendientes,
} from '../data/dashboardData'

import TransaccionesRecientes from './TransaccionesRecientes'
import ProductosMasVendidos from './ProductosMasVendidos'

// Iconos de las tarjetas de estadísticas
const iconos = {
  1: <TrendingUpOutlined />,
  2: <ShoppingCartOutlined />,
  3: <WarningAmberOutlined />,
  4: <DescriptionOutlined />,
}

// COMPONENTE PRINCIPAL
export default function Dashboard() {
  return (
    <Box>
      {/* Encabezado de la página */}
      <Typography
        variant="h4"
        component="h1"
        fontWeight={700}
        sx={{ mb: 0.5 }}
      >
        Panel de control
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Resumen de tu tienda, ventas, pedidos y actividad en Shopping.
      </Typography>

      {/* SECCIÓN 1: Tarjetas de estadísticas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {metricas.map((metrica) => (
          <Paper
            key={metrica.id}
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #e2e0ff',
              borderRadius: 3,
              minWidth: 0,
            }}
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
              <Typography
                color="text.secondary"
                variant="body2"
              >
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

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mb: 0.5 }}
            >
              {metrica.tipo === 'moneda'
                ? `$${metrica.valor.toLocaleString('es-CL')}`
                : metrica.valor}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{
                  color:
                    metrica.color === 'success'
                      ? '#00c853'
                      : '#ff9800',
                }}
              >
                {metrica.cambio}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {metrica.descripcion}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* SECCIÓN 2: Gráfico y acciones pendientes */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.65fr) minmax(0, 1fr)',
          },
          gap: 2,
          mt: 2.5,
          alignItems: 'stretch',
        }}
      >
        <GraficoVentas />
        <AccionesPendientes />
      </Box>

      {/* SECCIÓN 3: Transacciones y productos más vendidos */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.65fr) minmax(0, 1fr)',
          },
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

// COMPONENTE: Gráfico de ventas diarias
function GraficoVentas() {
  const ventaMaxima = Math.max(
    ...ventasDiarias.map((dia) => dia.ventas)
  )

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid #e2e0ff',
        borderRadius: 3,
        minWidth: 0,
      }}
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
        <Typography fontWeight={700}>
          Ventas diarias
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Total del mes:{' '}
          <Box
            component="span"
            sx={{
              color: 'text.primary',
              fontWeight: 700,
            }}
          >
            ${ventasDiarias
              .reduce((total, dia) => total + dia.ventas, 0)
              .toLocaleString('es-CL')}
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
        {ventasDiarias.map((dia) => (
          <Box
            key={dia.dia}
            title={`${dia.dia} Sep: $${dia.ventas.toLocaleString('es-CL')}`}
            sx={{
              flex: 1,
              minWidth: 0,
              height: `${
                ventaMaxima > 0
                  ? (dia.ventas / ventaMaxima) * 100
                  : 0
              }%`,
              bgcolor: 'primary.main',
              borderRadius: '3px 3px 0 0',
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 1.5,
        }}
      >
        {['1 Sep', '10 Sep', '20 Sep', '30 Sep'].map(
          (fecha) => (
            <Typography
              key={fecha}
              variant="caption"
              color="text.secondary"
            >
              {fecha}
            </Typography>
          )
        )}
      </Box>
    </Paper>
  )
}

// COMPONENTE: Acciones pendientes
function AccionesPendientes() {
  const iconosAcciones = {
    1: <HelpOutlineOutlined />,
    2: <Inventory2Outlined />,
    3: <ReplayOutlined />,
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid #e2e0ff',
        borderRadius: 3,
      }}
    >
      <Typography fontWeight={700} sx={{ mb: 2 }}>
        Acciones pendientes
      </Typography>

      {accionesPendientes.map((accion) => (
        <Box
          key={accion.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            mb: 1,
            bgcolor: '#f7f7f8',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              color: 'primary.main',
              bgcolor: 'white',
              p: 1,
              display: 'flex',
              borderRadius: 2,
            }}
          >
            {iconosAcciones[accion.id]}
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
            >
              {accion.titulo}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {accion.descripcion}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            fontWeight={700}
            color="primary.main"
          >
            {accion.cantidad}
          </Typography>
        </Box>
      ))}
    </Paper>
  )
}
