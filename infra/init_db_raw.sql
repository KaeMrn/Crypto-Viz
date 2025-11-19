-- Creating a table for raw articles
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT,
    published_at TIMESTAMP DEFAULT NOW()
);

-- Notify channel when a new article is inserted
CREATE OR REPLACE FUNCTION notify_new_article() RETURNS trigger AS $$
BEGIN
    PERFORM pg_notify('new_article', NEW.id::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_notify_insert ON articles;

CREATE TRIGGER articles_notify_insert
AFTER INSERT ON articles
FOR EACH ROW
EXECUTE FUNCTION notify_new_article();
