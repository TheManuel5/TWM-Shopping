import { API_MODE } from './services/api'
import { initializeDemo } from './data/demoSeed'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (!API_MODE) initializeDemo()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
