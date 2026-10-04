import { useState } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  Link, InputAdornment, IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';

import logoImg from '../../assets/login/Logo-prototipo.png'; 
import ilustracionImg from '../../assets/login/shop.jpg';

export default function Register() {
  // 1. Estados para el formulario (Nombre, Email y Contraseña)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejador del botón "Registrarse"
  const handleSubmit = (e) => {
    e.preventDefault();
    // Requisito de tu tarea: imprimir en consola
    console.log('Datos de Registro capturados:', formData);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#FAFAFE',
      overflow: 'hidden',
    }}>
      
      {/* --- LADO IZQUIERDO (Diseño corporativo) --- */}
      <Box sx={{ 
        flex: 1, 
        display: { xs: 'none', md: 'flex' }, 
        flexDirection: 'column', 
        justifyContent: 'center',
        p: 8,
      }}>
        <Box component="img" src={logoImg} alt="Logo TWM" sx={{ width: '100%', maxWidth: 400, mb: 4 }} />
        
        <Typography variant="h2" sx={{ fontWeight: 800, color: '#030C2E', lineHeight: 1.1 }}>
          Únete y descubre,<br />
          <span style={{ color: '#602FF7' }}>un mundo de opciones</span>
        </Typography>
        
        <Typography variant="h6" sx={{ color: '#5E6782', mt: 3, maxWidth: 400, fontWeight: 400 }}>
          Crea tu cuenta gratis para conectar con emprendedores y acceder a los mejores productos y servicios.
        </Typography>

        <Box component="img" src={ilustracionImg} alt="Ilustración" sx={{ width: '100%', maxWidth: 500, mt: 4, borderRadius: 4 }} />
      </Box>

      {/* --- LADO DERECHO (Formulario de Registro) --- */}
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
          {/* Cabecera del form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ width: 72, height: 72, bgcolor: '#F0EDFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Usamos un icono diferente para el registro */}
              <PersonAddOutlined sx={{ color: '#602FF7', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#030C2E' }}>
              Crear Cuenta
            </Typography>
          </Box>

          {/* Input Nombre Completo */}
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#030C2E', mb: 1, fontSize: 14 }}>Nombre Completo</Typography>
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

          {/* Input Email */}
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#030C2E', mb: 1, fontSize: 14 }}>Correo Electrónico</Typography>
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

          {/* Input Contraseña */}
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#030C2E', mb: 1, fontSize: 14 }}>Contraseña</Typography>
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
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Botón Submit */}
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
              fontSize: 16,
              textTransform: 'none',
              '&:hover': { bgcolor: '#4B0CE8' }
            }}
          >
            Registrarse
          </Button>

          {/* Link volver a Login */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            <Typography sx={{ color: '#64748B', fontSize: 14 }}>
              ¿Ya tienes una cuenta?
            </Typography>
            <Link href="/login" underline="hover" sx={{ color: '#602FF7', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Iniciar sesión
            </Link>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}