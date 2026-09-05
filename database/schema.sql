-- Cloudflare D1 Database Schema
-- Single lecture visitor tracking (anonymous sessions only)

CREATE TABLE IF NOT EXISTS lecture_visits (
    session_id TEXT PRIMARY KEY,
    lecture_id TEXT NOT NULL,
    first_seen INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient visitor count queries
CREATE INDEX IF NOT EXISTS idx_lecture_visits_lecture_id ON lecture_visits(lecture_id);

-- Optional: View for visitor statistics (read-only)
CREATE VIEW IF NOT EXISTS visitor_stats AS
SELECT
    lecture_id,
    COUNT(*) as total_visitors,
    MIN(first_seen) as earliest_visit,
    MAX(first_seen) as latest_visit
FROM lecture_visits
GROUP BY lecture_id;
