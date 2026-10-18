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

export default function AddressDialog({ open, address, editing, onChange, onClose, onSave }) {
  const updateField = (field, value) => {
    onChange({ ...address, [field]: value })
  }

  const formComplete = Boolean(
    address.name &&
    address.region &&
    address.province &&
    address.commune &&
    address.street &&
    address.number,
  )

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? 'Editar dirección' : 'Agregar dirección'}</DialogTitle>
      <DialogContent
        sx={{
          pt: '12px !important',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        <TextField label="Etiqueta" placeholder="Casa u oficina" value={address.name} onChange={(event) => updateField('name', event.target.value)} required />
        <TextField label="Región" value={address.region} onChange={(event) => updateField('region', event.target.value)} required />
        <TextField label="Provincia" value={address.province} onChange={(event) => updateField('province', event.target.value)} required />
        <TextField label="Comuna" value={address.commune} onChange={(event) => updateField('commune', event.target.value)} required />
        <TextField label="Calle" value={address.street} onChange={(event) => updateField('street', event.target.value)} required />
        <TextField label="Número" value={address.number} onChange={(event) => updateField('number', event.target.value)} required />
        <TextField label="Departamento (opcional)" value={address.department} onChange={(event) => updateField('department', event.target.value)} />
        <TextField label="Referencia" value={address.reference} onChange={(event) => updateField('reference', event.target.value)} />
        <FormControlLabel
          control={<Switch checked={address.primary} onChange={(event) => updateField('primary', event.target.checked)} />}
          label="Usar como dirección principal"
          sx={{ gridColumn: { sm: '1 / -1' } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onSave} disabled={!formComplete}>
          Guardar dirección
        </Button>
      </DialogActions>
    </Dialog>
  )
}
