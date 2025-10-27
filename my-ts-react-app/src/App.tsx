import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { LocalGroceryStore, Logout as LogoutIcon } from '@mui/icons-material';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Sayfalar
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import ExcelImportPage from './pages/ExcelImportPage';
import BarcodeGeneratorPage from './pages/BarcodeGeneratorPage';
import ReportPage from './pages/ReportPage';

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

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <LocalGroceryStore sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Barkod Yönetim Sistemi
          </Typography>
          {isAuthenticated && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                Hoş geldin, {user.firstName} {user.lastName}
              </Typography>
              <Button
                color="inherit"
                onClick={() => navigate('/profile')}
              >
                Profil
              </Button>
              {user.role === 'ADMIN' && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/admin')}
                >
                  Admin Panel
                </Button>
              )}
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Çıkış
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/excel-import" element={<ExcelImportPage />} />
          <Route path="/barcode-generator" element={<BarcodeGeneratorPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Container>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
