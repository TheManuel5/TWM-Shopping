import {
  AssignmentReturnOutlined,
  BarChartOutlined,
  ChatOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  FileDownloadOutlined,
  Inventory2Outlined,
  ShoppingCartOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Tooltip,
  Typography,
} from '@mui/material'
import { jsPDF } from 'jspdf'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import applianceImage from '../../assets/products/appliance.jpg'
import laptopImage from '../../assets/products/laptop.jpg'
import phoneImage from '../../assets/products/phone.jpg'
import shoeImage from '../../assets/products/shoe.jpg'
import StatusChip from '../../components/atoms/StatusChip/StatusChip'
import StatMetricCard from '../../components/molecules/StatMetricCard/StatMetricCard'
import { formatCLP } from '../../utils/taxonomyData'
import '../../components/orders/Orders.css'

// 14 barras quincenales/diarias que suman exactamente $1.428.000 CLP (corrige observación de P22)
const DAILY_BARS = [
  { day: '1 Sep', amount: 82000 },
  { day: '3 Sep', amount: 95000 },
  { day: '5 Sep', amount: 112000 },
  { day: '7 Sep', amount: 78000 },
  { day: '9 Sep', amount: 134000 },
  { day: '11 Sep', amount: 91000 },
  { day: '13 Sep', amount: 145000 },
  { day: '15 Sep', amount: 88000 },
  { day: '17 Sep', amount: 102000 },
  { day: '19 Sep', amount: 74000 },
  { day: '21 Sep', amount: 119000 },
  { day: '24 Sep', amount: 98000 },
  { day: '27 Sep', amount: 115000 },
  { day: '30 Sep', amount: 95000 },
]

const TRANSACTIONS = [
  { id: '#102384', date: '28 sep. 2026 14:32', client: 'Camila Rojas', product: 'Audífonos Bluetooth JBL', total: 59990, status: 'Pendiente', method: 'Webpay' },
  { id: '#102383', date: '27 sep. 2026 11:18', client: 'Matías Torres', product: 'Cafetera Oster 12 tazas', total: 34990, status: 'Completado', method: 'VISA ••4242' },
  { id: '#102382', date: '27 sep. 2026 09:05', client: 'Valentina Soto', product: 'Zapatillas Nike Air Max', total: 89990, status: 'Completado', method: 'MasterCard' },
  { id: '#102381', date: '26 sep. 2026 18:40', client: 'Diego Mendoza', product: 'Polera Adidas Essentials', total: 29990, status: 'Cancelado', method: 'Transferencia' },
]

