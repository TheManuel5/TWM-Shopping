import PasswordField from '../../../../components/forms/PasswordField'
import useAuth from '../../../../contexts/AuthContext/useAuth'
import { changePassword } from '../../../../services/demoAuth'
import { notify } from '../../../../utils/feedback'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material'
import { useState } from 'react'

export default function PasswordDialog({ open, onClose }) {
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', next: '', confirmation: '' })

  const updatePassword = (field, value) => {
    setPasswords((currentPasswords) => ({ ...currentPasswords, [field]: value }))
  }

  const close = () => { if (busy) return; setPasswords({ current: '', next: '', confirmation: '' }); setError(''); onClose() }
  const tooLong = new TextEncoder().encode(passwords.next).length > 72
  const passwordMatches = passwords.next === passwords.confirmation
  const formComplete = passwords.current && passwords.next && passwords.confirmation

  const handleSubmit = async () => {
    if (!formComplete || !passwordMatches || passwords.next.length < 8 || tooLong || busy) return
    setBusy(true); setError('')
    try {
      await changePassword(user.rut, passwords.current, passwords.next)
      setPasswords({ current: '', next: '', confirmation: '' })
      notify('Contraseña actualizada.'); onClose()
    } catch (error) { setError(error.message) }
    finally { setBusy(false) }
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
      <DialogTitle>Cambiar contraseña</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Alert severity="info">Usa al menos 8 caracteres y una contraseña distinta de la actual.</Alert>
          <PasswordField label="Contraseña actual" autoComplete="current-password" value={passwords.current} onChange={(event) => updatePassword('current', event.target.value)} />
          <PasswordField label="Nueva contraseña" autoComplete="new-password" error={tooLong} helperText={tooLong ? 'La contraseña es demasiado larga.' : undefined} value={passwords.next} onChange={(event) => updatePassword('next', event.target.value)} />
          <PasswordField
            label="Confirmar nueva contraseña" autoComplete="new-password"
           
            value={passwords.confirmation}
            onChange={(event) => updatePassword('confirmation', event.target.value)}
            error={Boolean(passwords.confirmation) && !passwordMatches}
            helperText={Boolean(passwords.confirmation) && !passwordMatches ? 'Las contraseñas no coinciden.' : ' '}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={close}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={busy || !formComplete || !passwordMatches || passwords.next.length < 8 || tooLong}>
          Actualizar contraseña
        </Button>
      </DialogActions>
    </Dialog>
  )
}
