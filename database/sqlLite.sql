-- Como la tabla betHistory tiene una primary Key compuesta
-- automaticamente ya refrencia a esas tablas
-- Si quieres consultar el bet_history de un usuario: SELECT * FROM betHistory WHER id_user = "";
DROP TABLE IF EXISTS betHistory;
DROP TABLE IF EXISTS bets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS betOneToOne;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS events;

CREATE TABLE users (
    id_user TEXT NOT NULL UNIQUE PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    balance REAL NOT NULL DEFAULT 0,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
);

CREATE TABLE events (
    id_event TEXT NOT NULL UNIQUE PRIMARY KEY,
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    extra NUMERIC,
    status TEXT NOT NULL,
    result TEXT,
    begin_date TEXT NOT NULL,
    end_date TEXT
);

CREATE TABLE bets (
    id_bet TEXT NOT NULL UNIQUE PRIMARY KEY,
    id_user TEXT,
    id_event TEXT,
    category TEXT,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    extra NUMERIC NOT NULL,  -- 'extra' parece referirse al momio
    status TEXT NOT NULL,
    result TEXT,
    begin_date TEXT,
    end_date TEXT,
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_event) REFERENCES events(id_event)
);

CREATE TABLE transactions (
    id_transaction TEXT NOT NULL PRIMARY KEY,
    id_user TEXT,
    amount REAL NOT NULL,
    card TEXT NOT NULL,  -- Cambiado a TEXT para evitar problemas con números largos
    bank TEXT NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    hour TEXT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);

