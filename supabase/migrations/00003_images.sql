-- imagesテーブル（pinsの後継・Supabase管理版）
-- C2PA詳細フィールドを強化し、Prisma pinsテーブルとの二重管理を許容する
-- legacy_pin_id でPrisma側のpinsレコードと紐付ける

CREATE TABLE IF NOT EXISTS images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  legacy_pin_id   TEXT,          -- Prisma pins.id との対応（任意）
  title           TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT NOT NULL,
  storage_path    TEXT,          -- Supabase Storage のパス
  width           INT,
  height          INT,
  file_size       INT,           -- バイト単位
  mime_type       TEXT,
  c2pa_status     c2pa_status NOT NULL DEFAULT 'pending',
  -- C2PA詳細データ
  manifest_json   JSONB,
  signer_info     JSONB,
  device_info     JSONB,
  software_info   JSONB,
  is_ai_flagged   BOOLEAN NOT NULL DEFAULT false,
  -- 統計
  view_count      INT NOT NULL DEFAULT 0,
  like_count      INT NOT NULL DEFAULT 0,
  comment_count   INT NOT NULL DEFAULT 0,
  save_count      INT NOT NULL DEFAULT 0,
  -- 公開設定
  is_public       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_c2pa_status ON images(c2pa_status);
CREATE INDEX idx_images_created_at ON images(created_at DESC);
CREATE INDEX idx_images_legacy_pin_id ON images(legacy_pin_id) WHERE legacy_pin_id IS NOT NULL;

CREATE TRIGGER images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
