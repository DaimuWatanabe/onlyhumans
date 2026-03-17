-- タグテーブルと画像タグの中間テーブル

CREATE TABLE IF NOT EXISTS tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  image_count INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_image_count ON tags(image_count DESC);

-- 画像とタグの中間テーブル
CREATE TABLE IF NOT EXISTS image_tags (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id  UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  tag_id    UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(image_id, tag_id)
);

CREATE INDEX idx_image_tags_image_id ON image_tags(image_id);
CREATE INDEX idx_image_tags_tag_id ON image_tags(tag_id);

-- タグの image_count を更新するトリガー
CREATE OR REPLACE FUNCTION update_tag_image_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET image_count = image_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET image_count = GREATEST(image_count - 1, 0) WHERE id = OLD.tag_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER image_tags_count_trigger
  AFTER INSERT OR DELETE ON image_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_image_count();
