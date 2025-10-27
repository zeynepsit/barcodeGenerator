import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Container,
  LinearProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Upload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';

const ExcelImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        setError('Sadece .xlsx dosyaları desteklenir.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Lütfen bir dosya seçin.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Excel import başlıyor...');
      const response = await axios.post('http://localhost:8080/api/simple-excel/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Import yanıtı:', response.data);
      
      if (response.data.success) {
        setSuccess(response.data.message || 'Excel dosyası başarıyla yüklendi!');
        setSelectedFile(null);
        // Dosya input'unu temizle
        const fileInput = document.getElementById('excel-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(response.data.error || 'Import işlemi başarısız oldu.');
      }
    } catch (err: any) {
      console.error('Import hatası:', err);
      setError('Excel import sırasında bir hata oluştu: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              Geri
            </Button>
            <Typography variant="h4" component="h1">
              Excel Dosyası Yükle
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" paragraph>
            Excel dosyanızı seçin ve içeriğini veritabanına yükleyin.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <input
              accept=".xlsx"
              style={{ display: 'none' }}
              id="excel-file-input"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="excel-file-input">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{ py: 2, mb: 2 }}
              >
                {selectedFile ? selectedFile.name : 'Excel Dosyası Seç (.xlsx)'}
              </Button>
            </label>

            <Button
              variant="contained"
              onClick={handleImport}
              disabled={!selectedFile || loading}
              fullWidth
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {loading ? 'Yükleniyor...' : 'Excel\'i Yükle'}
            </Button>
          </Box>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Not:</strong> Excel dosyanız şu sütunları içermelidir:
            </Typography>
            <Typography variant="caption" component="div" sx={{ mt: 1 }}>
              • Sütun 0: Barkod<br />
              • Sütun 6: Kargo Kodu<br />
              • Sütun 7: Sipariş Numarası<br />
              • Sütun 8: Alıcı<br />
              • Sütun 9: Teslimat Adresi<br />
              • Sütun 10: İl<br />
              • Sütun 11: İlçe<br />
              • Sütun 12: Ürün Adı<br />
              • Sütun 16: E-Posta<br />
              • Sütun 18: Marka<br />
              • Sütun 19: Stok Kodu
            </Typography>
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
};

export default ExcelImportPage;
