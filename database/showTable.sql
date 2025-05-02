-- SELECT * FROM bets;

-- ALTER TABLE users ADD COLUMN rol TEXT NOT NULL DEFAULT 'USER';

-- UPDATE users SET rol = 'ADMIN' WHERE username = 'Gilberto Avalos';

-- DELETE FROM events WHERE id_event = '9779de6e-dd3e-4aa9-8927-5dcc5b664aee';

-- SELECT * FROM events WHERE id_event = '9b3d8cce-0075-4a46-8415-f48d4ea11e63';

-- ALTER TABLE events ADD COLUMN status TEXT NOT NULL DEFAULT 'EN PROCESO';

DROP TABLE IF EXISTS cards;

CREATE TABLE cards(
    id_card TEXT NOT NULL UNIQUE PRIMARY KEY, 
    id_user TEXT NOT NULL,
    name TEXT NOT NULL,
    number INTEGER NOT NULL,
    expiration TEXT NOT NULL,
    cvv INTEGER NOT NULL,
    bank TEXT NOT NULL,
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);