export default function SellerDashboardPage() {
  const navigate = useNavigate()
  const [month, setMonth] = useState('Septiembre 2026')
  const totalMonth = DAILY_BARS.reduce((acc, b) => acc + b.amount, 0) // $1.428.000

  // 3° Documento PDF obligatorio (Etapa 11 - Pág. 24): Historial Transaccional y Devoluciones
  const handleExportHistoryPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 18
    let y = 22
    const colors = {
      navy: [3, 12, 46],
      purple: [96, 47, 247],
      muted: [98, 102, 128],
      line: [229, 231, 240],
      light: [247, 246, 255],
      green: [22, 163, 74],
    }

    const drawSectionTitle = (title) => {
      doc.setFillColor(...colors.purple)
      doc.roundedRect(margin, y - 5, 3, 9, 1, 1, 'F')
      doc.setTextColor(...colors.navy)
      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')
      doc.text(title, margin + 8, y + 2)
      y += 12
    }

    const drawFooter = (pageNumber) => {
      doc.setDrawColor(...colors.line)
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18)
      doc.setTextColor(...colors.muted)
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')
      doc.text('Shopping | Reporte de gestion comercial', margin, pageHeight - 10)
      doc.text(`Pagina ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' })
    }

    doc.setFillColor(96, 47, 247)
    doc.rect(0, 0, pageWidth, 12, 'F')
    doc.setTextColor(...colors.navy)
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text('Shopping', margin, y)
    y += 9
    doc.setFontSize(14)
    doc.text('Historial transaccional y reembolsos', margin, y)
    y += 8
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(...colors.muted)
    doc.text(`Tienda Sur (Osorno)  |  Periodo: ${month}`, margin, y)
    y += 12
    doc.setDrawColor(...colors.line)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    drawSectionTitle('Resumen del periodo')
    doc.setFillColor(...colors.light)
    doc.roundedRect(margin, y - 4, pageWidth - (margin * 2), 22, 3, 3, 'F')
    doc.setTextColor(...colors.muted)
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text('INGRESOS CONSOLIDADOS', margin + 7, y + 5)
    doc.text('VARIACION DEL PERIODO', pageWidth / 2 + 4, y + 5)
    doc.setTextColor(...colors.navy)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text(formatCLP(totalMonth), margin + 7, y + 14)
    doc.setTextColor(...colors.green)
    doc.text('+12%', pageWidth / 2 + 4, y + 14)
    y += 32

    drawSectionTitle('Transacciones registradas')
    const transactionColumns = [margin + 2, 42, 78, 130, 169]
    doc.setFillColor(...colors.navy)
    doc.rect(margin, y - 5, pageWidth - (margin * 2), 9, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont(undefined, 'bold')
    ;['Pedido', 'Fecha', 'Cliente', 'Total', 'Estado'].forEach((label, index) => {
      doc.text(label, transactionColumns[index], y + 1)
    })
    y += 10
    TRANSACTIONS.forEach((transaction) => {
      if (y > pageHeight - 42) {
        drawFooter(1)
        doc.addPage()
        y = 22
      }
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(...colors.line)
      doc.rect(margin, y - 5, pageWidth - (margin * 2), 15, 'FD')
      doc.setTextColor(...colors.navy)
      doc.setFontSize(8)
      doc.setFont(undefined, 'bold')
      doc.text(transaction.id, transactionColumns[0], y + 1)
      doc.setFont(undefined, 'normal')
      doc.text(transaction.date.split(' ').slice(0, 3).join(' '), transactionColumns[1], y + 1)
      doc.text(transaction.client, transactionColumns[2], y + 1)
      doc.text(formatCLP(transaction.total), transactionColumns[3], y + 1)
      doc.text(transaction.status, transactionColumns[4], y + 1)
      doc.setTextColor(...colors.muted)
      doc.setFontSize(7)
      doc.text(doc.splitTextToSize(transaction.product, 80)[0], transactionColumns[2], y + 6)
      y += 15
    })

    y += 8
    doc.setDrawColor(...colors.line)
    doc.line(margin, y, pageWidth - margin, y)
    y += 12
    drawSectionTitle('Devoluciones aprobadas')
    doc.setFillColor(...colors.navy)
    doc.rect(margin, y - 5, pageWidth - (margin * 2), 9, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont(undefined, 'bold')
    doc.text('Referencia', margin + 2, y + 1)
    doc.text('Pedido', 62, y + 1)
    doc.text('Motivo', 100, y + 1)
    doc.text('Reintegrado', 158, y + 1)
    y += 10
    doc.setTextColor(...colors.navy)
    doc.setFont(undefined, 'normal')
    doc.text('DEV-008', margin + 2, y + 1)
    doc.text('#1032', 62, y + 1)
    doc.text('Talla incorrecta', 100, y + 1)
    doc.text('$29.990', 158, y + 1)
    y += 9
    doc.text('DEV-005', margin + 2, y + 1)
    doc.text('#0976', 62, y + 1)
    doc.text('Falla tecnica', 100, y + 1)
    doc.text('$59.990', 158, y + 1)
    y += 16
    doc.setFillColor(...colors.light)
    doc.roundedRect(margin, y - 5, pageWidth - (margin * 2), 14, 3, 3, 'F')
    doc.setTextColor(...colors.navy)
    doc.setFont(undefined, 'bold')
    doc.text('TOTAL CAPITAL REINTEGRADO', margin + 7, y + 4)
    doc.text('$89.980 CLP', pageWidth - margin - 7, y + 4, { align: 'right' })
    drawFooter(1)

    /* Keep the document footer below all report content. */
    if (y > pageHeight - 42) {
      drawFooter(1)
    }

    doc.save('Historial_Transaccional_TiendaSur.pdf')
  }

  return (
    <Box className="orders-page">
      <Box className="orders-main">
        <Box className="orders-breadcrumb">Panel de control <span>/</span> Resumen comercial</Box>
        <Box className="orders-heading">
          <Box className="orders-title-group">
            <DashboardOutlined color="primary" fontSize="large" />
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700}>Panel de control</Typography>
              <Typography color="text.secondary">
                Resumen comercial, operativo y de calidad de tu tienda en Shopping (Dashboard Etapa 11).
              </Typography>
            </Box>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Select size="small" value={month} onChange={(e) => setMonth(e.target.value)} sx={{ bgcolor: 'background.paper', minWidth: { sm: 170 } }}>
              <MenuItem value="Septiembre 2026">Septiembre 2026</MenuItem>
              <MenuItem value="Octubre 2026">Octubre 2026</MenuItem>
            </Select>
            <Select size="small" value="Tienda Sur" sx={{ bgcolor: 'background.paper', minWidth: { sm: 150 } }}>
              <MenuItem value="Tienda Sur">Tienda Sur</MenuItem>
            </Select>
          </Stack>
        </Box>

      {/* 4 KPIs Superiores (P22) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatMetricCard
            title="Ventas del mes"
            value={formatCLP(totalMonth)}
            trendText="+12%"
            subtitle="vs. mes anterior"
            icon={<BarChartOutlined />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatMetricCard
            title="Pedidos"
            value="48"
            trendText="+9%"
            subtitle="vs. mes anterior"
            icon={<ShoppingCartOutlined />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatMetricCard
            title="Stock bajo"
            value="5"
            trendText="+2"
            trendColor="error.main"
            subtitle="productos en riesgo (< 10)"
            icon={<WarningAmberOutlined />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatMetricCard
            title="Cotizaciones pendientes"
            value="4"
            trendText="+1"
            trendColor="error.main"
            subtitle="requieren respuesta"
            icon={<DescriptionOutlined />}
          />
        </Grid>
      </Grid>

      {/* Gráfico de Ventas Diarias + Acciones Pendientes (P22) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8} sx={{ display: 'flex' }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1.5}
              sx={{ mb: 2.5 }}
            >
              <Typography variant="h6">Ventas diarias (Consistencia verificada)</Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  Total acumulado: <strong>{formatCLP(totalMonth)}</strong>
                </Typography>
                <Chip label="+12%" size="small" sx={{ bgcolor: 'success.light', color: 'success.dark' }} />
              </Stack>
            </Stack>

            <Box
              sx={{
                height: { xs: 180, sm: 210 },
                flexGrow: 1,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 1,
                pt: 3,
                px: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {DAILY_BARS.map((bar) => {
                const heightPct = Math.round((bar.amount / 150000) * 100)
                return (
                  <Tooltip key={bar.day} title={`${bar.day}: ${formatCLP(bar.amount)}`}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 28,
                          height: `${heightPct * 1.6}px`,
                          bgcolor: 'primary.main',
                          borderRadius: '6px 6px 0 0',
                          transition: 'opacity 0.15s',
                          '&:hover': { opacity: 0.8 },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.66rem' }}>
                        {bar.day}
                      </Typography>
                    </Box>
                  </Tooltip>
                )
              })}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4} sx={{ display: 'flex' }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Acciones pendientes
            </Typography>
            <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
              {[
                { title: 'Responder preguntas', sub: 'Consultas públicas de productos', badge: 3, Icon: ChatOutlined, path: '/producto/1' },
                { title: 'Preparar pedidos', sub: 'Listos para despacho en Osorno', badge: 6, Icon: Inventory2Outlined, path: '/crud-1' },
                { title: 'Revisar devoluciones', sub: 'Solicitudes pendientes de aprobación', badge: 2, Icon: AssignmentReturnOutlined, path: '/mis-compras' },
              ].map((act) => (
                <Paper
                  key={act.title}
                  variant="outlined"
                  onClick={() => navigate(act.path)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': { bgcolor: 'secondary.light', borderColor: 'primary.main' },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <act.Icon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{act.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{act.sub}</Typography>
                    </Box>
                  </Stack>
                  <Chip label={act.badge} size="small" color="secondary" sx={{ color: 'primary.main', fontWeight: 800 }} />
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Transacciones Recientes + Productos Más Vendidos (P22) */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-end', sm: 'flex-start' }}
              spacing={{ xs: 1.5, sm: 3 }}
              sx={{ mb: 2.5 }}
            >
              <Box sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>
                <Typography variant="h6">Transacciones recientes (RF29)</Typography>
                <Typography variant="caption" color="text.secondary">
                  Últimos movimientos de la tienda.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/crud-1')}
                sx={{ alignSelf: { xs: 'flex-end', sm: 'flex-start' }, flexShrink: 0, minWidth: { sm: 180 } }}
              >
                Ver gestión de pedidos
              </Button>
            </Stack>

            <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead sx={{ bgcolor: '#f7f6ff' }}>
                <TableRow>
                  <TableCell># Pedido</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Pago</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TRANSACTIONS.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell sx={{ fontWeight: 800 }}>{t.id}</TableCell>
                    <TableCell sx={{ fontSize: '0.78rem' }}>{t.date}</TableCell>
                    <TableCell>{t.client}</TableCell>
                    <TableCell>{t.product}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 400 }}>{formatCLP(t.total)}</TableCell>
                    <TableCell><StatusChip status={t.status} /></TableCell>
                    <TableCell sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{t.method}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TableContainer>
          </Card>
        </Grid>

      </Grid>

      {/* Servicios Más Cotizados + Exportar Historial PDF (P22) */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Typography variant="h6">Productos más vendidos</Typography>
              <Button variant="outlined" onClick={() => navigate('/vendedor/inventario')}>Ver todos</Button>
            </Stack>
            <Stack spacing={2} sx={{ flexGrow: 1 }}>
              {[
                { rank: 1, name: 'Zapatillas Nike Air Max', units: '120 unidades vendidas', price: 89990, img: shoeImage },
                { rank: 2, name: 'Audífonos Bluetooth JBL', units: '98 unidades vendidas', price: 59990, img: phoneImage },
                { rank: 3, name: 'Cafetera Oster 12 tazas', units: '76 unidades vendidas', price: 34990, img: applianceImage },
              ].map((p) => (
                <Stack key={p.rank} direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip label={p.rank} size="small" color="secondary" sx={{ fontWeight: 800 }} />
                    <Box component="img" src={p.img} alt="" sx={{ width: 48, height: 48, borderRadius: 2, objectFit: 'cover' }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.units}</Typography>
                    </Box>
                  </Stack>
                  <Typography variant="subtitle2" sx={{ flexShrink: 0, ml: 1, fontWeight: 400 }}>{formatCLP(p.price)}</Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
          <Card sx={{ p: { xs: 2, sm: 3 }, width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Servicios más cotizados</Typography>
            <Grid container spacing={1.5}>
              {[
                { name: 'Instalación de cámaras', quotes: '24 cotizaciones', rating: '4,8 (18)', img: phoneImage },
                { name: 'Mantención de computadores', quotes: '16 cotizaciones', rating: '4,6 (12)', img: laptopImage },
                { name: 'Aire acondicionado', quotes: '12 cotizaciones', rating: '4,9 (20)', img: applianceImage },
              ].map((s) => (
                <Grid item xs={12} sm={4} key={s.name}>
                  <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                    <Box component="img" src={s.img} alt="" sx={{ width: '100%', height: 74, borderRadius: 1.5, objectFit: 'cover', mb: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }} noWrap>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{s.quotes}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Calificación: {s.rating}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'flex-start' }}
              spacing={{ xs: 2, sm: 4 }}
              sx={{ mb: 2 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6">Historial detallado de transacciones</Typography>
                <Typography variant="caption" color="text.secondary">
                  Certifica compras pasadas, motivos de devoluciones y capital reintegrado.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<FileDownloadOutlined />}
                onClick={handleExportHistoryPDF}
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, flexShrink: 0, minWidth: { sm: 170 } }}
              >
                Exportar PDF
              </Button>
            </Stack>

            <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 620 }}>
              <TableHead sx={{ bgcolor: '#f7f6ff' }}>
                <TableRow>
                  <TableCell>Fecha y hora</TableCell>
                  <TableCell># Pedido</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {TRANSACTIONS.slice(0, 3).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell sx={{ fontSize: '0.76rem' }}>{t.date}</TableCell>
                    <TableCell sx={{ fontWeight: 400 }}>{t.id}</TableCell>
                    <TableCell>{t.client}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 400 }}>{formatCLP(t.total)}</TableCell>
                    <TableCell><StatusChip status={t.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
      </Box>
    </Box>
  )
}