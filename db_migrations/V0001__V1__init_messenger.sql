
CREATE TABLE IF NOT EXISTS t_p98925745_news_media_share_app.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p98925745_news_media_share_app.sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id INTEGER REFERENCES t_p98925745_news_media_share_app.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS t_p98925745_news_media_share_app.conversations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p98925745_news_media_share_app.conversation_members (
  conversation_id INTEGER REFERENCES t_p98925745_news_media_share_app.conversations(id),
  user_id INTEGER REFERENCES t_p98925745_news_media_share_app.users(id),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS t_p98925745_news_media_share_app.messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES t_p98925745_news_media_share_app.conversations(id),
  sender_id INTEGER REFERENCES t_p98925745_news_media_share_app.users(id),
  text TEXT,
  media_url TEXT,
  media_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p98925745_news_media_share_app.channel_posts (
  id SERIAL PRIMARY KEY,
  author_id INTEGER REFERENCES t_p98925745_news_media_share_app.users(id),
  title VARCHAR(255),
  text TEXT,
  media_url TEXT,
  media_type VARCHAR(20),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON t_p98925745_news_media_share_app.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON t_p98925745_news_media_share_app.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_posts_created ON t_p98925745_news_media_share_app.channel_posts(created_at DESC);
