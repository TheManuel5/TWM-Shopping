import { flushPersistence } from '../../data/localStore'
import { API_MODE } from '../../services/api'
import useCollection from '../../hooks/useCollection'
import useAuth from '../../contexts/AuthContext/useAuth'
import { logEvent, readCollection, writeCollection } from '../../data/localStore'
import { notify } from '../../utils/feedback'
import { emailPattern, phonePattern } from '../../utils/validation'
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import AddressCard from './components/AddressCard/AddressCard'
import AddressDialog from './components/AddressDialog/AddressDialog'
import PasswordDialog from './components/PasswordDialog/PasswordDialog'
import '../../components/orders/Orders.css'

const initialProfile = {
  fullName: 'Juan Ramirez',
  rut: '12.345.678-9',
  email: 'juan.ramirez@shopping.cl',
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
    <Stack direction="row" spacing={1.5}  sx={[{ alignItems: "flex-start" }, sx]}>
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
        <Typography
          variant="h6"
          sx={{ color: '#13234d', fontSize: '1.125rem', fontWeight: 700 }}
        >
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
  const { user, updateProfile } = useAuth()
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const born = user.fechaNacimiento?.split('-')
  const [savedProfile, setSavedProfile] = useCollection('profile:' + user.rut, { ...initialProfile, fullName: user.nombre, rut: user.rut, email: user.email, ...(born ? { birthDay: String(Number(born[2])), birthMonth: months[Number(born[1]) - 1], birthYear: born[0] } : {}), phones: [{ id: 1, number: user.telefono || '', label: 'Principal' }] })
  const [profile, setProfile] = useState(savedProfile)
  const [addresses, setAddresses] = useCollection('addresses:' + user.rut, initialAddresses.map((address, index) => index === 0 ? { ...address, street: user.direccion || address.street } : address))
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [addressDraft, setAddressDraft] = useState(emptyAddress)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressToDelete, setAddressToDelete] = useState(null)
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
    if (profile.phones.length <= 1) { notify('Debes conservar al menos un teléfono.', 'warning'); return }
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
    if (['name', 'region', 'province', 'commune', 'street', 'number'].some(field => !String(addressDraft[field]).trim())) { notify('Completa todos los campos obligatorios de la dirección.', 'error'); return }
    const mustRemainPrimary =
      editingAddressId &&
      !addressDraft.primary &&
      !addresses.some(
        (address) => address.id !== editingAddressId && address.primary,
      )
    const savedAddress = {
      ...addressDraft,
      id: editingAddressId ?? Date.now(),
      primary: mustRemainPrimary ? true : addressDraft.primary,
    }

    setAddresses((currentAddresses) => {
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
    logEvent(
      editingAddressId ? 'Dirección actualizada:' : 'Dirección agregada:',
      savedAddress,
    )
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

  const deleteAddress = () => {
    if (!addressToDelete) return
    if (addresses.length <= 1) { notify('Debes conservar al menos una dirección de despacho.', 'warning'); setAddressToDelete(null); return }

    setAddresses((currentAddresses) => {
      const remainingAddresses = currentAddresses.filter(
        (address) => address.id !== addressToDelete.id,
      )

      if (addressToDelete.primary && remainingAddresses.length > 0) {
        return remainingAddresses.map((address, index) => ({
          ...address,
          primary: index === 0,
        }))
      }

      return remainingAddresses
    })
    logEvent('Dirección eliminada:', addressToDelete)
    setAddressToDelete(null)
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    if (profile.fullName.trim().length < 3 || !emailPattern.test(profile.email) || !profile.phones.length || profile.phones.some(phone => !phonePattern.test(phone.number)) || new Set(profile.phones.map(phone => phone.number.replace(/\D/g, ''))).size !== profile.phones.length) { notify('Revisa nombre, correo y teléfonos. Los teléfonos deben ser válidos y no repetirse.', 'error'); return }
    const birthday = `${profile.birthYear}-${String(months.indexOf(profile.birthMonth) + 1).padStart(2, '0')}-${String(profile.birthDay).padStart(2, '0')}`
    const date = new Date(birthday)
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== birthday || date > new Date() || Number(profile.birthYear) < 1900) { notify('La fecha de nacimiento no es válida.', 'error'); return }
    const accounts = readCollection('accounts', [])
    if (accounts.some(account => account.rut !== user.rut && (account.email.toLowerCase() === profile.email.trim().toLowerCase() || profile.phones.some(phone => phone.number.replace(/\D/g, '') === account.telefono.replace(/\D/g, ''))))) { notify('El correo o teléfono ya pertenece a otra cuenta.', 'error'); return }
    setSavedProfile(profile)
    if (API_MODE) { try { await flushPersistence() } catch (error) { notify(error.message, 'error'); return } }
    updateProfile({ nombre: profile.fullName.trim(), email: profile.email.trim(), fechaNacimiento: birthday })
    if (!API_MODE) writeCollection('accounts', accounts => accounts.map(account => account.rut === user.rut ? { ...account, nombre: profile.fullName.trim(), email: profile.email.trim(), fechaNacimiento: birthday } : account))
    logEvent('Información personal actualizada:', {
      ...profile,
    })
    setNotificationOpen(true)
  }

  return (
    <Box component="form" onSubmit={handleSaveProfile} className="orders-page">
      <Box className="orders-main">
        <Box className="orders-breadcrumb">
          Panel de control <span>/</span> Mi perfil
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box>
            <Typography
              component="h1"
              sx={{
                color: '#13234d',
                fontSize: { xs: '1.75rem', sm: '2.125rem' },
                fontWeight: 700,
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
              <Typography variant="body2"  sx={[{ fontWeight: 700 }, { mb: 1 }]}>
                Fecha de nacimiento
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                  gap: 1.5,
                }}
              >
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

                 slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 4 } }}/>
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
            <Typography variant="body2"  sx={[{ fontWeight: 700 }, { mb: 1 }]}>
              Teléfonos
            </Typography>
            <Stack spacing={1.25}>
              {profile.phones.map((phone) => (
                <Stack key={phone.id} direction="row" spacing={1}  sx={{ alignItems: "center" }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={phone.number}
                    onChange={(event) => updatePhone(phone.id, event.target.value)}
                    slotProps={{ ...({
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
                    }), htmlInput: { 'aria-label': phone.label } }}

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
                deleteDisabled={API_MODE || addresses.length === 1}
                onDelete={() => setAddressToDelete(address)}
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

      <Dialog
        open={Boolean(addressToDelete)}
        onClose={() => setAddressToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Eliminar dirección</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Confirmas que deseas eliminar la dirección {addressToDelete?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAddressToDelete(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteOutlineOutlined />}
            onClick={deleteAddress}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notificationOpen}
        autoHideDuration={3500}
        onClose={() => setNotificationOpen(false)}
        message="Los cambios del perfil fueron guardados"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
      </Box>
    </Box>
  )
}
