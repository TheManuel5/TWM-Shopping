import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Alert, Box, Button, Fade, LinearProgress, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { CheckCircleRounded, CloudDoneOutlined, CloudSyncOutlined, RadioButtonUncheckedRounded, ShoppingBagOutlined } from '@mui/icons-material'
import { API_MODE, apiService } from '../../services/api'
import { loadRemoteState, getPersistenceStatus, subscribePersistence } from '../../data/localStore'
import useAuth from '../../contexts/AuthContext/useAuth'
import useSmoothProgress, { expectedDuration, rememberDuration } from '../../hooks/useSmoothProgress'

// Tramos del porcentaje. Cada etapa termina solo cuando ocurre el evento real.
const STAGES = [
  { id: 'session', label: 'Sesión', detail: 'Comprobando tu sesión', from: 0, to: 8 },
  { id: 'database', label: 'Base de datos', detail: 'Consultando PostgreSQL', from: 8, to: 55 },
  { id: 'download', label: 'Descarga', detail: 'Recibiendo catálogo y datos de tu cuenta', from: 55, to: 94 },
  { id: 'ready', label: 'Listo', detail: 'Preparando la tienda', from: 94, to: 100 },
]
const megabytes = bytes => (bytes / 1048576).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

function StorefrontSkeleton() {
  return <Box aria-hidden="true" sx={{ maxWidth: 1300, mx: 'auto', px: { xs: 2, md: 4 }, pb: 4 }}>
    <Skeleton variant="rounded" height={{ xs: 150, md: 220 }} sx={{ borderRadius: 4, mb: 3 }} />
    <Skeleton width={220} height={36} sx={{ mb: 1.5 }} />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2 }}>
      {[1, 2, 3, 4, 5].map(id => <Paper key={id} variant="outlined" sx={{ p: 1.5, borderRadius: 3, display: { xs: id > 4 ? 'none' : 'block', lg: 'block' } }}>
        <Skeleton variant="rounded" height={140} sx={{ borderRadius: 2, mb: 1.5 }} />
        <Skeleton width="85%" /><Skeleton width="55%" /><Skeleton width="40%" height={32} />
      </Paper>)}
    </Box>
  </Box>
}

function LoadingScreen({ target, stage, download, error, onRetry }) {
  const percent = useSmoothProgress(target)
  const active = STAGES.findIndex(item => item.id === stage)
  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }} aria-busy={!error} aria-label="Cargando Shopping">
    <Box sx={{ height: 64, bgcolor: '#030c2e', display: 'flex', alignItems: 'center', px: { xs: 2, md: 4 }, gap: 1.25, mb: { xs: 3, md: 5 } }}>
      <Box sx={{ display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'white', borderRadius: 2, width: 36, height: 36 }}><ShoppingBagOutlined fontSize="small" /></Box>
      <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>Shopping</Typography>
    </Box>
    <Paper elevation={0} sx={{ maxWidth: 560, mx: { xs: 2, sm: 'auto' }, p: { xs: 3, sm: 4 }, mb: 5, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 18px 50px rgba(96,47,247,0.10)' }}>
      {error ? <Stack spacing={2}>
        <Typography variant="h6">No pudimos cargar la tienda</Typography>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={onRetry} sx={{ alignSelf: 'flex-start' }}>Reintentar</Button>
      </Stack> : <>
        <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.08em' }}>Sincronizando</Typography>
            <Typography variant="h6" sx={{ lineHeight: 1.25 }}>{STAGES[Math.max(0, active)].detail}</Typography>
          </Box>
          <Typography aria-hidden="true" sx={{ fontWeight: 900, fontSize: { xs: '2.4rem', sm: '3rem' }, lineHeight: 1, color: 'primary.main', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em' }}>{percent}<Box component="span" sx={{ fontSize: '0.45em', ml: 0.25 }}>%</Box></Typography>
        </Stack>
        <LinearProgress variant="determinate" value={percent} aria-label="Progreso de carga inicial" sx={{ height: 10, borderRadius: 99, '& .MuiLinearProgress-bar': { borderRadius: 99, background: 'linear-gradient(90deg, #8060fa 0%, #602ff7 60%, #4520c7 100%)', transition: 'none' } }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, minHeight: 20, fontVariantNumeric: 'tabular-nums' }}>
          {stage === 'download' && download.total ? `${megabytes(download.loaded)} de ${megabytes(download.total)} MB recibidos` : stage === 'database' ? 'El servidor está reuniendo los datos' : ' '}
        </Typography>
        <Stack direction="row" sx={{ mt: 2, justifyContent: 'space-between', gap: 1 }}>
          {STAGES.map((item, index) => {
            const done = index < active || percent >= 100
            return <Stack key={item.id} direction="row" spacing={0.5} sx={{ alignItems: 'center', color: done ? 'success.main' : index === active ? 'primary.main' : 'text.disabled', minWidth: 0 }}>
              {done ? <CheckCircleRounded sx={{ fontSize: 18 }} /> : <RadioButtonUncheckedRounded sx={{ fontSize: 18 }} />}
              <Typography variant="caption" noWrap sx={{ fontWeight: index === active ? 800 : 600, color: 'inherit' }}>{item.label}</Typography>
            </Stack>
          })}
        </Stack>
      </>}
    </Paper>
    {!error && <StorefrontSkeleton />}
  </Box>
}

function SaveProgress({ status }) {
  const [target, setTarget] = useState(0)
  const [phase, setPhase] = useState('idle')
  const started = useRef(0)
  const busy = status.pending > 0
  useEffect(() => {
    if (!busy) return
    started.current = performance.now()
    const expected = expectedDuration('commit', 900)
    const show = setTimeout(() => setPhase('saving'), 250)
    const tick = () => {
      const { completed, total } = getPersistenceStatus()
      // La operación en curso avanza hasta el 90 % de su tramo; el resto llega con la confirmación.
      const current = Math.min(0.9, (performance.now() - started.current) / expected)
      setTarget(Math.min(96, (completed + current) / Math.max(1, total) * 100))
    }
    const timer = setInterval(tick, 120)
    return () => {
      clearTimeout(show); clearInterval(timer)
      rememberDuration('commit', performance.now() - started.current)
      setTarget(100)
      setPhase(value => value === 'saving' ? 'saved' : 'idle')
    }
  }, [busy])
  useEffect(() => {
    if (phase !== 'saved') return
    const timer = setTimeout(() => { setPhase('idle'); setTarget(0) }, 1400)
    return () => clearTimeout(timer)
  }, [phase])
  const percent = useSmoothProgress(target)
  const saved = phase === 'saved' && !busy
  return <Fade in={phase !== 'idle' && !status.error} unmountOnExit><Paper role="status" aria-live="polite" elevation={0} sx={{ position: 'fixed', bottom: { xs: 16, md: 24 }, right: { xs: 16, md: 24 }, zIndex: theme => theme.zIndex.snackbar, width: 300, maxWidth: 'calc(100vw - 32px)', p: 2, borderRadius: 3, border: '1px solid', borderColor: saved ? 'success.light' : 'divider', boxShadow: '0 16px 40px rgba(3,12,46,0.16)', pointerEvents: 'none' }}>
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1.25 }}>
      {saved ? <CloudDoneOutlined color="success" /> : <CloudSyncOutlined color="primary" />}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 800 }}>{saved ? 'Cambios guardados' : 'Guardando en la base de datos'}</Typography>
        <Typography variant="caption" color="text.secondary">{saved ? 'Sincronizado con PostgreSQL' : status.total > 1 ? `Operación ${Math.min(status.total, status.completed + 1)} de ${status.total}` : 'Esperando la confirmación del servidor'}</Typography>
      </Box>
      <Typography sx={{ fontWeight: 900, color: saved ? 'success.main' : 'primary.main', fontVariantNumeric: 'tabular-nums' }}>{saved ? 100 : percent}%</Typography>
    </Stack>
    <LinearProgress aria-label="Progreso de guardado" variant="determinate" color={saved ? 'success' : 'primary'} value={saved ? 100 : percent} sx={{ height: 6, '& .MuiLinearProgress-bar': { transition: 'none' } }} />
  </Paper></Fade>
}

