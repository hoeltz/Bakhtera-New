import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import ErrorBoundary, { ErrorProvider } from './components/ErrorBoundary';

// Example 1: Basic Error Boundary Usage in App.js
// ================================================

/**
 * This is how you would typically use the ErrorBoundary in your main App.js file
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary
          fallback={
            <div style={{ 
              padding: '20px', 
              textAlign: 'center',
              color: '#d32f2f',
              fontFamily: 'Arial, sans-serif'
            }}>
              <h2>Something went wrong with the application</h2>
              <p>Please refresh the page or contact support if the problem persists.</p>
            </div>
          }
        >
          <App />
        </ErrorBoundary>
      </ThemeProvider>
    </ErrorProvider>
  </React.StrictMode>
);

// Example 2: Error Boundary with Warehouse Management Context
// ============================================================

/**
 * Example usage specifically for Warehouse Management System
 * This shows how the error boundary would be used in the warehouse context
 */
export const WarehouseAppWithErrorBoundary = () => {
  return (
    <ErrorProvider>
      <div className="warehouse-app">
        <ErrorBoundary
          fallback={({ error, resetError }) => (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                maxWidth: '600px',
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ color: '#d32f2f', marginBottom: '20px' }}>
                  🚨 Warehouse System Error
                </h2>
                <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                  The Warehouse Management System encountered an unexpected error. 
                  This may be related to:
                </p>
                <ul style={{ textAlign: 'left', marginBottom: '20px' }}>
                  <li>Data synchronization issues</li>
                  <li>AWB or Bill of Lading processing</li>
                  <li>Customs portal operations</li>
                  <li>Inventory management functions</li>
                </ul>
                <button 
                  onClick={resetError}
                  style={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginRight: '10px'
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
                    fontSize: '16px'
                  }}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        >
          {/* Your Warehouse Management Components */}
          <div>Warehouse content goes here...</div>
        </ErrorBoundary>
      </div>
    </ErrorProvider>
  );
};

// Example 3: Component-Level Error Boundary
// ==========================================

/**
 * Example of wrapping specific components with error boundaries
 * for more granular error handling
 */
export const WarehouseWithComponentErrorBoundaries = () => {
  return (
    <ErrorProvider>
      <div className="warehouse-dashboard">
        <h1>Warehouse Management System</h1>
        
        {/* AWB Management with its own error boundary */}
        <ErrorBoundary
          fallback={({ error, resetError }) => (
            <div style={{ padding: '20px', border: '2px solid #ff9800', borderRadius: '8px', margin: '20px 0' }}>
              <h3>⚠️ AWB Management Error</h3>
              <p>Unable to load AWB Management module. Error: {error.message}</p>
              <button onClick={resetError}>Retry AWB Module</button>
            </div>
          )}
        >
          <AWBManagement />
        </ErrorBoundary>

        {/* Bill of Lading Management with its own error boundary */}
        <ErrorBoundary
          fallback={({ error, resetError }) => (
            <div style={{ padding: '20px', border: '2px solid #ff9800', borderRadius: '8px', margin: '20px 0' }}>
              <h3>⚠️ Bill of Lading Error</h3>
              <p>Unable to load BL Management module. Error: {error.message}</p>
              <button onClick={resetError}>Retry BL Module</button>
            </div>
          )}
        >
          <BillOfLadingManagement />
        </ErrorBoundary>

        {/* Inventory Management with its own error boundary */}
        <ErrorBoundary
          fallback={({ error, resetError }) => (
            <div style={{ padding: '20px', border: '2px solid #ff9800', borderRadius: '8px', margin: '20px 0' }}>
              <h3>⚠️ Inventory Management Error</h3>
              <p>Unable to load Inventory module. Error: {error.message}</p>
              <button onClick={resetError}>Retry Inventory Module</button>
            </div>
          )}
        >
          <InventoryManagement />
        </ErrorBoundary>
      </div>
    </ErrorProvider>
  );
};

// Example 4: Error Boundary with Custom Error Handler
// ====================================================

/**
 * Example of using the error boundary with a custom error handler
 * for logging errors to external services
 */
export const WarehouseWithCustomErrorHandler = () => {
  const customErrorHandler = (error, errorInfo) => {
    // Log to external service
    console.log('Logging error to external service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: 'warehouse-management'
    });

    // Example: Send to error tracking service
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    // });
  };

  return (
    <ErrorProvider>
      <ErrorBoundary
        onError={customErrorHandler}
        fallback={({ error, resetError }) => (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>System Error</h2>
            <p>The warehouse system encountered an error and has been logged for review.</p>
            <button onClick={resetError}>Continue</button>
          </div>
        )}
      >
        <WarehouseDashboard />
      </ErrorBoundary>
    </ErrorProvider>
  );
};

