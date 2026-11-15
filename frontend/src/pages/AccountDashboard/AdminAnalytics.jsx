import { useMemo } from 'react'
import { LocalShippingOutlined, StarRounded, TrendingUpOutlined } from '@mui/icons-material'
import { Box, Card, Stack, Typography } from '@mui/material'
import BarChart from '../../components/molecules/BarChart/BarChart'
import { collectionEntries } from '../../data/localStore'
import useCollection from '../../hooks/useCollection'
import { adminAnalytics } from '../../utils/dashboard'
import { formatCLP } from '../../utils/taxonomyData'

const number = value => Number(value).toLocaleString('es-CL')
const short = value => value >= 1e6 ? `$${(value / 1e6).toLocaleString('es-CL', { maximumFractionDigits: 1 })} M` : formatCLP(value)

function Section({ icon, title, description, children }) {
  return <Box component="section" sx={{ mb: 4 }}>
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
      <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 2.5, bgcolor: 'primary.main', color: 'white', flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography variant="h6" component="h2" sx={{ lineHeight: 1.2 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
      </Box>
    </Stack>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>{children}</Box>
  </Box>
}

function ChartCard({ title, note, stat, children }) {
  return <Card sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h3" sx={{ fontWeight: 800 }}>{title}</Typography>
        {note && <Typography variant="caption" color="text.secondary">{note}</Typography>}
      </Box>
      {stat && <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', lineHeight: 1.1, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>{stat[0]}</Typography>
        <Typography variant="caption" color="text.secondary">{stat[1]}</Typography>
      </Box>}
    </Stack>
    {children}
  </Card>
}

/** Tablero gráfico del administrador: análisis comercial, operativo y de calidad. */
export default function AdminAnalytics({ orders }) {
  const [returns] = useCollection('returns', [])
  const data = useMemo(() => {
    const entries = collectionEntries()
    const collect = prefix => entries.filter(([key]) => key.startsWith(prefix)).flatMap(([, rows]) => Array.isArray(rows) ? rows : [])
    return adminAnalytics({ orders, returns, reviews: collect('reviews:'), questions: collect('questions:') })
  }, [orders, returns])
  const { commercial, operations, quality } = data

  return <>
    <Section icon={<TrendingUpOutlined />} title="Análisis comercial" description="Evolución de los ingresos y vendedores con mayor venta.">
      <ChartCard title="Ingresos por mes" note="Pedidos no cancelados, IVA incluido" stat={[formatCLP(commercial.averageTicket), 'ticket promedio']}>
        <BarChart vertical data={commercial.revenueByMonth} format={short} label="Ingresos por mes" />
      </ChartCard>
      <ChartCard title="Vendedores con más ingresos" note="Cinco primeros por importe vendido">
        <BarChart data={commercial.topSellers} format={short} label="Vendedores con más ingresos" />
      </ChartCard>
    </Section>

    <Section icon={<LocalShippingOutlined />} title="Análisis operativo" description="Avance de los pedidos y forma de entrega.">
      <ChartCard title="Pedidos por estado" note="En el orden del ciclo del pedido" stat={[`${operations.deliveredRate} %`, 'entregados']}>
        <BarChart data={operations.ordersByStatus} format={number} label="Pedidos por estado" />
      </ChartCard>
      <ChartCard title="Entregas por transportista" note="Incluye los retiros con el vendedor" stat={[number(operations.cancelled), 'cancelados']}>
        <BarChart data={operations.delivery} format={number} label="Entregas por transportista" />
      </ChartCard>
    </Section>

    <Section icon={<StarRounded />} title="Análisis de calidad" description="Satisfacción de los compradores, devoluciones y atención de preguntas.">
      <ChartCard title="Calificaciones de los compradores" note={`${number(quality.reviews)} reseñas`} stat={[quality.average == null ? '—' : quality.average.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }), 'promedio de 5']}>
        <BarChart data={quality.ratingRows} format={number} label="Calificaciones de los compradores" emptyText="Aún no hay reseñas registradas." />
      </ChartCard>
      <ChartCard title="Devoluciones por motivo" note={`${number(quality.returns)} solicitudes · ${quality.returnRate.toLocaleString('es-CL', { maximumFractionDigits: 1 })} % de los pedidos`} stat={[number(quality.unanswered), `preguntas sin responder de ${number(quality.questions)}`]}>
        <BarChart data={quality.returnsByReason} format={number} label="Devoluciones por motivo" emptyText="No hay devoluciones registradas." />
      </ChartCard>
    </Section>
  </>
}
