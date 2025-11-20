import React from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Container,
  Grid,
  Alert,
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
  Report as ReportIcon,
} from '@mui/icons-material';

/**
 * Error Context for managing error state
 */
const ErrorContext = React.createContext();

/**
 * Custom hook to access error context
 */
export const useError = () => {
  const context = React.useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

/**
 * Error Provider Component
 */
export const ErrorProvider = ({ children }) => {
  const [error, setError] = React.useState(null);
  const [errorInfo, setErrorInfo] = React.useState(null);

  const clearError = React.useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);

  const value = React.useMemo(
    () => ({
      error,
      errorInfo,
      clearError,
      setError: (error, errorInfo = null) => {
        console.error('Error Boundary caught an error:', error, errorInfo);
        setError(error);
        setErrorInfo(errorInfo);
      },
    }),
    [error, errorInfo, clearError]
  );

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

/**
 * Error Page Component - Main error display with accessibility features
 */
const ErrorPage = ({ 
  error, 
  errorInfo, 
  onReload, 
  onBack, 
  showDetails = false,
  onToggleDetails 
}) => {
  const { language = 'en' } = React.useContext(ErrorContext) || {};
  const [detailsExpanded, setDetailsExpanded] = React.useState(showDetails);

  // Multi-language support
  const t = React.useMemo(() => ({
    en: {
      title: 'Oops! Something went wrong',
      titleShort: 'Error Occurred',
      subtitle: 'We encountered an unexpected error in the Warehouse Management System.',
      subtitleShort: 'An error occurred while processing your request.',
      description: 'This might be due to a temporary issue or a problem with the system. You can try refreshing the page or go back to the previous page.',
      descriptionShort: 'Please try refreshing the page or go back.',
      reloadButton: 'Reload Page',
      backButton: 'Go Back',
      errorDetails: 'Error Details',
      technicalInfo: 'Technical Information',
      errorMessage: 'Error Message',
      stackTrace: 'Stack Trace',
      componentStack: 'Component Stack',
      timestamp: 'Timestamp',
      userAgent: 'User Agent',
      url: 'Current URL',
      warehouseError: 'Warehouse System Error',
      awbError: 'AWB Management Error',
      blError: 'Bill of Lading Error',
      customsError: 'Customs Portal Error',
      dataSyncError: 'Data Synchronization Error',
      helpText: 'If this problem persists, please contact technical support.',
      id: 'Indonesian',
    },
    id: {
      title: 'Oops! Terjadi Kesalahan',
      titleShort: 'Terjadi Kesalahan',
      subtitle: 'Kami mengalami kesalahan tak terduga di Sistem Manajemen Gudang.',
      subtitleShort: 'Terjadi kesalahan saat memproses permintaan Anda.',
      description: 'Ini mungkin karena masalah sementara atau masalah dengan sistem. Anda dapat mencoba memuat ulang halaman atau kembali ke halaman sebelumnya.',
      descriptionShort: 'Silakan coba memuat ulang halaman atau kembali.',
      reloadButton: 'Muat Ulang Halaman',
      backButton: 'Kembali',
      errorDetails: 'Detail Kesalahan',
      technicalInfo: 'Informasi Teknis',
      errorMessage: 'Pesan Kesalahan',
      stackTrace: 'Stack Trace',
      componentStack: 'Stack Komponen',
      timestamp: 'Waktu',
      userAgent: 'User Agent',
      url: 'URL Saat Ini',
      warehouseError: 'Kesalahan Sistem Gudang',
      awbError: 'Kesalahan Manajemen AWB',
      blError: 'Kesalahan Bill of Lading',
      customsError: 'Kesalahan Portal Bea Cukai',
      dataSyncError: 'Kesalahan Sinkronisasi Data',
      helpText: 'Jika masalah ini berlanjut, silakan hubungi dukungan teknis.',
      id: 'Indonesia',
    }
  }), [language]);

  const currentLang = t[language] || t.en;

  // Error type detection
  const errorType = React.useMemo(() => {
    if (!error) return 'general';
    
    const errorMessage = error.message?.toLowerCase() || '';
    const errorStack = error.stack?.toLowerCase() || '';
    const combined = `${errorMessage} ${errorStack}`;
    
    if (combined.includes('warehouse') || combined.includes('consignment') || combined.includes('inventory')) {
      return 'warehouse';
    }
    if (combined.includes('awb') || combined.includes('air waybill')) {
      return 'awb';
    }
    if (combined.includes('bill of lading') || combined.includes('bl') || combined.includes('bl-')) {
      return 'bl';
    }
    if (combined.includes('customs') || combined.includes('bc') || combined.includes('bea cukai')) {
      return 'customs';
    }
    if (combined.includes('warehouseService') || combined.includes('getall') || combined.includes('datasync')) {
      return 'datasync';
    }
    return 'general';
  }, [error]);

  // Get error type specific info
  const errorTypeInfo = React.useMemo(() => {
    const info = {
      warehouse: { icon: <ErrorIcon />, color: 'error', label: currentLang.warehouseError },
      awb: { icon: <WarningIcon />, color: 'warning', label: currentLang.awbError },
      bl: { icon: <ReportIcon />, color: 'info', label: currentLang.blError },
      customs: { icon: <ErrorIcon />, color: 'error', label: currentLang.customsError },
      datasync: { icon: <WarningIcon />, color: 'warning', label: currentLang.dataSyncError },
      general: { icon: <ErrorIcon />, color: 'error', label: 'System Error' }
    };
    return info[errorType] || info.general;
  }, [errorType, currentLang]);

  // Format timestamp
  const timestamp = React.useMemo(() => {
    return new Date().toLocaleString(language === 'id' ? 'id-ID' : 'en-US');
  }, [language]);

  // Error details for logging
  const errorDetails = React.useMemo(() => ({
    message: error?.message,
    stack: error?.stack,
    componentStack: errorInfo?.componentStack,
    timestamp,
    url: window.location.href,
    userAgent: navigator.userAgent,
    errorType,
    warehouseContext: {
      currentPath: window.location.pathname,
      tabData: sessionStorage.getItem('warehouseData') ? 'Available' : 'Not Available',
      localStorage: localStorage.getItem('warehouseData') ? 'Available' : 'Not Available'
    }
  }), [error, errorInfo, timestamp, errorType]);

  // Auto-log error details to console
  React.useEffect(() => {
    if (error) {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error Details:', errorDetails);
      console.error('Raw Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }, [error, errorInfo, errorDetails]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box 
        role="main" 
        aria-labelledby="error-title"
        aria-describedby="error-description"
        sx={{ textAlign: 'center' }}
      >
        <Card 
          elevation={3}
          sx={{ 
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Error Icon and Type */}
            <Box sx={{ mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: `${errorTypeInfo.color}.light`,
                  color: `${errorTypeInfo.color}.main`,
                  mb: 2
                }}
                aria-hidden="true"
              >
                {React.cloneElement(errorTypeInfo.icon, { sx: { fontSize: 40 } })}
              </Box>
              
              <Chip
                label={errorTypeInfo.label}
                color={errorTypeInfo.color}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                aria-label={`Error type: ${errorTypeInfo.label}`}
              />
            </Box>

            {/* Main Error Message */}
            <Typography 
              id="error-title"
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 2
              }}
            >
              {currentLang.title}
            </Typography>

            <Typography 
              id="error-description"
              variant="h6" 
              component="h2" 
              color="text.secondary"
              sx={{ 
                mb: 3,
                fontWeight: 'normal'
              }}
            >
              {currentLang.subtitle}
            </Typography>

            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                mb: 4,
                lineHeight: 1.6,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              {currentLang.description}
            </Typography>

            {/* Error Summary for Screen Readers */}
            <Alert 
              severity={errorTypeInfo.color} 
              sx={{ 
                mb: 4,
                textAlign: 'left',
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
              role="alert"
              aria-live="polite"
            >
              <Typography variant="body2">
                <strong>{currentLang.errorMessage}:</strong> {error?.message || 'Unknown error occurred'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>{currentLang.timestamp}:</strong> {timestamp}
              </Typography>
            </Alert>

            {/* Action Buttons */}
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Grid item>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={onReload}
                  sx={{ 
                    minWidth: 160,
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                  aria-label={currentLang.reloadButton}
                >
                  {currentLang.reloadButton}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  onClick={onBack}
                  sx={{ 
                    minWidth: 160,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.light',
                      color: 'primary.dark'
                    }
                  }}
                  aria-label={currentLang.backButton}
                >
                  {currentLang.backButton}
                </Button>
              </Grid>
            </Grid>

            {/* Technical Details Section */}
            <Box sx={{ textAlign: 'left' }}>
              <Button
                variant="text"
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                startIcon={detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ 
                  color: 'text.secondary',
                  mb: 2,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'text.primary'
                  }
                }}
                aria-expanded={detailsExpanded}
                aria-controls="error-details"
                aria-label={`${detailsExpanded ? 'Hide' : 'Show'} ${currentLang.errorDetails}`}
              >
                {currentLang.errorDetails}
              </Button>

              <Collapse in={detailsExpanded} timeout="auto" unmountOnExit>
                <Box 
                  id="error-details"
                  role="region"
                  aria-labelledby="technical-details-title"
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 2
                  }}
                >
                  <Typography 
                    id="technical-details-title"
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      color: 'text.primary',
                      fontWeight: 'bold',
                      mb: 2
                    }}
                  >
                    {currentLang.technicalInfo}
                  </Typography>

                  {/* Error Message */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {currentLang.errorMessage}:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        backgroundColor: '#fff',
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        wordBreak: 'break-word'
                      }}
                    >
                      {error?.message || 'No error message available'}
                    </Typography>
                  </Box>

                  {/* Error Stack */}
                  {error?.stack && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {currentLang.stackTrace}:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          backgroundColor: '#fff',
                          p: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0',
                          maxHeight: 200,
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}
                        component="pre"
                      >
                        {error.stack}
                      </Typography>
                    </Box>
                  )}

                  {/* Component Stack */}
                  {errorInfo?.componentStack && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {currentLang.componentStack}:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          backgroundColor: '#fff',
                          p: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0',
                          maxHeight: 200,
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}
                        component="pre"
                      >
                        {errorInfo.componentStack}
                      </Typography>
                    </Box>
                  )}

                  {/* System Information */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {currentLang.timestamp}:
                      </Typography>
                      <Typography variant="body2">
                        {timestamp}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {currentLang.url}:
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {window.location.href}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 2,
                      pt: 2,
                      borderTop: '1px solid #e0e0e0',
                      color: 'text.secondary',
                      fontStyle: 'italic'
                    }}
                  >
                    {currentLang.helpText}
                  </Typography>
                </Box>
              </Collapse>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

