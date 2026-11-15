import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccountCircle, ArrowBackRounded, ChevronRightRounded, CloseRounded, ExpandMoreOutlined, MenuOutlined } from '@mui/icons-material'
import { Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemText, Typography } from '@mui/material'
import useAuth from '../../contexts/AuthContext/useAuth'
import useCollection from '../../hooks/useCollection'
import { CATEGORY_TREE } from '../../utils/taxonomyData'

const PANEL_WIDTH = 365
const GROUPS = ['Servicios', 'Productos']
const slide = direction => ({
  animation: `category-${direction} 220ms ease`,
  '@keyframes category-forward': { from: { transform: 'translateX(28%)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
  '@keyframes category-back': { from: { transform: 'translateX(-28%)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
})

function SectionTitle({ children }) {
  return <Typography component="h2" sx={{ px: 3.5, pt: 2.25, pb: 0.75, fontWeight: 800, fontSize: '1.12rem', letterSpacing: '-0.01em', color: 'primary.main' }}>{children}</Typography>
}

function Row({ label, onClick, drill = false, strong = false }) {
  return <ListItemButton onClick={onClick} aria-haspopup={drill ? 'true' : undefined} sx={{ px: 3.5, py: 1.4, minHeight: 48, '&:hover, &.Mui-focusVisible': { bgcolor: 'secondary.light' } }}>
    <ListItemText primary={label} slotProps={{ primary: { fontSize: '0.95rem', fontWeight: strong ? 700 : 400, color: 'text.primary' } }} />
    {drill && <ChevronRightRounded sx={{ color: 'text.secondary', ml: 1 }} />}
  </ListItemButton>
}

/**
 * Menú lateral de categorías por niveles: al elegir una categoría con subcategorías,
 * el panel avanza a ese nivel y ofrece volver al anterior, en lugar de abrir otro panel.
 */
export default function CategoryMenu() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [tree] = useCollection('categories', CATEGORY_TREE)
  const [open, setOpen] = useState(false)
  // Ruta de niveles abiertos: [{ node, group }]. Vacía = menú principal.
  const [path, setPath] = useState([])
  const [direction, setDirection] = useState('forward')

  const navRef = useRef(null)
  // Al cambiar de nivel, el botón pulsado desaparece: se devuelve el foco al panel para que
  // el teclado (Escape, Tab) siga funcionando dentro del menú.
  useEffect(() => { if (open) navRef.current?.focus({ preventScroll: true }) }, [open, path])
  const current = path[path.length - 1]
  const close = () => setOpen(false)
  const openMenu = () => { setPath([]); setDirection('forward'); setOpen(true) }
  const go = (group, name) => { close(); navigate('/catalogo?' + new URLSearchParams({ tipo: group, ...(name ? { categoria: name } : {}) })) }
  const visit = to => { close(); navigate(to) }
  const choose = (node, group) => {
    if (!node.children?.length) { go(group, node.name); return }
    setDirection('forward'); setPath(levels => [...levels, { node, group }])
  }
  const back = () => { setDirection('back'); setPath(levels => levels.slice(0, -1)) }
  const firstName = String(user?.nombre || '').trim().split(/\s+/)[0]
  const account = isAuthenticated
    ? [['Panel de mi cuenta', '/mi-panel'], ['Compras y devoluciones', '/mis-compras'], ['Cotizaciones', '/cotizaciones'], ['Favoritos', '/favoritos'], ['Perfil y direcciones', '/perfil']]
    : [['Iniciar sesión', '/login'], ['Crear cuenta', '/register'], ['Favoritos', '/favoritos']]

  return <>
    <Button color="inherit" aria-label="Abrir categorías" aria-haspopup="dialog" aria-expanded={open} onClick={openMenu} startIcon={<MenuOutlined />} endIcon={<ExpandMoreOutlined sx={{ display: { xs: 'none', sm: 'block' } }} />} sx={{ whiteSpace: 'nowrap', minWidth: 0 }}>
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Categorías</Box>
    </Button>

    <Drawer
      anchor="left" open={open} onClose={close}
      sx={{ zIndex: theme => theme.zIndex.modal + 1 }}
      slotProps={{
        backdrop: { sx: { bgcolor: 'rgba(3,12,46,0.72)' } },
        paper: { role: 'dialog', 'aria-modal': true, 'aria-label': 'Categorías del catálogo', sx: { width: `min(${PANEL_WIDTH}px, calc(100vw - 56px))`, overflow: 'visible', bgcolor: 'background.paper' } },
      }}
    >
      {/* Botón de cierre fuera del panel, sobre el fondo oscurecido */}
      <IconButton aria-label="Cerrar menú" onClick={close} sx={{ position: 'absolute', top: 10, right: -48, color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' } }}>
        <CloseRounded sx={{ fontSize: 30 }} />
      </IconButton>

      <Box
        component={isAuthenticated ? 'div' : 'button'} type={isAuthenticated ? undefined : 'button'} onClick={isAuthenticated ? undefined : () => visit('/login')}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3.5, minHeight: 64, flexShrink: 0, border: 0, width: '100%', textAlign: 'left', bgcolor: '#030c2e', color: 'white', cursor: isAuthenticated ? 'default' : 'pointer', font: 'inherit' }}
      >
        <AccountCircle sx={{ fontSize: 30 }} />
        <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.15rem' }} noWrap>{isAuthenticated ? `Hola, ${firstName || 'bienvenido'}` : 'Hola, identifícate'}</Typography>
      </Box>

      <Box ref={navRef} tabIndex={-1} component="nav" aria-label={current ? current.node.name : 'Menú principal'} sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pb: 3, outline: 0 }}>
        <Box key={path.map(level => level.node.id).join('/') || 'root'} sx={slide(direction)}>
          {current ? <>
            <ListItemButton onClick={back} sx={{ px: 3.5, py: 1.6, gap: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
              <ArrowBackRounded sx={{ color: 'text.secondary' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', letterSpacing: '0.03em', textTransform: 'uppercase' }} noWrap>{path.length > 1 ? path[path.length - 2].node.name : 'Menú principal'}</Typography>
            </ListItemButton>
            <SectionTitle>{current.node.name}</SectionTitle>
            <List disablePadding>
              <Row label={`Todo en ${current.node.name}`} strong onClick={() => go(current.group, current.node.name)} />
              {current.node.children.map(node => <Row key={node.id} label={node.name} drill={Boolean(node.children?.length)} onClick={() => choose(node, current.group)} />)}
            </List>
          </> : <>
            {GROUPS.map((group, index) => <Box key={group}>
              {index > 0 && <Divider sx={{ mt: 1.5 }} />}
              <SectionTitle>{group}</SectionTitle>
              <List disablePadding aria-label={group}>
                {(tree[group] || []).map(node => <Row key={node.id} label={node.name} drill={Boolean(node.children?.length)} onClick={() => choose(node, group)} />)}
                <Row label={`Ver todos los ${group.toLowerCase()}`} strong onClick={() => go(group)} />
              </List>
            </Box>)}
            <Divider sx={{ mt: 1.5 }} />
            <SectionTitle>Tu cuenta</SectionTitle>
            <List disablePadding aria-label="Tu cuenta">
              {account.map(([label, to]) => <Row key={to} label={label} onClick={() => visit(to)} />)}
            </List>
          </>}
        </Box>
      </Box>
    </Drawer>
  </>
}
