import { Chip } from '@mui/material'

const STATUS_MAP = {
  // Estados de pedido / despacho (RF15, RF20)
  Recibido: { bg: '#e2e0ff', color: '#602ff7' },
  'En preparación': { bg: '#fef3c7', color: '#b45309' },
  Enviado: { bg: '#dbeafe', color: '#1d4ed8' },
  Despachado: { bg: '#dbeafe', color: '#1d4ed8' },
  'En reparto': { bg: '#f1eeff', color: '#602ff7' },
  Entregado: { bg: '#dcfce7', color: '#15803d' },
  Completado: { bg: '#dcfce7', color: '#15803d' },
  Pendiente: { bg: '#fef3c7', color: '#b45309' },
  Cancelado: { bg: '#feeceb', color: '#b91c1c' },

  // Estados de Cotización (RF23 - P13)
  Solicitada: { bg: '#dbeafe', color: '#1d4ed8' },
  Respondida: { bg: '#e2e0ff', color: '#602ff7' },
  'Aceptada por el cliente': { bg: '#dcfce7', color: '#15803d' },
  Expirada: { bg: '#f3f4f6', color: '#6b7280' },

  // Estados de Devolución (RF30 - P14)
  Aprobada: { bg: '#dcfce7', color: '#15803d' },
  'En proceso': { bg: '#dbeafe', color: '#1d4ed8' },
  Rechazada: { bg: '#feeceb', color: '#b91c1c' },
  Finalizada: { bg: '#f3f4f6', color: '#374151' },

  // Estados de Inventario / Usuario / Empresa (P17, P19, P20)
  Activo: { bg: '#dcfce7', color: '#15803d' },
  Activa: { bg: '#dcfce7', color: '#15803d' },
  'Stock bajo': { bg: '#fef3c7', color: '#b45309' },
  'En revisión': { bg: '#fef3c7', color: '#b45309' },
  'Sin stock': { bg: '#f3f4f6', color: '#6b7280' },
  Inactivo: { bg: '#feeceb', color: '#b91c1c' },
  Suspendida: { bg: '#feeceb', color: '#b91c1c' },
  Oferta: { bg: '#dcfce7', color: '#15803d' },
  'Oferta finalizada': { bg: '#feeceb', color: '#b91c1c' },
}

export default function StatusChip({ status, size = 'small', sx = {} }) {
  const style = STATUS_MAP[status] || { bg: '#e2e0ff', color: '#602ff7' }

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 700,
        fontSize: '0.75rem',
        borderRadius: '999px',
        ...sx,
      }}
    />
  )
}