CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  club_name TEXT NOT NULL,
  event_date TEXT NOT NULL,
  timing TEXT NOT NULL,
  venue TEXT NOT NULL,
  cost REAL NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  prizes TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason TEXT NOT NULL DEFAULT '',
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_moderation_status ON events(moderation_status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
