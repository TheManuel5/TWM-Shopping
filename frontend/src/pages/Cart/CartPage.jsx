import { useNavigate } from 'react-router-dom'
import { ArrowBackOutlined, DeleteOutlined, FavoriteBorderOutlined, InfoOutlined, ShoppingCartOutlined, StorefrontOutlined } from '@mui/icons-material'
import { Box, Button, Card, Chip, Divider, IconButton, Radio, Stack, Tooltip, Typography } from '@mui/material'
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import { requestQuote, toggleFavorite } from '../../data/catalog'
import { logEvent } from '../../data/localStore'
import useCollection from '../../hooks/useCollection'
import { catalogImage } from '../../utils/catalogImages'
import { notify } from '../../utils/feedback'
import { formatCLP } from '../../utils/taxonomyData'

const units = items => items.reduce((sum, item) => sum + item.qty, 0)
const amount = items => items.reduce((sum, item) => sum + item.price * item.qty, 0)

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useCollection('cart', [])
  const [selectedVendor, setSelectedVendor] = useCollection('selectedVendor', '')
  const groups = [...new Set(cart.map(item => item.seller))].map(seller => ({ vendor: seller, items: cart.filter(item => item.seller === seller) }))
  const activeGroup = groups.find(group => group.vendor === selectedVendor) || groups[0]

  if (!activeGroup) return <Card sx={{ p: { xs: 4, md: 7 }, textAlign: 'center', maxWidth: 560, mx: 'auto', mt: 2 }}>
    <Box sx={{ display: 'grid', placeItems: 'center', width: 72, height: 72, mx: 'auto', mb: 2, borderRadius: '50%', bgcolor: 'secondary.light', color: 'primary.main' }}><ShoppingCartOutlined sx={{ fontSize: 34 }} /></Box>
    <Typography variant="h5" component="h1">Tu carrito está vacío</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Explora el catálogo y agrega productos o servicios.</Typography>
    <Button variant="contained" size="large" onClick={() => navigate('/catalogo')}>Explorar catálogo</Button>
  </Card>

  const subtotal = amount(activeGroup.items)
  const changeQty = (key, qty) => {
    setCart(prev => prev.map(item => item.key === key ? { ...item, qty: Math.min(item.type === 'Servicio' ? 1000 : item.stock, qty) } : item))
    logEvent('Actualizar cantidad', { itemId: key, qty })
  }
  const remove = key => {
    setCart(prev => prev.filter(item => item.key !== key))
    logEvent('Quitar del carrito', { itemId: key })
  }
  const quote = () => { try { requestQuote(activeGroup.items); navigate('/cotizaciones') } catch (error) { notify(error.message, 'error') } }

  return (
    <Box sx={{ maxWidth: 1240, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>Mi carrito</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{units(cart)} {units(cart) === 1 ? 'artículo' : 'artículos'}{groups.length > 1 ? ` de ${groups.length} vendedores` : ''}</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>
        <Stack spacing={2}>
          {groups.length > 1 && <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', p: 1.5, borderRadius: 2.5, bgcolor: 'secondary.light' }}>
            <InfoOutlined color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary">Cada compra corresponde a un solo vendedor. Elige cuál quieres pagar ahora; los demás quedan guardados en el carrito.</Typography>
          </Stack>}

          {groups.map(group => {
            const selected = group.vendor === activeGroup.vendor
            return <Card key={group.vendor} sx={{ overflow: 'hidden', borderColor: selected ? 'primary.main' : 'divider', boxShadow: selected ? '0 0 0 1px #602ff7, 0 10px 26px rgba(96,47,247,0.10)' : undefined, transition: 'box-shadow 180ms ease, border-color 180ms ease' }}>
              <Stack
                direction="row" spacing={1} component={groups.length > 1 ? 'label' : 'div'}
                sx={{ alignItems: 'center', px: { xs: 1.5, sm: 2.5 }, py: 1.5, bgcolor: selected ? 'secondary.light' : 'transparent', cursor: groups.length > 1 ? 'pointer' : 'default' }}
              >
                {groups.length > 1 && <Radio size="small" checked={selected} onChange={() => setSelectedVendor(group.vendor)} slotProps={{ input: { 'aria-label': `Comprar a ${group.vendor}` } }} />}
                <StorefrontOutlined color="primary" />
                <Typography sx={{ fontWeight: 800, flex: 1, minWidth: 0 }} noWrap>{group.vendor}</Typography>
                {selected && groups.length > 1 && <Chip label="Seleccionado" size="small" color="primary" />}
                <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>{formatCLP(amount(group.items))}</Typography>
              </Stack>
              <Divider />
              <Stack divider={<Divider />}>
                {group.items.map(item => <Box key={item.key} sx={{ display: 'grid', gridTemplateColumns: { xs: '72px minmax(0, 1fr)', sm: '88px minmax(0, 1fr) auto' }, gap: { xs: 1.5, sm: 2 }, alignItems: 'center', p: { xs: 1.5, sm: 2.5 } }}>
                  <Box
                    component="img" src={catalogImage(item)} alt="" onClick={() => navigate(item.type === 'Servicio' ? `/servicio/${item.id}` : `/producto/${item.id}`)}
                    sx={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 2, objectFit: 'cover', bgcolor: '#f4f2ff', cursor: 'pointer' }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.3 }}>{item.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {item.type === 'Servicio' ? 'Servicio' : [item.size || item.talla, item.color].filter(Boolean).join(' · ') || 'Variante única'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{formatCLP(item.price)} c/u</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, ml: -1 }}>
                      <Tooltip title="Guardar en favoritos"><IconButton aria-label={`Guardar ${item.name} en favoritos`} size="small" onClick={() => { toggleFavorite(item); notify('Guardado en favoritos.') }}><FavoriteBorderOutlined fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Quitar del carrito"><IconButton aria-label={`Quitar ${item.name} del carrito`} size="small" onClick={() => remove(item.key)}><DeleteOutlined fontSize="small" /></IconButton></Tooltip>
                    </Stack>
                  </Box>
                  <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1} sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' }, alignItems: { xs: 'center', sm: 'flex-end' }, justifyContent: 'space-between' }}>
                    <QuantityInput value={item.qty} max={item.type === 'Servicio' ? 1000 : item.stock} onChange={value => changeQty(item.key, value)} />
                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{formatCLP(item.price * item.qty)}</Typography>
                  </Stack>
                </Box>)}
              </Stack>
            </Card>
          })}

          <Button startIcon={<ArrowBackOutlined />} sx={{ alignSelf: 'flex-start' }} onClick={() => navigate('/catalogo')}>Seguir comprando</Button>
        </Stack>

        <Card component="aside" aria-label="Resumen de la compra" sx={{ p: 3, position: { lg: 'sticky' }, top: { lg: 88 } }}>
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Resumen</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2, color: 'text.secondary' }}>
            <StorefrontOutlined fontSize="small" /><Typography variant="body2" noWrap>{activeGroup.vendor}</Typography>
          </Stack>
          <Stack spacing={1.25}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Subtotal ({units(activeGroup.items)} {units(activeGroup.items) === 1 ? 'artículo' : 'artículos'})</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCLP(subtotal)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Despacho</Typography>
              <Typography variant="body2" color="text.secondary">Se calcula al confirmar</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Typography sx={{ fontWeight: 800 }}>Total parcial</Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.02em', color: 'primary.main' }}>{formatCLP(subtotal)}</Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">IVA incluido</Typography>
          </Stack>
          <Stack spacing={1.25} sx={{ mt: 2.5, '& .MuiButton-root': { minHeight: 46 } }}>
            <Button variant="contained" size="large" fullWidth onClick={() => { setSelectedVendor(activeGroup.vendor); navigate('/checkout') }}>Continuar compra</Button>
            <Button variant="outlined" size="large" fullWidth onClick={quote}>Solicitar cotización</Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>La cotización mantiene estos precios por 15 días.</Typography>
        </Card>
      </Box>
    </Box>
  )
}
