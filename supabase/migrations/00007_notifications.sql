-- 通知テーブル

CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,  -- 受信者
  actor_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,           -- 送信者
  type            notification_type NOT NULL,
  -- 関連リソース（通知種別によってどれかが入る）
  image_id        UUID REFERENCES images(id) ON DELETE CASCADE,
  comment_id      UUID REFERENCES comments(id) ON DELETE CASCADE,
  board_id        UUID REFERENCES boards(id) ON DELETE CASCADE,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
