
import {
  Box,
  Paper,
  Typography,
} from '@mui/material'

import { Inventory2Outlined } from '@mui/icons-material'

import { productosMasVendidos } from '../data/dashboardData'

export default function ProductosMasVendidos() {
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
        Productos más vendidos
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {productosMasVendidos.map((producto) => (
          <Box
            key={producto.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor: '#f7f7f8',
              borderRadius: 2,
              p: 1.5,
            }}
          >
            {/* Posición en el ranking */}
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              {producto.id}
            </Typography>

            {/* Imagen provisional del producto */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 42,
                height: 42,
                flexShrink: 0,
                bgcolor: '#ffffff',
                borderRadius: 2,
                color: 'primary.main',
              }}
            >
              <Inventory2Outlined />
            </Box>

            {/* Información del producto */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                noWrap
              >
                {producto.nombre}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {producto.unidades} unidades vendidas
              </Typography>
            </Box>

            {/* Precio */}
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ whiteSpace: 'nowrap' }}
            >
              ${producto.precio.toLocaleString('es-CL')}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
