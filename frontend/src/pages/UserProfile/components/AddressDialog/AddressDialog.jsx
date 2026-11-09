import useGeography from '../../../../hooks/useGeography'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  MenuItem,
  TextField,
} from '@mui/material'

export default function AddressDialog({ open, address, editing, onChange, onClose, onSave }) {
  const CHILE_DPA = useGeography()
  const updateField = (field, value) => {
    onChange({ ...address, [field]: value })
  }

  const formComplete = Boolean(
    address.name.trim() &&
    address.region &&
    address.province &&
    address.commune &&
    address.street.trim() &&
    String(address.number).trim() && CHILE_DPA[address.region]?.[address.province]?.includes(address.commune),
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
        <TextField select label="Región" value={address.region} onChange={event => { const region = event.target.value; const province = Object.keys(CHILE_DPA[region])[0]; onChange({ ...address, region, province, commune: CHILE_DPA[region][province][0] }) }} required>{Object.keys(CHILE_DPA).map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <TextField select label="Provincia" value={address.province} onChange={event => onChange({ ...address, province: event.target.value, commune: CHILE_DPA[address.region][event.target.value][0] })} required>{Object.keys(CHILE_DPA[address.region] || {}).map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <TextField select label="Comuna" value={address.commune} onChange={event => updateField('commune', event.target.value)} required>{(CHILE_DPA[address.region]?.[address.province] || []).map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
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
