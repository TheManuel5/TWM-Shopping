import { useEffect, useState, useSyncExternalStore } from 'react'
import { Alert, Box, Button, Fade, LinearProgress, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { CloudUploadOutlined, ShoppingBagOutlined } from '@mui/icons-material'
import { API_MODE, apiService } from '../../services/api'
import { loadRemoteState, getPersistenceStatus, subscribePersistence } from '../../data/localStore'
import useAuth from '../../contexts/AuthContext/useAuth'

function SaveProgress({ status }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!status.pending) return
    const timer = setTimeout(() => setVisible(true), 450)
    return () => { clearTimeout(timer); setVisible(false) }
  }, [status.pending])
  const measured = status.total > 1
  const progress = Math.round(status.completed / Math.max(1, status.total) * 100)
  return <Fade in={visible && status.pending > 0} unmountOnExit><Paper role="status" aria-live="polite" aria-label="Guardando cambios" elevation={4} sx={{ position: 'fixed', bottom: { xs: 16, md: 24 }, right: { xs: 16, md: 24 }, zIndex: theme => theme.zIndex.snackbar, width: 270, maxWidth: 'calc(100vw - 32px)', p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', pointerEvents: 'none' }}>
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1 }}><CloudUploadOutlined color="primary" /><Box sx={{ flex: 1 }}><Typography variant="body2" fontWeight={700}>Guardando cambios</Typography><Typography variant="caption" color="text.secondary">{measured ? `${status.completed} de ${status.total} operaciones · ${progress}%` : 'Confirmando con el servidor…'}</Typography></Box></Stack>
    <LinearProgress aria-label="Progreso de guardado" variant={measured ? 'determinate' : 'indeterminate'} value={measured ? progress : undefined} sx={{ height: 4 }} />
  </Paper></Fade>
}
export default function ApiGate({ children }) {
  const { setServerUser } = useAuth()
  const [ready, setReady] = useState(!API_MODE)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [progress, setProgress] = useState(0)
  const persistence = useSyncExternalStore(subscribePersistence, getPersistenceStatus)
  useEffect(() => {
    if (!API_MODE) return
    let active = true
    async function load() {
      try {
        let profile = null
        try { profile = await apiService.me() } catch (error) { if (error.status !== 401) throw error }
        if (active) setProgress(50)
        await loadRemoteState()
        if (active) { setProgress(100); setServerUser(profile); setReady(true); setError('') }
      } catch (error) { if (active) setError(error.message) }
    }
    load()
    return () => { active = false }
  }, [attempt, setServerUser])
  if (!ready) return <Box sx={{ maxWidth: 1300, mx: 'auto', p: { xs: 2, md: 4 } }} aria-busy={!error} aria-label="Cargando Shopping">
    {error ? <Alert severity="error" action={<Button variant="contained" onClick={() => { setProgress(0); setError(''); setAttempt(value => value + 1) }}>Reintentar</Button>}>{error}</Alert> : <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}><Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}><Box sx={{ display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'white', borderRadius: 3, width: 48, height: 48 }}><ShoppingBagOutlined /></Box><Box sx={{ flex: 1 }}><Typography variant="h6">Preparando Shopping</Typography><Typography variant="body2" color="text.secondary">{progress < 50 ? 'Comprobando tu sesión' : 'Cargando catálogo y datos de tu cuenta'}</Typography></Box><Typography color="primary" fontWeight={800}>{progress}%</Typography></Stack><LinearProgress variant="determinate" value={progress} aria-label="Progreso de carga inicial" sx={{ height: 6 }} /><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Avance por etapas completadas: sesión y datos.</Typography></Paper>
      <Skeleton variant="rounded" height={64} /><Skeleton width="40%" height={40} /><Skeleton variant="rounded" height={200} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>{[1, 2, 3, 4].map(id => <Skeleton key={id} variant="rounded" height={220} />)}</Box>
    </Stack>}
  </Box>
  return <><SaveProgress status={persistence} />{persistence.error && <Alert severity="error" sx={{ position: 'sticky', top: 0, zIndex: 1900 }}>{persistence.error}</Alert>}{children}</>
}
