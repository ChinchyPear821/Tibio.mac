-- Cree otra tabla "card". La query esta en el archivo showTable.sql
DROP TABLE IF EXISTS soccer_stats;
DROP TABLE IF EXISTS football_stats;
DROP TABLE IF EXISTS basketball_stats;
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
    rol TEXT NOT NULL DEFAULT 'USER',
);

CREATE TABLE events (
    id_event TEXT NOT NULL UNIQUE PRIMARY KEY,
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'EN PROCESO',
    result TEXT,
    begin_date TEXT NOT NULL, 
    end_date TEXT
);

CREATE TABLE event_outcomes (
    id_outcome    TEXT    PRIMARY KEY,
    id_event      TEXT    NOT NULL,
    outcome_name  TEXT    NOT NULL,
    official_odds DECIMAL NOT NULL,
    UNIQUE (id_event, outcome_name),
    FOREIGN KEY (id_event) REFERENCES events(id_event)
);

CREATE TABLE bets (
    id_bet TEXT NOT NULL UNIQUE PRIMARY KEY,
    id_event TEXT,
    id_user TEXT,
    id_outcome TEXT NOT NULL,
    category TEXT,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    extra NUMERIC NOT NULL,  -- 'extra' parece referirse al momio
    status TEXT NOT NULL,
    target TEXT,
    result TEXT,
    begin_date TEXT,
    end_date TEXT,
    FOREIGN KEY (id_event) REFERENCES events(id_event),
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_outcome) REFERENCES events_outcome(id_outcome)
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

CREATE TABLE soccer_stats (
    id_event TEXT PRIMARY KEY,
    home_team TEXT,
    away_team TEXT,
    home_goals INTEGER,
    away_goals INTEGER,
    yellow_cards INTEGER,
    red_cards INTEGER,
    corners INTEGER,
    penalties INTEGER,
    FOREIGN KEY (id_event) REFERENCES events(id_event)
);

CREATE TABLE basketball_stats (
    id_event TEXT PRIMARY KEY,
    home_team TEXT,
    away_team TEXT,
    home_points INTEGER,
    away_points INTEGER,
    three_pointers INTEGER,
    fouls INTEGER,
    rebounds INTEGER,
    FOREIGN KEY (id_event) REFERENCES events(id_event)
);

CREATE TABLE football_stats (
    id_event TEXT PRIMARY KEY,
    home_team TEXT,
    away_team TEXT,
    home_touchdowns INTEGER,
    away_touchdowns INTEGER,
    field_goals INTEGER,
    interceptions INTEGER,
    sacks INTEGER,
    FOREIGN KEY (id_event) REFERENCES events(id_event)
);