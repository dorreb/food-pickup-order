DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  id SERIAL PRIMARY KEY NOT NULL,
  created_at TIMESTAMP NOT NULL,
  preparation_time INTEGER,
  isComplete BOOLEAN DEFAULT FALSE,
  ready_at TIMESTAMP,
  isCancelled BOOLEAN DEFAULT FALSE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE
);
