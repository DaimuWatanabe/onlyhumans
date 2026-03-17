-- 検索履歴テーブル

CREATE TABLE IF NOT EXISTS search_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query       TEXT NOT NULL CHECK (char_length(query) BETWEEN 1 AND 200),
  result_count INT,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_searched_at ON search_history(searched_at DESC);

-- 1ユーザーあたりの検索履歴を最大100件に保つトリガー
CREATE OR REPLACE FUNCTION limit_search_history()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM search_history
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM search_history
      WHERE user_id = NEW.user_id
      ORDER BY searched_at DESC
      LIMIT 99
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER search_history_limit_trigger
  AFTER INSERT ON search_history
  FOR EACH ROW EXECUTE FUNCTION limit_search_history();
