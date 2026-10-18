import {
  LockOutlined,
  PersonOutlineOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
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
import { fetchApi } from '../../services/api' 

const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    height: 48,
    bgcolor: 'background.paper',
  },
}

function cleanRut(value) {
  return value.replace(/[^0-9kK]/g, '').slice(0, 9).toUpperCase()
}

function formatRut(value) {
  const cleanedRut = cleanRut(value)

  if (cleanedRut.length <= 7) {
    return cleanedRut.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const body = cleanedRut.slice(0, -1)
  const checkDigit = cleanedRut.slice(-1)
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${formattedBody}-${checkDigit}`
}

function isValidRut(value) {
  const cleanedRut = cleanRut(value)
  if (cleanedRut.length < 8) {
    return false
  }
  return true
}

function validateLoginForm(values) {
  const errors = {}

  if (!values.rut.trim()) {
    errors.rut = 'El RUT es obligatorio.'
  } else if (!isValidRut(values.rut)) {
    errors.rut = 'Ingresa un RUT valido.'
  }

  if (!values.password.trim()) {
    errors.password = 'La contrasena es obligatoria.'
  } else if (values.password.length < 6) {
    errors.password = 'Debe tener al menos 6 caracteres.'
  }

  return errors
}

export default function Login() {
  const [formData, setFormData] = useState({ rut: '', password: '', recordarSesion: false })
  const [touchedFields, setTouchedFields] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const errors = validateLoginForm(formData)

  const getFieldError = (fieldName) => (
    (submitted || touchedFields[fieldName]) ? errors[fieldName] : ''
  )

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: name === 'rut' ? formatRut(value) : type === 'checkbox' ? checked : value,
    }))
  }

  const handleBlur = (event) => {
    const { name } = event.target
    setTouchedFields((currentFields) => ({ ...currentFields, [name]: true }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)

    const currentErrors = validateLoginForm(formData)
    if (Object.keys(currentErrors).length > 0) {
      return
    }

    setIsLoading(true)
    setErrorMsg('')

    try {
      // 1. Limpiamos los puntos visuales del frontend para que quede como "10000001-K"
      const rutLimpio = formData.rut.replace(/\./g, '')

      // 2. Enviamos EXCLUSIVAMENTE los nombres que C# espera en su LoginDto
      const dataBackend = await fetchApi('/Auth/login', {
        method: 'POST',
        body: JSON.stringify({
          Run: rutLimpio,
          Password: formData.password
        })
      })

      login(dataBackend)
      navigate(location.state?.from ?? '/inicio', { replace: true })
      
    } catch (error) {
      console.error(error)
      setErrorMsg(error.message || 'Credenciales incorrectas.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthPageShell
      headline="Todo lo que buscas,"
      accentHeadline="en un solo lugar"
      description="Conecta con emprendedores, descubre productos y servicios increíbles y realiza tus compras de forma segura."
    >
      <Paper
        component="form"
        noValidate
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

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

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
              placeholder="Ej: 10000001-K"
              value={formData.rut}
              onChange={updateField}
              onBlur={handleBlur}
              error={Boolean(getFieldError('rut'))}
              helperText={getFieldError('rut') || 'Ingresa tu RUT con formato 12.345.678-9.'}
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
              onBlur={handleBlur}
              error={Boolean(getFieldError('password'))}
              helperText={getFieldError('password')}
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
            disabled={isLoading}
            sx={{ minHeight: 48, fontWeight: 700 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
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