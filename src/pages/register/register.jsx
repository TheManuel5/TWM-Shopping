import {
  BadgeOutlined,
  EmailOutlined,
  LockOutlined,
  PersonAddOutlined,
  PersonOutlineOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'

const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    height: 46,
    bgcolor: 'background.paper',
  },
}

function RegisterField({ children, htmlFor }) {
  return (
    <Typography
      component="label"
      htmlFor={htmlFor}
      variant="caption"
      sx={{ mb: 0.5, display: 'block', fontWeight: 700 }}
    >
      {children}
    </Typography>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ nombre: '', rut: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Datos de Registro capturados:', formData)
    navigate('/login', { replace: true })
  }

  return (
    <AuthPageShell
      headline="Únete y descubre,"
      accentHeadline="un mundo de opciones"
      description="Crea tu cuenta gratis para conectar con emprendedores y acceder a los mejores productos y servicios."
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 18px 48px rgba(3, 12, 46, 0.14)',
        }}
      >
        <Box
          sx={{
            width: 54,
            height: 54,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            color: 'primary.main',
            mx: 'auto',
          }}
        >
          <PersonAddOutlined />
        </Box>
        <Typography
          component="h2"
          sx={{
            mt: 1,
            mb: 1.5,
            color: 'text.primary',
            fontSize: '1.75rem',
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          Crear cuenta
        </Typography>

        <Stack spacing={1.15}>
          <Box>
            <RegisterField htmlFor="register-name">Nombre completo</RegisterField>
            <TextField
              id="register-name"
              required
              fullWidth
              name="nombre"
              placeholder="Ej. Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              sx={fieldStyles}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box>
            <RegisterField htmlFor="register-rut">RUT</RegisterField>
            <TextField
              id="register-rut"
              required
              fullWidth
              name="rut"
              placeholder="12.345.678-9"
              value={formData.rut}
              onChange={handleChange}
              sx={fieldStyles}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box>
            <RegisterField htmlFor="register-email">Correo electrónico</RegisterField>
            <TextField
              id="register-email"
              required
              fullWidth
              name="email"
              type="email"
              placeholder="juan@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              sx={fieldStyles}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box>
            <RegisterField htmlFor="register-password">Contraseña</RegisterField>
            <TextField
              id="register-password"
              required
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Crea una contraseña segura"
              value={formData.password}
              onChange={handleChange}
              sx={fieldStyles}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword((currentValue) => !currentValue)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ minHeight: 46, fontWeight: 700 }}
          >
            Registrarse
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, textAlign: 'center' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 700 }}>
            Iniciar sesión
          </Link>
        </Typography>
      </Paper>
    </AuthPageShell>
  )
}
