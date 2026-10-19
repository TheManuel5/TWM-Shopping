import { Step, StepLabel, Stepper, Typography, useMediaQuery } from '@mui/material'

const DEFAULT_STEPS = [
  { label: 'Recibido', description: 'Tu pedido fue registrado' },
  { label: 'En preparación', description: 'Preparado por el vendedor' },
  { label: 'Enviado', description: 'En tránsito a tu dirección' },
  { label: 'Entregado', description: 'Entregado en domicilio' },
]

export default function OrderStepper({ activeStep = 1, steps = DEFAULT_STEPS }) {
  const isMobile = useMediaQuery('(max-width:600px)')
  const safeStep = Math.max(0, Math.min(Number(activeStep) || 0, steps.length))
  return (
    <Stepper activeStep={safeStep} orientation={isMobile ? 'vertical' : 'horizontal'} alternativeLabel={!isMobile} sx={{ py: 2, maxWidth: '100%' }}>
      {steps.map((step, index) => (
        <Step key={step.label} completed={index < safeStep}>
          <StepLabel
             optional={
              step.description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: isMobile ? 'left' : 'center' }}>
                  {step.description}
                </Typography>
              )
            }
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {step.label}
            </Typography>
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  )
}
