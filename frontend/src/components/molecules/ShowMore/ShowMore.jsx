import { ExpandMoreRounded } from '@mui/icons-material'
import { Button, LinearProgress, Stack, Typography } from '@mui/material'

/** Pie de lista por bloques: cuánto se está viendo y un botón para cargar el siguiente bloque. */
export default function ShowMore({ shown, total, step, onMore, label = 'registros' }) {
  if (total <= step) return null
  const remaining = total - shown
  return <Stack spacing={1.25} sx={{ alignItems: 'center', py: 2.5 }}>
    <Typography variant="body2" color="text.secondary">Viendo {shown.toLocaleString('es-CL')} de {total.toLocaleString('es-CL')} {label}</Typography>
    <LinearProgress variant="determinate" value={shown / total * 100} aria-label={`Progreso de ${label} vistos`} sx={{ width: 200, height: 4 }} />
    {remaining > 0 && <Button variant="outlined" endIcon={<ExpandMoreRounded />} onClick={onMore} sx={{ px: 3.5, borderRadius: 99, bgcolor: 'background.paper' }}>Ver {Math.min(step, remaining)} más</Button>}
  </Stack>
}
