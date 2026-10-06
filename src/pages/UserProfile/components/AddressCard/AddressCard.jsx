import {
  DeleteOutlineOutlined,
  EditOutlined,
  HomeOutlined,
  LocationOnOutlined,
} from '@mui/icons-material'
import { Box, Button, Chip, IconButton, Radio, Stack, Tooltip, Typography } from '@mui/material'

export default function AddressCard({ address, deleteDisabled, onDelete, onEdit, onSetPrimary }) {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: address.primary ? 'primary.main' : 'divider',
        bgcolor: address.primary ? 'rgba(96, 47, 247, 0.05)' : 'background.paper',
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Radio
          checked={address.primary}
          onChange={onSetPrimary}
          value={address.id}
          name="primary-address"
          inputProps={{ 'aria-label': `Usar ${address.name} como dirección principal` }}
          sx={{ p: 0.5 }}
        />
        <HomeOutlined color={address.primary ? 'primary' : 'action'} sx={{ mt: 0.5 }} />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography fontWeight={700}>{address.name}</Typography>
            {address.primary && (
              <Chip label="Dirección principal" size="small" color="primary" variant="outlined" />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            ID: DIR-{String(address.id).padStart(3, '0')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {address.region}, Provincia de {address.province}, Comuna de {address.commune}
          </Typography>
          <Typography variant="body2">
            {address.street} {address.number}{address.department ? `, ${address.department}` : ''}
          </Typography>
          {address.reference && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <LocationOnOutlined sx={{ fontSize: 15, verticalAlign: 'text-bottom', mr: 0.5 }} />
              Referencia: {address.reference}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Button size="small" startIcon={<EditOutlined />} onClick={onEdit}>
            Editar
          </Button>
          <Tooltip
            title={deleteDisabled ? 'Debes mantener al menos una dirección' : 'Eliminar dirección'}
          >
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={deleteDisabled}
                onClick={onDelete}
                aria-label={`Eliminar dirección ${address.name}`}
              >
                <DeleteOutlineOutlined fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  )
}
