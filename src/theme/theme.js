import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#602ff7',
      dark: '#4520c7',
      light: '#8060fa',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e2e0ff',
      contrastText: '#030c2e',
    },
    background: {
      default: '#f7f6ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#030c2e',
      secondary: '#626680',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
})

export default theme
