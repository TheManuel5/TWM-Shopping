import { StorefrontOutlined } from '@mui/icons-material'
import { Box, Paper, Typography } from '@mui/material'

export default function CrudTwoPlaceholder() {
  return (
    <Box>
      <Typography component="h1" variant="h4" fontWeight={700}>
        CRUD 2
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Espacio reservado para el segundo módulo CRUD.
      </Typography>
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <StorefrontOutlined color="primary" sx={{ fontSize: 56 }} />
        <Typography variant="h6" sx={{ mt: 1 }}>
          Módulo pendiente de integración
        </Typography>
        <Typography color="text.secondary">
          Aquí se conectará el trabajo de Manuel y Seba.
        </Typography>
      </Paper>
    </Box>
  )
}
