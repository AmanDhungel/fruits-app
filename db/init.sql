CREATE TABLE IF NOT EXISTS fruits (
  id   serial PRIMARY KEY,
  name text NOT NULL
);

INSERT INTO fruits (name) VALUES ('apple'), ('mango'), ('banana');