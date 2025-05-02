SELECT * FROM bets;

ALTER TABLE users ADD COLUMN rol TEXT NOT NULL DEFAULT 'USER';

UPDATE users SET rol = 'ADMIN' WHERE username = 'Gilberto Avalos';

DELETE FROM events WHERE id_event = '9779de6e-dd3e-4aa9-8927-5dcc5b664aee';

SELECT * FROM events WHERE id_event = '94dbf8d1-96ff-4974-a0ab-43ce6eb2e53d';

ALTER TABLE events ADD COLUMN status TEXT NOT NULL DEFAULT 'EN PROCESO';

SELECT * FROM events
