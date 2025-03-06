CREATE TABLE users (
    id_user TEXT NOT NULL UNIQUE PRIMARY KEY,
    username TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    id_betHistory TEXT, 
    FOREIGN KEY(id_betHistory) REFERENCES betHistory(id_betHistory)
);

CREATE TABLE events (
    id_event TEXT NOT NULL UNIQUE PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    sport TEXT NOT NULL,
    date TEXT NOT NULL,
    hour TEXT NOT NULL
);

CREATE TABLE bets (
    id_bet TEXT NOT NULL UNIQUE PRIMARY KEY,
    id_user TEXT,
    id_event TEXT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    extra REAL NOT NULL,  -- 'extra' parece referirse al momio
    status TEXT NOT NULL,
    result TEXT,
    date TEXT NOT NULL,
    hour TEXT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_event) REFERENCES events(id_event)
);

CREATE TABLE betOneToOne (
    id_bet TEXT NOT NULL UNIQUE PRIMARY KEY,
    id_userEmitter TEXT,
    id_userReceiver TEXT,
    id_event TEXT,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    extra REAL NOT NULL,  
    status TEXT NOT NULL,
    result TEXT,
    date TEXT NOT NULL,
    hour TEXT NOT NULL,
    FOREIGN KEY (id_userEmitter) REFERENCES users(id_user),
    FOREIGN KEY (id_userReceiver) REFERENCES users(id_user),
    FOREIGN KEY (result) REFERENCES users(id_user),
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

CREATE TABLE betHistory (
    id_user TEXT NOT NULL,
    id_bet TEXT NOT NULL,
    PRIMARY KEY (id_user, id_bet),
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_bet) REFERENCES bets(id_bet)
);
