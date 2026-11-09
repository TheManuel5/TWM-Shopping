import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowBackOutlined, ChevronRightOutlined, CloseOutlined, ExpandMoreOutlined, Inventory2Outlined, LocalOfferOutlined, MenuOutlined } from '@mui/icons-material'
import { Box, Button, Divider, IconButton, List, ListItemButton, ListItemText, Modal, Paper, Stack, Typography } from '@mui/material'
import useCollection from '../../hooks/useCollection'
import { CATEGORY_TREE } from '../../utils/taxonomyData'
import { headerOffset } from './layoutConstants'

function Subcategories({ nodes, onChoose, depth = 0 }) {
  return nodes.map(node => <Box key={node.id} sx={{ mb: node.children?.length ? 2.5 : 0 }}>
    <Button onClick={() => onChoose(node.name)} sx={{ justifyContent: 'flex-start', textAlign: 'left', width: '100%', px: 1, py: 0.65, minHeight: 34, color: node.children?.length ? 'primary.main' : 'text.primary', fontWeight: node.children?.length ? 750 : 400, fontSize: 13, pl: 1 + depth }}>
      {node.name}
    </Button>
    {node.children?.length > 0 && <Subcategories nodes={node.children} onChoose={onChoose} depth={depth + 1} />}
  </Box>)
}

export default function CategoryMenu() {
  const navigate = useNavigate()
  const navRef = useRef(null)
  const [tree] = useCollection('categories', CATEGORY_TREE)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const close = () => setOpen(false)
  const go = (name, group) => { close(); navigate('/catalogo?' + new URLSearchParams({ tipo: group, ...(name ? { categoria: name } : {}) })) }
  const select = (node, group) => setSelected({ node, group })
  const detail = Boolean(selected?.node.children?.length)
  return <>
    <Button color="inherit" aria-label="Abrir categorías" aria-expanded={open} aria-controls={open ? 'category-drawer' : undefined} onClick={() => { setSelected(null); setOpen(value => !value) }} startIcon={<MenuOutlined />} endIcon={<ExpandMoreOutlined />} sx={{ whiteSpace: 'nowrap', minWidth: 0 }}><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Categorías</Box></Button>
    <Modal open={open} onClose={close} aria-label="Explorar categorías" sx={{ top: headerOffset, zIndex: theme => theme.zIndex.drawer + 1 }} slotProps={{ backdrop: { sx: { top: headerOffset, bgcolor: 'rgba(9,15,29,.25)' } } }}>
      <Box ref={navRef} id="category-drawer" component="nav" aria-label="Categorías del catálogo" tabIndex={-1} sx={{ outline: 0, height: '100%', display: 'flex', alignItems: 'flex-start', width: { xs: 'min(360px, 100vw)', md: detail ? 710 : 330 }, maxWidth: '100vw' }}>
        <Paper elevation={0} square sx={{ width: { xs: '100%', md: 330 }, flexShrink: 0, height: '100%', overflowY: 'auto', px: 2, py: 1.5, borderRight: '1px solid', borderColor: 'divider', display: { xs: detail ? 'none' : 'block', md: 'block' } }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}><Typography variant="overline" color="text.secondary">Explora el catálogo</Typography><IconButton size="small" aria-label="Cerrar categorías" onClick={close}><CloseOutlined fontSize="small" /></IconButton></Stack>
          {['Servicios', 'Productos'].map((group, index) => <Box key={group}>
            {index > 0 && <Divider sx={{ my: 1 }} />}
            <Button onClick={() => go(null, group)} startIcon={group === 'Servicios' ? <LocalOfferOutlined /> : <Inventory2Outlined />} sx={{ px: 0.5, fontWeight: 800, fontSize: 16 }}>{group}</Button>
            <List disablePadding aria-label={group}>{(tree[group] || []).map(node => <ListItemButton key={node.id} selected={selected?.node.id === node.id && selected?.group === group} onMouseEnter={() => select(node, group)} onFocus={() => select(node, group)} onClick={() => node.children?.length ? select(node, group) : go(node.name, group)} aria-expanded={node.children?.length ? selected?.node.id === node.id && selected?.group === group : undefined} sx={{ px: 1, py: 0.35, minHeight: 35, '&.Mui-selected': { bgcolor: 'secondary.light' } }}>
              <ListItemText primary={node.name} slotProps={{ primary: { fontSize: 12.5, lineHeight: 1.45, fontWeight: 500 } }} /><ChevronRightOutlined sx={{ fontSize: 18, color: 'text.secondary', ml: 1 }} />
            </ListItemButton>)}</List>
          </Box>)}
        </Paper>
        {detail && <Paper component="section" aria-label={`Subcategorías de ${selected.node.name}`} elevation={3} sx={{ width: { xs: '100%', md: 380 }, maxHeight: '100%', overflowY: 'auto', borderRadius: { xs: 0, md: '0 18px 18px 18px' }, p: { xs: 2, md: 3 }, minHeight: 260 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}><IconButton aria-label="Volver a categorías" onClick={() => { navRef.current?.focus(); setSelected(null) }} sx={{ display: { xs: 'inline-flex', md: 'none' } }}><ArrowBackOutlined /></IconButton><Typography variant="h6" color="primary" sx={{ fontSize: 18, flex: 1 }}>{selected.node.name}</Typography><IconButton size="small" aria-label="Cerrar subcategorías" onClick={close}><CloseOutlined fontSize="small" /></IconButton></Stack>
          <Subcategories nodes={selected.node.children} onChoose={name => go(name, selected.group)} />
          <Divider sx={{ mt: 2, mb: 1 }} /><Button fullWidth sx={{ justifyContent: 'flex-start', fontSize: 12 }} endIcon={<ChevronRightOutlined />} onClick={() => go(selected.node.name, selected.group)}>Ver todo en {selected.node.name}</Button>
        </Paper>}
      </Box>
    </Modal>
  </>
}