/**
 * Main Error Boundary Component
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      showDetails: process.env.NODE_ENV === 'development'
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = async (error, errorInfo) => {
    try {
      // In a real app, you would send this to your error logging service
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        warehouseContext: {
          currentPath: window.location.pathname,
          tabData: sessionStorage.getItem('warehouseData') ? 'Available' : 'Not Available',
          localStorage: localStorage.getItem('warehouseData') ? 'Available' : 'Not Available',
          errorType: this.detectErrorType(error)
        }
      };

      // Example: Send to logging service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

      console.log('Error report prepared:', errorReport);
    } catch (logError) {
      console.error('Failed to log error to service:', logError);
    }
  };

  detectErrorType = (error) => {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorStack = error.stack?.toLowerCase() || '';
    const combined = `${errorMessage} ${errorStack}`;
    
    if (combined.includes('warehouse') || combined.includes('consignment') || combined.includes('inventory')) {
      return 'warehouse';
    }
    if (combined.includes('awb') || combined.includes('air waybill')) {
      return 'awb';
    }
    if (combined.includes('bill of lading') || combined.includes('bl') || combined.includes('bl-')) {
      return 'bl';
    }
    if (combined.includes('customs') || combined.includes('bc') || combined.includes('bea cukai')) {
      return 'customs';
    }
    if (combined.includes('warehouseService') || combined.includes('getall') || combined.includes('datasync')) {
      return 'datasync';
    }
    return 'general';
  };

  handleReload = () => {
    window.location.reload();
  };

  handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  handleToggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReload={this.handleReload}
          onBack={this.handleBack}
          showDetails={this.state.showDetails}
          onToggleDetails={this.handleToggleDetails}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;