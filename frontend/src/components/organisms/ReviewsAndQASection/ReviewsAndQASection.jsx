import { API_MODE } from '../../../services/api'
import useCollection from '../../../hooks/useCollection'
import useAuth from '../../../contexts/AuthContext/useAuth'
import { logEvent } from '../../../data/localStore'
import { notify } from '../../../utils/feedback'
import {
  ChatOutlined,
  CheckCircleOutlined,
  InfoOutlined,
  StorefrontOutlined,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Rating,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'

const INITIAL_REVIEWS = [
  {
    id: 1,
    author: 'Camila R.',
    date: '12 de septiembre de 2026',
    rating: 5,
    title: 'Muy cómodas y buen diseño',
    comment: 'Me encantaron, son realmente cómodas para el uso diario. La calidad se nota y el diseño es tal como en las fotos. Volvería a comprar.',
    verified: true,
  },
  {
    id: 2,
    author: 'Matías P.',
    date: '5 de septiembre de 2026',
    rating: 5,
    title: 'Buena relación precio-calidad',
    comment: 'Se ven resistentes y son livianas. La talla fue la correcta. El envío llegó antes de lo esperado a Osorno. Recomendadas.',
    verified: true,
  },
]

const INITIAL_QUESTIONS = [
  {
    id: 1,
    user: 'Juan K.',
    date: '14 de septiembre de 2026',
    question: '¿Son impermeables o resistentes a la lluvia del sur?',
    seller: 'Tienda Sur',
    answerDate: '14 de septiembre de 2026',
    answer: 'Hola Juan, no son 100% impermeables, pero tienen un material exterior sintético resistente a salpicaduras. ¡Saludos!',
  },
  {
    id: 2,
    user: 'Paula M.',
    date: '10 de septiembre de 2026',
    question: '¿Tienen disponibilidad inmediata en talla 38 y 42?',
    seller: 'Tienda Sur',
    answerDate: '10 de septiembre de 2026',
    answer: 'Hola Paula, sí, tenemos stock disponible en ambas tallas para despacho inmediato desde Osorno. ¡Saludos!',
  },
]

// Distribución coherente cuyo promedio real es 4.8 (corrige el pendiente de P23)
const STAR_COUNTS = [
  { stars: 5, count: 106 },
  { stars: 4, count: 14 },
  { stars: 3, count: 2 },
  { stars: 2, count: 1 },
  { stars: 1, count: 1 },
]

const HIGHLIGHT_TAGS = ['Buena calidad', 'Talla correcta', 'Entrega a tiempo']

export default function ReviewsAndQASection({ sellerName = 'Tienda Sur', entityId = '1' }) {
  const { user } = useAuth()
  const [orders] = useCollection('orders', [])
  const [answers, setAnswers] = useState({})
  const purchased = orders.some(order => order.customerRut === user?.rut && ['Entregado', 'Recibido'].includes(order.status) && order.products.some(item => String(item.id) === String(entityId)))
  const [tab, setTab] = useState(0)
  const [reviews, setReviews] = useCollection('reviews:' + entityId, API_MODE ? [] : INITIAL_REVIEWS)
  const [questions, setQuestions] = useCollection('questions:' + entityId, API_MODE ? [] : INITIAL_QUESTIONS)

  const [productRating, setProductRating] = useState(5)
  const [sellerRating, setSellerRating] = useState(5)
  const [selectedTags, setSelectedTags] = useState(['Buena calidad'])
  const [comment, setComment] = useState('')
  const [newQuestion, setNewQuestion] = useState('')

  const totalReviews = API_MODE ? reviews.length : STAR_COUNTS.reduce((acc, item) => acc + item.count, 0) + (reviews.length - 2)
  const weightedSum = API_MODE ? reviews.reduce((sum, review) => sum + review.rating, 0) : STAR_COUNTS.reduce((acc, item) => acc + item.stars * item.count, 0) + reviews.slice(0, Math.max(0, reviews.length - 2)).reduce((sum, review) => sum + review.rating, 0)
  const averageRating = (totalReviews ? weightedSum / totalReviews : 0).toFixed(1).replace('.', ',')

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const handlePublishReview = (e) => {
    e.preventDefault()
    if (!purchased) { notify('Solo puedes calificar artículos de tus pedidos entregados.', 'warning'); return }
    if (comment.trim().length < 5 || comment.trim().length > 2000) { notify('Escribe una reseña de 5 a 2000 caracteres.', 'error'); return }
    setReviews((prev) => [
      {
        id: Date.now(),
        author: user.nombre, customerRut: user.rut, sellerRating, createdAt: new Date().toISOString(),
        date: 'Hoy',
        rating: productRating,
        title: selectedTags.join(' · ') || 'Excelente compra',
        comment: comment.trim(),
        verified: true,
      },
      ...prev,
    ])
    logEvent('Publicar reseña', { entityId, productRating, sellerRating, comment: comment.trim() }); notify('Reseña publicada.'); setComment('')
  }

  const handleAskQuestion = (e) => {
    e.preventDefault()
    if (!user) { notify('Inicia sesión para publicar una pregunta.', 'warning'); return }
    if (newQuestion.trim().length < 5 || newQuestion.trim().length > 1000) { notify('Escribe una pregunta de 5 a 1000 caracteres.', 'error'); return }
    setQuestions((prev) => [
      {
        id: Date.now(),
        user: user.nombre, createdAt: new Date().toISOString(),
        date: 'Ahora mismo',
        question: newQuestion.trim(),
        seller: sellerName,
        answerDate: 'Pendiente de respuesta (< 48h)',
        answer: null,
      },
      ...prev,
    ])
    logEvent('Publicar pregunta', { entityId, question: newQuestion.trim() }); notify('Pregunta publicada.'); setNewQuestion('')
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Tabs
        value={tab}
        onChange={(_, val) => setTab(val)}
        sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}
      >
        <Tab label={`Reseñas (${totalReviews})`} sx={{ fontWeight: 700 }} />
        <Tab label={`Preguntas y respuestas (${questions.length})`} sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* Bloque Superior: Reseñas + Formulario (P23) */}
      <Card sx={{ p: { xs: 2, md: 3.5 }, mb: 3, display: tab === 0 ? 'block' : 'none' }}>
        <Grid container spacing={4}>
          {/* Columna Izquierda: Promedio y listado de reseñas */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={2}  sx={[{ alignItems: "center" }, { mb: 3 }]}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1 }}>
                  {averageRating}
                </Typography>
                <Rating value={4.8} precision={0.1} readOnly sx={{ color: 'primary.main', my: 0.75 }} />
                <Typography variant="body2" color="text.secondary">
                  {totalReviews} reseñas verificadas
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 8 }}>
                <Stack spacing={0.75}>
                  {(API_MODE ? [5, 4, 3, 2, 1].map(stars => ({ stars, count: reviews.filter(review => review.rating === stars).length })) : STAR_COUNTS).map((row) => (
                    <Stack key={row.stars} direction="row"  spacing={1.5} sx={{ alignItems: "center" }}>
                      <Typography variant="caption" sx={{ minWidth: 58, fontWeight: 600 }}>
                        {row.stars} estrellas
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(row.count / (totalReviews || 1)) * 100}
                        sx={{
                          flexGrow: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#e5e7f0',
                          '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 4 },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 24, textAlign: 'right' }}>
                        {row.count}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Reseñas de clientes
            </Typography>

            <Stack spacing={2.5}>
              {reviews.map((rev) => (
                <Box key={rev.id} sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row"  spacing={1.5} sx={[{ alignItems: "center" }, { mb: 1 }]}>
                    <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 800, width: 36, height: 36 }}>
                      {rev.author.charAt(0)}
                    </Avatar>
                    <Box>
                      <Stack direction="row"  spacing={1} sx={{ alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {rev.author}
                        </Typography>
                        {rev.verified && (
                          <Stack direction="row"  spacing={0.4} sx={[{ alignItems: "center" }, { color: 'success.main' }]}>
                            <CheckCircleOutlined sx={{ fontSize: 15 }} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              Compra verificada
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                      <Stack direction="row"  spacing={1} sx={{ alignItems: "center" }}>
                        <Rating value={rev.rating} size="small" readOnly sx={{ color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          {rev.date}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {rev.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {rev.comment}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Columna Derecha: Comparte tu experiencia (RF16: Producto + Emprendedor) */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              component="form"
              onSubmit={handlePublishReview}
              sx={{
                p: 3,
                bgcolor: 'secondary.light',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Comparte tu experiencia
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Calificar producto / servicio
                </Typography>
                <Stack direction="row"  spacing={1} sx={{ alignItems: "center" }}>
                  <Rating
                    value={productRating}
                    onChange={(_, val) => setProductRating(val || 5)}
                    size="large"
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Haz clic en una estrella
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Calificar vendedor{' '}
                  <Typography component="span" variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
                    {sellerName}
                  </Typography>
                </Typography>
                <Stack direction="row"  spacing={1} sx={{ alignItems: "center" }}>
                  <Rating
                    value={sellerRating}
                    onChange={(_, val) => setSellerRating(val || 5)}
                    size="large"
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Haz clic en una estrella
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  ¿Qué destacó más?
                </Typography>
                <Stack direction="row" spacing={1}  useFlexGap sx={{ flexWrap: "wrap" }}>
                  {HIGHLIGHT_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag)
                    return (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => handleToggleTag(tag)}
                        variant={active ? 'filled' : 'outlined'}
                        color="primary"
                        sx={{ borderRadius: '999px' }}
                      />
                    )
                  })}
                </Stack>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
                  Comentario (opcional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos más sobre tu experiencia (ej: excelente, recomendado)..."
                  sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                />
              </Box>

              <Button type="submit" variant="contained" fullWidth size="large">
                Publicar reseña
              </Button>

              <Stack direction="row"  spacing={0.75} sx={[{ alignItems: "center" }, { mt: 1.5, color: 'text.secondary' }]}>
                <InfoOutlined fontSize="small" />
                <Typography variant="caption">
                  Tu reseña será pública y ayudará a otros clientes.
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Bloque Inferior: Preguntas y respuestas públicas (RF26 - P23) */}
      <Card sx={{ p: { xs: 2, md: 3 }, display: tab === 1 ? 'block' : 'none' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}


          spacing={1.5}
          sx={[{ justifyContent: "space-between", alignItems: { xs: 'stretch', sm: 'center' } }, { mb: 2.5 }]}
        >
          <Typography variant="h6">Preguntas y respuestas</Typography>
          <Stack
            component="form"
            onSubmit={handleAskQuestion}
            direction="row"
            spacing={1}
            sx={{ minWidth: { sm: 380 } }}
          >
            <TextField
              size="small"
              fullWidth
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Escribe tu pregunta para el vendedor..."
            />
            <Button
              type="submit"
              variant="outlined"
              startIcon={<ChatOutlined />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Hacer una pregunta
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={2}>
          {questions.map((q) => (
            <Grid
              container
              key={q.id}
              spacing={2}
              sx={{ pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={1.5}  sx={{ alignItems: "flex-start" }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#e2e0ff', color: 'primary.main', fontSize: '0.85rem', fontWeight: 800 }}>
                    {q.user.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <strong>{q.user}</strong> · {q.date}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {q.question}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack
                  direction="row"
                  spacing={1.5}

                  sx={[{ alignItems: "flex-start" }, { pl: { md: 2 }, borderLeft: { md: '2px solid #e5e7f0' } }]}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#f1eeff', color: 'primary.main' }}>
                    <StorefrontOutlined fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      <strong>{q.seller}</strong> · {q.answerDate}
                    </Typography>
                    <Typography variant="body2" color={q.answer ? 'text.primary' : 'warning.dark'}>
                      {q.answer || 'Esperando respuesta del emprendedor...'}
                    </Typography>
                    {!q.answer && ['Vendedor', 'Admin'].includes(user?.role) && <Box component="form" onSubmit={event => { event.preventDefault(); const answer = answers[q.id]?.trim(); if (!answer || answer.length < 3) { notify('Escribe una respuesta de al menos tres caracteres.', 'warning'); return } setQuestions(current => current.map(question => question.id === q.id ? { ...question, answer, answerDate: new Date().toLocaleDateString('es-CL') } : question)); logEvent('Responder pregunta', { entityId, questionId: q.id, answer }); notify('Respuesta publicada.') }} sx={{ mt: 2 }}><TextField fullWidth size="small" label="Respuesta del vendedor" value={answers[q.id] || ''} onChange={event => setAnswers(current => ({ ...current, [q.id]: event.target.value }))} /><Button type="submit">Publicar respuesta</Button></Box>}
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Card>
    </Box>
  )
}
