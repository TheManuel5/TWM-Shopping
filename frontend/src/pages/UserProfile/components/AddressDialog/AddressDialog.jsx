import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material'
import { useState } from 'react'

const requiredFields = [
  { key: 'name', label: 'Etiqueta', placeholder: 'Casa u oficina' },
  { key: 'region', label: 'Región' },
  { key: 'province', label: 'Provincia' },
  { key: 'commune', label: 'Comuna' },
  { key: 'street', label: 'Calle' },
  { key: 'number', label: 'Número' },
]

export default function AddressDialog({ open, address, editing, onChange, onClose, onSave }) {
  const [touched, setTouched] = useState({})

  const updateField = (field, value) => {
    onChange({ ...address, [field]: value })
  }

  const valid = requiredFields.every(({ key }) =>
    typeof address[key] === 'string' && address[key].trim().length > 0,
  )

  const closeDialog = () => {
    setTouched({})
    onClose()
  }

  const saveDialog = () => {
    if (!valid) return
    onSave()
    setTouched({})
  }

  return (
    <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? 'Editar dirección' : 'Agregar dirección'}</DialogTitle>
      <DialogContent
        sx={{
          pt: '12px !important',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {requiredFields.map(({ key, label, placeholder }) => {
          const invalid = Boolean(touched[key]) && !String(address[key] ?? '').trim()
          return (
            <TextField
              key={key}
              label={label}
              placeholder={placeholder}
              value={address[key] ?? ''}
              onChange={(event) => updateField(key, event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, [key]: true }))}
              required
              error={invalid}
              helperText={invalid ? `El campo ${label.toLowerCase()} es obligatorio.` : undefined}
              fullWidth
            />
          )
        })}
        <TextField
          label="Departamento (opcional)"
          value={address.department ?? ''}
          onChange={(event) => updateField('department', event.target.value)}
          fullWidth
        />
        <TextField
          label="Referencia (opcional)"
          value={address.reference ?? ''}
          onChange={(event) => updateField('reference', event.target.value)}
          fullWidth
        />
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(address.primary)}
              onChange={(event) => updateField('primary', event.target.checked)}
            />
          }
          label="Usar como dirección principal"
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={closeDialog}>Cancelar</Button>
        <Button variant="contained" onClick={saveDialog} disabled={!valid}>
          Guardar dirección
        </Button>
      </DialogActions>
    </Dialog>
  )
}
