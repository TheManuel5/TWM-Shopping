import {
  AccountCircleOutlined,
  Inventory2Outlined,
  StorefrontOutlined,
} from '@mui/icons-material'
import { Box, Paper, Typography } from '@mui/material'

const modules = [
  {
    title: 'Perfil de usuario',
    description: 'Información personal, direcciones y seguridad.',
    icon: <AccountCircleOutlined />,
  },
  {
    title: 'Primer módulo CRUD',
    description: 'Lectura, creación, edición y eliminación de registros.',
    icon: <Inventory2Outlined />,
  },
  {
    title: 'Segundo módulo CRUD',
    description: 'Segundo flujo de administración del proyecto.',
    icon: <StorefrontOutlined />,
  },
]

export default function Home() {
  return (
    <Box>
      <Typography component="h1" variant="h4" fontWeight={700}>
        Inicio
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Accede a los módulos principales de Shopping.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {modules.map((module) => (
          <Paper key={module.title} variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ color: 'primary.main', mb: 1 }}>{module.icon}</Box>
            <Typography variant="h6" fontWeight={700}>
              {module.title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {module.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  )
}
