import { AddOutlined, RemoveOutlined } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'

export default function QuantityInput({ value = 1, min = 1, max = 99, onChange, size = 'small' }) {
  const handleDecrease = () => {
    if (value > min) onChange?.(value - 1)
  }

  const handleIncrease = () => {
    if (value < max) onChange?.(value + 1)
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        height: size === 'small' ? 34 : 40,
      }}
    >
      <IconButton
        size="small"
        onClick={handleDecrease}
        disabled={value <= min}
        aria-label="disminuir cantidad"
      >
        <RemoveOutlined fontSize="small" />
      </IconButton>
      <Typography
        sx={{
          px: 1.5,
          minWidth: 32,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}
      >
        {value}
      </Typography>
      <IconButton
        size="small"
        onClick={handleIncrease}
        disabled={value >= max}
        aria-label="aumentar cantidad"
      >
        <AddOutlined fontSize="small" />
      </IconButton>
    </Box>
  )
}