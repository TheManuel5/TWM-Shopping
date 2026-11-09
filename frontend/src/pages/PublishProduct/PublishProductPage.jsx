import useCollection from '../../hooks/useCollection'
import { flattenCategories } from '../../utils/categories'
import useSellerCollection from '../../hooks/useSellerCollection'
import { dateKey } from '../../utils/dates'
import { catalogSeed } from '../../data/catalog'
import { logEvent } from '../../data/localStore'
import { notify } from '../../utils/feedback'
import { validateOffer } from '../../utils/validation'
import ImagePicker from '../../components/crud2/ImagePicker'
import {
  AddOutlined,
  BuildOutlined,
  DeleteOutlined,
  Inventory2Outlined,
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
import { useNavigate, useSearchParams } from 'react-router-dom'
import ColorSwatch from '../../components/atoms/ColorSwatch/ColorSwatch'

const INITIAL_VARIANTS = [{ sku: '', size: '', color: '', price: 0, stock: 0 }]

export default function PublishProductPage() {
  const navigate = useNavigate()
  const [categoryTree] = useCollection('categories', { Productos: [], Servicios: [] })
  const categoryNames = [...new Set(flattenCategories(categoryTree).map(category => category.name))]
  const [catalog, setCatalog] = useSellerCollection('catalog', catalogSeed)
  const [params] = useSearchParams()
  const editing = catalog.find(product => String(product.id) === params.get('editar'))
  const [images, setImages] = useState(editing?.imagenes?.length ? editing.imagenes : editing?.imagen ? [editing.imagen] : [])
  const [related, setRelated] = useState(editing?.relacionados || [])
  const [activeStep, setActiveStep] = useState(0)
  const [name, setName] = useState(editing?.nombre ?? '')
  const [catMain, setCatMain] = useState('Productos')
  const [catSec, setCatSec] = useState(editing?.categoria ?? '')
  const [catSpec, setCatSpec] = useState('')
  const [brand, setBrand] = useState(editing?.marca || '')
  const [material, setMaterial] = useState(editing?.material ?? '')
  const [weight, setWeight] = useState(editing?.peso ?? 0)
  const [sizeBase, setSizeBase] = useState(editing?.tamano ?? '')
  const [selectedColor, setSelectedColor] = useState(editing?.color ?? '')
  const [description, setDescription] = useState(
    editing?.descripcion || '',
  )

  const [regularPrice, setRegularPrice] = useState(editing?.precio ?? 0)
  const [hasOffer, setHasOffer] = useState(Boolean(editing?.oferta))
  const [offerPrice, setOfferPrice] = useState(0)
  const [offerStart, setOfferStart] = useState(editing?.oferta?.inicio || dateKey())
  const [offerEnd, setOfferEnd] = useState(editing?.oferta?.fin || '')

  const [widthCm, setWidthCm] = useState(0)
  const [heightCm, setHeightCm] = useState(0)
  const [depthCm, setDepthCm] = useState(0)

  const [variants, setVariants] = useState(editing?.variantes ?? INITIAL_VARIANTS)

  const saveProduct = (draft = false) => {
    if (!catSec) { notify('Selecciona una categoría de la base de datos.', 'error'); return }
    if (!name.trim()) { notify('Ingresa un nombre para identificar tu publicación.', 'error'); return }
    if (!draft && (!name.trim() || !catSec || !material || !sizeBase.trim() || !description.trim() || !images.length)) { notify('Completa nombre, categoría, material, tamaño, descripción e imagen.', 'error'); return }
    if (!draft && ![regularPrice, weight, widthCm, heightCm, depthCm].every(value => Number.isFinite(Number(value)) && Number(value) > 0)) { notify('Precio, peso y dimensiones deben ser mayores que cero.', 'error'); return }
    if (!draft && (!variants.length || variants.some(variant => !variant.sku.trim() || !variant.size.trim() || !variant.color.trim() || !Number.isInteger(Number(variant.stock)) || Number(variant.stock) < 0 || Number(variant.price) <= 0) || new Set(variants.map(v => v.sku.trim())).size !== variants.length)) { notify('Revisa las variantes: SKU único, talla, color, precio positivo y stock entero.', 'error'); return }
    if (!draft && hasOffer) { const message = validateOffer(regularPrice, offerPrice, offerStart, offerEnd); if (message) { notify(message, 'error'); return } }
    const product = { ...editing, id: editing?.id || Date.now(), nombre: name.trim(), tipo: 'Producto', categoria: catSec, subcategoria: catSpec, marca: brand, material, peso: Number(weight), tamano: sizeBase.trim(), talla: variants[0]?.size || sizeBase, color: selectedColor, descripcion: description.trim(), precio: Number(regularPrice), stock: variants.reduce((sum, variant) => sum + Number(variant.stock), 0), variantes: variants.map(v => ({ ...v, price: Number(v.price), stock: Number(v.stock) })), imagen: images[0], imagenes: images, relacionados: related, dimensiones: { ancho: widthCm, alto: heightCm, fondo: depthCm }, vendedor: editing?.vendedor || 'Tienda Sur', estado: draft ? 'Borrador' : 'Publicado', oferta: hasOffer ? { precio: Number(offerPrice), inicio: offerStart, fin: offerEnd } : null }
    try {
      setCatalog(current => editing ? current.map(item => item.id === product.id ? product : item) : [product, ...current])
      logEvent(draft ? 'Guardar borrador de producto' : 'Publicar producto', product)
      notify(draft ? 'Borrador guardado. Puedes editarlo desde el catálogo.' : 'Producto publicado correctamente.')
      navigate('/crud-2')
    } catch (error) { notify(error.message, 'error') }
  }

  const handleVariantChange = (index, field, val) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: val } : v)),
    )
  }

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { sku: `SKU-${Date.now()}`, size: '40', color: selectedColor, price: regularPrice, stock: 0 },
    ])
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Breadcrumbs sx={{ mb: 1.5, fontSize: '0.85rem' }}>
        <Link underline="hover" color="inherit" onClick={() => navigate('/crud-2')} sx={{ cursor: 'pointer' }}>
          Catálogo
        </Link>
        <Link underline="hover" color="inherit" onClick={() => navigate('/catalogo')}>Productos</Link>
        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 700 }}>
          Agregar producto
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Publicar producto
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Completa la información de tu producto para publicarlo en Shopping.
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
          {['1. Información', '2. Variantes y precio', '3. Envío'].map((label, idx) => (
            <Step key={label} onClick={() => { setActiveStep(idx); document.getElementById(['product-info', 'product-variants', 'product-shipping'][idx])?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }} sx={{ cursor: 'pointer' }}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Card>

      <Grid container spacing={3}>
        {/* Columna Izquierda: Información del Producto y Variantes (P15) */}
        <Grid size={{ xs: 12, lg: 7.5 }}>
          <Card id="product-info" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Información del producto
            </Typography>

            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Nombre del producto *
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Nombre del producto" value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mt: 0.5, mb: 2 }}
            />

            {/* Categorías Jerárquicas */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Categoría principal *</Typography>
                <Select fullWidth size="small" value={catMain} onChange={(e) => setCatMain(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="Productos">Productos</MenuItem>
                </Select>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Categoría secundaria *</Typography>
                <Select fullWidth size="small" value={catSec} onChange={(e) => setCatSec(e.target.value)} sx={{ mt: 0.5 }}>
                  {categoryNames.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                </Select>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Categoría específica *</Typography>
                <Select fullWidth size="small" value={catSpec} onChange={(e) => setCatSpec(e.target.value)} sx={{ mt: 0.5 }}>
                  {categoryNames.map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                </Select>
              </Grid>
            </Grid>

            {/* Atributos mínimos RF08: Marca, Material, Peso, Tamaño */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Marca</Typography>
                <Select fullWidth size="small" value={brand} onChange={(e) => setBrand(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="URBAN">URBAN</MenuItem>
                  <MenuItem value="PUMA">PUMA</MenuItem>
                  <MenuItem value="NEW BALANCE">NEW BALANCE</MenuItem>
                </Select>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Material principal *</Typography>
                <Select fullWidth size="small" value={material} onChange={(e) => setMaterial(e.target.value)} sx={{ mt: 0.5 }}>
                  <MenuItem value="Textil">Textil</MenuItem>
                  <MenuItem value="Cuero">Cuero</MenuItem>
                  <MenuItem value="Sintético">Sintético</MenuItem>
                </Select>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Tamaño / Rango *</Typography>
                <TextField fullWidth size="small" label="Tamaño" value={sizeBase} onChange={(e) => setSizeBase(e.target.value)} sx={{ mt: 0.5 }} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
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
            <Stack direction="row" spacing={2}  sx={[{ alignItems: "center" }, { mb: 2.5 }]}>
              {[
                { name: 'Blanco', hex: '#ffffff' },
                { name: 'Violeta', hex: '#602ff7' },
                { name: 'Negro', hex: '#111827' },
                { name: 'Gris', hex: '#6b7280' },
              ].map((c) => (
                <Stack key={c.name} direction="row" spacing={0.75}  sx={{ alignItems: "center" }}>
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
            <ImagePicker images={images} onChange={setImages} />

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

          {/* Tabla Editable de Variantes con SKU, Precio y Stock Propios */}
          <Card id="product-variants" sx={{ p: 3, overflowX: 'auto' }}>
            <Stack direction="row"   sx={[{ justifyContent: "space-between", alignItems: "center" }, { mb: 2 }]}>
              <Box>
                <Typography variant="h6">Variantes con precio y stock propios</Typography>
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

        {/* Columna Derecha: Precio/Promociones, Producto Relacionado y Dimensiones (P15) */}
        <Grid size={{ xs: 12, lg: 4.5 }}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Precio y promociones
              </Typography>

              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Precio regular (CLP) *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Precio oficial" value={regularPrice}
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
                        Solo 1 oferta activa al mismo tiempo
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
                    <Grid size={{ xs: 6 }}>
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
                    <Grid size={{ xs: 6 }}>
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
                Producto relacionado
              </Typography>
              <Select multiple fullWidth size="small" value={related} onChange={event => { if (event.target.value.length <= 5) setRelated(event.target.value); else notify('Selecciona hasta cinco productos relacionados.', 'warning') }} displayEmpty renderValue={ids => ids.length ? `${ids.length} productos seleccionados` : 'Seleccionar productos relacionados'}>
                {catalog.filter(p => p.tipo !== 'Servicio' && p.id !== editing?.id).map(product => <MenuItem key={product.id} value={product.id}>{product.nombre}</MenuItem>)}
              </Select>
            </Card>

            {/* Dimensiones del Paquete (Trigger 2: Costo de Envío Volumétrico) */}
            <Card sx={{ p: 3 }}>
              <Typography id="product-shipping" variant="h6" sx={{ mb: 1.5 }}>
                Dimensiones del paquete
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Ancho (cm) *</Typography>
                  <TextField fullWidth size="small" type="number" value={widthCm} onChange={(e) => setWidthCm(Number(e.target.value))} sx={{ mt: 0.5 }} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Alto (cm) *</Typography>
                  <TextField fullWidth size="small" type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} sx={{ mt: 0.5 }} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Fondo (cm) *</Typography>
                  <TextField fullWidth size="small" type="number" value={depthCm} onChange={(e) => setDepthCm(Number(e.target.value))} sx={{ mt: 0.5 }} />
                </Grid>
              </Grid>
            </Card>

            <Divider />

            <Stack direction="row" spacing={1.5}  sx={{ justifyContent: "flex-end" }}>
              <Button variant="outlined" size="large" onClick={() => saveProduct(true)}>
                Guardar borrador
              </Button>
              <Button variant="contained" size="large" onClick={() => saveProduct(false)}>
                Publicar producto
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
