import {
  BadgeOutlined,
  EmailOutlined,
  LockOutlined,
  PersonAddOutlined,
  PersonOutlineOutlined,
  ShoppingCartOutlined,
  StorefrontOutlined,
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'

const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    height: 48,
    bgcolor: 'background.paper',
  },
}

function RegisterField({ children, htmlFor }) {
  return (
    <Typography
      component="label"
      htmlFor={htmlFor}
      variant="caption"
      sx={{ mb: 0.6, display: 'block', fontWeight: 700 }}
    >
      {children}
    </Typography>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ nombre: '', rut: '', email: '', password: '', rol: 'cliente' })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Datos de Registro capturados:', formData)
    navigate('/register-success', { replace: true })
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
          <PersonAddOutlined />
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
          Crear cuenta
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2.5, textAlign: 'center' }}>
          Completa tus datos para registrarte.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{ mb: 0.6, display: 'block', fontWeight: 700 }}
          >
            Tipo de cuenta
          </Typography>
          <ToggleButtonGroup
            value={formData.rol}
            exclusive
            onChange={(_, newRol) => {
              if (newRol !== null) {
                setFormData((currentData) => ({ ...currentData, rol: newRol }))
              }
            }}
            fullWidth
            sx={{
              height: 48,
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                gap: 1,
                borderColor: 'divider',
                color: 'text.secondary',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              },
            }}
          >
            <ToggleButton value="cliente">
              <ShoppingCartOutlined fontSize="small" />
              Cliente
            </ToggleButton>
            <ToggleButton value="vendedor">
              <StorefrontOutlined fontSize="small" />
              Vendedor
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Stack spacing={1.5}>
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
            sx={{ minHeight: 48, fontWeight: 700 }}
          >
            Registrarse
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 700 }}>
            Iniciar sesión
          </Link>
        </Typography>
      </Paper>
    </AuthPageShell>
  )
}
