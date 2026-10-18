import { Box, Card, Typography } from '@mui/material'

export default function StatMetricCard({
  title,
  value,
  subtitle,
  trendText,
  trendColor = 'success.main',
  icon,
  iconBg = 'secondary.light',
  iconColor = 'primary.main',
}) {
  return (
    <Card sx={{ p: 2.25, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      {icon && (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: iconBg,
            color: iconColor,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, my: 0.25 }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          {trendText && (
            <Typography variant="caption" sx={{ fontWeight: 700, color: trendColor }}>
              {trendText}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  )
}