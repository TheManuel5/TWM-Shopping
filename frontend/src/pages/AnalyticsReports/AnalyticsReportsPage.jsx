import DatabasePanel from './DatabasePanel'
import { API_MODE, fetchApi } from '../../services/api'
import { flushPersistence, hydrateState } from '../../data/localStore'
import { dateKey } from '../../utils/dates'
import { AccountTreeOutlined, AddOutlined, DeleteOutlineOutlined, EditOutlined, PlayArrowOutlined, StorageOutlined, WarningAmberOutlined } from '@mui/icons-material'
import { Box, Button, Card, Chip, Grid, IconButton, MenuItem, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import useCollection from '../../hooks/useCollection'
import { catalogSeed } from '../../data/catalog'
import { collectionEntries, logEvent, readCollection, writeCollection } from '../../data/localStore'
import { money, refreshQuotes } from '../../data/commerce'
import { CATEGORY_TREE, formatCLP } from '../../utils/taxonomyData'
import { flattenCategories, mapCategoryTree } from '../../utils/categories'
import { confirmAction, notify } from '../../utils/feedback'
import { exportDocument } from '../../utils/pdfExport'

export default function AnalyticsReportsPage() {
  const [tab, setTab] = useState('consultas')
  const [report, setReport] = useState('ventas')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [query, setQuery] = useState('')
  const [carrier, setCarrier] = useState('Todas')
  const [results, setResults] = useState(null)
  const [orders] = useCollection('orders', [])
  const [catalog] = useCollection('catalog', catalogSeed)
  const [tree, setTree] = useCollection('categories', CATEGORY_TREE)
  const [categoryName, setCategoryName] = useState('')
  const [parent, setParent] = useState('Productos')
  const [editing, setEditing] = useState(null)
  const [moderation, setModeration] = useState([])
  const nodes = flattenCategories(tree)
  const execute = async () => {
    if (from && to && from > to) { notify('El inicio no puede ser posterior al término.', 'error'); return }
    if (API_MODE) {
      try { await flushPersistence(); const rows = await fetchApi(`/reportes/${report}?${new URLSearchParams({ from, to, q: query, carrier })}`); setResults(rows.map(row => ({ ...row, valor: typeof row.valor === 'number' ? formatCLP(row.valor) : row.valor }))); notify(`${rows.length} resultados disponibles.`) }
      catch (error) { notify(error.message, 'error') }
      return
    }
    const selected = orders.filter(order => (!from || (order.createdAt ? dateKey(order.createdAt) : '') >= from) && (!to || (order.createdAt ? dateKey(order.createdAt) : '') <= to) && (!query || `${order.customer} ${order.store} ${order.products.map(item => item.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())) && (carrier === 'Todas' || order.dispatch?.carrier === carrier))
    let rows
    if (report === 'ventas') rows = selected.map(order => ({ id: order.id, titular: order.customer, detalle: order.store, valor: formatCLP(money(order.total)), estado: order.status }))
    else if (report === 'clientes') {
      const grouped = Object.groupBy(selected, order => order.customerRut || order.customer)
      rows = Object.entries(grouped).map(([id, sales]) => ({ id, titular: sales[0].customer, detalle: `${sales.length} compras`, valor: formatCLP(sales.reduce((sum, order) => sum + money(order.total), 0)), estado: 'Registrado' }))
    } else rows = selected.filter(order => order.dispatch).map(order => ({ id: order.id, titular: order.dispatch.carrier, detalle: order.dispatch.tracking, valor: order.address, estado: order.status }))
    setResults(rows); logEvent('Ejecutar reporte local', { report, from, to, query, carrier, count: rows.length }); notify(`${rows.length} resultados disponibles.`)
  }
  const saveCategory = event => {
    event.preventDefault()
    const name = categoryName.trim()
    if (name.length < 3 || nodes.some(node => node.name.toLowerCase() === name.toLowerCase() && node.id !== editing)) { notify('Usa un nombre único de al menos tres caracteres.', 'error'); return }
    const node = { id: `cat-${crypto.randomUUID()}`, name, children: [] }
    if (editing) {
      const old = nodes.find(item => item.id === editing)
      setTree(mapCategoryTree(tree, editing, item => ({ ...item, name })))
      writeCollection('catalog', catalog.map(product => ({ ...product, categoria: product.categoria === old.name ? name : product.categoria, subcategoria: product.subcategoria === old.name ? name : product.subcategoria })))
    } else if (parent === 'Productos' || parent === 'Servicios') setTree({ ...tree, [parent]: [...tree[parent], node] })
    else setTree(mapCategoryTree(tree, parent, item => ({ ...item, children: [...(item.children || []), node] })))
    logEvent(editing ? 'Editar categoría' : 'Crear categoría', { parent, name }); setCategoryName(''); setEditing(null); notify('Categoría guardada.')
  }
  const removeCategory = async node => {
    if (node.children?.length || catalog.some(product => product.categoria === node.name || product.subcategoria === node.name)) { notify('La categoría tiene subcategorías o publicaciones asociadas. Reasígnalas antes de eliminar.', 'warning'); return }
    if (!await confirmAction(`¿Eliminar la categoría ${node.name}?`)) return
    setTree(mapCategoryTree(tree, node.id, () => null)); logEvent('Eliminar categoría', { id: node.id }); notify('Categoría eliminada.')
  }
  const renderTree = (items, depth = 0) => items.map(node => <Box key={node.id} sx={{ pl: depth * 1.5, borderLeft: depth ? '1px solid' : 'none', borderColor: 'divider' }}><Stack direction="row"   sx={[{ alignItems: "center", gap: 1 }, { py: 0.5 }]}><Typography sx={{ flex: 1 }} variant="body2">{node.name}</Typography><IconButton size="small" aria-label={`Editar categoría ${node.name}`} onClick={() => { setEditing(node.id); setCategoryName(node.name) }}><EditOutlined fontSize="small" /></IconButton><IconButton size="small" color="error" aria-label={`Eliminar categoría ${node.name}`} onClick={() => removeCategory(node)}><DeleteOutlineOutlined fontSize="small" /></IconButton></Stack>{renderTree(node.children || [], depth + 1)}</Box>)
  const refreshModeration = () => {
    const now = new Date()
    const entries = collectionEntries()
    const questions = entries.filter(([key]) => key.startsWith('questions:')).flatMap(([key, values]) => values.filter(question => !question.answer && question.createdAt && now - new Date(question.createdAt) > 48 * 3600000).map(question => ({ id: question.id, canal: 'Pregunta pública', titular: question.user, detalle: question.question, enlace: `/producto/${key.split(':')[1]}` })))
    const messages = readCollection('messages', [])
    const last = Object.values(Object.groupBy(messages, message => message.conversationId)).map(thread => thread.at(-1)).filter(message => message.from === 'me' && message.createdAt && now - new Date(message.createdAt) > 48 * 3600000).map(message => ({ id: message.id, canal: 'Mensaje interno', titular: message.conversationId, detalle: message.text, enlace: '/mensajes' }))
    setModeration([...questions, ...last]); notify('Interacciones pendientes actualizadas.')
  }
  const lifecycle = async () => {
    if (API_MODE) { try { hydrateState(await fetchApi('/cotizaciones/mantenimiento', { method: 'POST' })); notify('Vigencia y precios actualizados.') } catch (error) { notify(error.message, 'error') } return }
 const current = readCollection('quotes', []); const next = refreshQuotes(current, catalog); writeCollection('quotes', next); logEvent('Actualizar vigencia de cotizaciones', { antes: current.length, despues: next.length }); notify('Vigencia y precios de cotizaciones actualizados.') }
  return <Box sx={{ maxWidth: 1400, mx: 'auto' }}><Typography variant="h4">Reportes, categorías y moderación</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Analiza la información comercial y administra la estructura del catálogo.</Typography><Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}><Tab value="consultas" icon={<StorageOutlined />} iconPosition="start" label="Reportes" /><Tab value="categorias" icon={<AccountTreeOutlined />} iconPosition="start" label="Categorías" /><Tab value="database" icon={<StorageOutlined />} iconPosition="start" label="Base relacional" /><Tab value="moderacion" icon={<WarningAmberOutlined />} iconPosition="start" label="Moderación" /></Tabs>
    {tab === 'database' && <DatabasePanel />}
    {tab === 'consultas' && <Card sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>Consulta de información comercial</Typography><Grid container spacing={2}><Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth label="Reporte" value={report} onChange={event => { setReport(event.target.value); setResults(null) }}><MenuItem value="ventas">Ventas y comprobantes</MenuItem><MenuItem value="clientes">Compras por cliente</MenuItem><MenuItem value="logistica">Seguimiento y transportistas</MenuItem></TextField></Grid><Grid size={{ xs: 6, md: 2 }}><TextField fullWidth label="Desde" type="date" value={from} onChange={event => setFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid><Grid size={{ xs: 6, md: 2 }}><TextField fullWidth label="Hasta" type="date" value={to} onChange={event => setTo(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid><Grid size={{ xs: 12, md: 4 }}><TextField select fullWidth label="Transportista" value={carrier} onChange={event => setCarrier(event.target.value)}>{['Todas', 'Chilexpress', 'Blue Express', 'Starken'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField></Grid></Grid><Stack direction={{ xs: 'column', sm: 'row' }}  sx={[{ gap: 2 }, { my: 2 }]}><TextField fullWidth size="small" label="Buscar cliente, producto o tienda" value={query} onChange={event => setQuery(event.target.value)} /><Button variant="contained" startIcon={<PlayArrowOutlined />} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }} onClick={execute}>Ejecutar reporte</Button><Button variant="outlined" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }} disabled={!results?.length} onClick={() => exportDocument('SHOPPING - REPORTE COMERCIAL', results.map(row => Object.values(row).join(' | ')), 'reporte-comercial.pdf')}>Exportar PDF</Button></Stack><TableContainer><Table size="small"><TableHead><TableRow>{['Identificador', 'Titular', 'Detalle', 'Valor', 'Estado'].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{results?.map(row => <TableRow key={row.id}>{Object.entries(row).map(([key, value]) => <TableCell key={key}>{value}</TableCell>)}</TableRow>)}{!results?.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>{results ? 'No hay resultados para estos filtros.' : 'Selecciona un reporte y presiona Ejecutar.'}</TableCell></TableRow>}</TableBody></Table></TableContainer></Card>}
    {tab === 'categorias' && <Grid container spacing={3}><Grid size={{ xs: 12, md: 8 }}><Card sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>Árbol de categorías</Typography><Grid container spacing={3}>{Object.entries(tree).map(([group, items]) => <Grid size={{ xs: 12, sm: 6 }} key={group}><Typography color="primary"  sx={{ fontWeight: 800 }}>{group}</Typography>{renderTree(items)}</Grid>)}</Grid></Card></Grid><Grid size={{ xs: 12, md: 4 }}><Card component="form" onSubmit={saveCategory} sx={{ p: 3 }}><Stack spacing={2}><Typography variant="h6">{editing ? 'Editar categoría' : 'Nueva subcategoría'}</Typography><TextField required label="Nombre de categoría" value={categoryName} onChange={event => setCategoryName(event.target.value)} />{!editing && <TextField select label="Categoría padre" value={parent} onChange={event => setParent(event.target.value)}>{['Productos', 'Servicios'].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}{nodes.map(node => <MenuItem key={node.id} value={node.id}>{node.group} / {node.name}</MenuItem>)}</TextField>}<Button variant="contained" type="submit" startIcon={<AddOutlined />}>Guardar categoría</Button>{editing && <Button onClick={() => { setEditing(null); setCategoryName('') }}>Cancelar</Button>}</Stack></Card></Grid></Grid>}
    {tab === 'moderacion' && <Grid container spacing={3}><Grid size={{ xs: 12, md: 8 }}><Card sx={{ p: 3 }}><Typography variant="h6">Interacciones sin respuesta por más de 48 horas</Typography><Button sx={{ my: 2 }} variant="outlined" onClick={refreshModeration}>Actualizar pendientes</Button><Stack spacing={2}>{moderation.map(item => <Box key={item.id}><Chip label={item.canal} size="small" /><Typography  sx={{ fontWeight: 700 }}>{item.titular}</Typography><Typography>{item.detalle}</Typography><Button href={item.enlace}>Revisar conversación</Button></Box>)}{!moderation.length && <Typography color="text.secondary">No hay interacciones pendientes en la última revisión.</Typography>}</Stack></Card></Grid><Grid size={{ xs: 12, md: 4 }}><Card sx={{ p: 3 }}><Typography variant="h6">Vigencia de cotizaciones</Typography><Typography sx={{ my: 2 }}>Precios fijos durante 15 días, actualización semanal posterior y eliminación al cumplir 45 días. El servidor revisa la vigencia automáticamente.</Typography><Button variant="contained" onClick={lifecycle}>Revisar vigencia ahora</Button></Card></Grid></Grid>}
  </Box>
}
