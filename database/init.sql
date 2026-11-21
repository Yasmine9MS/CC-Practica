CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS wallets (
    user_id INT PRIMARY KEY REFERENCES users(id),
    balance DECIMAL(12, 2) NOT NULL DEFAULT 10000.00
);

CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    coingecko_id VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS wallet_assets (
    wallet_id INT REFERENCES wallets(user_id),
    asset_id INT REFERENCES assets(id),
    quantity DECIMAL(20, 8) NOT NULL DEFAULT 0,
    average_buy_price DECIMAL(20, 8) NOT NULL DEFAULT 0,

    PRIMARY KEY (wallet_id, asset_id)
);

CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    wallet_id INT NOT NULL REFERENCES wallets(user_id),
    asset_id INT NOT NULL REFERENCES assets(id),
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    total DECIMAL(20, 8) NOT NULL,
    realized_profit_loss DECIMAL(20, 8),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);