import ViewErrorBoundary from './components/layout/ViewErrorBoundary'
import ApiGate from './components/layout/ApiGate'
import LocalLifecycle from './components/layout/LocalLifecycle'
import { CssBaseline, ThemeProvider } from '@mui/material'
import AuthProvider from './contexts/AuthContext/AuthProvider'
import Feedback from './components/layout/Feedback'
import AppRoutes from './routes/routes'
import theme from './theme/theme'
import './styles/app.css'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ApiGate><ViewErrorBoundary><AppRoutes /></ViewErrorBoundary></ApiGate>
        <Feedback />
        <LocalLifecycle />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

