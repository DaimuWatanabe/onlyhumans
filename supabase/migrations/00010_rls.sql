-- Row Level Security (RLS) ポリシー
-- 「誰が何を見られるか・操作できるか」の権限設定

-- ===== profiles =====
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが公開プロフィールを閲覧可能
CREATE POLICY "profiles: 誰でも閲覧可能"
  ON profiles FOR SELECT USING (true);

-- 自分自身のプロフィールのみ更新可能
CREATE POLICY "profiles: 本人のみ更新可能"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ===== images =====
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- 公開画像は誰でも閲覧可能。非公開は本人のみ
CREATE POLICY "images: 公開画像は全員閲覧可能"
  ON images FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- ログイン済みユーザーのみ投稿可能（自分のidが必要）
CREATE POLICY "images: ログイン済みなら投稿可能"
  ON images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 自分の画像のみ更新・削除可能
CREATE POLICY "images: 本人のみ更新可能"
  ON images FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "images: 本人のみ削除可能"
  ON images FOR DELETE USING (auth.uid() = user_id);

-- ===== boards =====
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- 公開ボードは誰でも閲覧可能。非公開は本人のみ
CREATE POLICY "boards: 公開ボードは全員閲覧可能"
  ON boards FOR SELECT
  USING (is_private = false OR auth.uid() = user_id);

CREATE POLICY "boards: ログイン済みなら作成可能"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "boards: 本人のみ更新・削除可能"
  ON boards FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "boards: 本人のみ削除可能"
  ON boards FOR DELETE USING (auth.uid() = user_id);

-- ===== board_images =====
ALTER TABLE board_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_images: ボードが見えれば閲覧可能"
  ON board_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_images.board_id
        AND (boards.is_private = false OR boards.user_id = auth.uid())
    )
  );

CREATE POLICY "board_images: ボード所有者のみ追加可能"
  ON board_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_images.board_id
        AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "board_images: ボード所有者のみ削除可能"
  ON board_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = board_images.board_id
        AND boards.user_id = auth.uid()
    )
  );

-- ===== comments =====
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 公開画像のコメントは誰でも閲覧可能
CREATE POLICY "comments: 公開画像なら全員閲覧可能"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM images
      WHERE images.id = comments.image_id
        AND (images.is_public = true OR images.user_id = auth.uid())
    )
  );

CREATE POLICY "comments: ログイン済みなら投稿可能"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 本人または画像オーナーが削除可能
CREATE POLICY "comments: 本人または画像オーナーが削除可能"
  ON comments FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM images
      WHERE images.id = comments.image_id
        AND images.user_id = auth.uid()
    )
  );

-- ===== reactions =====
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reactions: 公開画像なら全員閲覧可能"
  ON reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM images
      WHERE images.id = reactions.image_id
        AND (images.is_public = true OR images.user_id = auth.uid())
    )
  );

CREATE POLICY "reactions: ログイン済みなら追加可能"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions: 本人のみ削除可能"
  ON reactions FOR DELETE USING (auth.uid() = user_id);

-- ===== follows =====
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows: 誰でも閲覧可能"
  ON follows FOR SELECT USING (true);

CREATE POLICY "follows: ログイン済みならフォロー可能"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows: 本人のみアンフォロー可能"
  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- ===== notifications =====
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 通知は受信者本人のみ閲覧可能
CREATE POLICY "notifications: 本人のみ閲覧可能"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications: 本人のみ更新可能（既読処理）"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ===== tags =====
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags: 誰でも閲覧可能"
  ON tags FOR SELECT USING (true);

-- ===== image_tags =====
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "image_tags: 誰でも閲覧可能"
  ON image_tags FOR SELECT USING (true);

CREATE POLICY "image_tags: 画像オーナーのみ追加・削除可能"
  ON image_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM images WHERE images.id = image_tags.image_id
        AND images.user_id = auth.uid()
    )
  );

CREATE POLICY "image_tags: 画像オーナーのみ削除可能"
  ON image_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM images WHERE images.id = image_tags.image_id
        AND images.user_id = auth.uid()
    )
  );

-- ===== search_history =====
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_history: 本人のみ閲覧・操作可能"
  ON search_history FOR ALL USING (auth.uid() = user_id);

-- ===== view_history =====
ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;

-- 画像オーナーは自分の画像の閲覧履歴を見られる
CREATE POLICY "view_history: 画像オーナーのみ閲覧可能"
  ON view_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM images
      WHERE images.id = view_history.image_id
        AND images.user_id = auth.uid()
    )
  );

-- ログイン済みユーザーは閲覧記録を追加できる（自分のuser_idか NULL）
CREATE POLICY "view_history: 追加は誰でも可能"
  ON view_history FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
