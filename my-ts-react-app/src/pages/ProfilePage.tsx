import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Grid,
  Divider
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/api';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Tüm alanları doldurun.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) {
        setError('Kullanıcı bilgisi bulunamadı.');
        return;
      }

      console.log('🔐 Şifre güncelleme isteği gönderiliyor...');
      console.log('User ID:', user.id);
      console.log('Yeni şifre:', passwordData.newPassword);
      
      // Kendi ID'mizi kullanarak şifre güncelle (admin endpoint'i kullan)
      await userApi.updateUserPassword(user.id, passwordData.newPassword);
      
      console.log('✅ Şifre güncelleme başarılı');
      setSuccess('Şifreniz başarıyla güncellendi!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Şifre güncellenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error">Kullanıcı bilgisi bulunamadı.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Profil Ayarları
          </Typography>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/')}
          >
            Ana Sayfa
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Kullanıcı Bilgileri */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Kullanıcı Bilgileri
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ad Soyad
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.firstName} {user.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Kullanıcı Adı
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.username}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    E-posta
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Rol
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Şifre Değiştir */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LockIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Şifre Değiştir
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Mevcut Şifre"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange('currentPassword')}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Yeni Şifre"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange('newPassword')}
                      variant="outlined"
                      helperText="En az 6 karakter olmalıdır"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Yeni Şifre Tekrar"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange('confirmPassword')}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProfilePage;

