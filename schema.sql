DROP TABLE IF EXISTS pdf_records;
CREATE TABLE pdf_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_nickname_phone ON pdf_records(nickname, phone_number);
