import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Badge,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar
} from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon, Group as GroupIcon, Person as PersonIcon, Inventory as ProductIcon, Refresh as RefreshIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { productApi, barcodeApi, orderApi } from '../services/api';
import { Product, Order } from '../types';

interface Group {
  groupType: string;
  groupName: string;
  items: Order[];
  count: number;
  totalAmount: number;
  barcode?: string; // Excel'den gelen barkod (virgülle ayrılmış)
  stockCode?: string; // Stok kodu (virgülle ayrılmış)
}

const BarcodeGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [barcodeSize, setBarcodeSize] = useState(300);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'SHIPPED'>('PENDING');

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    loadGroups();
  }, [statusFilter]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Siparişleri yükle
      const response = await orderApi.getAllOrders();
      console.log('API Response:', response);
      console.log('Response type:', typeof response, 'isArray:', Array.isArray(response));
      
      // Response'un array olup olmadığını kontrol et
      const allOrders: Order[] = Array.isArray(response) ? response : [];
      
      let filteredOrders: Order[];
      
      if (statusFilter === 'SHIPPED') {
        // Kargoya Verildi: Sadece bugün oluşturulan SHIPPED siparişleri göster
        const today = new Date();
        
        // Yerel saat diliminde bugünün tarihini al
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        
        console.log('====== FİLTRELEME BAŞLIYOR ======');
        console.log('Bugünün tarihi (yerel saat):', todayStr);
        console.log('Bugünün tam tarihi:', today.toString());
        console.log('Toplam SHIPPED sipariş sayısı:', allOrders.filter(o => o.status === 'SHIPPED').length);
        
        filteredOrders = allOrders.filter(order => {
          if (order.status !== 'SHIPPED') return false;
          
          // createdAt tarihi bugün mü kontrol et
          if (!order.createdAt) {
            console.log(`❌ Sipariş ${order.orderNumber}: createdAt yok`);
            return false;
          }
          
          // createdAt'ten sadece tarih kısmını al (timezone bağımsız)
          let orderDateStr: string;
          if (order.createdAt.includes('T')) {
            orderDateStr = order.createdAt.split('T')[0];
          } else if (order.createdAt.includes(' ')) {
            orderDateStr = order.createdAt.split(' ')[0];
          } else {
            orderDateStr = order.createdAt.substring(0, 10);
          }
          
          const isToday = orderDateStr === todayStr;
          
          if (isToday) {
            console.log(`✅ Sipariş ${order.orderNumber}: createdAt=${order.createdAt}, tarih=${orderDateStr} (BUGÜN)`);
          } else {
            console.log(`❌ Sipariş ${order.orderNumber}: createdAt=${order.createdAt}, tarih=${orderDateStr} (Farklı gün - bugün: ${todayStr})`);
          }
          
          return isToday;
        });
        
        console.log('====== FİLTRELEME BİTTİ ======');
        console.log('Bugün oluşturulan SHIPPED siparişler:', filteredOrders.length);
      } else {
        // Beklemede: Tüm PENDING siparişler
        filteredOrders = allOrders.filter(order => order.status === 'PENDING');
        console.log('PENDING Siparişler:', filteredOrders.length);
      }
      
      console.log('Tüm Siparişler:', allOrders.length);
      console.log(`${statusFilter} Siparişler:`, filteredOrders.length);
      console.log('First order:', filteredOrders[0]);
      console.log('First order items:', filteredOrders[0]?.orderItems);
      
      // Hibrit gruplandırma
      const groupedData = createHybridGroups(filteredOrders);
      setGroups(groupedData);
      
    } catch (err: any) {
      console.error('Load groups error:', err);
      setError('Gruplar yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createHybridGroups = (orders: Order[]): Group[] => {
    const groups: Group[] = [];
    
    // Alıcı + Stok Kodu bazında gruplandırma yap
    const aliciStokGroups = new Map<string, Order[]>();
    
    orders.forEach(order => {
      // Alıcı adını doğru şekilde al
      let aliciName = order.customerName;
      
      // Eğer customerName tarih gibi görünüyorsa, orderNumber'dan alıcı adını çıkarmaya çalış
      if (aliciName && (aliciName.includes('/') || aliciName.includes('-') || /^\d+$/.test(aliciName))) {
        console.log('CustomerName tarih gibi görünüyor:', aliciName, 'OrderNumber:', order.orderNumber);
        // orderNumber formatından alıcı adını çıkarmaya çalış
        const orderParts = order.orderNumber.split('_');
        if (orderParts.length > 1) {
          aliciName = orderParts[1]; // İkinci kısım alıcı adı olabilir
          console.log('OrderNumber\'dan alıcı adı çıkarıldı:', aliciName);
        } else {
          aliciName = order.orderNumber; // Fallback olarak orderNumber kullan
          console.log('Fallback olarak orderNumber kullanıldı:', aliciName);
        }
      }
      
      // Stok kodu için önce Order'dan al, yoksa OrderItem'dan al
      let stockCode = order.stockCode || '';
      
      // Eğer Order'da stok kodu yoksa OrderItem'lardan al
      if (!stockCode && order.orderItems && order.orderItems.length > 0) {
        const stockCodes = order.orderItems
          .map(item => item.stockCode || item.product?.barcode || item.product?.name || '')
          .filter(code => code && code.trim() !== '');
        stockCode = stockCodes.length > 0 ? stockCodes[0] : '';
      }
      
      // Eğer hala stok kodu yoksa orderNumber'dan çıkarmaya çalış
      if (!stockCode) {
        stockCode = order.orderNumber.split('-')[0] || order.orderNumber;
      }
      
      console.log('Order:', order.orderNumber);
      console.log('OrderItems:', order.orderItems?.length || 0);
      console.log('Order.stockCode:', order.stockCode);
      console.log('Final aliciName:', aliciName, 'StockCode:', stockCode);
      
      const groupKey = `${aliciName}_${stockCode}`; // Özlem Karataş_ABC123
      
      if (!aliciStokGroups.has(groupKey)) {
        aliciStokGroups.set(groupKey, []);
      }
      aliciStokGroups.get(groupKey)!.push(order);
    });
    
    // Alıcı+Stok Kodu gruplarını ekle
    aliciStokGroups.forEach((orders, groupKey) => {
      const [aliciName] = groupKey.split('_'); // İlk kısım alıcı adı
      const totalQuantity = orders.reduce((sum, order) => sum + order.totalItems, 0);
      
      // İlk siparişten sipariş numarasını al
      const orderNumberForGroup = orders[0]?.orderNumber || 'Bilinmeyen';
      
      let groupType = '1li';
      if (totalQuantity === 2) groupType = '2li';
      else if (totalQuantity === 3) groupType = '3lu';
      else if (totalQuantity === 4) groupType = '4lu';
      else if (totalQuantity >= 5) groupType = '5veUstu';
      
      // Tüm benzersiz stok kodlarını ve barkodları topla
      const allStockCodes = new Set<string>();
      const allBarcodes = new Set<string>();
      
      orders.forEach(order => {
        // Order'dan barkod al
        if (order.barcode && order.barcode.trim()) {
          allBarcodes.add(order.barcode);
        }
        // Order'dan stok kodu al
        if (order.stockCode) {
          allStockCodes.add(order.stockCode);
        }
        // OrderItem'lardan stok kodlarını al
        if (order.orderItems) {
          order.orderItems.forEach(item => {
            const code = item.stockCode || item.product?.name;
            if (code && code.trim()) {
              allStockCodes.add(code);
            }
          });
        }
      });
      
      // Virgülle ayrılmış stok kodları ve barkodlar
      const stockCodesList = Array.from(allStockCodes).join(', ');
      const barcodesList = Array.from(allBarcodes).join(', ');
      const firstBarcode = Array.from(allBarcodes)[0] || '';
      const firstStockCode = Array.from(allStockCodes)[0] || '';
      
      const groupName = `${groupType.toUpperCase()} - ${aliciName} - ${orderNumberForGroup}`;
      
      console.log('Grup oluşturuluyor:', {
        groupKey,
        aliciName,
        barcodesList,
        firstBarcode,
        stockCodesList,
        firstStockCode,
        orderNumberForGroup,
        totalQuantity
      });
      
      groups.push({
        groupType,
        groupName,
        items: orders,
        count: orders.length,
        totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        barcode: barcodesList, // Tüm barkodları virgülle ayırarak kaydet
        stockCode: stockCodesList // Tüm stok kodlarını virgülle ayırarak kaydet
      });
    });
    
    return groups.sort((a, b) => {
      const order = ['1li', '2li', '3lu', '4lu', '5veUstu', 'diger'];
      return order.indexOf(a.groupType) - order.indexOf(b.groupType);
    });
  };

  const handleGenerateBarcode = () => {
    if (!selectedGroup) {
      setError('Lütfen bir grup seçin!');
      return;
    }
    
    console.log('Selected Group:', selectedGroup);
    
    // Grup tipine göre barkod oluştur
    let barcodeData = '';
    let groupTitle = '';
    
    // Excel'den gelen barcode alanını kullan (ilk barkod)
    const firstBarcode = selectedGroup.barcode?.split(',')[0].trim() || '';
    const firstStockCode = selectedGroup.stockCode?.split(',')[0].trim() || '';
    
    if (selectedGroup.groupType === '1li') {
      // 1'li grup: Excel'den gelen barkod
      barcodeData = firstBarcode || firstStockCode || selectedGroup.groupName;
      groupTitle = `1'li Grup - ${firstStockCode || 'Stok Kodu Yok'}`;
    } else {
      // 2+ li grup: İlk barkod (barkod için), tüm stok kodları (gösterim için)
      barcodeData = firstBarcode || firstStockCode || selectedGroup.groupName;
      groupTitle = `${selectedGroup.groupType.toUpperCase()} Grup - ${selectedGroup.stockCode || 'Stok Kodu Yok'}`;
    }
    
    console.log('Barcode Data:', barcodeData);
    console.log('Barcode Type:', barcodeType);
    console.log('Barcode Size:', barcodeSize);
    
    if (!barcodeData) {
      setError('Barkod verisi bulunamadı!');
      return;
    }
    
    const barcodeUrl = barcodeApi.getBarcodeImage(
      barcodeData,
      barcodeType,
      barcodeSize,
      barcodeSize
    );
    
    console.log('Barcode URL:', barcodeUrl);
    
    // Barkod resmini yeni pencerede aç
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Barkod - ${groupTitle}</title>
            <style>
              body { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0; 
                font-family: Arial, sans-serif;
              }
              .barcode-container {
                text-align: center;
                padding: 20px;
                border: 2px solid #ccc;
                border-radius: 10px;
                background: white;
              }
              .barcode-info {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <img src="${barcodeUrl}" alt="Barkod" style="max-width: 100%; height: auto;" onerror="alert('Barkod yüklenemedi: ' + this.src)" />
              <div class="barcode-info">
                <div style="margin-top: 15px;">
                  <p><strong>Sipariş Detayları:</strong></p>
                  ${selectedGroup.items.map(order => `
                    <div style="margin: 10px 0; padding: 8px; background: #f5f5f5; border-radius: 3px;">
                      <strong>Sipariş No:</strong> ${order.orderNumber}<br>
                      <strong>Alıcı:</strong> ${order.customerName}<br>
                      <strong>Teslimat Adresi:</strong> ${order.deliveryAddress || order.address || 'Yok'}<br>
                      ${order.brand ? `<strong>Marka:</strong> ${order.brand}<br>` : ''}
                      ${order.orderItems && order.orderItems.length > 0 ? `
                        <div style="margin-top: 8px; padding-left: 10px; border-left: 3px solid #2196F3;">
                          ${order.orderItems.map((item, index) => `
                            <div style="margin: 5px 0; padding: 5px; background: white; border-radius: 3px;">
                              <strong>${index + 1}. Ürün:</strong><br>
                              <strong>Stok Kodu:</strong> ${item.stockCode || item.product?.barcode || 'Yok'}<br>
                              <strong>Adet:</strong> ${item.quantity}
                            </div>
                        `).join('')}
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handlePrintAllGroups = (groupsToPrint: Group[]) => {
    if (!groupsToPrint || groupsToPrint.length === 0) {
      setError('Yazdırılacak grup yok!');
      return;
    }
    
    // Yazdırma için yeni pencere
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Tüm grupların tüm siparişlerini topla
      const allPages: string[] = [];
      
      let pageIndex = 0;
      let totalPages = 0;
      
      // Önce toplam sayfa sayısını hesapla
      groupsToPrint.forEach(group => {
        totalPages += group.items.length;
      });
      
      groupsToPrint.forEach(group => {
        // Her grup için her siparişi ayrı sayfa olarak ekle
        group.items.forEach(order => {
          pageIndex++;
          const isLastPage = pageIndex === totalPages;
          
          // Her siparişin kendi kargo kodu ile barkod oluştur
          const orderBarcode = order.cargoCampaignCode;
          const totalItems = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    
    const barcodeUrl = barcodeApi.getBarcodeImage(
            orderBarcode,
      barcodeType,
            350,  // genişlik - yatay dikdörtgen
            80    // yükseklik
          );
          
          // Son sayfa için farklı class kullan
          const pageClass = isLastPage ? 'page last-page' : 'page';
          
          const currentDate = new Date().toLocaleString('tr-TR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          allPages.push(`
            <div class="page">
              <!-- Header: Firma Adı ve Tarih -->
              <div class="header">
                <div class="company-name">${order.customerName || 'Beste Koku'}</div>
                <div class="date-info">
                  <div>${currentDate}</div>
                  <div class="page-number">${pageIndex}</div>
                </div>
              </div>
              
              <!-- Sipariş Bilgileri -->
              <div class="order-info">
                <div class="order-number">Sipariş No: ${order.orderNumber}</div>
                <div class="total-items">Toplam: ${totalItems}</div>
              </div>
              
              <!-- Adres -->
              <div class="address">${order.deliveryAddress || order.address || 'Adres yok'}</div>
              
              <!-- Kargo Kampanya Kodu ve Barkod -->
              <div class="barcode-section">
                <div class="barcode-label">Kargo Kampanya Kodu: ${orderBarcode}</div>
                <div class="barcode-image">
                  <img src="${barcodeUrl}" alt="Barkod" />
                </div>
              </div>
              
              <!-- Ürün Listesi -->
              <div class="product-list">
                <div class="product-header">
                  <span class="col-stock">Stok Kodu</span>
                  <span class="col-qty">Adet</span>
                </div>
                <div class="separator"></div>
                ${order.orderItems && order.orderItems.length > 0 ? order.orderItems.map((item, index) => {
                  const isLast = index === (order.orderItems?.length || 0) - 1;
                  return `
                  <div class="product-row">
                    <span class="col-stock">${item.stockCode || item.product?.name || 'Yok'}</span>
                    <span class="col-qty">${item.quantity}</span>
                  </div>
                  ${!isLast ? '<div class="separator"></div>' : ''}
                `}).join('') : '<div class="product-row">Ürün yok</div>'}
              </div>
            </div>
          `);
        });
      });
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Tüm Gruplar - ${groupsToPrint.length} Grup, ${allPages.length} Sipariş</title>
            <style>
              @page {
                size: 100mm 100mm;
                margin: 2mm;
              }
              
              * {
                box-sizing: border-box;
              }
              
              body { 
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                font-size: 6pt;
              }
              
              .page {
                width: 100mm;
                min-height: 100mm;
                padding: 2mm;
                display: flex;
                flex-direction: column;
                page-break-after: always;
              }
              
              .page:last-child {
                page-break-after: auto;
              }
              
              /* Header */
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 2mm;
              }
              
              .company-name {
                font-size: 15pt;
                font-weight: bold;
              }
              
              .date-info {
                text-align: right;
                font-size: 7pt;
                line-height: 1.3;
              }
              
              .page-number {
                font-size: 9pt;
                font-weight: bold;
                margin-top: 0.5mm;
              }
              
              /* Order Info */
              .order-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1mm;
                font-size: 9pt;
              }
              
              .order-number {
                font-weight: normal;
              }
              
              .total-items {
                font-weight: bold;
                font-size: 8pt;
              }
              
              /* Address */
              .address {
                font-size: 6.5pt;
                margin-bottom: 2mm;
                line-height: 1.3;
              }
              
              /* Barcode Section */
              .barcode-section {
                margin: 2mm 0;
                text-align: left;
              }
              
              .barcode-label {
                font-size: 6.5pt;
                margin-bottom: 0.5mm;
                font-weight: bold;
              }
              
              .barcode-image {
                text-align: center;
                margin: 1mm 0 2mm 0;
              }
              
              .barcode-image img {
                max-width: 90mm;
                max-height: 18mm;
                height: auto;
              }
              
              /* Product List */
              .product-list {
                margin-top: 2mm;
                flex: 1;
              }
              
              .product-header {
                display: flex;
                justify-content: space-between;
                font-size: 6.5pt;
                font-weight: bold;
                margin-bottom: 0.5mm;
              }
              
              .separator {
                border-bottom: 0.3mm solid #000;
                margin: 0.3mm 0;
              }
              
              .product-row {
                display: flex;
                justify-content: space-between;
                font-size: 6.5pt;
                padding: 0.5mm 0;
                line-height: 1.3;
                font-size: 10pt;
                font-weight: bold;
              
              }
              
              .col-stock {
                flex: 1;
                text-align: left;
              }
              
              .col-qty {
                width: 10mm;
                text-align: right;
              }
              
              @media print {
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                
                .page {
                  width: 100mm !important;
                  min-height: 100mm !important;
                  page-break-after: always !important;
                }
                
                .page:last-child {
                  page-break-after: auto !important;
                }
              }
            </style>
          </head>
          <body>
            ${allPages.join('')}
            <script>
              window.onload = function() {
                // Son sayfanın page-break'ini kaldır
                const pages = document.querySelectorAll('.page');
                if (pages.length > 0) {
                  const lastPage = pages[pages.length - 1];
                  lastPage.style.pageBreakAfter = 'auto';
                  lastPage.style.breakAfter = 'auto';
                }
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Yazdırma tamamlandığında otomatik SHIPPED yap
      printWindow.onafterprint = async () => {
        console.log('🖨️ Yazdırma tamamlandı, durumlar güncelleniyor...');
        
        try {
          const updatePromises = groupsToPrint.flatMap(group => 
            group.items.map(order => 
              orderApi.updateOrderStatus(order.id, 'SHIPPED')
                .then(() => console.log(`✅ Sipariş ${order.orderNumber} durumu güncellendi: SHIPPED`))
                .catch(err => console.error(`❌ Sipariş ${order.orderNumber} durumu güncellenemedi:`, err))
            )
          );
          
          await Promise.all(updatePromises);
          
          console.log('✅ Tüm siparişler SHIPPED olarak işaretlendi');
          setSuccessMessage('✅ Barkodlar yazdırıldı ve siparişler "Kargoya Verildi" olarak işaretlendi!');
          
          // Grupları yeniden yükle
          await loadGroups();
        } catch (err) {
          console.error('❌ Durum güncellenirken hata:', err);
          setError('Durum güncellenirken hata oluştu');
        }
      };
      
      console.log('✅ Yazdırma penceresi açıldı.');
    }
  };

  const handleMarkAsShipped = async (groupsToShip: Group[]) => {
    if (!groupsToShip || groupsToShip.length === 0) {
      setError('İşlenecek grup yok!');
      return;
    }
    
    try {
      setUpdatingStatus(true);
      console.log('📦 Siparişler manuel olarak SHIPPED yapılıyor...');
      
      const updatePromises = groupsToShip.flatMap(group => 
        group.items.map(order => 
          orderApi.updateOrderStatus(order.id, 'SHIPPED')
            .then(() => console.log(`✅ Sipariş ${order.orderNumber} manuel olarak SHIPPED yapıldı`))
            .catch(err => console.error(`❌ Sipariş ${order.orderNumber} durumu güncellenemedi:`, err))
        )
      );
      
      await Promise.all(updatePromises);
      
      console.log('✅ Tüm siparişler manuel olarak SHIPPED olarak işaretlendi');
      setSuccessMessage(`✅ ${groupsToShip.length} grup içindeki tüm siparişler "Kargoya Verildi" olarak işaretlendi!`);
      
      // Grupları yeniden yükle
      await loadGroups();
      
    } catch (err: any) {
      console.error('❌ Durum güncellenirken hata:', err);
      setError('Durum güncellenirken hata oluştu: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkAsPending = async (groupsToRevert: Group[]) => {
    if (!groupsToRevert || groupsToRevert.length === 0) {
      setError('İşlenecek grup yok!');
      return;
    }
    
    try {
      setUpdatingStatus(true);
      console.log('🔄 Siparişler PENDING yapılıyor...');
      
      const updatePromises = groupsToRevert.flatMap(group => 
        group.items.map(order => 
          orderApi.updateOrderStatus(order.id, 'PENDING')
            .then(() => console.log(`✅ Sipariş ${order.orderNumber} PENDING yapıldı`))
            .catch(err => console.error(`❌ Sipariş ${order.orderNumber} durumu güncellenemedi:`, err))
        )
      );
      
      await Promise.all(updatePromises);
      
      console.log('✅ Tüm siparişler PENDING olarak işaretlendi');
      setSuccessMessage(`✅ ${groupsToRevert.length} grup içindeki tüm siparişler geri alındı ve "Beklemede" durumuna getirildi!`);
      
      // Grupları yeniden yükle
      await loadGroups();
      
    } catch (err: any) {
      console.error('❌ Durum güncellenirken hata:', err);
      setError('Durum güncellenirken hata oluştu: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrintBarcode = () => {
    if (!selectedGroup) return;
    
    // Yazdırma için yeni pencere - her sipariş için ayrı sayfa
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Her sipariş için ayrı sayfa oluştur
       const pages = selectedGroup.items.map((order, orderIndex) => {
         // Her siparişin kendi kargo kampanya kodu ile barkod oluştur
         const orderBarcode = order.cargoCampaignCode || order.barcode || order.stockCode || '';
         const barcodeUrl = barcodeApi.getBarcodeImage(
           orderBarcode,
           barcodeType,
           350,  // genişlik - yatay dikdörtgen
           80    // yükseklik
         );
         
         return `
         <div class="page" style="page-break-after: always;">
           <h4 style="text-align: center; font-size: 10pt; margin: 2mm 0; font-weight: bold;">Sipariş Detayları:</h4>
           
            <div class="group-info">
             <div style="margin: 2mm 0; padding: 2mm; background: #f5f5f5; border-radius: 1mm; font-size: 6pt;">
                    <strong>Sipariş No:</strong> ${order.orderNumber}<br>
                    <strong>Alıcı:</strong> ${order.customerName}<br>
               <strong>Teslimat Adresi:</strong> ${order.deliveryAddress || order.address || 'Yok'}<br>
               ${order.brand ? `<strong>Marka:</strong> ${order.brand}<br>` : ''}
                    ${order.orderItems && order.orderItems.length > 0 ? `
                 <div style="margin-top: 2mm; padding-left: 2mm; border-left: 1mm solid #2196F3;">
                   ${order.orderItems.map((item, index) => `
                     <div style="margin: 1mm 0; padding: 1mm; background: white; border-radius: 1mm; font-size: 5.5pt;">
                       <strong>${index + 1}. Ürün:</strong><br>
                       <strong>Stok Kodu:</strong> ${item.stockCode || item.product?.barcode || 'Yok'}<br>
                       <strong>Ürün Adı:</strong> ${item.product?.name || 'Yok'}<br>
                       <strong>Adet:</strong> ${item.quantity}
                     </div>
                      `).join('')}
                 </div>
                    ` : ''}
                  </div>
              </div>
           
           <div class="barcode" style="margin-top: 3mm; text-align: center;">
             <h3 style="margin-bottom: 1mm; font-size: 6pt; font-weight: bold;">Kargo Kampanya Kodu:</h3>
             <p style="font-size: 7pt; margin: 0.5mm 0; font-weight: bold;">${orderBarcode}</p>
             <img src="${barcodeUrl}" alt="Barkod" style="max-width: 85mm; max-height: 20mm; margin-top: 1mm;" />
            </div>
            </div>
       `}).join('');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Barkod Yazdır - ${selectedGroup.items.length} Sipariş</title>
            <style>
              @page {
                size: 100mm 100mm;
                margin: 2mm;
              }
              
              * {
                box-sizing: border-box;
              }
              
              body { 
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                font-size: 7pt;
              }
              
              .page {
                width: 100mm;
                min-height: 100mm;
                padding: 2mm;
                display: flex;
                flex-direction: column;
                page-break-after: always;
              }
              
              .page:last-child {
                page-break-after: auto;
              }
              
              .page h4 {
                text-align: center !important;
                font-size: 10pt !important;
                margin: 2mm 0 !important;
                font-weight: bold !important;
              }
              
              .group-info { 
                margin: 1mm 0 !important;
                width: 100% !important;
                font-size: 6pt !important;
              }
              
              .group-info > div {
                margin: 2mm 0 !important;
                padding: 2mm !important;
                background: #f5f5f5 !important;
                border-radius: 1mm !important;
                font-size: 6pt !important;
              }
              
              .group-info div div {
                margin-top: 2mm !important;
                padding-left: 2mm !important;
                border-left: 1mm solid #2196F3 !important;
              }
              
              .group-info div div div {
                margin: 1mm 0 !important;
                padding: 1mm !important;
                background: white !important;
                border-radius: 1mm !important;
                font-size: 5.5pt !important;
                border-left: none !important;
              }
              
              .group-info strong {
                font-weight: bold !important;
              }
              
              .barcode { 
                margin-top: 3mm !important;
                text-align: center !important;
              }
              
              .barcode h3 {
                margin-bottom: 1mm !important;
                font-size: 6pt !important;
                font-weight: bold !important;
              }
              
              .barcode p {
                font-size: 7pt !important;
                margin: 0.5mm 0 !important;
                font-weight: bold !important;
              }
              
              .barcode img {
                max-width: 85mm !important;
                max-height: 20mm !important;
                height: auto !important;
                margin-top: 1mm !important;
              }
              
              @media print {
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                
                .page {
                  width: 100mm !important;
                  min-height: 100mm !important;
                  page-break-after: always !important;
                }
                
                .page:last-child {
                  page-break-after: auto !important;
                }
              }
            </style>
          </head>
          <body>
            ${pages}
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getGroupedByType = () => {
    const grouped = {
      '1li': groups.filter(g => g.groupType === '1li'),
      '2li': groups.filter(g => g.groupType === '2li'),
      '3lu': groups.filter(g => g.groupType === '3lu'),
      '4lu': groups.filter(g => g.groupType === '4lu'),
      '5veUstu': groups.filter(g => g.groupType === '5veUstu')
    };
    return grouped;
  };

  const renderGroupList = (groupList: Group[], groupType: string) => (
    <List>
      {groupList.map((group, index) => (
        <React.Fragment key={index}>
          <ListItem 
            button 
            onClick={() => setSelectedGroup(group)}
            selected={selectedGroup?.groupName === group.groupName}
            sx={{ 
              border: selectedGroup?.groupName === group.groupName ? '2px solid #1976d2' : '1px solid #e0e0e0',
              borderRadius: 1,
              mb: 1
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={group.groupType.toUpperCase()} 
                    color={groupType === '1li' ? 'primary' : 'secondary'} 
                    size="small" 
                  />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {group.groupName.split(' - ')[1]}
                  </Typography>
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sipariş Sayısı: {group.count} 
                  </Typography>
                  {groupType === '1li' && (
                    <Typography variant="caption" color="info.main">
                      Stok kodu bazında gruplandırılmış
                    </Typography>
                  )}
                  {groupType !== '1li' && (
                    <Typography variant="caption" color="info.main">
                      Müşteri bazında gruplandırılmış
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
          {index < groupList.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );

  const groupedByType = getGroupedByType();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate('/')}
            >
              Ana Sayfa
            </Button>
            <Typography variant="h4" component="h1">
          Grup Bazlı Barkod Oluşturucu
        </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={loadGroups}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          >
            {loading ? 'Yükleniyor...' : 'Grupları Yükle'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                Sipariş Grupları
              </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={statusFilter === 'PENDING' ? 'contained' : 'outlined'}
                    color="warning"
                    size="small"
                    onClick={() => setStatusFilter('PENDING')}
                  >
                    Beklemede
                  </Button>
                  <Button
                    variant={statusFilter === 'SHIPPED' ? 'contained' : 'outlined'}
                    color="success"
                    size="small"
                    onClick={() => setStatusFilter('SHIPPED')}
                  >
                    Kargoya Verildi
                  </Button>
                </Box>
              </Box>
              
              <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                <Tab 
                  label={
                    <Badge badgeContent={groupedByType['1li'].length} color="primary">
                      1'li Gruplar
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge badgeContent={groupedByType['2li'].length} color="secondary">
                      2'li Gruplar
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge badgeContent={groupedByType['3lu'].length} color="error">
                      3'lü Gruplar
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge badgeContent={groupedByType['4lu'].length} color="warning">
                      4'lü Gruplar
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge badgeContent={groupedByType['5veUstu'].length} color="success">
                      5+ Gruplar
                    </Badge>
                  } 
                />
              </Tabs>

              <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
                {statusFilter === 'PENDING' && (
                <Button
                  variant="contained"
                    color="success"
                  fullWidth
                    startIcon={<PrintIcon />}
                    onClick={() => {
                      const currentGroups = 
                        activeTab === 0 ? groupedByType['1li'] :
                        activeTab === 1 ? groupedByType['2li'] :
                        activeTab === 2 ? groupedByType['3lu'] :
                        activeTab === 3 ? groupedByType['4lu'] :
                        groupedByType['5veUstu'];
                      handlePrintAllGroups(currentGroups);
                    }}
                    disabled={
                      (activeTab === 0 && groupedByType['1li'].length === 0) ||
                      (activeTab === 1 && groupedByType['2li'].length === 0) ||
                      (activeTab === 2 && groupedByType['3lu'].length === 0) ||
                      (activeTab === 3 && groupedByType['4lu'].length === 0) ||
                      (activeTab === 4 && groupedByType['5veUstu'].length === 0)
                    }
                  >
                    Tüm {
                      activeTab === 0 ? "1'li" :
                      activeTab === 1 ? "2'li" :
                      activeTab === 2 ? "3'lü" :
                      activeTab === 3 ? "4'lü" :
                      "5+"
                    } Grupları Yazdır ({
                      activeTab === 0 ? groupedByType['1li'].length :
                      activeTab === 1 ? groupedByType['2li'].length :
                      activeTab === 2 ? groupedByType['3lu'].length :
                      activeTab === 3 ? groupedByType['4lu'].length :
                      groupedByType['5veUstu'].length
                    })
                </Button>
                )}
                
                {statusFilter === 'SHIPPED' && (
                <Button
                    variant="contained"
                    color="warning"
                  fullWidth
                    startIcon={updatingStatus ? <CircularProgress size={20} color="inherit" /> : undefined}
                    onClick={() => {
                      const currentGroups = 
                        activeTab === 0 ? groupedByType['1li'] :
                        activeTab === 1 ? groupedByType['2li'] :
                        activeTab === 2 ? groupedByType['3lu'] :
                        activeTab === 3 ? groupedByType['4lu'] :
                        groupedByType['5veUstu'];
                      handleMarkAsPending(currentGroups);
                    }}
                    disabled={
                      updatingStatus ||
                      (activeTab === 0 && groupedByType['1li'].length === 0) ||
                      (activeTab === 1 && groupedByType['2li'].length === 0) ||
                      (activeTab === 2 && groupedByType['3lu'].length === 0) ||
                      (activeTab === 3 && groupedByType['4lu'].length === 0) ||
                      (activeTab === 4 && groupedByType['5veUstu'].length === 0)
                    }
                  >
                    {updatingStatus ? 'Geri Alınıyor...' : `Geri Al (${
                      activeTab === 0 ? groupedByType['1li'].length :
                      activeTab === 1 ? groupedByType['2li'].length :
                      activeTab === 2 ? groupedByType['3lu'].length :
                      activeTab === 3 ? groupedByType['4lu'].length :
                      groupedByType['5veUstu'].length
                    })`}
                </Button>
                )}
              </Box>

              <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
                {activeTab === 0 && renderGroupList(groupedByType['1li'], '1li')}
                {activeTab === 1 && renderGroupList(groupedByType['2li'], '2li')}
                {activeTab === 2 && renderGroupList(groupedByType['3lu'], '3lu')}
                {activeTab === 3 && renderGroupList(groupedByType['4lu'], '4lu')}
                {activeTab === 4 && renderGroupList(groupedByType['5veUstu'], '5veUstu')}
                </Box>
            </Paper>
          </Grid>
        </Grid>

        {selectedGroup && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seçilen Grup
              </Typography>
              <Typography variant="body1">
                <strong>Grup Adı:</strong> {selectedGroup.groupName}
              </Typography>
              <Typography variant="body1">
                <strong>Grup Tipi:</strong> {selectedGroup.groupType.toUpperCase()}
              </Typography>
              <Typography variant="body1">
                <strong>Sipariş Sayısı:</strong> {selectedGroup.count}
              </Typography>
              
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Grup İçindeki Siparişler:
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sipariş No</TableCell>
                      <TableCell>Alıcı</TableCell>
                      <TableCell>Ürün Sayısı</TableCell>
                      <TableCell>Tutar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedGroup.items.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.totalItems}</TableCell>
                        <TableCell>₺{order.totalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
          message={successMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
    </Container>
  );
};

export default BarcodeGeneratorPage;
