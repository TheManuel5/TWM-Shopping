import { AdminPanelSettingsOutlined, ShoppingCartOutlined, StorefrontOutlined } from '@mui/icons-material'
import { Box, Button, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../../contexts/AuthContext/useAuth'

export default function RoleSwitcher({ showAdmin = true }) {
  const { user, switchRole } = useAuth()
  const navigate = useNavigate()
  const currentRole = user?.role || 'Comprador'

  const handleRoleChange = (newRole, targetPath) => {
    switchRole?.(newRole)
    if (targetPath) navigate(targetPath)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.5,
        display: 'inline-flex',
        gap: 0.5,
        bgcolor: '#f1eeff',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Button
        size="small"
        startIcon={<ShoppingCartOutlined fontSize="small" />}
        variant={currentRole === 'Comprador' ? 'contained' : 'text'}
        onClick={() => handleRoleChange('Comprador', '/perfil')}
        sx={{ borderRadius: 2, px: 1.5 }}
      >
        Comprar
      </Button>
      <Button
        size="small"
        startIcon={<StorefrontOutlined fontSize="small" />}
        variant={currentRole === 'Vendedor' ? 'contained' : 'text'}
        onClick={() => handleRoleChange('Vendedor', '/vendedor/dashboard')}
        sx={{ borderRadius: 2, px: 1.5 }}
      >
        Vender
      </Button>
      {showAdmin && (
        <Button
          size="small"
          startIcon={<AdminPanelSettingsOutlined fontSize="small" />}
          variant={currentRole === 'Admin' ? 'contained' : 'text'}
          onClick={() => handleRoleChange('Admin', '/admin/usuarios')}
          sx={{ borderRadius: 2, px: 1.5 }}
        >
          Admin
        </Button>
      )}
    </Paper>
  )
}