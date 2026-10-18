import { Step, StepLabel, Stepper, Typography } from '@mui/material'

const DEFAULT_STEPS = [
  { label: 'Recibido', description: 'Tu pedido fue registrado' },
  { label: 'En preparación', description: 'Preparado por el vendedor' },
  { label: 'Enviado', description: 'En tránsito a tu dirección' },
  { label: 'Entregado', description: 'Entregado en domicilio' },
]

export default function OrderStepper({ activeStep = 1, steps = DEFAULT_STEPS }) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel sx={{ py: 2 }}>
      {steps.map((step, index) => (
        <Step key={step.label} completed={index < activeStep}>
          <StepLabel
             optional={
              step.description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
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