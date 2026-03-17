-- boardsテーブル（コレクション/ボード機能）
-- board_imagesテーブルで画像との多対多を管理する

CREATE TABLE IF NOT EXISTS boards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  cover_image_url TEXT,
  is_private      BOOLEAN NOT NULL DEFAULT false,
  image_count     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_boards_user_id ON boards(user_id);

CREATE TRIGGER boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ボードと画像の中間テーブル
CREATE TABLE IF NOT EXISTS board_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  image_id    UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(board_id, image_id)
);

CREATE INDEX idx_board_images_board_id ON board_images(board_id);
CREATE INDEX idx_board_images_image_id ON board_images(image_id);

-- ボードに画像が追加/削除されたときに image_count を更新するトリガー
CREATE OR REPLACE FUNCTION update_board_image_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE boards SET image_count = image_count + 1 WHERE id = NEW.board_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE boards SET image_count = image_count - 1 WHERE id = OLD.board_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER board_images_count_trigger
  AFTER INSERT OR DELETE ON board_images
  FOR EACH ROW EXECUTE FUNCTION update_board_image_count();
