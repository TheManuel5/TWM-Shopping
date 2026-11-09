import { Component } from 'react'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
export default class ViewErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error) { console.error('[Shopping] No se pudo mostrar la vista:', error.message) }
  render() {
    if (!this.state.failed) return this.props.children
    return <Box sx={{ maxWidth: 640, mx: 'auto', p: 3, pt: 8 }}><Alert severity="error"><Typography fontWeight={700}>No se pudo mostrar esta página</Typography><Typography variant="body2">Recarga la vista o vuelve al inicio para continuar.</Typography></Alert><Stack direction="row" spacing={1} sx={{ mt: 2 }}><Button variant="contained" onClick={() => window.location.reload()}>Recargar</Button><Button onClick={() => window.location.assign('/inicio')}>Ir al inicio</Button></Stack></Box>
  }
}
