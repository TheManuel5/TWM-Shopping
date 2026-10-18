import { Box, Typography } from '@mui/material'
import { formatCLP } from '../../../utils/taxonomyData'

export default function PriceTag({
  price,
  originalPrice,
  highlightColor = 'primary.main',
  size = 'md',
}) {
  const fontSizes = {
    sm: '1rem',
    md: '1.35rem',
    lg: '1.85rem',
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {originalPrice && originalPrice > price && (
        <Typography
          variant="caption"
          sx={{
            textDecoration: 'line-through',
            color: 'text.secondary',
            fontWeight: 500,
            lineHeight: 1.1,
          }}
        >
          {formatCLP(originalPrice)}
        </Typography>
      )}
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: fontSizes[size] || fontSizes.md,
          color: highlightColor,
          lineHeight: 1.2,
        }}
      >
        {formatCLP(price)}
      </Typography>
    </Box>
  )
}