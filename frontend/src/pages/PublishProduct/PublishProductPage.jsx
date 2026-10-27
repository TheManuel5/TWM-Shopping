import {
  AddOutlined,
  AddPhotoAlternateOutlined,
  BuildOutlined,
  DeleteOutlined,
  Inventory2Outlined,
  SearchOutlined,
} from '@mui/icons-material'
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import chairImage from '../../assets/products/chair.jpg'
import fashionImage from '../../assets/products/fashion.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import ColorSwatch from '../../components/atoms/ColorSwatch/ColorSwatch'

const INITIAL_VARIANTS = [
  { sku: 'URB-38-BL', size: '38', color: 'Blanco', price: 34990, stock: 12 },
  { sku: 'URB-39-BL', size: '39', color: 'Blanco', price: 34990, stock: 8 },
  { sku: 'URB-42-NG', size: '42', color: 'Negro', price: 36990, stock: 15 },
]

export default function PublishProductPage() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [name, setName] = useState('Zapatillas Urbanas')
  const [catMain, setCatMain] = useState('Productos')
  const [catSec, setCatSec] = useState('Ropa, moda y calzado')
  const [catSpec, setCatSpec] = useState('Calzado')
  const [brand, setBrand] = useState('URBAN')
  const [material, setMaterial] = useState('Textil')
  const [weight, setWeight] = useState(650)
  const [sizeBase, setSizeBase] = useState('38 - 42 EU')
  const [selectedColor, setSelectedColor] = useState('Blanco')
  const [description, setDescription] = useState(
    'Zapatillas urbanas con diseño moderno y cómodo, ideales para el uso diario. Fabricadas en textil transpirable con suela de goma antideslizante.',
  )

  const [regularPrice, setRegularPrice] = useState(34990)
  const [hasOffer, setHasOffer] = useState(true)
  const [offerPrice, setOfferPrice] = useState(29990)
  const [offerStart, setOfferStart] = useState('2026-09-20')
  const [offerEnd, setOfferEnd] = useState('2026-10-15')

  const [widthCm, setWidthCm] = useState(30)
  const [heightCm, setHeightCm] = useState(20)
  const [depthCm, setDepthCm] = useState(12)

  const [variants, setVariants] = useState(INITIAL_VARIANTS)

  const handleVariantChange = (index, field, val) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: val } : v)),
    )
  }

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { sku: `URB-40-VI`, size: '40', color: selectedColor, price: regularPrice, stock: 10 },
    ])
  }

  // NUEVA FUNCIÓN DE ENVÍO
  const handlePublish = () => {
    const payload = {
      nombre: name,
      categorias: {
        principal: catMain,
        secundaria: catSec,
        especifica: catSpec
      },
      atributos: {
        marca: brand,
        material: material,
        pesoGramos: weight,
        tamanioRango: sizeBase,
        colorPrincipal: selectedColor,
        dimensiones: { ancho: widthCm, alto: heightCm, fondo: depthCm }
      },
      descripcion: description,
      precioRegular: regularPrice,
      ofertaActiva: hasOffer,
      detalleOferta: hasOffer ? {
        precioOferta: offerPrice,
        fechaInicio: offerStart,
        fechaFin: offerEnd
      } : null,
      variantes: variants,
      productoRelacionado: 'MCH-001' // Extraído del mockup (Mochila Urbana Essential)
    }

    console.log('Enviando nuevo producto al backend:', payload)
    
    // Redirigir al inventario tras la simulación
    navigate('/vendedor/inventario')
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 1.5, fontSize: '0.85rem' }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/crud-2')} sx={{ cursor: 'pointer' }}>
          Catálogo
        </Link>
        <Link underline="hover" color="inherit">Productos</Link>
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
          Agregar producto
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Publicar producto
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Completa la información de tu producto para publicarlo en Shopping (RF07 / RF08 / RF27).
      </Typography>

      <Tabs value="producto" sx={{ mb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab value="producto" icon={<Inventory2Outlined fontSize="small" />} iconPosition="start" label="Producto" />
        <Tab
          value="servicio"
          icon={<BuildOutlined fontSize="small" />}
          iconPosition="start"
          label="Servicio"
          onClick={() => navigate('/vendedor/publicar-servicio')}
        />
      </Tabs>

      <Card sx={{ p: 2, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {['1. Información', '2. Variantes y precio (RF27)', '3. Envío'].map((label, idx) => (
            <Step key={label} onClick={() => setActiveStep(idx)} sx={{ cursor: 'pointer' }}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      <Grid container spacing={3}>
        {/* Columna Izquierda: Información del Producto y Variantes (P15) */}
        <Grid item xs={12} lg={7.5}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Información del producto (RF08)
            </Typography>

            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Nombre del producto *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mt: 0.5, mb: 2 }}
            />

            {/* Categorías Jerárquicas (RF21) */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Categoría principal *</Typography>
                <Select fullWidth size="small" value={catMain} onChange={(e) => setCatMain(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="Productos">Productos</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Categoría secundaria *</Typography>
                <Select fullWidth size="small" value={catSec} onChange={(e) => setCatSec(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="Ropa, moda y calzado">Ropa, moda y calzado</MenuItem>
                  <MenuItem value="Tecnología">Tecnología</MenuItem>
                  <MenuItem value="Hogar y Cocina">Hogar y Cocina</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Categoría específica *</Typography>
                <Select fullWidth size="small" value={catSpec} onChange={(e) => setCatSpec(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="Calzado">Calzado</MenuItem>
                  <MenuItem value="Ropa">Ropa</MenuItem>
                  <MenuItem value="Accesorios">Accesorios</MenuItem>
                </Select>
              </Grid>
            </Grid>

            {/* Atributos mínimos RF08: Marca, Material, Peso, Tamaño */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Marca</Typography>
                <Select fullWidth size="small" value={brand} onChange={(e) => setBrand(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="URBAN">URBAN</MenuItem>
                  <MenuItem value="PUMA">PUMA</MenuItem>
                  <MenuItem value="NEW BALANCE">NEW BALANCE</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Material principal *</Typography>
                <Select fullWidth size="small" value={material} onChange={(e) => setMaterial(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="Textil">Textil</MenuItem>
                  <MenuItem value="Cuero">Cuero</MenuItem>
                  <MenuItem value="Sintético">Sintético</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Tamaño / Rango *</Typography>
                <TextField fullWidth size="small" value={sizeBase} onChange={(e) => setSizeBase(e.target.value)} sx={{ mt: 0.5 }} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Peso (g) *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                  sx={{ mt: 0.5 }}
                />
              </Grid>
            </Grid>

            {/* Color principal */}
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              Color *
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
              {[
                { name: 'Blanco', hex: '#ffffff' },
                { name: 'Violeta', hex: '#602ff7' },
                { name: 'Negro', hex: '#111827' },
                { name: 'Gris', hex: '#6b7280' },
              ].map((c) => (
                <Stack key={c.name} direction="row" spacing={0.75} alignItems="center">
                  <ColorSwatch
                    colorHex={c.hex}
                    name={c.name}
                    selected={selectedColor === c.name}
                    onClick={() => setSelectedColor(c.name)}
                  />
                  <Typography variant="body2">{c.name}</Typography>
                </Stack>
              ))}
            </Stack>

            {/* Imágenes del producto */}
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
              Imágenes del producto *
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }} flexWrap="wrap" useFlexGap>
              {[shoeImage, fashionImage, chairImage].map((img, i) => (
                <Box key={i} sx={{ position: 'relative', width: 92, height: 92, borderRadius: 2.5, overflow: 'hidden', border: '1px solid #e5e7f0' }}>
                  <Box component="img" src={img} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
              <Paper
                variant="outlined"
                sx={{
                  width: 92,
                  height: 92,
                  borderStyle: 'dashed',
                  borderColor: 'primary.main',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <AddPhotoAlternateOutlined color="primary" />
                <Typography variant="caption" color="primary" sx={{ fontWeight: 700, fontSize: '0.68rem' }}>
                  Agregar fotos
                </Typography>
              </Paper>
            </Stack>

            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
              Descripción del producto *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Card>

          {/* Tabla Editable de Variantes con SKU, Precio y Stock Propios (RF27) */}
          <Card sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6">Variantes con precio y stock propios (RF27)</Typography>
                <Typography variant="caption" color="text.secondary">
                  Define el SKU, talla, color, precio y unidades disponibles de cada variante física.
                </Typography>
              </Box>
              <Button size="small" variant="outlined" startIcon={<AddOutlined />} onClick={handleAddVariant}>
                Añadir variante
              </Button>
            </Stack>

            <Table size="small">
              <TableHead sx={{ bgcolor: '#f7f6ff' }}>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Talla / Tamaño</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Precio (CLP)</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variants.map((v, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <TextField size="small" value={v.sku} onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)} sx={{ width: 115 }} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={v.size} onChange={(e) => handleVariantChange(idx, 'size', e.target.value)} sx={{ width: 70 }} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={v.color} onChange={(e) => handleVariantChange(idx, 'color', e.target.value)} sx={{ width: 95 }} />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={v.price}
                        onChange={(e) => handleVariantChange(idx, 'price', Math.max(0, Number(e.target.value)))}
                        sx={{ width: 105 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', Math.max(0, Number(e.target.value)))}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => setVariants((prev) => prev.filter((_, i) => i !== idx))}>
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        {/* Columna Derecha: Precio/Promociones (RF10), Producto Relacionado (RF28) y Dimensiones (P15) */}
        <Grid item xs={12} lg={4.5}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Precio y promociones (RF10)
              </Typography>

              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Precio regular (CLP) *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={regularPrice}
                onChange={(e) => setRegularPrice(Math.max(0, Number(e.target.value)))}
                sx={{ mt: 0.5, mb: 2 }}
              />

              <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'secondary.light', borderRadius: 2.5, mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={hasOffer} onChange={(e) => setHasOffer(e.target.checked)} color="primary" />}
                  label={
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Oferta temporal activa</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Solo 1 oferta activa al mismo tiempo (Trigger 4)
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              {hasOffer && (
                <>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Precio de oferta (CLP) *
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Math.max(0, Number(e.target.value)))}
                    sx={{ mt: 0.5, mb: 2 }}
                  />

                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Fecha de inicio *</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        value={offerStart}
                        onChange={(e) => setOfferStart(e.target.value)}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>Fecha de término *</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        value={offerEnd}
                        onChange={(e) => setOfferEnd(e.target.value)}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Card>

            {/* Producto Relacionado (RF28: Venta Cruzada) */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Producto relacionado (RF28)
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box component="img" src={chairImage} alt="" sx={{ width: 52, height: 52, borderRadius: 2, objectFit: 'cover' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Mochila Urbana Essential</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>SKU: MCH-001</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>$24.990</Typography>
                </Box>
              </Paper>
              <Button variant="outlined" fullWidth startIcon={<SearchOutlined />}>
                Seleccionar otro producto
              </Button>
            </Card>

            {/* Dimensiones del Paquete (Trigger 2: Costo de Envío Volumétrico) */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Dimensiones del paquete (Trigger 2)
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Ancho (cm) *</Typography>
                  <TextField fullWidth size="small" type="number" value={widthCm} onChange={(e) => setWidthCm(Number(e.target.value))} sx={{ mt: 0.5 }} />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Alto (cm) *</Typography>
                  <TextField fullWidth size="small" type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} sx={{ mt: 0.5 }} />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Fondo (cm) *</Typography>
                  <TextField fullWidth size="small" type="number" value={depthCm} onChange={(e) => setDepthCm(Number(e.target.value))} sx={{ mt: 0.5 }} />
                </Grid>
              </Grid>
            </Card>

            <Divider />

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button variant="outlined" size="large" onClick={() => navigate('/vendedor/inventario')}>
                Guardar borrador
              </Button>
              {/* BOTÓN ACTUALIZADO */}
              <Button variant="contained" size="large" onClick={handlePublish}>
                Publicar producto
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}