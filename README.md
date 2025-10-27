# Gözlük Marketi - Stok ve Sipariş Yönetim Sistemi

## Özellikler

- ✅ Excel Import - Excel dosyası yükleme
- ✅ Barkod Oluşturucu - Gruplandırma ve barkod yazdırma
- ✅ Günlük Rapor - Raporlama ve filtreleme
- ✅ Login/Register - Kullanıcı girişi ve admin onay sistemi

## Kurulum (Docker ile)

### Gereksinimler

- Docker Desktop (https://www.docker.com/products/docker-desktop/)

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone <repo-url>
cd gozlukMarketi
```

2. **Environment dosyasını oluşturun:**
```bash
# .env.example dosyasını kopyalayın
cp .env.example .env

# .env dosyasını düzenleyin ve şifreleri değiştirin
```

3. **Docker Desktop'ı başlatın**

4. **Uygulamayı çalıştırın:**
```bash
docker-compose up --build
```

4. **Tarayıcıda açın:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8080

### İlk Giriş

- **Username:** admin
- **Password:** admin123

## Geliştirme

### Kod Değişikliği Yaptıktan Sonra:

```bash
# Docker'ı durdurun (Ctrl+C)
# Yeniden build edin:
docker-compose up --build
```

### Environment Variables

`.env` dosyasında şu değişkenleri özelleştirin:

- `DB_PASSWORD` - Veritabanı şifresi (güçlü bir şifre seçin)
- `JWT_SECRET` - JWT token güvenlik anahtarı (en az 256 bit)
- `JWT_EXPIRATION` - Token geçerlilik süresi (ms, varsayılan: 24 saat)

**ÖNEMLİ:** `.env` dosyası Git'e eklenmez (güvenlik için)

## Teknolojiler

- **Backend:** Spring Boot, H2 Database, JWT Authentication
- **Frontend:** React, TypeScript, Material-UI
- **Deployment:** Docker, Nginx

## Lisans

Private

