-- SELECT * FROM bets;

-- ALTER TABLE users ADD COLUMN rol TEXT NOT NULL DEFAULT 'USER';

-- UPDATE users SET rol = 'ADMIN' WHERE username = 'Gilberto Avalos';

-- DELETE FROM events WHERE id_event = '9779de6e-dd3e-4aa9-8927-5dcc5b664aee';

<<<<<<< HEAD
SELECT * FROM events WHERE id_event = '94dbf8d1-96ff-4974-a0ab-43ce6eb2e53d';

ALTER TABLE events ADD COLUMN status TEXT NOT NULL DEFAULT 'EN PROCESO';

SELECT * FROM events
=======
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
>>>>>>> 9087f9ccb8b140d2487b044ca7dfb6b00aa924bd
