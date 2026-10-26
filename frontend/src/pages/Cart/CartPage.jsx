import {
  ArrowBackOutlined,
  DeleteOutlined,
  FavoriteBorderOutlined,
  InfoOutlined,
  LocalShippingOutlined,
  ProductionQuantityLimitsOutlined,
  RadioButtonCheckedOutlined,
  RadioButtonUncheckedOutlined,
  StorefrontOutlined,
  VerifiedUserOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import chairImage from '../../assets/products/chair.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import { formatCLP } from '../../utils/taxonomyData'

const DEFAULT_GROUPS = [
  {
    vendorId: 'tienda-sur',
    vendorName: 'Tienda Sur',
    comuna: 'Osorno',
    shippingCost: 3570,
    items: [
      { id: 1, name: 'Zapatillas New Balance 574', subtitle: 'Hombre · Gris', size: '38', price: 29990, qty: 1, stock: 15, image: shoeImage },
      { id: 2, name: 'Mochila urbana Everest', subtitle: 'Negro · 20 L', size: 'Única', price: 19990, qty: 1, stock: 8, image: chairImage },
    ],
  },
  {
    vendorId: 'audio-austral',
    vendorName: 'Audio Austral',
    comuna: 'Osorno',
    shippingCost: 3200,
    items: [
      { id: 3, name: 'Audífonos Bluetooth Sony WH-CH520', subtitle: 'Negro · Inalámbricos', size: 'Única', price: 25990, qty: 1, stock: 5, image: phoneImage },
    ],
  },
]

export default function CartPage() {
  const navigate = useNavigate()

  const [groups, setGroups] = useState(() => {
    try {
      const saved = window.localStorage.getItem('shopping-cart')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // Ignorar error de parsing y usar grupos por defecto
    }
    return DEFAULT_GROUPS
  })

  const [selectedVendor, setSelectedVendor] = useState(() => {
    return groups[0]?.vendorId || 'tienda-sur'
  })

  // Sincronizar cambios en el carrito con localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem('shopping-cart', JSON.stringify(groups))
    } catch (e) {
      console.error('No se pudo guardar el carrito:', e)
    }
  }, [groups])

  // Ajustar vendor seleccionado si se eliminó
  useEffect(() => {
    if (groups.length > 0 && !groups.some((g) => g.vendorId === selectedVendor)) {
      setSelectedVendor(groups[0].vendorId)
    }
  }, [groups, selectedVendor])

  const handleQtyChange = (vendorId, itemId, newQty) => {
    if (newQty < 1) return
    setGroups((prev) =>
      prev.map((g) =>
        g.vendorId !== vendorId
          ? g
          : {
              ...g,
              items: g.items.map((it) => (it.id === itemId ? { ...it, qty: newQty } : it)),
            },
      ),
    )
  }

  const handleRemoveItem = (vendorId, itemId) => {
    setGroups((prev) =>
      prev
        .map((g) =>
          g.vendorId !== vendorId
            ? g
            : { ...g, items: g.items.filter((it) => it.id !== itemId) },
        )
        .filter((g) => g.items.length > 0),
    )
  }

  const handleSizeChange = (vendorId, itemId, newSize) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.vendorId !== vendorId
          ? g
          : {
              ...g,
              items: g.items.map((it) => (it.id === itemId ? { ...it, size: newSize } : it)),
            },
      ),
    )
  }

  const totalItemsCount = groups.reduce((acc, g) => acc + g.items.length, 0)
  const activeGroup = groups.find((g) => g.vendorId === selectedVendor) || groups[0]

  // Cálculos dinámicos
  const subtotal = activeGroup
    ? activeGroup.items.reduce((acc, it) => acc + it.price * it.qty, 0)
    : 0
  const shippingCost = activeGroup?.shippingCost || 3570
  const total = subtotal + shippingCost

  const handleProceedToCheckout = () => {
    if (!activeGroup || activeGroup.items.length === 0) return
    navigate('/checkout', {
      state: {
        selectedVendor: activeGroup,
        subtotal,
        shippingCost,
        total,
      },
    })
  }

  // Estado vacío del carrito
  if (totalItemsCount === 0 || !activeGroup) {
    return (
      <Box sx={{ maxWidth: 680, mx: 'auto', py: { xs: 6, md: 8 }, px: 2, textAlign: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 3,
            border: '1px solid #e5e7f0',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              bgcolor: 'rgba(96, 47, 247, 0.08)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <ProductionQuantityLimitsOutlined sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
            Tu carrito está vacío
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 440, mb: 4, lineHeight: 1.6 }}
          >
            Parece que aún no tienes productos seleccionados. Explora las publicaciones de nuestros
            emprendedores y agrega lo que más te guste.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/catalogo')}
            sx={{ px: 4, py: 1.5, borderRadius: 2.5, fontWeight: 700 }}
          >
            Explorar catálogo
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Mi carrito
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Revisa tus productos y selecciona el vendedor para continuar. Cada compra corresponde a un
        solo vendedor (RF12).
      </Typography>

      <Grid container spacing={3}>
        {/* Bloques Agrupados por Vendedor (P06) */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={2.5}>
            {groups.map((group) => {
              const isSelected = group.vendorId === selectedVendor
              return (
                <Card
                  key={group.vendorId}
                  sx={{
                    p: 2.5,
                    border: isSelected ? '2px solid #602ff7' : '1px solid #e5e7f0',
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Radio
                        checked={isSelected}
                        onChange={() => setSelectedVendor(group.vendorId)}
                        icon={<RadioButtonUncheckedOutlined />}
                        checkedIcon={<RadioButtonCheckedOutlined />}
                      />
                      <StorefrontOutlined color="primary" />
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="h6">{group.vendorName}</Typography>
                          {isSelected && (
                            <Chip
                              label="Vendedor seleccionado"
                              size="small"
                              sx={{ bgcolor: 'secondary.main', color: 'primary.main' }}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {group.items.length} productos · Envío {formatCLP(group.shippingCost || 3570)} · {group.comuna}
                        </Typography>
                      </Box>
                    </Stack>

                    <Button size="small" onClick={() => navigate('/catalogo')}>
                      Ver más productos de esta tienda →
                    </Button>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    {group.items.map((item) => (
                      <Stack
                        key={item.id}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => setSelectedVendor(group.vendorId)}
                          />
                          <Box
                            component="img"
                            src={item.image || shoeImage}
                            alt={item.name}
                            sx={{ width: 76, height: 76, borderRadius: 2, objectFit: 'cover' }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {item.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', mb: 0.5 }}
                            >
                              {item.subtitle || 'Disponible'}
                            </Typography>
                            {item.size && item.size !== 'Única' && (
                              <Select
                                size="small"
                                value={item.size}
                                onChange={(e) => handleSizeChange(group.vendorId, item.id, e.target.value)}
                                sx={{ height: 28, fontSize: '0.78rem' }}
                              >
                                <MenuItem value="36">Talla 36</MenuItem>
                                <MenuItem value="37">Talla 37</MenuItem>
                                <MenuItem value="38">Talla 38</MenuItem>
                                <MenuItem value="39">Talla 39</MenuItem>
                                <MenuItem value="40">Talla 40</MenuItem>
                                <MenuItem value="41">Talla 41</MenuItem>
                                <MenuItem value="42">Talla 42</MenuItem>
                              </Select>
                            )}
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                          <QuantityInput
                            value={item.qty}
                            max={item.stock || 20}
                            onChange={(val) => handleQtyChange(group.vendorId, item.id, val)}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 900, minWidth: 85, textAlign: 'right' }}
                          >
                            {formatCLP(item.price * item.qty)}
                          </Typography>
                          <IconButton size="small" onClick={() => navigate('/favoritos')} title="Guardar en favoritos">
                            <FavoriteBorderOutlined fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(group.vendorId, item.id)}
                            title="Eliminar del carrito"
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>

                  {!isSelected && (
                    <Paper
                      elevation={0}
                      sx={{
                        mt: 2,
                        p: 1.5,
                        bgcolor: 'secondary.light',
                        borderRadius: 2.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <InfoOutlined color="primary" fontSize="small" />
                        <Typography variant="caption" color="text.secondary">
                          Para comprar productos de este vendedor, debes realizar una compra por
                          separado.
                        </Typography>
                      </Stack>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setSelectedVendor(group.vendorId)}
                      >
                        Comprar a este vendedor
                      </Button>
                    </Paper>
                  )}
                </Card>
              )
            })}
          </Stack>

          <Button
            startIcon={<ArrowBackOutlined />}
            sx={{ mt: 2 }}
            onClick={() => navigate('/catalogo')}
          >
            Seguir comprando
          </Button>
        </Grid>

        {/* Resumen Lateral Derecho (P06) */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resumen de tu compra
            </Typography>

            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f7f6ff', borderRadius: 2.5, mb: 2 }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <StorefrontOutlined color="primary" />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {activeGroup.vendorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activeGroup.items.length} producto(s) seleccionado(s)
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Subtotal productos
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatCLP(subtotal)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Envío estimado
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatCLP(shippingCost)}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Total a pagar
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {formatCLP(total)}
                </Typography>
              </Stack>
            </Stack>

            <Stack spacing={1.25} sx={{ mb: 2.5 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleProceedToCheckout}
              >
                Continuar compra
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate('/cotizaciones')}
              >
                Solicitar cotización (15 días)
              </Button>
            </Stack>

            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <LocalShippingOutlined color="primary" fontSize="small" />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                    Envío a todo Chile
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Compra con tranquilidad
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <VerifiedUserOutlined color="primary" fontSize="small" />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                    Pagos seguros
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tus datos siempre protegidos
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'secondary.light', borderRadius: 2 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, display: 'block', color: 'primary.main' }}
              >
                Cada compra corresponde a un solo vendedor
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Si quieres productos de otro vendedor, podrás realizar una nueva compra
                inmediatamente después.
              </Typography>
            </Paper>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}