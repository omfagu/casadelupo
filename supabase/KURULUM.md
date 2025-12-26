# Supabase Kurulum Rehberi

Bu rehber, Casa de Lupo QR Menü sistemi için Supabase'i adım adım kurmanıza yardımcı olacaktır.

## 1. Supabase Hesabı Oluşturma

1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın (veya e-posta ile kayıt olun)

## 2. Yeni Proje Oluşturma

1. Dashboard'da "New Project" butonuna tıklayın
2. Aşağıdaki bilgileri doldurun:
   - **Organization**: Kendi organizasyonunuzu seçin
   - **Project name**: `casadelupo` (veya istediğiniz isim)
   - **Database Password**: Güçlü bir şifre belirleyin (not alın!)
   - **Region**: `Frankfurt (eu-central-1)` (Türkiye için en yakın)
3. "Create new project" butonuna tıklayın
4. Proje oluşturulurken bekleyin (1-2 dakika sürebilir)

## 3. API Anahtarlarını Alma

1. Sol menüden **Project Settings** (dişli ikonu) tıklayın
2. **API** sekmesine gidin
3. Şu değerleri kopyalayın:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Projenizin kök dizininde `.env.local` dosyası oluşturun:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxx...
   ```

## 4. Veritabanı Tablolarını Oluşturma

1. Sol menüden **SQL Editor** tıklayın
2. "New query" butonuna tıklayın
3. `supabase/schema.sql` dosyasının içeriğini yapıştırın
4. **Run** butonuna tıklayın
5. Tüm tabloların oluşturulduğunu göreceksiniz

## 5. Storage Bucket Oluşturma (Görsel Yükleme İçin)

1. Sol menüden **Storage** tıklayın
2. **New bucket** butonuna tıklayın
3. Bucket ayarları:
   - **Name**: `product-images`
   - **Public bucket**: ✅ İşaretleyin
4. **Create bucket** butonuna tıklayın

### Storage Politikası (RLS)
Bucket oluşturduktan sonra:
1. `product-images` bucket'ına tıklayın
2. **Policies** sekmesine gidin
3. **New Policy** butonuna tıklayın
4. "For full customization" seçin

**Policy 1 - Herkes Okuyabilir:**
- Policy name: `Public Read`
- Allowed operation: `SELECT`
- Policy definition: `true`

**Policy 2 - Auth Kullanıcılar Yükleyebilir:**
- Policy name: `Auth Upload`
- Allowed operation: `INSERT`
- Policy definition: `auth.role() = 'authenticated'`

## 6. Admin Kullanıcısı Oluşturma

1. Sol menüden **Authentication** tıklayın
2. **Users** sekmesine gidin
3. **Add user** → **Create new user** tıklayın
4. Aşağıdaki bilgileri girin:
   - **Email**: `admin@casadelupo.local`
   - **Password**: Güçlü bir şifre belirleyin
   - **Auto Confirm User**: ✅ İşaretleyin
5. **Create user** butonuna tıklayın

> **Not**: Login ekranında sadece `admin` yazmanız yeterli olacak, sistem otomatik olarak `admin@casadelupo.local` e-postasına dönüştürecek.

## 7. Test Etme

1. Terminalde `npm run dev` çalıştırın
2. Tarayıcıda `http://localhost:3000/admin` açın
3. Kullanıcı adı: `admin`
4. Şifre: Belirlediğiniz şifre
5. Giriş yapabiliyorsanız kurulum tamamdır!

## Sorun Giderme

### "Invalid API key" hatası
- `.env.local` dosyasındaki değerleri kontrol edin
- Next.js sunucusunu yeniden başlatın (`npm run dev`)

### "Row level security" hatası
- SQL Editor'da RLS politikalarının doğru oluşturulduğunu kontrol edin
- `schema.sql` dosyasını tekrar çalıştırmayı deneyin

### Görsel yüklenemiyor
- Storage bucket'ın "Public" olduğundan emin olun
- Storage politikalarını kontrol edin
