import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { useState } from 'react'

const emptyPasswords = { current: '', next: '', confirmation: '' }

export default function PasswordDialog({ open, onClose }) {
  const [passwords, setPasswords] = useState(emptyPasswords)
  const [submitted, setSubmitted] = useState(false)

  const updatePassword = (field, value) => {
    setPasswords((current) => ({ ...current, [field]: value }))
  }

  const hasCurrent = passwords.current.length > 0
  const hasNext = passwords.next.length >= 8
  const matches = passwords.next === passwords.confirmation
  const isDifferent = passwords.current !== passwords.next
  const canSubmit = hasCurrent && hasNext && passwords.confirmation.length > 0 && matches && isDifferent

  const closeDialog = () => {
    setPasswords(emptyPasswords)
    setSubmitted(false)
    onClose()
  }

  const handleSubmit = () => {
    setSubmitted(true)
    if (!canSubmit) return

    // Simulación: jamás imprimir ni almacenar contraseñas en consola.
    // Se requiere un endpoint seguro del backend para cambiarlas realmente.
    console.log('Solicitud simulada de cambio de contraseña (sin datos sensibles).')
    closeDialog()
  }

  return (
    <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="xs">
      <DialogTitle>Cambiar contraseña</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <Stack spacing={2}>
          <Alert severity="info">
            La nueva contraseña debe contener al menos 8 caracteres. El cambio es una simulación
            hasta que el backend habilite esta operación.
          </Alert>
          <TextField
            label="Contraseña actual"
            type="password"
            autoComplete="current-password"
            value={passwords.current}
            onChange={(event) => updatePassword('current', event.target.value)}
            error={submitted && !hasCurrent}
            helperText={submitted && !hasCurrent ? 'Ingresa tu contraseña actual.' : undefined}
            fullWidth
          />
          <TextField
            label="Nueva contraseña"
            type="password"
            autoComplete="new-password"
            value={passwords.next}
            onChange={(event) => updatePassword('next', event.target.value)}
            error={Boolean(passwords.next) && (!hasNext || !isDifferent)}
            helperText={
              passwords.next && !hasNext
                ? 'Debe tener al menos 8 caracteres.'
                : passwords.next && !isDifferent
                  ? 'La nueva contraseña debe ser diferente de la actual.'
                  : undefined
            }
            fullWidth
          />
          <TextField
            label="Confirmar nueva contraseña"
            type="password"
            autoComplete="new-password"
            value={passwords.confirmation}
            onChange={(event) => updatePassword('confirmation', event.target.value)}
            error={Boolean(passwords.confirmation) && !matches}
            helperText={
              passwords.confirmation && !matches ? 'Las contraseñas no coinciden.' : undefined
            }
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={closeDialog}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
          Actualizar contraseña
        </Button>
      </DialogActions>
    </Dialog>
  )
}
