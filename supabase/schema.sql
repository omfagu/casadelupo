-- Casa de Lupo - QR Menü Sistemi
-- Supabase Veritabanı Şeması
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- ============================================
-- 1. TABLOLAR
-- ============================================

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ürünler tablosu
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================

-- RLS'i etkinleştir
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Kategoriler için politikalar
-- Herkes okuyabilir
CREATE POLICY "Kategorileri herkes okuyabilir" ON categories
  FOR SELECT USING (true);

-- Sadece giriş yapmış kullanıcı yazabilir
CREATE POLICY "Kategorileri sadece admin ekleyebilir" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Kategorileri sadece admin güncelleyebilir" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Kategorileri sadece admin silebilir" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- Ürünler için politikalar
-- Herkes okuyabilir
CREATE POLICY "Ürünleri herkes okuyabilir" ON products
  FOR SELECT USING (true);

-- Sadece giriş yapmış kullanıcı yazabilir
CREATE POLICY "Ürünleri sadece admin ekleyebilir" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Ürünleri sadece admin güncelleyebilir" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Ürünleri sadece admin silebilir" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- 3. UPDATED_AT TRIGGER
-- ============================================

-- updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Products tablosu için trigger
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ÖRNEK VERİLER (Opsiyonel)
-- ============================================

-- Örnek kategoriler
INSERT INTO categories (name, sort_order) VALUES
  ('Kebaplar', 1),
  ('Pizzalar', 2),
  ('Salatalar', 3),
  ('İçecekler', 4),
  ('Tatlılar', 5);

-- Örnek ürünler (kategori id'lerini almak için)
DO $$
DECLARE
  kebap_id UUID;
  pizza_id UUID;
  salata_id UUID;
  icecek_id UUID;
  tatli_id UUID;
BEGIN
  SELECT id INTO kebap_id FROM categories WHERE name = 'Kebaplar';
  SELECT id INTO pizza_id FROM categories WHERE name = 'Pizzalar';
  SELECT id INTO salata_id FROM categories WHERE name = 'Salatalar';
  SELECT id INTO icecek_id FROM categories WHERE name = 'İçecekler';
  SELECT id INTO tatli_id FROM categories WHERE name = 'Tatlılar';

  INSERT INTO products (category_id, name, description, price, sort_order) VALUES
    (kebap_id, 'Adana Kebap', 'Özel baharatlarla hazırlanmış acılı kebap', 180.00, 1),
    (kebap_id, 'Urfa Kebap', 'Acısız lezzetli kebap', 175.00, 2),
    (kebap_id, 'Patlıcan Kebap', 'Közlenmiş patlıcan eşliğinde', 190.00, 3),
    (pizza_id, 'Margherita', 'Domates sos, mozzarella, fesleğen', 150.00, 1),
    (pizza_id, 'Karışık Pizza', 'Sucuk, sosis, mantar, biber', 180.00, 2),
    (salata_id, 'Mevsim Salata', 'Taze mevsim yeşillikleri', 60.00, 1),
    (salata_id, 'Çoban Salata', 'Domates, salatalık, soğan', 55.00, 2),
    (icecek_id, 'Ayran', 'Ev yapımı taze ayran', 25.00, 1),
    (icecek_id, 'Kola', '330ml', 35.00, 2),
    (icecek_id, 'Su', '500ml', 15.00, 3),
    (tatli_id, 'Künefe', 'Hatay usulü künefe', 120.00, 1),
    (tatli_id, 'Baklava', '4 dilim fıstıklı baklava', 100.00, 2);
END $$;

-- ============================================
-- 5. STORAGE BUCKET KURULUMU
-- ============================================
-- Bu kısmı Supabase Dashboard > Storage'dan yapın:
-- 1. "New bucket" butonuna tıklayın
-- 2. Bucket adı: product-images
-- 3. "Public bucket" seçeneğini işaretleyin
-- 4. Create bucket

-- Storage politikası (SQL Editor'da çalıştırın)
-- Herkes okuyabilir
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Public Read',
  'product-images',
  'SELECT',
  'true'
) ON CONFLICT DO NOTHING;

-- Sadece authenticated kullanıcılar yükleyebilir
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Auth Upload',
  'product-images',
  'INSERT',
  'auth.role() = ''authenticated'''
) ON CONFLICT DO NOTHING;