// Example 5: Test Component to Trigger Errors
// ============================================

/**
 * Test component that can be used to trigger different types of errors
 * for testing the error boundary functionality
 */
export const ErrorTestComponent = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  const [errorType, setErrorType] = React.useState('general');

  if (shouldThrow) {
    switch (errorType) {
      case 'warehouse':
        throw new Error('Warehouse service error: Failed to load consignments from warehouseService.getAll()');
      case 'awb':
        throw new Error('AWB Management error: Cannot process Air Waybill data');
      case 'bl':
        throw new Error('Bill of Lading error: BL processing failed for vessel voyage data');
      case 'customs':
        throw new Error('Customs Portal error: BC category validation failed');
      case 'datasync':
        throw new Error('Data sync error: warehouseService.getAll() returned invalid data');
      default:
        throw new Error('General application error');
    }
  }

  return (
    <div style={{ padding: '20px', border: '2px dashed #ccc', margin: '20px 0' }}>
      <h3>Error Boundary Test Component</h3>
      <p>This component can trigger different types of errors to test the error boundary:</p>
      
      <div style={{ margin: '20px 0' }}>
        <label>
          Error Type:
          <select 
            value={errorType} 
            onChange={(e) => setErrorType(e.target.value)}
            style={{ margin: '0 10px', padding: '5px' }}
          >
            <option value="general">General Error</option>
            <option value="warehouse">Warehouse Service Error</option>
            <option value="awb">AWB Management Error</option>
            <option value="bl">Bill of Lading Error</option>
            <option value="customs">Customs Portal Error</option>
            <option value="datasync">Data Sync Error</option>
          </select>
        </label>
      </div>
      
      <button 
        onClick={() => setShouldThrow(true)}
        style={{
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        Trigger Error
      </button>
      
      <button 
        onClick={() => setShouldThrow(false)}
        style={{
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Reset
      </button>
    </div>
  );
};

// Example 6: Integration with Warehouse Service
// ==============================================

/**
 * Example of how the error boundary integrates with warehouse service errors
 */
export const WarehouseServiceErrorIntegration = () => {
  const [warehouseData, setWarehouseData] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Mock warehouse service that can fail
  const warehouseService = {
    getAll: () => {
      // Simulate different types of errors
      const shouldFail = Math.random() > 0.7; // 30% chance of failure
      
      if (shouldFail) {
        const errorTypes = [
          'Failed to parse localStorage data',
          'warehouseService.getAll() returned undefined',
          'JSON parsing error in warehouse data',
          'Network error while syncing warehouse data'
        ];
        const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        throw new Error(`Warehouse Service Error: ${randomError}`);
      }
      
      return {
        consignments: [],
        awb: [],
        billOfLadings: [],
        inventory: []
      };
    }
  };

  const loadWarehouseData = () => {
    try {
      const data = warehouseService.getAll();
      setWarehouseData(data);
      setError(null);
    } catch (err) {
      setError(err);
    }
  };

  React.useEffect(() => {
    loadWarehouseData();
  }, []);

  return (
    <ErrorProvider>
      <div style={{ padding: '20px' }}>
        <h2>Warehouse Service Integration Test</h2>
        
        <button 
          onClick={loadWarehouseData}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Load Warehouse Data
        </button>

        {error && (
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#ffebee', 
            border: '1px solid #f44336',
            borderRadius: '4px',
            margin: '20px 0'
          }}>
            <h4>Service Error Caught:</h4>
            <p>{error.message}</p>
            <button onClick={loadWarehouseData}>Retry</button>
          </div>
        )}

        {warehouseData && (
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e8f5e8', 
            border: '1px solid #4caf50',
            borderRadius: '4px',
            margin: '20px 0'
          }}>
            <h4>Data Loaded Successfully:</h4>
            <p>Consignments: {warehouseData.consignments.length}</p>
            <p>AWB Records: {warehouseData.awb.length}</p>
            <p>Bill of Lading Records: {warehouseData.billOfLadings.length}</p>
            <p>Inventory Items: {warehouseData.inventory.length}</p>
          </div>
        )}
      </div>
    </ErrorProvider>
  );
};

// Export all examples for reference
export default {
  WarehouseAppWithErrorBoundary,
  WarehouseWithComponentErrorBoundaries,
  WarehouseWithCustomErrorHandler,
  ErrorTestComponent,
  WarehouseServiceErrorIntegration
};