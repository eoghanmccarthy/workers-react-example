-- D1 Database Schema for Media Feed
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'image', 'video', 'audio'
  title TEXT,
  description TEXT,
  tags TEXT, -- JSON array as text
  media_url TEXT NOT NULL, -- R2 URL
  thumbnail_url TEXT, -- for videos/audio
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER, -- for images/videos
  height INTEGER -- for images/videos
);

-- Index for efficient feed queries (order by created_at DESC)
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Index for filtering by type
CREATE INDEX idx_posts_type ON posts(type);

-- Index for search by tags (if needed later)
CREATE INDEX idx_posts_tags ON posts(tags);