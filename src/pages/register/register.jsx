import {
  BadgeOutlined,
  EmailOutlined,
  LocationOnOutlined,
  LockOutlined,
  PersonAddOutlined,
  PersonOutlineOutlined,
  PhoneOutlined,
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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?\d[\d\s-]{7,14}$/

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

  const body = cleanedRut.slice(0, -1)
  const checkDigit = cleanedRut.slice(-1)
  let multiplier = 2
  let sum = 0

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const expectedValue = 11 - (sum % 11)
  const expectedDigit = expectedValue === 11 ? '0' : expectedValue === 10 ? 'K' : String(expectedValue)

  return checkDigit === expectedDigit
}

function validateRegisterForm(values) {
  const errors = {}

  if (!values.rol) {
    errors.rol = 'Selecciona un tipo de cuenta.'
  }

  if (!values.nombre.trim()) {
    errors.nombre = 'El nombre es obligatorio.'
  } else if (values.nombre.trim().length < 3) {
    errors.nombre = 'Ingresa al menos 3 caracteres.'
  }

  if (!values.rut.trim()) {
    errors.rut = 'El RUT es obligatorio.'
  } else if (!isValidRut(values.rut)) {
    errors.rut = 'Ingresa un RUT valido.'
  }

  if (!values.email.trim()) {
    errors.email = 'El correo es obligatorio.'
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Ingresa un correo valido.'
  }

  if (!values.telefono.trim()) {
    errors.telefono = 'El telefono es obligatorio.'
  } else if (!phonePattern.test(values.telefono.trim())) {
    errors.telefono = 'Ingresa un telefono valido.'
  }

  if (!values.direccion.trim()) {
    errors.direccion = 'La direccion es obligatoria.'
  } else if (values.direccion.trim().length < 5) {
    errors.direccion = 'Ingresa una direccion mas completa.'
  }

  if (!values.password.trim()) {
    errors.password = 'La contrasena es obligatoria.'
  } else if (values.password.length < 6) {
    errors.password = 'Debe tener al menos 6 caracteres.'
  }

  return errors
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
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    rol: 'cliente',
  })
  const [touchedFields, setTouchedFields] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const errors = validateRegisterForm(formData)

  const getFieldError = (fieldName) => (
    (submitted || touchedFields[fieldName]) ? errors[fieldName] : ''
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: name === 'rut' ? formatRut(value) : value }))
  }

  const handleBlur = (event) => {
    const { name } = event.target
    setTouchedFields((currentFields) => ({ ...currentFields, [name]: true }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    setTouchedFields({
      nombre: true,
      rol: true,
      rut: true,
      email: true,
      telefono: true,
      direccion: true,
      password: true,
    })

    if (Object.keys(errors).length > 0) {
      return
    }

    console.log('Datos de Registro capturados:', formData)
    navigate('/register-success', { replace: true })
  }

  return (
    <AuthPageShell
      headline="Únete y descubre,"
      accentHeadline="un mundo de opciones"
      description="Crea tu cuenta gratis para conectar con emprendedores y acceder a los mejores productos y servicios."
      gridTemplateColumns={{ xs: '1fr', md: '0.95fr 1.05fr', lg: '1fr 1fr' }}
      formAreaSx={{ overflowY: { xs: 'auto', md: 'auto' } }}
      illustrationSx={{ maxHeight: '39vh', mt: 1 }}
    >
      <Paper
        component="form"
        noValidate
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: { xs: 480, md: 760 },
          p: { xs: 3, sm: 3.25, md: 3 },
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
            display: { xs: 'grid', md: 'none' },
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
            fontSize: { xs: '1.75rem', md: '1.45rem' },
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          Crear cuenta
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: { xs: 2.5, md: 1.5 }, textAlign: 'center' }}>
          Completa tus datos para registrarte.
        </Typography>

        <Box sx={{ mb: 1.5 }}>
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
                setTouchedFields((currentFields) => ({ ...currentFields, rol: true }))
              }
            }}
            fullWidth
            sx={{
              height: 48,
              border: getFieldError('rol') ? '1px solid' : 'none',
              borderColor: getFieldError('rol') ? 'error.main' : 'transparent',
              borderRadius: 1,
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
          {getFieldError('rol') ? (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {getFieldError('rol')}
            </Typography>
          ) : null}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.5,
          }}
        >
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
              onBlur={handleBlur}
              error={Boolean(getFieldError('nombre'))}
              helperText={getFieldError('nombre')}
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
              onBlur={handleBlur}
              error={Boolean(getFieldError('rut'))}
              helperText={getFieldError('rut')}
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
              onBlur={handleBlur}
              error={Boolean(getFieldError('email'))}
              helperText={getFieldError('email')}
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
              onBlur={handleBlur}
              error={Boolean(getFieldError('password'))}
              helperText={getFieldError('password')}
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

          <Box>
            <RegisterField htmlFor="register-phone">Numero de telefono</RegisterField>
            <TextField
              id="register-phone"
              required
              fullWidth
              name="telefono"
              type="tel"
              placeholder="+56 9 1234 5678"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(getFieldError('telefono'))}
              helperText={getFieldError('telefono')}
              sx={fieldStyles}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box>
            <RegisterField htmlFor="register-address">Direccion</RegisterField>
            <TextField
              id="register-address"
              required
              fullWidth
              name="direccion"
              placeholder="Ej. Av. Siempre Viva 742"
              value={formData.direccion}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(getFieldError('direccion'))}
              helperText={getFieldError('direccion')}
              sx={fieldStyles}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlined fontSize="small" />
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
            sx={{ minHeight: 48, fontWeight: 700, gridColumn: { xs: 'auto', md: '1 / -1' } }}
          >
            Registrarse
          </Button>
        </Box>

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