export default function ApiGate({ children }) {
  const { setServerUser } = useAuth()
  const [ready, setReady] = useState(!API_MODE)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [target, setTarget] = useState(0)
  const [stage, setStage] = useState('session')
  const [download, setDownload] = useState({ loaded: 0, total: 0 })
  const persistence = useSyncExternalStore(subscribePersistence, getPersistenceStatus)
  useEffect(() => {
    if (!API_MODE) return
    let active = true
    let timer
    const range = id => STAGES.find(item => item.id === id)
    async function load() {
      try {
        let profile = null
        try { profile = await apiService.me() } catch (error) { if (error.status !== 401) throw error }
        if (!active) return
        setStage('database'); setTarget(range('database').from)
        // Mientras el servidor consulta no hay bytes que medir: el tramo avanza según
        // la duración de la carga anterior y nunca supera su límite hasta que responde.
        const started = performance.now(), expected = expectedDuration('state', 3500), database = range('database')
        timer = setInterval(() => setTarget(database.from + (database.to - database.from) * Math.min(0.92, (performance.now() - started) / expected)), 120)
        await loadRemoteState(event => {
          if (!active) return
          const span = range('download')
          if (event.phase === 'response') { clearInterval(timer); rememberDuration('state', performance.now() - started); setStage('download'); setTarget(span.from) }
          if (event.phase === 'download') { setDownload({ loaded: event.loaded, total: event.total }); setTarget(span.from + (span.to - span.from) * event.loaded / event.total) }
        })
        clearInterval(timer)
        if (!active) return
        setStage('ready'); setTarget(100); setServerUser(profile); setError('')
        // Un instante para que el contador llegue a 100 antes de mostrar la tienda.
        setTimeout(() => { if (active) setReady(true) }, 450)
      } catch (error) { clearInterval(timer); if (active) setError(error.message) }
    }
    load()
    return () => { active = false; clearInterval(timer) }
  }, [attempt, setServerUser])
  if (!ready) return <LoadingScreen target={target} stage={stage} download={download} error={error} onRetry={() => { setTarget(0); setStage('session'); setDownload({ loaded: 0, total: 0 }); setError(''); setAttempt(value => value + 1) }} />
  return <><SaveProgress status={persistence} />{persistence.error && <Alert severity="error" sx={{ position: 'sticky', top: 0, zIndex: 1900 }}>{persistence.error}</Alert>}{children}</>
}
