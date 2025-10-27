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
  Link,
  Grid
} from '@mui/material';
import {
  PersonAdd as RegisterIcon,
  Login as LoginIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Zorunlu alanları doldurun.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      
      // Token varsa otomatik login olmuş, yoksa onay bekliyor
      if (response && response.token) {
        navigate('/');
      } else {
        // Onay bekleniyor
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <RegisterIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Kayıt Ol
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} icon={<SuccessIcon />}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Kayıt başarılı! 🎉
              </Typography>
              <Typography variant="body2">
                Hesabınız oluşturuldu ancak henüz aktif değil. 
                Admin onayından sonra giriş yapabileceksiniz.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Giriş Sayfasına Dön
              </Button>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Ad"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  autoComplete="given-name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Soyad"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  autoComplete="family-name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Kullanıcı Adı"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  autoComplete="username"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="E-posta"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  autoComplete="email"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  autoComplete="tel"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Şifre"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  autoComplete="new-password"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Şifre Tekrar"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  autoComplete="new-password"
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <RegisterIcon />}
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </form>
          )}

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Zaten hesabınız var mı?
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ mt: 1 }}
            >
              Giriş Yap
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;

