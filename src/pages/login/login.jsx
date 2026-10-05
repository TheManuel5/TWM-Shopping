import {
  LockOutlined,
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
  Typography,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import logoImage from '../../assets/login/Logo-prototipo.png'
import illustrationImage from '../../assets/login/shop.png'
import useAuth from '../../contexts/AuthContext/useAuth'

export default function Login() {
  // rut y recordarSesion
  const [formData, setFormData] = useState({ rut: '', password: '', recordarSesion: false })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Ajustamos la función para que entienda si es texto o checkbox
  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((currentData) => ({ 
      ...currentData, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Datos de inicio de sesión:', formData)
    login(formData)
    navigate(location.state?.from ?? '/inicio', { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          p: { md: 6, lg: 9 },
          overflow: 'hidden',
        }}
      >
        <Box component="img" src={logoImage} alt="Shopping" sx={{ width: 210, mb: 3 }} />
        <Typography
          component="h1"
          sx={{
            maxWidth: 600,
            fontSize: { md: '2.8rem', lg: '3.6rem' },
            lineHeight: 1.02,
            fontWeight: 900,
            letterSpacing: '-0.04em',
          }}
        >
          Compra, vende y encuentra{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>todo en un solo lugar</Box>
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 520, fontSize: '1.1rem' }}>
          Conecta con emprendedores y descubre productos y servicios cerca de ti.
        </Typography>
        <Box
          component="img"
          src={illustrationImage}
          alt="Productos disponibles en Shopping"
          sx={{ width: 'min(100%, 560px)', mt: 3, alignSelf: 'center' }}
        />
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2, sm: 4 } }}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 480,
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 18px 48px rgba(3, 12, 46, 0.12)',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              bgcolor: 'secondary.main',
              color: 'primary.main',
              mx: 'auto',
            }}
          >
            <LockOutlined fontSize="large" />
          </Box>
          <Typography variant="h4" fontWeight={850} textAlign="center" sx={{ mt: 2 }}>
            Iniciar sesión
          </Typography>
          <Typography color="text.secondary" textAlign="center" sx={{ mt: 0.75, mb: 3 }}>
            Ingresa tus datos para continuar.
          </Typography>

          {/* RUT */}
          <TextField
            fullWidth
            required
            name="rut"
            label="RUT"
            placeholder="12.345.678-9"
            value={formData.rut}
            onChange={updateField}
          />
          <TextField
            fullWidth
            required
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Contraseña"
            value={formData.password}
            onChange={updateField}
            autoComplete="current-password"
            sx={{ mt: 2 }}
            slotProps={{
              input: {
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

          {/*Checkbox de recordar sesión */}
          <FormControlLabel
            control={
              <Checkbox 
                name="recordarSesion" 
                checked={formData.recordarSesion} 
                onChange={updateField}
                color="primary"
              />
            }
            label={<Typography variant="body2" color="text.secondary" fontWeight={500}>Recordar mi sesión</Typography>}
            sx={{ mt: 1, ml: 0.5 }}
          />

          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 2, py: 1.4 }}>
            Ingresar
          </Button>
          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 2.5 }}>
            ¿Todavía no tienes una cuenta?{' '}
            <Link component={RouterLink} to="/register" underline="hover" fontWeight={750}>
              Regístrate
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}