import { useEffect, useState } from 'react'
import { Alert, Button, Card, MenuItem, Skeleton, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from '@mui/material'
import { fetchApi } from '../../services/api'
import { confirmAction, notify } from '../../utils/feedback'
import { exportDocument } from '../../utils/pdfExport'
export default function DatabasePanel() {
  const [mode, setMode] = useState('queries'), [queries, setQueries] = useState([]), [tables, setTables] = useState([])
  const [selected, setSelected] = useState(''), [table, setTable] = useState(''), [args, setArgs] = useState([]), [rows, setRows] = useState([])
  const [fields, setFields] = useState('{}'), [key, setKey] = useState('{}'), [busy, setBusy] = useState(false), [error, setError] = useState('')
  useEffect(() => { Promise.all([fetchApi('/admin/database/queries'), fetchApi('/admin/database/tables')]).then(([q, t]) => { setQueries(q); setTables(t) }).catch(error => setError(error.message)) }, [])
  const query = queries.find(item => item.id === selected)
  const parameters = query?.parameters || []
  const initialArgs = q => (q?.parameters || []).map(p => p.type === 'jsonb' ? '{}' : p.optional ? '' : '')
  const run = async () => {
    setBusy(true); setError('')
    try { const result = mode === 'queries' ? await fetchApi('/admin/database/queries/' + selected, { method: 'POST', body: JSON.stringify(args.map((value, index) => parameters[index]?.type === 'jsonb' || parameters[index]?.type.endsWith('[]') ? (value ? JSON.parse(value) : null) : value === '' ? null : value)) }) : await fetchApi('/admin/database/tables/' + table); setRows(result) }
    catch (error) { setError(error.message) } finally { setBusy(false) }
  }
  const mutate = async method => {
    let payload
    try { payload = { fields: JSON.parse(fields), key: JSON.parse(key) } } catch { setError('Escribe objetos JSON válidos.'); return }
    if (!await confirmAction(`¿Confirmar ${method} sobre la tabla ${table}? PostgreSQL aplicará sus restricciones.`, 'Confirmar cambio en la base')) return
    setBusy(true); setError('')
    try { await fetchApi('/admin/database/tables/' + table, { method, body: JSON.stringify(payload) }); notify('Operación confirmada por PostgreSQL.'); setRows(await fetchApi('/admin/database/tables/' + table)) }
    catch (error) { setError(error.message) } finally { setBusy(false) }
  }
  const columns = [...new Set(rows.flatMap(row => Object.keys(row || {})))]
  return <Card sx={{ p: 3 }}><Typography variant="h6">Consultas y tablas de la base cargada</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Acceso administrativo a las funciones y a las 41 tablas de public. Las contraseñas no se muestran.</Typography>
    <Tabs value={mode} onChange={(_, mode) => { setMode(mode); setRows([]); setError('') }} sx={{ mb: 2 }}><Tab value="queries" label="Consultas analíticas" /><Tab value="tables" label="Administración de tablas" /></Tabs>
    {mode === 'queries' ? <Stack spacing={2}><TextField select fullWidth label="Consulta de PostgreSQL" value={selected} onChange={event => { const q = queries.find(item => item.id === event.target.value); setSelected(event.target.value); setArgs(initialArgs(q)); setRows([]) }}>{queries.map(q => <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>)}</TextField>{parameters.map((parameter, index) => <TextField key={parameter.name} label={`${parameter.name} (${parameter.type})${parameter.optional ? ' · opcional' : ''}`} helperText={parameter.type === 'jsonb' ? 'Filtros JSON, por ejemplo {} para todos los registros.' : parameter.type.endsWith('[]') ? 'Lista JSON, por ejemplo ["Visa","MasterCard"]. Vacío usa el valor predeterminado.' : parameter.optional ? 'Vacío utiliza el valor predeterminado de PostgreSQL.' : 'Completa el parámetro requerido.'} value={args[index] || ''} onChange={event => setArgs(current => current.map((value, i) => i === index ? event.target.value : value))} />)}</Stack> : <Stack spacing={2}><TextField select label="Tabla" value={table} onChange={event => { setTable(event.target.value); setRows([]) }}>{tables.map(t => <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>)}</TextField><Alert severity="info">La lectura muestra hasta 100 registros. Para modificar o eliminar, indica la clave primaria completa en JSON. El motor protege las referencias y el historial.</Alert><TextField label="Campos a crear o modificar (JSON)" multiline minRows={4} value={fields} onChange={event => setFields(event.target.value)} /><TextField label="Clave primaria (JSON)" multiline minRows={2} value={key} onChange={event => setKey(event.target.value)} /><Stack direction="row" spacing={1}><Button disabled={!table || busy} onClick={() => mutate('POST')}>Crear</Button><Button disabled={!table || busy} onClick={() => mutate('PUT')}>Actualizar</Button><Button disabled={!table || busy} color="error" onClick={() => mutate('DELETE')}>Eliminar</Button></Stack></Stack>}
    <Stack direction="row" spacing={1} sx={{ my: 2 }}><Button variant="contained" disabled={busy || (mode === 'queries' ? !selected : !table)} onClick={run}>Ejecutar consulta</Button><Button disabled={!rows.length} onClick={() => exportDocument('SHOPPING - REPORTE POSTGRESQL', rows.map(row => Object.entries(row).map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`).join(' | ')), 'reporte-postgresql.pdf')}>Exportar PDF</Button></Stack>{error && <Alert severity="error">{error}</Alert>}{busy ? <Skeleton variant="rounded" height={240} /> : <TableContainer><Table size="small"><TableHead><TableRow>{columns.map(column => <TableCell key={column}>{column}</TableCell>)}</TableRow></TableHead><TableBody>{rows.map((row, index) => <TableRow key={index}>{columns.map(column => <TableCell key={column}>{typeof row[column] === 'object' ? JSON.stringify(row[column]) : String(row[column] ?? '')}</TableCell>)}</TableRow>)}</TableBody></Table></TableContainer>}
  </Card>
}
