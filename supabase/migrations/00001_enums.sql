-- 列挙型（Enum）の定義
-- c2pa_status: C2PA検証ステータス
-- reaction_type: リアクション種別
-- notification_type: 通知種別

CREATE TYPE c2pa_status AS ENUM (
  'pending',
  'verified_human',
  'no_data',
  'rejected_ai'
);

CREATE TYPE reaction_type AS ENUM (
  'like',
  'love',
  'fire',
  'wow'
);

CREATE TYPE notification_type AS ENUM (
  'like',
  'comment',
  'follow',
  'mention',
  'board_add'
);
