-- Settings tablosu (Logo ve diğer ayarlar için)
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- RLS etkinleştir
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Settings herkes okuyabilir" ON settings
  FOR SELECT USING (true);

-- Sadece authenticated kullanıcılar yazabilir
CREATE POLICY "Settings sadece admin ekleyebilir" ON settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Settings sadece admin güncelleyebilir" ON settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- İlk satırı oluştur
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
