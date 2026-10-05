import { Inventory2Outlined } from '@mui/icons-material'
import { Box, Paper, Typography } from '@mui/material'

export default function CrudOnePlaceholder() {
  return (
    <Box>
      <Typography component="h1" variant="h4" fontWeight={700}>
        CRUD 1
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Espacio reservado para el primer módulo CRUD.
      </Typography>
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Inventory2Outlined color="primary" sx={{ fontSize: 56 }} />
        <Typography variant="h6" sx={{ mt: 1 }}>
          Módulo pendiente de integración
        </Typography>
        <Typography color="text.secondary">
          Aquí se conectará el trabajo de Rolando y Gaby.
        </Typography>
      </Paper>
    </Box>
  )
}
