package com.example.demo.controller;

import com.example.demo.model.OrderImportData;
import com.example.demo.model.Product;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.OrderItemRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/simple-excel")
@CrossOrigin(origins = "*")
public class SimpleExcelImportController {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "OK", "message", "Simple Excel Import Controller is running"));
    }

    @PostMapping("/test-excel")
    public ResponseEntity<?> testExcel(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Dosya boş"));
            }

            try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);
            
                // İlk 3 satırı oku ve analiz et
                List<Map<String, Object>> testData = new ArrayList<>();
                
                for (int i = 0; i <= Math.min(2, sheet.getLastRowNum()); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;
                    
                    Map<String, Object> rowData = new HashMap<>();
                    for (int j = 0; j < Math.min(20, row.getLastCellNum()); j++) {
                        Cell cell = row.getCell(j);
                        String value = getCellValueAsString(cell);
                        rowData.put("Sütun_" + j, value);
                    }
                    testData.add(rowData);
                }
                
                workbook.close();
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("testData", testData);
                response.put("message", "Excel test başarılı");
                
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "error", "Test sırasında hata: " + e.getMessage()));
        }
    }

    @PostMapping("/import")
    public ResponseEntity<?> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "Dosya boş"));
            }

            List<Product> importedProducts = new ArrayList<>();
            Map<String, Order> orderMap = new HashMap<>(); // Sipariş numarası -> Order mapping
            int successCount = 0;
            int errorCount = 0;

            try (InputStream inputStream = file.getInputStream()) {
                Workbook workbook = new XSSFWorkbook(inputStream);
                Sheet sheet = workbook.getSheetAt(0);

                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;

                    try {
                        OrderImportData data = extractRowData(row);
                        
                        // Order oluştur veya güncelle
                        Order order = orderMap.get(data.getOrderNumber());
                        if (order == null) {
                            order = new Order();
                            order.setOrderNumber(data.getOrderNumber());
                            order.setCustomerName(data.getCustomerName());
                            order.setAddress(data.getAddress()); // Teslimat Adresi
                            order.setDeliveryAddress(data.getAddress()); // Teslimat Adresi (ayrı alan)
                            order.setPhone(data.getPhone());
                            order.setEmail(data.getEmail());
                            order.setCargoCampaignCode(data.getCargoCampaignCode());
                            order.setBarcode(data.getBarcode()); // İlk barkodu kaydet
                            order.setStockCode(data.getProductCode()); // İlk stok kodunu kaydet
                            order.setBrand(data.getBrand()); // Marka
                            order.setTotalItems(0);
                            order.setTotalAmount(0.0);
                            order.setStatus(com.example.demo.model.OrderStatus.PENDING);
                            order.setCreatedAt(java.time.LocalDateTime.now());
                            order.setUpdatedAt(java.time.LocalDateTime.now());
                            orderMap.put(data.getOrderNumber(), order);
                        }
                        
                        // Product oluştur
                        Product product = createProductFromData(data);
                        if (product != null) {
                            importedProducts.add(product);
                        }
                        
                        // OrderItem oluştur
                        OrderItem orderItem = new OrderItem();
                        orderItem.setOrder(order);
                        orderItem.setProduct(product);
                        orderItem.setStockCode(data.getProductCode()); // Stok kodunu kaydet
                        orderItem.setQuantity(data.getQuantity());
                        orderItem.setUnitPrice(data.getPrice());
                        orderItem.setCreatedAt(java.time.LocalDateTime.now());
                        
                        if (order.getOrderItems() == null) {
                            order.setOrderItems(new ArrayList<>());
                        }
                        order.getOrderItems().add(orderItem);
                        
                        successCount++;
                        System.out.println("✅ Satır " + i + " başarıyla işlendi: " + data.getProductName());

                    } catch (Exception e) {
                        System.out.println("❌ Satır " + i + " işlenirken hata: " + e.getMessage());
                        e.printStackTrace();
                        errorCount++;
                    }
                }

                workbook.close();
            }

            // Önce Product'ları kaydet ve ID'lerini al
            Map<String, Product> savedProducts = new HashMap<>();
            for (Product product : importedProducts) {
                try {
                    // Barcode'a göre var mı kontrol et
                    Product existingProduct = productRepository.findByBarcode(product.getBarcode()).orElse(null);
                    
                    Product savedProduct;
                    if (existingProduct != null) {
                        // Varsa mevcut product'ı kullan
                        savedProduct = existingProduct;
                        System.out.println("ℹ️ Product zaten mevcut: " + product.getBarcode() + " (ID: " + existingProduct.getId() + ")");
                    } else {
                        // Yoksa yeni kaydet
                        savedProduct = productRepository.save(product);
                        System.out.println("✅ Product kaydedildi: " + product.getBarcode() + " (ID: " + savedProduct.getId() + ")");
                    }
                    
                    savedProducts.put(product.getName(), savedProduct); // Name ile mapping
                } catch (Exception e) {
                    System.out.println("❌ Product kaydedilirken hata: " + e.getMessage());
                    errorCount++;
                }
            }
            
            // OrderItem'lardaki Product referanslarını güncelle
            for (Order order : orderMap.values()) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getProduct() != null) {
                        Product savedProduct = savedProducts.get(item.getProduct().getName());
                        if (savedProduct != null) {
                            item.setProduct(savedProduct);
                        }
                    }
                }
            }
            
            // Sonra Order'ları kaydet
            for (Order order : orderMap.values()) {
                try {
                    // TotalItems ve TotalAmount hesapla
                    int totalItems = order.getOrderItems().size();
                    double totalAmount = order.getOrderItems().stream()
                            .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
                            .sum();
                    
                    order.setTotalItems(totalItems);
                    order.setTotalAmount(totalAmount);
                    
                    // Veritabanında var mı kontrol et
                    Order existingOrder = orderRepository.findByOrderNumber(order.getOrderNumber()).orElse(null);
                    if (existingOrder != null) {
                        // Varsa güncelle (updatedAt'i GÜNCELLEME - sadece yeni item eklenirse güncellenir)
                        existingOrder.setTotalItems(totalItems);
                        existingOrder.setTotalAmount(totalAmount);
                        // OrderItem'ları ekle
                        if (existingOrder.getOrderItems() == null) {
                            existingOrder.setOrderItems(new ArrayList<>());
                        }
                        existingOrder.getOrderItems().addAll(order.getOrderItems());
                        orderRepository.save(existingOrder);
                        System.out.println("✅ Order güncellendi: " + order.getOrderNumber() + " (updatedAt korundu)");
                    } else {
                        // Yoksa yeni kaydet
                        orderRepository.save(order);
                        System.out.println("✅ Order kaydedildi: " + order.getOrderNumber());
                    }
                } catch (Exception e) {
                    System.out.println("❌ Order kaydedilirken hata: " + e.getMessage());
                    e.printStackTrace();
                    errorCount++;
                }
            }
            
            // Dosyayı kaydet
            saveExcelFile(file);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("importedCount", successCount);
            response.put("orderCount", orderMap.size());
            response.put("errorCount", errorCount);
            response.put("message", successCount + " satır başarıyla yüklendi, " + orderMap.size() + " sipariş oluşturuldu");

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("success", false, "error", "Import sırasında hata: " + e.getMessage()));
        }
    }
    
    private OrderImportData extractRowData(Row row) {
        OrderImportData data = new OrderImportData();

        try {
            // Excel sütun yapısı - gerçek yapı:
            // 0: Barkod (barcode)
            // 1: Paket No (packageNo)
            // 2: Kargo Firması (cargoCompany)
            // 3: Sipariş Tarihi (orderDate)
            // 4: Termin Süresinin Bittiği Tarih (deadlineDate)
            // 5: Kargoya Teslim Tarihi (deliveryDate)
            // 6: Kargo Kodu (cargoCode)
            // 7: Sipariş Numarası (orderNumber)
            // 8: Alıcı (customerName)
            // 9: Teslimat Adresi (address)
            // 10: İl (city)
            // 11: İlçe (district)
            // 12: Ürün Adı (productName)
            // 13: Fatura Adresi (invoiceAddress)
            // 14: Alıcı - Fatura Adresi (customerInvoiceAddress)
            // 15: Sipariş Statüsü (orderStatus)
            // 16: E-Posta (email)
            // 17: Komisyon Oranı (commissionRate)
            // 18: Marka (brand)
            // 19: Stok Kodu (stockCode)

            String barcode = getCellValueAsString(row.getCell(0));
            String packageNo = getCellValueAsString(row.getCell(1));
            String cargoCompany = getCellValueAsString(row.getCell(2));
            String orderDate = getCellValueAsString(row.getCell(3));
            String deadlineDate = getCellValueAsString(row.getCell(4));
            String deliveryDate = getCellValueAsString(row.getCell(5));
            String cargoCode = getCellValueAsString(row.getCell(6));
            String orderNumber = getCellValueAsString(row.getCell(7));
            String customerName = getCellValueAsString(row.getCell(8));
            String address = getCellValueAsString(row.getCell(9));
            String city = getCellValueAsString(row.getCell(10));
            String district = getCellValueAsString(row.getCell(11));
            String productName = getCellValueAsString(row.getCell(12));
            String email = getCellValueAsString(row.getCell(16));
            String brand = getCellValueAsString(row.getCell(18));

            // 19. sütunda stok kodu var (Sütun_19 = index 19)
            String stockCode = getCellValueAsString(row.getCell(19)); // 0-based index, 19. sütun = index 19

            System.out.println("==========================================");
            System.out.println("📊 Satır verileri:");
            System.out.println("  - Sipariş Numarası: '" + orderNumber + "'");
            System.out.println("  - Alıcı: '" + customerName + "'");
            System.out.println("  ✅ STOK KODU (19. SÜTUN): '" + stockCode + "'");
            System.out.println("  ✅ KARGO KODU (6. SÜTUN - BARKOD): '" + cargoCode + "'");
            System.out.println("  - Excel Barkod (0. sütun): '" + barcode + "'");
            System.out.println("==========================================");

            // Boş değer kontrolü
            if (orderNumber == null || orderNumber.trim().isEmpty()) {
                System.out.println("⚠️ UYARI: Sipariş numarası boş!");
            }
            if (barcode == null || barcode.trim().isEmpty()) {
                System.out.println("⚠️ UYARI: Barkod boş!");
            }
            if (customerName == null || customerName.trim().isEmpty()) {
                System.out.println("⚠️ UYARI: Alıcı adı boş!");
            }
            if (stockCode == null || stockCode.trim().isEmpty()) {
                System.out.println("⚠️ UYARI: Stok kodu boş!");
            }

            data.setOrderNumber(orderNumber);
            data.setBarcode(barcode); // 6. sütundaki kargo kodu - BARKOD İÇİN KULLANILACAK
            data.setProductCode(stockCode); // 19. sütundaki stok kodu
            data.setProductName(productName); // 12. sütundaki ürün adı
            data.setBrand(brand); // 18. sütundaki marka
            data.setCustomerName(customerName);
            data.setCity(city); // 10. sütundaki il
            data.setDistrict(district); // 11. sütundaki ilçe
            data.setOrderDate(orderDate);
            data.setPrice(0.0); // Fiyat bilgisi yok
            data.setQuantity(1); // Adet bilgisi yok, varsayılan 1
            data.setAddress(address); // 9. sütundaki teslimat adresi
            data.setPhone(""); // Telefon bilgisi yok
            data.setEmail(email); // 16. sütundaki email
            data.setCargoCampaignCode(cargoCode);

            return data;
        } catch (Exception e) {
            System.out.println("❌ extractRowData hatası: " + e.getMessage());
            throw e;
        }
    }

    private Product createProductFromData(OrderImportData data) {
        if (data.getProductCode() == null || data.getProductCode().trim().isEmpty()) {
            System.out.println("⚠️ UYARI: ProductCode boş, Product oluşturulamadı!");
            return null;
        }

        Product product = new Product();
        product.setName(data.getProductName()); // 12. sütun - Ürün Adı
        product.setBarcode(data.getBarcode()); // 0. sütun - Barkod (Excel'in ilk sütunu - gerçek ürün adı)
        product.setStockCode(data.getProductCode()); // 19. sütun - Stok Kodu (şirketin stok kodu)
        product.setDescription("Excel'den import edildi");

        product.setStock(1); // Varsayılan stok miktarı
        
        System.out.println("🔹 Product oluşturuldu:");
        System.out.println("  - Barcode (Excel 0. sütun - Gerçek Ürün Adı): " + data.getBarcode());
        System.out.println("  - StockCode (Excel 19. sütun - Şirket Stok Kodu): " + data.getProductCode());
        System.out.println("  - Name (Excel 12. sütun - Ürün Adı): " + data.getProductName());

        return product;
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        try {
            switch (cell.getCellType()) {
                case STRING:
                    return cell.getStringCellValue();
                case NUMERIC:
                    if (DateUtil.isCellDateFormatted(cell)) {
                        return cell.getDateCellValue().toString();
                    } else {
                        return String.valueOf(cell.getNumericCellValue());
                    }
                case BLANK:
                    return "";
                default:
                    return "";
            }
        } catch (Exception e) {
            System.out.println("Hücre değeri okunurken hata: " + e.getMessage());
            return "";
        }
    }
    
    private void saveExcelFile(MultipartFile file) throws IOException {
        // Upload dizinini oluştur
        Path uploadPath = Paths.get("uploads/excel/");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Dosya adını oluştur (tarih + orijinal ad)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = "import_" + timestamp + "_" + (originalFilename != null ? originalFilename : "file") + extension;
        
        // Dosyayı kaydet
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
    }
}