import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Assessment as ReportIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { orderApi } from '../services/api';
import { Order } from '../types';
import { useNavigate } from 'react-router-dom';

const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('TODAY');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const calculateDateRange = () => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    
    switch (dateRangeFilter) {
      case 'TODAY':
        start = today;
        end = today;
        break;
      case 'WEEK':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case 'MONTH':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;
      case 'YEAR':
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        break;
      case 'CUSTOM':
        return { start: new Date(startDate), end: new Date(endDate) };
    }
    
    return { start, end };
  };

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderApi.getAllOrders();
      
      // Tarih aralığına göre filtrele
      const { start, end } = calculateDateRange();
      const startDateStr = start.toISOString().split('T')[0];
      const endDateStr = end.toISOString().split('T')[0];
      
      const filteredOrders = response.filter((order: Order) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate >= startDateStr && orderDate <= endDateStr;
      });
      
      setOrders(filteredOrders);
    } catch (err: any) {
      console.error('Siparişler yüklenirken hata:', err);
      setError('Siparişler yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [dateRangeFilter, startDate, endDate]);

  // Durum ve marka filtresine göre siparişleri filtrele
  const filteredOrders = orders.filter(order => {
    // Durum filtresi
    if (statusFilter !== 'ALL' && order.status !== statusFilter) {
      return false;
    }
    // Marka filtresi
    if (brandFilter !== 'ALL' && order.brand !== brandFilter) {
      return false;
    }
    return true;
  });

  // İstatistikler (filtrelenmiş siparişler üzerinden)
  const totalOrders = filteredOrders.length;
  
  // Toplam ürün sayısı - OrderItems'ları say
  let totalItems = 0;
  filteredOrders.forEach(order => {
    if (order.orderItems && order.orderItems.length > 0) {
      totalItems += order.orderItems.length;
    }
  });
  
  const totalAmount = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  // Benzersiz stok kodları (filtrelenmiş siparişler üzerinden)
  const uniqueStockCodes = new Set<string>();
  filteredOrders.forEach(order => {
    if (order.stockCode) {
      uniqueStockCodes.add(order.stockCode);
    }
    if (order.orderItems) {
      order.orderItems.forEach(item => {
        if (item.stockCode) {
          uniqueStockCodes.add(item.stockCode);
        }
      });
    }
  });

  // Benzersiz markalar (tüm siparişlerden)
  const uniqueBrands = new Set<string>();
  orders.forEach(order => {
    if (order.brand && order.brand.trim()) {
      uniqueBrands.add(order.brand);
    }
  });
  const brandList = Array.from(uniqueBrands).sort();

  // Durum bazında gruplandırma (sadece tarih ve marka filtresine göre, durum filtresi hariç)
  const ordersForStatusCount = orders.filter(order => {
    // Sadece marka filtresi uygula
    if (brandFilter !== 'ALL' && order.brand !== brandFilter) {
      return false;
    }
    return true;
  });
  
  const statusGroups = {
    PENDING: ordersForStatusCount.filter(o => o.status === 'PENDING').length,
    PROCESSING: ordersForStatusCount.filter(o => o.status === 'PROCESSING').length,
    SHIPPED: ordersForStatusCount.filter(o => o.status === 'SHIPPED').length,
    DELIVERED: ordersForStatusCount.filter(o => o.status === 'DELIVERED').length,
    CANCELLED: ordersForStatusCount.filter(o => o.status === 'CANCELLED').length
  };

  // En çok satılan ürünler analizi
  interface ProductSales {
    stockCode: string;
    barcode: string;
    productName: string;
    brand: string;
    totalQuantity: number;
    orderCount: number;
  }

  const topProducts = React.useMemo(() => {
    const productMap = new Map<string, ProductSales>();
    
    filteredOrders.forEach(order => {
      if (order.orderItems) {
        order.orderItems.forEach(item => {
          const stockCode = item.stockCode || item.product?.stockCode || 'Bilinmeyen';
          
          if (!productMap.has(stockCode)) {
            productMap.set(stockCode, {
              stockCode,
              barcode: item.product?.barcode || '',
              productName: item.product?.name || '',
              brand: order.brand || '',
              totalQuantity: 0,
              orderCount: 0
            });
          }
          
          const product = productMap.get(stockCode)!;
          product.totalQuantity += item.quantity || 1;
          product.orderCount += 1;
        });
      }
    });
    
    // En çok satılandan aza sırala
    return Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10); // Top 10
  }, [filteredOrders]);

  const handlePrint = () => {
    window.print();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sayfalanmış veriler
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );


  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Ana Sayfa
          </Button>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            <ReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Günlük Rapor
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tarih Seçimi, Durum Filtresi ve Butonlar */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Tarih Aralığı</InputLabel>
                <Select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  label="Tarih Aralığı"
                >
                  <MenuItem value="TODAY">Bugün</MenuItem>
                  <MenuItem value="WEEK">Son 7 Gün</MenuItem>
                  <MenuItem value="MONTH">Bu Ay</MenuItem>
                  <MenuItem value="YEAR">Bu Yıl</MenuItem>
                  <MenuItem value="CUSTOM">Özel Aralık</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {dateRangeFilter === 'CUSTOM' && (
              <>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Başlangıç Tarihi"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    label="Bitiş Tarihi"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Marka Filtresi</InputLabel>
                <Select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  label="Marka Filtresi"
                >
                  <MenuItem value="ALL">Tüm Markalar</MenuItem>
                  {brandList.map(brand => (
                    <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Durum Filtresi</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Durum Filtresi"
                >
                  <MenuItem value="ALL">Tümü</MenuItem>
                  <MenuItem value="PENDING">Beklemede</MenuItem>
              
                  <MenuItem value="SHIPPED">Kargoya Verildi</MenuItem>
                 
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={loadOrders}
                fullWidth
              >
                Yenile
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                fullWidth
                disabled={filteredOrders.length === 0}
              >
                Yazdır
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* İstatistikler */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Toplam Sipariş
                </Typography>
                <Typography variant="h4" component="div" color="primary">
                  {totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Toplam Ürün (Adet)
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {totalItems}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sipariş kalemleri toplamı
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Durum Dağılımı */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sipariş Durumu Dağılımı
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Chip label={`Beklemede: ${statusGroups.PENDING}`} color="default" />
            </Grid>
           
            <Grid item>
              <Chip label={`Kargoya Verildi: ${statusGroups.SHIPPED}`} color="primary" />
            </Grid>
          
            
          </Grid>
        </Paper>

        {/* En Çok Satılan Ürünler */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            En Çok Satılan Ürünler (Top 10)
          </Typography>
          {topProducts.length === 0 ? (
            <Alert severity="info">Ürün verisi bulunamadı.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>#</strong></TableCell>
                    <TableCell><strong>Barkod Adı</strong></TableCell>
                    <TableCell><strong>Stok Kodu</strong></TableCell>
                    <TableCell><strong>Ürün Adı</strong></TableCell>
                    <TableCell><strong>Marka</strong></TableCell>
                    <TableCell align="center"><strong>Toplam Adet</strong></TableCell>
                    <TableCell align="center"><strong>Sipariş Sayısı</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.stockCode} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {product.barcode || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.stockCode} size="small" color="secondary" />
                      </TableCell>
                      <TableCell>{product.productName || '-'}</TableCell>
                      <TableCell>{product.brand || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={product.totalQuantity} 
                          color="success" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">{product.orderCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Sipariş Listesi */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sipariş Detayları ({filteredOrders.length} adet)
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Alert severity="info">
              {statusFilter === 'ALL' 
                ? `${selectedDate} tarihinde sipariş bulunamadı.`
                : `${selectedDate} tarihinde "${statusFilter}" durumunda sipariş bulunamadı.`
              }
            </Alert>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Sipariş No</strong></TableCell>
                      <TableCell><strong>Alıcı</strong></TableCell>
                      <TableCell><strong>Teslimat Adresi</strong></TableCell>
                      <TableCell><strong>Stok Kodu</strong></TableCell>
                      <TableCell><strong>Marka</strong></TableCell>
                      <TableCell><strong>Kargo Kodu</strong></TableCell>
                      <TableCell><strong>Ürün Sayısı</strong></TableCell>
                      <TableCell><strong>Tutar</strong></TableCell>
                      <TableCell><strong>Durum</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {order.deliveryAddress || order.address}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {order.orderItems && order.orderItems.length > 0 ? (
                            <Box>
                              {order.orderItems.map((item, idx) => (
                                <Chip 
                                  key={idx}
                                  label={item.stockCode || 'Yok'} 
                                  size="small" 
                                  sx={{ m: 0.5 }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Chip label={order.stockCode || 'Yok'} size="small" />
                          )}
                        </TableCell>
                        <TableCell>{order.brand || '-'}</TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {order.barcode || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{order.totalItems}</TableCell>
                        <TableCell>₺{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status} 
                            color={
                              order.status === 'DELIVERED' ? 'success' :
                              order.status === 'SHIPPED' ? 'primary' :
                              order.status === 'PROCESSING' ? 'info' :
                              order.status === 'CANCELLED' ? 'error' :
                              'default'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredOrders.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                labelRowsPerPage="Sayfa başına satır:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
              />
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ReportPage;

