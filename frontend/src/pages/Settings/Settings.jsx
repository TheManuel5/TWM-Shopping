import { SettingsOutlined } from '@mui/icons-material'
import { Box, Paper, Typography } from '@mui/material'

export default function Settings() {
  return (
    <Box>
      <Typography component="h1" variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
        Configuración
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Preferencias generales de la cuenta y de la aplicación.
      </Typography>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, textAlign: 'center' }}>
        <SettingsOutlined color="primary" sx={{ fontSize: 56 }} />
        <Typography variant="h6" sx={{ mt: 1 }}>
          Configuración preparada
        </Typography>
        <Typography color="text.secondary">
          Esta vista queda disponible para futuras opciones del proyecto.
        </Typography>
      </Paper>
    </Box>
  )
}
