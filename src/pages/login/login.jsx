import {
  LockOutlined,
  PersonOutlineOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import AuthPageShell from '../../components/auth/AuthPageShell'
import useAuth from '../../contexts/AuthContext/useAuth'

const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    height: 48,
    bgcolor: 'background.paper',
  },
}

export default function Login() {
  const [formData, setFormData] = useState({ rut: '', password: '', recordarSesion: false })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Datos de inicio de sesión:', formData)
    login(formData)
    navigate(location.state?.from ?? '/inicio', { replace: true })
  }

  return (
    <AuthPageShell
      headline="Todo lo que buscas,"
      accentHeadline="en un solo lugar"
      description="Conecta con emprendedores, descubre productos y servicios increíbles y realiza tus compras de forma segura."
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
          <LockOutlined />
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
          Iniciar sesión
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2.5, textAlign: 'center' }}>
          Ingresa tus datos para continuar.
        </Typography>

        <Stack spacing={1.5}>
          <Box>
            <Typography
              component="label"
              htmlFor="login-rut"
              variant="caption"
              sx={{ mb: 0.6, display: 'block', fontWeight: 700 }}
            >
              RUT
            </Typography>
            <TextField
              id="login-rut"
              fullWidth
              required
              name="rut"
              placeholder="12.345.678-9"
              value={formData.rut}
              onChange={updateField}
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Ingresa tu RUT con formato 12.345.678-9.
            </Typography>
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="login-password"
              variant="caption"
              sx={{ mb: 0.6, display: 'block', fontWeight: 700 }}
            >
              Contraseña
            </Typography>
            <TextField
              id="login-password"
              fullWidth
              required
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={updateField}
              autoComplete="current-password"
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

          <FormControlLabel
            control={(
              <Checkbox
                name="recordarSesion"
                checked={formData.recordarSesion}
                onChange={updateField}
                color="primary"
                sx={{ p: 0, mr: 1.25 }}
              />
            )}
            label="Recordar mi sesión"
            sx={{ m: 0, minHeight: 32, alignSelf: 'flex-start', color: 'text.primary' }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ minHeight: 48, fontWeight: 700 }}
          >
            Ingresar
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          ¿Todavía no tienes una cuenta?{' '}
          <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 700 }}>
            Regístrate
          </Link>
        </Typography>
      </Paper>
    </AuthPageShell>
  )
}
