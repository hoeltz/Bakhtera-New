import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ErrorBoundary, ErrorProvider } from './components/ErrorBoundary';
import WarehouseManagement from './components/WarehouseManagement';
import './App.css';

// Create Material-UI theme that matches the warehouse system
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Material-UI blue
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e', // Material-UI red
      light: '#ff5983',
      dark: '#9a0036',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  spacing: 8, // 8px base unit
  shape: {
    borderRadius: 8,
  },
});

// Main App Component
function App() {
  return (
    <div className="App">
      <WarehouseManagement />
    </div>
  );
}

// Export wrapped App with Error Boundary
export default function AppWithErrorBoundary() {
  return (
    <ErrorProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary
          fallback={({ error, resetErrorBoundary }) => {
            // You can customize this fallback UI or use the default ErrorPage component
            console.error('App-level error caught:', error);
            
            return (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
              }}>
                <div style={{
                  maxWidth: '600px',
                  backgroundColor: 'white',
                  padding: '40px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}>
                  <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>
                    🚨 Application Error
                  </h1>
                  <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                    The Warehouse Management System encountered an unexpected error. 
                    This has been logged for technical review.
                  </p>
                  <div style={{ marginBottom: '20px' }}>
                    <strong>Error:</strong> {error?.message || 'Unknown error'}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={resetErrorBoundary}
                      style={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => window.location.href = '/'}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#1976d2',
                        border: '1px solid #1976d2',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      Go to Home
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        >
          <App />
        </ErrorBoundary>
      </ThemeProvider>
    </ErrorProvider>
  );
}

// Alternative: Using the default ErrorPage component
export function AppWithDefaultErrorPage() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  );
}