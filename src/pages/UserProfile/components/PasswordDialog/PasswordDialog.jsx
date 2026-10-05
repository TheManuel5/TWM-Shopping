import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { useState } from 'react'

export default function PasswordDialog({ open, onClose }) {
  const [passwords, setPasswords] = useState({ current: '', next: '', confirmation: '' })

  const updatePassword = (field, value) => {
    setPasswords((currentPasswords) => ({ ...currentPasswords, [field]: value }))
  }

  const passwordMatches = passwords.next === passwords.confirmation
  const formComplete = passwords.current && passwords.next && passwords.confirmation

  const handleSubmit = () => {
    console.log('Solicitud de cambio de contraseña:', {
      currentPasswordProvided: Boolean(passwords.current),
      newPasswordLength: passwords.next.length,
    })
    setPasswords({ current: '', next: '', confirmation: '' })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cambiar contraseña</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <Stack spacing={2}>
          <Alert severity="info">La contraseña debe contener al menos 8 caracteres.</Alert>
          <TextField label="Contraseña actual" type="password" value={passwords.current} onChange={(event) => updatePassword('current', event.target.value)} />
          <TextField label="Nueva contraseña" type="password" value={passwords.next} onChange={(event) => updatePassword('next', event.target.value)} />
          <TextField
            label="Confirmar nueva contraseña"
            type="password"
            value={passwords.confirmation}
            onChange={(event) => updatePassword('confirmation', event.target.value)}
            error={Boolean(passwords.confirmation) && !passwordMatches}
            helperText={Boolean(passwords.confirmation) && !passwordMatches ? 'Las contraseñas no coinciden.' : ' '}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!formComplete || !passwordMatches || passwords.next.length < 8}>
          Actualizar contraseña
        </Button>
      </DialogActions>
    </Dialog>
  )
}
