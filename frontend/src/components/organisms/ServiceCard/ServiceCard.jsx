import { FavoriteBorderOutlined, LocationOnOutlined, StarBorderOutlined } from '@mui/icons-material'
import { Box, Card, Chip, IconButton, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { formatCLP } from '../../../utils/taxonomyData'

export default function ServiceCard({ service, favorite = false, onToggleFavorite }) {
  const navigate = useNavigate()

  return (
    <Card
      onClick={() => navigate(`/servicio/${service.id}`)}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: service.horizontal ? 'row' : 'column',
        gap: 1.5,
        alignItems: service.horizontal ? 'center' : 'stretch',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 20px rgba(96, 47, 247, 0.10)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: service.horizontal ? 110 : '100%',
          height: service.horizontal ? 92 : 148,
          borderRadius: 2.5,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={service.image}
          alt={service.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Chip
          label={service.comuna || 'Osorno'}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(255,255,255,0.92)',
            color: 'text.primary',
            fontWeight: 700,
            height: 22,
            fontSize: '0.7rem',
          }}
        />
        {!service.horizontal && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite?.(service.id)
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.92)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            {favorite ? <FavoriteBorderOutlined color="primary" fontSize="small" /> : <FavoriteBorderOutlined fontSize="small" />}
          </IconButton>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
            {service.name}
          </Typography>
          {service.horizontal && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite?.(service.id)
              }}
              sx={{ p: 0.25 }}
            >
              {favorite ? <FavoriteBorderOutlined color="primary" fontSize="small" /> : <FavoriteBorderOutlined fontSize="small" />}
            </IconButton>
          )}
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }} noWrap>
          {service.category}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: service.price ? 1 : 0 }}>
          <StarBorderOutlined sx={{ fontSize: 16, color: '#f59e0b' }} />
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            {service.rating}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({service.reviews})
          </Typography>
        </Stack>

        {service.price && (
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                {formatCLP(service.price)}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <LocationOnOutlined sx={{ fontSize: 13, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {service.comuna || 'Osorno'}
                </Typography>
              </Stack>
            </Box>
            {service.modality && (
              <Chip
                label={service.modality}
                size="small"
                sx={{
                  bgcolor: service.modality === 'Online' ? '#dcfce7' : '#dbeafe',
                  color: service.modality === 'Online' ? '#15803d' : '#1d4ed8',
                  fontSize: '0.7rem',
                }}
              />
            )}
          </Stack>
        )}
      </Box>
    </Card>
  )
}