import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Container
} from '@mui/material';
import {
  Upload as UploadIcon,
  QrCode as BarcodeIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const menuItems = [
    {
      title: 'Excel Import',
      description: 'Excel dosyasından ürün yükle',
      icon: <UploadIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      onClick: () => navigate('/excel-import')
    },
    {
      title: 'Barkod Oluşturucu',
      description: 'Ürünler için barkod oluştur ve yazdır',
      icon: <BarcodeIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      onClick: () => navigate('/barcode-generator')
    },
    {
      title: 'Günlük Rapor',
      description: 'Günlük yüklenen siparişler ve istatistikler',
      icon: <ReportIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      onClick: () => navigate('/report')
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Barkod Yönetim Sistemi
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Ürünlerinizi kolayca yönetin, barkod oluşturun ve tarayın
        </Typography>
        
        {!isAuthenticated && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h6" color="warning.main" gutterBottom>
              Sistemi kullanmak için giriş yapın
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                size="large"
              >
                Giriş Yap
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/register')}
                size="large"
              >
                Kayıt Ol
              </Button>
            </Box>
          </Box>
        )}
        
        {isAuthenticated && user && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Hoş geldin, {user.firstName} {user.lastName}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Rol: {user.role === 'ADMIN' ? 'Yönetici' : user.role === 'MANAGER' ? 'Müdür' : 'Kullanıcı'}
            </Typography>
          </Box>
        )}
        
        {isAuthenticated && (
          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 6
                    }
                  }}
                  onClick={item.onClick}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                    <Box sx={{ color: item.color, mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;
