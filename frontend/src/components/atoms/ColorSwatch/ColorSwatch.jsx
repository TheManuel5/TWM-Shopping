import { Box, Tooltip } from '@mui/material'

export default function ColorSwatch({ colorHex, name, selected = false, onClick, size = 28 }) {
  return (
    <Tooltip title={name || colorHex}>
      <Box
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: colorHex,
          cursor: 'pointer',
          border: selected ? '3px solid #602ff7' : '1px solid #d1d5db',
          boxShadow: selected ? '0 0 0 2px #ffffff inset' : 'none',
          transition: 'transform 0.15s ease',
          '&:hover': { transform: 'scale(1.1)' },
        }}
      />
    </Tooltip>
  )
}