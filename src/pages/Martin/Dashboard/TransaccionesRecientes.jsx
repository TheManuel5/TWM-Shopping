
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'

import { CreditCardOutlined } from '@mui/icons-material'

import { transaccionesRecientes } from '../data/dashboardData'

// Colores para los distintos estados
const coloresEstado = {
  Pendiente: {
    fondo: '#fff3d6',
    texto: '#d58a00',
  },
  Completado: {
    fondo: '#dcfce7',
    texto: '#00a650',
  },
  Cancelado: {
    fondo: '#ffe4e6',
    texto: '#e53935',
  },
}

export default function TransaccionesRecientes() {
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
      <Typography fontWeight={700} sx={{ mb: 2 }}>
        Transacciones recientes
      </Typography>

      <TableContainer>
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {[
                'PEDIDO',
                'FECHA',
                'CLIENTE',
                'PRODUCTO',
                'TOTAL',
                'ESTADO',
                'PAGO',
              ].map((columna) => (
                <TableCell
                  key={columna}
                  sx={{
                    color: 'text.secondary',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {columna}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {transaccionesRecientes.map((pedido) => {
              const colores = coloresEstado[pedido.estado] ?? {
                fondo: '#eeeeee',
                texto: '#626680',
              }

              return (
                <TableRow key={pedido.id} hover>
                  <TableCell
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                    }}
                  >
                    #{pedido.id}
                  </TableCell>

                  <TableCell
                    sx={{
                      whiteSpace: 'nowrap',
                      color: 'text.secondary',
                    }}
                  >
                    {pedido.fecha}
                  </TableCell>

                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {pedido.cliente}
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ maxWidth: 105 }}
                    >
                      {pedido.producto}
                    </Typography>
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ${pedido.total.toLocaleString('es-CL')}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={pedido.estado}
                      size="small"
                      sx={{
                        bgcolor: colores.fondo,
                        color: colores.texto,
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'text.secondary',
                      }}
                    >
                      <CreditCardOutlined fontSize="small" />

                      <Typography variant="caption">
                        {pedido.pago}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
