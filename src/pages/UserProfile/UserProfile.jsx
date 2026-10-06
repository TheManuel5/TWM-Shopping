import {
  AccountCircleOutlined,
  AddOutlined,
  DeleteOutlineOutlined,
  LocationOnOutlined,
  LockOutlined,
  SaveOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import AddressCard from './components/AddressCard/AddressCard'
import AddressDialog from './components/AddressDialog/AddressDialog'
import PasswordDialog from './components/PasswordDialog/PasswordDialog'

const initialProfile = {
  fullName: 'Jheffry Trepstein',
  rut: '12.345.678-9',
  email: 'jheffry.trepstein@shopping.cl',
  birthDay: '14',
  birthMonth: 'Marzo',
  birthYear: '1998',
  phones: [
    { id: 1, number: '+56 9 8765 4321', label: 'Principal' },
    { id: 2, number: '+56 9 1234 5678', label: 'Secundario' },
  ],
}

const initialAddresses = [
  {
    id: 1,
    name: 'Casa',
    region: 'Los Lagos',
    province: 'Osorno',
    commune: 'Osorno',
    street: 'Av. Manuel Rodríguez',
    number: '1234',
    department: 'Depto. 101',
    reference: 'A una cuadra de la Plaza de Armas.',
    primary: true,
  },
  {
    id: 2,
    name: 'Oficina',
    region: 'Los Lagos',
    province: 'Osorno',
    commune: 'Osorno',
    street: 'Calle Bilbao',
    number: '567',
    department: 'Oficina 302',
    reference: 'Edificio Torres del Sur, piso 3.',
    primary: false,
  },
]

const emptyAddress = {
  name: '',
  region: 'Los Lagos',
  province: 'Osorno',
  commune: 'Osorno',
  street: '',
  number: '',
  department: '',
  reference: '',
  primary: false,
}

function SectionHeading({ icon, title, description, sx }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={sx}>
      <Box
        sx={{
          display: 'grid',
          placeItems: 'center',
          width: 38,
          height: 38,
          borderRadius: 2,
          bgcolor: 'secondary.main',
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.125rem' }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}

export default function UserProfile() {
  const [profile, setProfile] = useState(initialProfile)
  const [addresses, setAddresses] = useState(initialAddresses)
  const [activeRole, setActiveRole] = useState('comprar')
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [addressDraft, setAddressDraft] = useState(emptyAddress)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)

  const updateProfileField = (field, value) => {
    setProfile((currentProfile) => ({ ...currentProfile, [field]: value }))
  }

  const updatePhone = (phoneId, value) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      phones: currentProfile.phones.map((phone) =>
        phone.id === phoneId ? { ...phone, number: value } : phone,
      ),
    }))
  }

  const addPhone = () => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      phones: [
        ...currentProfile.phones,
        {
          id: Date.now(),
          number: '',
          label: `Teléfono ${currentProfile.phones.length + 1}`,
        },
      ],
    }))
  }

  const removePhone = (phoneId) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      phones: currentProfile.phones.filter((phone) => phone.id !== phoneId),
    }))
  }

  const openNewAddressDialog = () => {
    setEditingAddressId(null)
    setAddressDraft(emptyAddress)
    setAddressDialogOpen(true)
  }

  const openEditAddressDialog = (address) => {
    setEditingAddressId(address.id)
    setAddressDraft({ ...address })
    setAddressDialogOpen(true)
  }

  const saveAddress = () => {
    setAddresses((currentAddresses) => {
      const isOnlyPrimary =
        editingAddressId &&
        !addressDraft.primary &&
        !currentAddresses.some(
          (address) => address.id !== editingAddressId && address.primary,
        )
      const savedAddress = {
        ...addressDraft,
        id: editingAddressId ?? Date.now(),
        primary: isOnlyPrimary ? true : addressDraft.primary,
      }
      const remainingAddresses = editingAddressId
        ? currentAddresses.filter((address) => address.id !== editingAddressId)
        : currentAddresses

      return [
        ...remainingAddresses.map((address) => ({
          ...address,
          primary: savedAddress.primary ? false : address.primary,
        })),
        savedAddress,
      ].sort((firstAddress, secondAddress) => firstAddress.id - secondAddress.id)
    })
    setAddressDialogOpen(false)
  }

  const setPrimaryAddress = (addressId) => {
    setAddresses((currentAddresses) =>
      currentAddresses.map((address) => ({
        ...address,
        primary: address.id === addressId,
      })),
    )
  }

  const handleSaveProfile = (event) => {
    event.preventDefault()
    console.log('Perfil actualizado:', { ...profile, activeRole, addresses })
    setNotificationOpen(true)
  }

  return (
    <Box component="form" onSubmit={handleSaveProfile}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            component="h1"
            fontWeight={700}
            sx={{
              color: '#13234d',
              fontSize: { xs: '1.75rem', sm: '2.125rem' },
              lineHeight: 1.1,
              letterSpacing: 0,
            }}
          >
            Mi perfil
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Administra tu información personal, direcciones y seguridad.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            textAlign: { xs: 'left', md: 'right' },
          }}
        >
          <ToggleButtonGroup
            value={activeRole}
            exclusive
            onChange={(_, nextRole) => nextRole && setActiveRole(nextRole)}
            size="small"
            color="primary"
            aria-label="rol activo"
          >
            <ToggleButton value="comprar">Comprar</ToggleButton>
            <ToggleButton value="vender">Vender</ToggleButton>
          </ToggleButtonGroup>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.75, display: 'block' }}
          >
            Puedes cambiar de rol en cualquier momento.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1fr)' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, sm: 3 },
            minWidth: 0,
            '& .MuiOutlinedInput-root': { minHeight: 52 },
            '& .MuiInputBase-input, & .MuiSelect-select': { fontSize: 16 },
            '& .MuiInputLabel-root': {
              fontSize: 16,
              bgcolor: 'background.paper',
              px: 0.5,
            },
          }}
        >
          <SectionHeading
            icon={<AccountCircleOutlined />}
            title="Información personal"
            sx={{ mb: 2.5 }}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              size="small"
              label="Nombre completo"
              value={profile.fullName}
              onChange={(event) => updateProfileField('fullName', event.target.value)}
              required
            />
            <Tooltip title="El RUT no puede modificarse desde el perfil">
              <TextField size="small" label="RUT (no editable)" value={profile.rut} disabled />
            </Tooltip>

            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                Fecha de nacimiento
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.5 }}>
                <FormControl size="small">
                  <InputLabel id="birth-day-label">Día</InputLabel>
                  <Select
                    labelId="birth-day-label"
                    label="Día"
                    value={profile.birthDay}
                    onChange={(event) => updateProfileField('birthDay', event.target.value)}
                  >
                    {Array.from({ length: 31 }, (_, index) => String(index + 1)).map((day) => (
                      <MenuItem key={day} value={day}>{day}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel id="birth-month-label">Mes</InputLabel>
                  <Select
                    labelId="birth-month-label"
                    label="Mes"
                    value={profile.birthMonth}
                    onChange={(event) => updateProfileField('birthMonth', event.target.value)}
                  >
                    {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month) => (
                      <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Año"
                  value={profile.birthYear}
                  onChange={(event) => updateProfileField('birthYear', event.target.value)}
                  inputProps={{ inputMode: 'numeric', maxLength: 4 }}
                />
              </Box>
            </Box>

            <TextField
              size="small"
              label="Correo electrónico"
              type="email"
              value={profile.email}
              onChange={(event) => updateProfileField('email', event.target.value)}
              required
              sx={{ gridColumn: { sm: '1 / -1' } }}
            />
          </Box>

          <Box sx={{ mt: 2.5 }}>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
              Teléfonos
            </Typography>
            <Stack spacing={1.25}>
              {profile.phones.map((phone) => (
                <Stack key={phone.id} direction="row" spacing={1} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    value={phone.number}
                    onChange={(event) => updatePhone(phone.id, event.target.value)}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <Chip
                            label={phone.label}
                            size="small"
                            color={phone.id === profile.phones[0].id ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        ),
                      },
                    }}
                    inputProps={{ 'aria-label': phone.label }}
                  />
                  <IconButton
                    color="error"
                    size="small"
                    disabled={profile.phones.length === 1}
                    onClick={() => removePhone(phone.id)}
                    aria-label={`Quitar ${phone.label}`}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                  >
                    <DeleteOutlineOutlined fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddOutlined />}
              onClick={addPhone}
              sx={{ mt: 2 }}
            >
              Agregar teléfono
            </Button>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              mb: 2.5,
            }}
          >
            <SectionHeading
              icon={<LocationOnOutlined />}
              title="Mis direcciones"
            />
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={openNewAddressDialog}
              sx={{
                flexShrink: 0,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 'none',
              }}
            >
              Agregar dirección
            </Button>
          </Box>

          <Stack spacing={1.5}>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => openEditAddressDialog(address)}
                onSetPrimary={() => setPrimaryAddress(address.id)}
              />
            ))}
          </Stack>

          <Alert severity="info" sx={{ mt: 2 }}>
            Debes mantener al menos una dirección de despacho.
          </Alert>
        </Paper>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: { xs: 2.5, sm: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <SectionHeading
          icon={<LockOutlined />}
          title="Seguridad"
          description="Mantén tu cuenta protegida con una contraseña segura."
        />
        <Button
          variant="outlined"
          startIcon={<LockOutlined />}
          onClick={() => setPasswordDialogOpen(true)}
          sx={{ flexShrink: 0 }}
        >
          Cambiar contraseña
        </Button>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button type="submit" variant="contained" size="large" startIcon={<SaveOutlined />}>
          Guardar cambios
        </Button>
      </Box>

      <AddressDialog
        open={addressDialogOpen}
        address={addressDraft}
        editing={Boolean(editingAddressId)}
        onChange={setAddressDraft}
        onClose={() => setAddressDialogOpen(false)}
        onSave={saveAddress}
      />
      <PasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />

      <Snackbar
        open={notificationOpen}
        autoHideDuration={3500}
        onClose={() => setNotificationOpen(false)}
        message="Los cambios del perfil fueron guardados"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  )
}
