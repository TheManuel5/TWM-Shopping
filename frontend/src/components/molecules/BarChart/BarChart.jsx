import { Box, Stack, Tooltip, Typography } from '@mui/material'

const hiddenTable = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }
const plain = value => Number(value).toLocaleString('es-CL')

/**
 * Gráfico de barras de una sola serie, en el color principal de la marca.
 * - Cada barra tiene su valor escrito y un detalle al pasar el cursor o enfocarla.
 * - Incluye una tabla equivalente para lectores de pantalla.
 * `data`: [{ label, value, detail? }] · `format`: cómo escribir el valor · `vertical`: columnas en vez de filas.
 */
export default function BarChart({ data, format = plain, vertical = false, label, emptyText = 'Aún no hay datos para este gráfico.' }) {
  const rows = data.filter(row => Number.isFinite(row.value))
  if (!rows.length || rows.every(row => row.value === 0)) return <Typography variant="body2" color="text.secondary">{emptyText}</Typography>
  const max = Math.max(...rows.map(row => row.value), 1)
  const tip = row => `${row.label}: ${format(row.value)}${row.detail ? ` · ${row.detail}` : ''}`
  const bar = { bgcolor: 'primary.main', transition: 'background-color 150ms ease', '&:hover, &:focus-visible': { bgcolor: 'primary.dark', outline: 'none' } }

  return <Box role="group" aria-label={label} sx={{ position: 'relative' }}>
    {vertical ? <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: 'flex-end', height: 220, borderBottom: '1px solid', borderColor: 'divider', px: 0.5 }} aria-hidden="true">
      {rows.map(row => <Stack key={row.label} sx={{ flex: 1, minWidth: 0, height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5, maxWidth: '100%' }}>{format(row.value)}</Typography>
        <Tooltip title={tip(row)}>
          <Box tabIndex={0} sx={{ ...bar, width: '100%', maxWidth: 72, height: row.value > 0 ? `${Math.max(1, row.value / max * 82)}%` : 0, borderRadius: '4px 4px 0 0' }} />
        </Tooltip>
      </Stack>)}
    </Stack> : <Stack spacing={1.25} aria-hidden="true">
      {rows.map(row => <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 96px) minmax(0, 1fr) auto', sm: 'minmax(0, 150px) minmax(0, 1fr) auto' }, alignItems: 'center', gap: 1.5 }}>
        <Typography variant="body2" noWrap color="text.secondary" title={row.label}>{row.label}</Typography>
        <Box sx={{ height: 14, borderRadius: 1, bgcolor: 'secondary.light' }}>
          <Tooltip title={tip(row)}>
            <Box tabIndex={0} sx={{ ...bar, height: '100%', width: row.value > 0 ? `${Math.max(0.5, row.value / max * 100)}%` : 0, borderRadius: '0 4px 4px 0' }} />
          </Tooltip>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{format(row.value)}</Typography>
      </Box>)}
    </Stack>}
    {vertical && <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ px: 0.5, mt: 0.75 }} aria-hidden="true">
      {rows.map(row => <Typography key={row.label} variant="caption" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0, textAlign: 'center' }}>{row.label}</Typography>)}
    </Stack>}
    <Box component="table" sx={hiddenTable}>
      <caption>{label}</caption>
      <tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{format(row.value)}</td></tr>)}</tbody>
    </Box>
  </Box>
}
