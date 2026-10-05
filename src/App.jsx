import { CssBaseline, ThemeProvider } from '@mui/material'
import AuthProvider from './contexts/AuthContext/AuthProvider'
import AppRoutes from './routes/routes'
import theme from './theme/theme'
import './styles/app.css'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

