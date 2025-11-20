import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// React Router v7 Future Flag untuk kompatibilitas
const router = {
  future: {
    v7_relativeSplatPath: true,
  },
};

const theme = createTheme({
  palette: {
    // Align primary/secondary with BRiDGE Customs Portal gradients
    primary: {
      main: '#667eea',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#f5576c',
      contrastText: '#ffffff'
    },
    info: {
      main: '#4facfe'
    },
    success: {
      main: '#43e97b'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    // Standardize header sizes to match Customs Portal screenshot
    h4: {
      fontWeight: 700,
      fontSize: '2rem'
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.25rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem'
    },
    subtitle1: {
      fontSize: '0.875rem'
    },
    body1: {
      fontSize: '0.9375rem'
    },
    body2: {
      fontSize: '0.875rem'
    }
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1976d2',
          color: 'white',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 700
        },
        contained: {
          boxShadow: 'none'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#667eea',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.875rem',
          padding: '16px'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8
        }
      }
    }
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={router.future}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);