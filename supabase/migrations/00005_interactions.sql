-- インタラクション系テーブル
-- comments / reactions / shares / view_history

-- コメントテーブル
CREATE TABLE IF NOT EXISTS comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id    UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE, -- 返信コメント用
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  like_count  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_image_id ON comments(image_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- コメント数を images.comment_count に反映するトリガー
CREATE OR REPLACE FUNCTION update_image_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE images SET comment_count = comment_count + 1 WHERE id = NEW.image_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE images SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.image_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_image_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_image_comment_count();

-- リアクションテーブル（1ユーザー1画像につき1種類）
CREATE TABLE IF NOT EXISTS reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id    UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        reaction_type NOT NULL DEFAULT 'like',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(image_id, user_id)  -- 1ユーザー1画像につき1リアクション
);

CREATE INDEX idx_reactions_image_id ON reactions(image_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);

-- リアクション数を images.like_count に反映するトリガー
CREATE OR REPLACE FUNCTION update_image_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE images SET like_count = like_count + 1 WHERE id = NEW.image_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE images SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.image_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reactions_like_count_trigger
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION update_image_like_count();

-- 閲覧履歴テーブル
CREATE TABLE IF NOT EXISTS view_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id    UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- 未ログインは NULL
  viewer_ip   TEXT,           -- 未ログインユーザーの追跡用（任意）
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_view_history_image_id ON view_history(image_id);
CREATE INDEX idx_view_history_user_id ON view_history(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_view_history_viewed_at ON view_history(viewed_at DESC);
