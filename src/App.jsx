import { CssBaseline, ThemeProvider } from '@mui/material'
import AppRoutes from './routes/routes'
import theme from './theme/theme'
import './styles/app.css'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  )
}

export default App

