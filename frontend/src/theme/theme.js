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
      light: '#f1eeff',
      dark: '#c5bfff',
      contrastText: '#030c2e',
    },
    error: {
      main: '#e5252a',
      light: '#feeceb',
      dark: '#b91c1c',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
      dark: '#b45309',
      contrastText: '#030c2e',
    },
    success: {
      main: '#16a34a',
      light: '#dcfce7',
      dark: '#15803d',
      contrastText: '#ffffff',
    },
    info: {
      main: '#2563eb',
      light: '#dbeafe',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f6ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#030c2e',
      secondary: '#626680',
    },
    divider: '#e5e7f0',
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { fontSize: '1.75rem', lineHeight: 1.25, letterSpacing: '-0.025em', fontWeight: 800, color: '#030c2e' },
    h5: { fontWeight: 800, color: '#030c2e' },
    h6: { fontWeight: 700, color: '#030c2e' },
    subtitle1: { fontWeight: 600 },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiDialog: { styleOverrides: { paper: { borderRadius: 18, border: '1px solid #e5e7f0', boxShadow: '0 24px 70px rgba(3,12,46,0.18)' } } },
    MuiDialogTitle: { styleOverrides: { root: { fontSize: '1.25rem', fontWeight: 800, padding: '24px 24px 16px' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px 24px', gap: 8 } } },
    MuiButton: {
      defaultProps: { color: 'primary', disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          minHeight: 40,
          transition: 'background-color 160ms ease, box-shadow 160ms ease',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 8, backgroundColor: '#e2e0ff' }, bar: { borderRadius: 8 } } },
    MuiSkeleton: { defaultProps: { animation: 'wave' }, styleOverrides: { root: { backgroundColor: '#eeebfa' } } },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid #e5e7f0',
          boxShadow: '0 2px 10px rgba(3, 12, 46, 0.03)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
})

export default theme
