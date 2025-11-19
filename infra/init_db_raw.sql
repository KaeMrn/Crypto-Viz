--creating a table for new articles

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT,
    published_at TIMESTAMP DEFAULT NOW()
);

