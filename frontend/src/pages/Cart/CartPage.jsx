import { catalogImage } from '../../utils/catalogImages'
import useCollection from '../../hooks/useCollection'
import { logEvent } from '../../data/localStore'
import { requestQuote, toggleFavorite } from '../../data/catalog'
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
  Paper,
  Radio,
  Stack,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import QuantityInput from '../../components/atoms/QuantityInput/QuantityInput'
import { formatCLP } from '../../utils/taxonomyData'

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useCollection('cart', [])
  const [selectedVendor, setSelectedVendor] = useCollection('selectedVendor', '')
  const groups = [...new Set(cart.map(item => item.seller))].map(seller => ({ vendorId: seller, vendorName: seller, comuna: 'Osorno', items: cart.filter(item => item.seller === seller) }))
  const activeGroup = groups.find(g => g.vendorId === selectedVendor) || groups[0]
  const subtotal = activeGroup?.items.reduce((sum, item) => sum + item.price * item.qty, 0) || 0
  const handleQtyChange = (vendorId, itemId, qty) => {
    setCart(prev => prev.map(item => item.seller === vendorId && item.key === itemId ? { ...item, qty: Math.min(item.type === 'Servicio' ? 1000 : item.stock, qty) } : item))
    logEvent('Actualizar cantidad', { itemId, qty })
  }
  const handleRemoveItem = (vendorId, itemId) => {
    setCart(prev => prev.filter(item => !(item.seller === vendorId && item.key === itemId)))
    logEvent('Quitar del carrito', { itemId })
  }
  if (!activeGroup) return <Card sx={{ p: 5, textAlign: 'center' }}><Typography variant="h4">Tu carrito está vacío</Typography><Typography sx={{ my: 2 }}>Encuentra productos y servicios para tu próxima compra.</Typography><Button variant="contained" onClick={() => navigate('/catalogo')}>Explorar catálogo</Button></Card>
  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Mi carrito
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Revisa tus productos y selecciona el vendedor para continuar. Cada compra corresponde a un solo vendedor.
      </Typography>

      <Grid container spacing={3}>
        {/* Bloques Agrupados por Vendedor (P06) */}
        <Grid size={{ xs: 12, lg: 8 }}>
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
                  <Stack direction="row"   sx={[{ justifyContent: "space-between", alignItems: "center" }, { mb: 2 }]}>
                    <Stack direction="row" spacing={1.25}  sx={{ alignItems: "center" }}>
                      <Radio
                        checked={isSelected}
                        onChange={() => setSelectedVendor(group.vendorId)}
                        icon={<RadioButtonUncheckedOutlined />}
                        checkedIcon={<RadioButtonCheckedOutlined />}
                      />
                      <StorefrontOutlined color="primary" />
                      <Box>
                        <Stack direction="row" spacing={1}  sx={{ alignItems: "center" }}>
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
                        key={item.key}
                        direction={{ xs: 'column', sm: 'row' }}


                        spacing={2}
                       sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: "space-between" }}>
                        <Stack direction="row" spacing={1.5}  sx={{ alignItems: "center" }}>
                          <Checkbox checked={isSelected} onChange={() => setSelectedVendor(group.vendorId)} />
                          <Box
                            component="img"
                            src={catalogImage(item)}
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
                            <Typography variant="caption" color="text.secondary">Variante: {item.size || item.talla || 'Única'} · {item.color || ''}</Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={2}  sx={{ alignItems: "center" }}>
                          <QuantityInput
                            value={item.qty}
                            max={item.type === 'Servicio' ? 1000 : item.stock}
                            onChange={(val) => handleQtyChange(group.vendorId, item.key, val)}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, minWidth: 85, textAlign: 'right' }}>
                            {formatCLP(item.price * item.qty)}
                          </Typography>
                          <IconButton aria-label={`Guardar ${item.name} en favoritos`} size="small" onClick={() => { toggleFavorite(item); navigate('/favoritos') }}>
                            <FavoriteBorderOutlined fontSize="small" />
                          </IconButton>
                          <IconButton aria-label={`Quitar ${item.name} del carrito`} size="small" onClick={() => handleRemoveItem(group.vendorId, item.key)}>
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
                      <Stack direction="row" spacing={1}  sx={{ alignItems: "center" }}>
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
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resumen de tu compra
            </Typography>

            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f7f6ff', borderRadius: 2.5, mb: 2 }}>
              <Stack direction="row" spacing={1.25}  sx={{ alignItems: "center" }}>
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
              <Stack direction="row"  sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal productos
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {formatCLP(subtotal)}
                </Typography>
              </Stack>
              <Stack direction="row"  sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Envío
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Por calcular en Checkout
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row"   sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Total productos
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {formatCLP(subtotal)}
                </Typography>
              </Stack>
            </Stack>

            <Stack spacing={1.25} sx={{ mb: 2.5 }}>
              <Button variant="contained" size="large" fullWidth onClick={() => { setSelectedVendor(activeGroup.vendorId); navigate('/checkout') }}>
                Continuar compra
              </Button>
              <Button variant="outlined" size="large" fullWidth onClick={() => { requestQuote(activeGroup.items); navigate('/cotizaciones') }}>
                Solicitar cotización (15 días)
              </Button>
            </Stack>

            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1.25}  sx={{ alignItems: "center" }}>
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
              <Stack direction="row" spacing={1.25}  sx={{ alignItems: "center" }}>
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
