import { useState } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  Link, InputAdornment, IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// Imágenes de la carpeta assets/login
import logoImg from '../../assets/login/Logo-prototipo.png'; 
import ilustracionImg from '../../assets/login/shop.png';

export default function Register() {
  const navigate = useNavigate();
  
  // rut, nombre, email y password
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos de Registro capturados:', formData);
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#FAFAFE',
      overflow: 'hidden',
    }}>
      
      {/* --- LADO IZQUIERDO --- */}
      <Box sx={{ 
        flex: 1, 
        display: { xs: 'none', md: 'flex' }, 
        flexDirection: 'column', 
        justifyContent: 'center',
        p: 8,
      }}>
        <Box component="img" src={logoImg} alt="Logo TWM" sx={{ width: '100%', maxWidth: 400, mb: 4 }} />
        
        <Typography sx={{ fontSize: 60, fontWeight: 800, color: '#030C2E', lineHeight: '56px', fontFamily: 'Inter' }}>
          Únete y descubre,<br />
          <span style={{ color: '#602FF7' }}>un mundo de opciones</span>
        </Typography>
        
        <Typography sx={{ fontSize: 22, fontWeight: 400, color: '#5E6782', lineHeight: '26px', mt: 3, maxWidth: 400, fontFamily: 'Inter' }}>
          Crea tu cuenta gratis para conectar con emprendedores y acceder a los mejores productos y servicios.
        </Typography>

        <Box component="img" src={ilustracionImg} alt="Ilustración" sx={{ width: '100%', maxWidth: 500, mt: 4, borderRadius: 4 }} />
      </Box>

      {/* --- LADO DERECHO --- */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: { xs: 2, md: 4 }
      }}>
        <Paper 
          elevation={0}
          component="form" 
          onSubmit={handleSubmit}
          sx={{ 
            p: { xs: 4, md: 6 }, 
            width: '100%', 
            maxWidth: 480, 
            borderRadius: 6, 
            boxShadow: '0px 16px 48px rgba(3, 12, 46, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          {/* Cabecera */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ width: 72, height: 72, bgcolor: '#F0EDFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonAddOutlined sx={{ color: '#602FF7', fontSize: 32 }} />
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#030C2E', fontFamily: 'Inter' }}>
              Crear Cuenta
            </Typography>
          </Box>

          {/* Nombre */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#030C2E', mb: 1, fontFamily: 'Inter' }}>Nombre Completo</Typography>
            <TextField
              required
              fullWidth
              id="nombre"
              name="nombre"
              placeholder="Ej. Juan Pérez"
              value={formData.nombre}
              onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Box>

          {/* RUT */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#030C2E', mb: 1, fontFamily: 'Inter' }}>RUT</Typography>
            <TextField
              required
              fullWidth
              id="rut"
              name="rut"
              placeholder="12.345.678-9"
              value={formData.rut}
              onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Box>

          {/* Email */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#030C2E', mb: 1, fontFamily: 'Inter' }}>Correo Electrónico</Typography>
            <TextField
              required
              fullWidth
              id="email"
              name="email"
              type="email"
              placeholder="juan@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Box>

          {/* Contraseña */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#030C2E', mb: 1, fontFamily: 'Inter' }}>Contraseña</Typography>
            <TextField
              required
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Crea una contraseña segura"
              value={formData.password}
              onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Botón */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              py: 2, 
              mt: 1,
              bgcolor: '#602FF7', 
              borderRadius: 3, 
              fontWeight: 700, 
              fontSize: 15,
              textTransform: 'capitalize',
              fontFamily: 'Inter',
              boxShadow: '0px 8px 16px rgba(96, 47, 247, 0.20)',
              '&:hover': { bgcolor: '#4B0CE8' }
            }}
          >
            Registrarse
          </Button>

          {/* Link */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 400, color: '#64748B', fontFamily: 'Inter' }}>
              ¿Ya tienes una cuenta?
            </Typography>
            <Link component={RouterLink} to="/login" underline="hover" sx={{ fontSize: 14, fontWeight: 700, color: '#602FF7', fontFamily: 'Inter', cursor: 'pointer' }}>
              Iniciar sesión
            </Link>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}