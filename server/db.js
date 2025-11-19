const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'desiticket.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const initDb = () => {
    db.serialize(() => {
        // Tickets Table
        db.run(`CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      requester_name TEXT NOT NULL,
      requester_wa TEXT NOT NULL,
      status TEXT DEFAULT 'Pending', -- Pending, In Progress, Review, Done
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        // Ticket Actions (Audit Log)
        db.run(`CREATE TABLE IF NOT EXISTS ticket_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER,
      action_type TEXT NOT NULL, -- CREATE, REVISION_REQ, EXTENSION_REQ, STATUS_CHANGE, APPROVE
      payload TEXT, -- JSON string for details (e.g., revision notes)
      created_by TEXT DEFAULT 'System',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(ticket_id) REFERENCES tickets(id)
    )`);
    });
};

module.exports = { db, initDb };
