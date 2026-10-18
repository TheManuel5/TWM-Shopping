import {
  ArrowBackOutlined,
  DeleteOutlined,
  FavoriteBorderOutlined,
  InfoOutlined,
  LocalShippingOutlined,
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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import chairImage from '../../assets/products/chair.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import { formatCLP } from '../../utils/taxonomyData'

const INITIAL_GROUPS = [
  {
    vendorId: 'tienda-sur',
    vendorName: 'Tienda Sur',
    comuna: 'Osorno',
    items: [
      { id: 1, name: 'Zapatillas New Balance 574', subtitle: 'Hombre · Gris', size: '38', price: 29990, qty: 1, image: shoeImage },
      { id: 2, name: 'Mochila urbana Everest', subtitle: 'Negro · 20 L', size: 'Única', price: 19990, qty: 1, image: chairImage },
    ],
  },
  {
    vendorId: 'audio-austral',
    vendorName: 'Audio Austral',
    comuna: 'Osorno',
    items: [
      { id: 3, name: 'Audífonos Bluetooth Sony WH-CH520', subtitle: 'Negro · Inalámbricos', size: 'Única', price: 25990, qty: 1, image: phoneImage },
    ],
  },
]

export default function CartPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState(INITIAL_GROUPS)
  const [selectedVendor, setSelectedVendor] = useState('tienda-sur')

  const handleQtyChange = (vendorId, itemId, newQty) => {
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
      prev.map((g) =>
        g.vendorId !== vendorId ? g : { ...g, items: g.items.filter((it) => it.id !== itemId) },
      ),
    )
  }

  const activeGroup = groups.find((g) => g.vendorId === selectedVendor) || groups[0]
  const subtotal = activeGroup.items.reduce((acc, it) => acc + it.price * it.qty, 0)

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Mi carrito
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Revisa tus productos y selecciona el vendedor para continuar. Cada compra corresponde a un solo vendedor (RF12).
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
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
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
                          {group.items.length} productos · Envío por calcular · {group.comuna}
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
                          <Checkbox checked={isSelected} onChange={() => setSelectedVendor(group.vendorId)} />
                          <Box
                            component="img"
                            src={item.image}
                            alt={item.name}
                            sx={{ width: 76, height: 76, borderRadius: 2, objectFit: 'cover' }}
                          />
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                              {item.subtitle}
                            </Typography>
                            {item.size !== 'Única' && (
                              <Select size="small" value={item.size} sx={{ height: 28, fontSize: '0.78rem' }}>
                                <MenuItem value="37">Talla 37</MenuItem>
                                <MenuItem value="38">Talla 38</MenuItem>
                                <MenuItem value="42">Talla 42</MenuItem>
                              </Select>
                            )}
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                          <QuantityInput
                            value={item.qty}
                            onChange={(val) => handleQtyChange(group.vendorId, item.id, val)}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, minWidth: 85, textAlign: 'right' }}>
                            {formatCLP(item.price * item.qty)}
                          </Typography>
                          <IconButton size="small" onClick={() => navigate('/favoritos')}>
                            <FavoriteBorderOutlined fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleRemoveItem(group.vendorId, item.id)}>
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
                          Para comprar productos de este vendedor, debes realizar una compra por separado.
                        </Typography>
                      </Stack>
                      <Button variant="contained" size="small" onClick={() => setSelectedVendor(group.vendorId)}>
                        Comprar a este vendedor
                      </Button>
                    </Paper>
                  )}
                </Card>
              )
            })}
          </Stack>

          <Button startIcon={<ArrowBackOutlined />} sx={{ mt: 2 }} onClick={() => navigate('/catalogo')}>
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
                    {activeGroup.items.length} productos seleccionados
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
                  Envío
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Por calcular en Checkout
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Total productos
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {formatCLP(subtotal)}
                </Typography>
              </Stack>
            </Stack>

            <Stack spacing={1.25} sx={{ mb: 2.5 }}>
              <Button variant="contained" size="large" fullWidth onClick={() => navigate('/checkout')}>
                Continuar compra
              </Button>
              <Button variant="outlined" size="large" fullWidth onClick={() => navigate('/cotizaciones')}>
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
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'primary.main' }}>
                Cada compra corresponde a un solo vendedor
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Si quieres productos de otro vendedor, podrás realizar una nueva compra inmediatamente después.
              </Typography>
            </Paper>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}