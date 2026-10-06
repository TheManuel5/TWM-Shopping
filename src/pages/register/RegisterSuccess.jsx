import { CheckCircleOutlined } from '@mui/icons-material'
import { Box, Button, Link, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'

export default function RegisterSuccess() {
  return (
    <AuthPageShell
      headline="¡Bienvenido a bordo!"
      accentHeadline="Tu cuenta está lista"
      description="Ya formas parte de nuestra comunidad. Conecta con emprendedores y descubre productos y servicios increíbles."
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 18px 48px rgba(3, 12, 46, 0.14)',
        }}
      >
        <Box
          sx={{
            width: 58,
            height: 58,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            color: 'primary.main',
            mx: 'auto',
          }}
        >
          <CheckCircleOutlined />
        </Box>
        <Typography
          component="h2"
          sx={{
            mt: 1.5,
            color: 'text.primary',
            fontSize: '1.75rem',
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          ¡Registro exitoso!
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2.5, textAlign: 'center' }}>
          Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión y comenzar a explorar.
        </Typography>

        <Stack spacing={1.5}>
          <Button
            component={RouterLink}
            to="/login"
            fullWidth
            variant="contained"
            size="large"
            sx={{ minHeight: 48, fontWeight: 700 }}
          >
            Iniciar sesión
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          ¿Necesitas ayuda?{' '}
          <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 700 }}>
            Volver al registro
          </Link>
        </Typography>
      </Paper>
    </AuthPageShell>
  )
}
