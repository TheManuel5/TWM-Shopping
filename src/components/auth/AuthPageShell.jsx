import { Box, Typography } from '@mui/material'
import logoImage from '../../assets/login/Logo-prototipo.png'
import illustrationImage from '../../assets/login/shop.png'

const decorativeDots = Array.from({ length: 18 }, (_, index) => index)

export default function AuthPageShell({ accentHeadline, children, description, headline }) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100dvh',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.08fr 0.92fr' },
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: { xs: 90, md: 150 },
          height: { xs: 70, md: 110 },
          bgcolor: 'primary.main',
          borderBottomRightRadius: '100%',
          zIndex: 0,
        }}
      />

      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: { xs: 18, md: 24 },
          right: { xs: 18, md: 30 },
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 6px)',
          gap: 1.25,
          zIndex: 1,
        }}
      >
        {decorativeDots.map((dot) => (
          <Box
            key={dot}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: dot > 13 ? 'primary.light' : 'primary.main',
            }}
          />
        ))}
      </Box>

      <Box
        component="svg"
        aria-hidden="true"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: { xs: 58, md: 86 },
          zIndex: 0,
        }}
      >
        <path d="M0 45 C280 5 460 18 720 56 C1000 97 1210 70 1440 18 L1440 120 L0 120 Z" fill="#030c2e" />
        <path d="M0 82 C260 46 470 48 720 82 C990 118 1210 98 1440 58 L1440 120 L0 120 Z" fill="#602ff7" />
      </Box>

      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          left: 18,
          bottom: 20,
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: 'repeat(6, 6px)',
          gap: 1.1,
          zIndex: 1,
        }}
      >
        {decorativeDots.map((dot) => (
          <Box
            key={dot}
            sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'common.white' }}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          minWidth: 0,
          flexDirection: 'column',
          justifyContent: 'center',
          px: { md: 6, lg: 8 },
          py: 3,
          zIndex: 1,
        }}
      >
        <Box
          component="img"
          src={logoImage}
          alt="Shopping"
          sx={{
            width: 'min(30vw, 390px)',
            maxHeight: '13vh',
            objectFit: 'contain',
            objectPosition: 'left',
          }}
        />
        <Typography
          component="h1"
          sx={{
            mt: 1.5,
            maxWidth: 650,
            color: 'text.primary',
            fontSize: 'clamp(2.5rem, 4.1vw, 4.25rem)',
            fontWeight: 900,
            lineHeight: 0.98,
            letterSpacing: '-0.04em',
          }}
        >
          {headline}
          <br />
          <Box component="span" sx={{ color: 'primary.main' }}>
            {accentHeadline}
          </Box>
        </Typography>
        <Typography
          sx={{
            mt: 1.5,
            maxWidth: 470,
            color: 'text.secondary',
            fontSize: 'clamp(1rem, 1.35vw, 1.3rem)',
            lineHeight: 1.28,
          }}
        >
          {description}
        </Typography>
        <Box
          component="img"
          src={illustrationImage}
          alt="Productos y servicios disponibles en Shopping"
          sx={{
            width: 'min(42vw, 540px)',
            maxHeight: '45vh',
            mt: 1.5,
            alignSelf: 'center',
            objectFit: 'contain',
          }}
        />
      </Box>

      <Box
        sx={{
          minWidth: 0,
          display: 'grid',
          placeItems: 'center',
          p: { xs: 2, sm: 3, md: 4 },
          overflowY: { xs: 'auto', md: 'hidden' },
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
