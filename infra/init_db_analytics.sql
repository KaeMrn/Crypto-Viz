-- creating a table for metrics (counts per coin per timestamp)
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    coin VARCHAR(50) NOT NULL,
    mentions INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);
