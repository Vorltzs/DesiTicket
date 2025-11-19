const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { initDb, db } = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Initialization
initDb();

// Email Transporter (Mock for now, or use Ethereal for testing)
// In production, replace with real SMTP credentials
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ethereal.user@ethereal.email', // Placeholder
        pass: 'ethereal.pass' // Placeholder
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        // console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, Body: ${text}`);
        // In a real app, uncomment below:
        // await transporter.sendMail({ from: '"DesiTicket System" <system@desiticket.com>', to, subject, text });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Routes
app.get('/', (req, res) => {
    res.send('DesiTicket API is running');
});

// GET All Tickets
app.get('/api/tickets', (req, res) => {
    const sql = `SELECT * FROM tickets ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

// POST Create Ticket
app.post('/api/tickets', (req, res) => {
    const { title, description, requester_name, requester_wa } = req.body;
    const sql = `INSERT INTO tickets (title, description, requester_name, requester_wa) VALUES (?, ?, ?, ?)`;

    db.run(sql, [title, description, requester_name, requester_wa], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const ticketId = this.lastID;

        // Log Action
        const actionSql = `INSERT INTO ticket_actions (ticket_id, action_type, payload) VALUES (?, ?, ?)`;
        db.run(actionSql, [ticketId, 'CREATE', JSON.stringify({ title })]);

        // Send Email (Mock)
        sendEmail('design-team@company.com', `New Ticket: ${title}`, `New request from ${requester_name}. Check dashboard.`);

        res.json({ id: ticketId, message: 'Ticket created successfully' });
    });
});

// POST Ticket Action (The Core Logic)
app.post('/api/tickets/:id/action', (req, res) => {
    const { id } = req.params;
    const { action_type, payload } = req.body; // payload is an object

    let newStatus = null;

    // Determine Status Change based on Action
    switch (action_type) {
        case 'START_WORK':
            newStatus = 'In Progress';
            break;
        case 'REQUEST_REVIEW':
            newStatus = 'Review Required';
            break;
        case 'REQUEST_REVISION':
            newStatus = 'Revision Needed';
            break;
        case 'APPROVE':
            newStatus = 'Done';
            break;
        case 'REQUEST_EXTENSION':
            newStatus = 'Extension Requested';
            break;
        // 'COMMENT' does not change status
    }

    const timestamp = new Date().toISOString();

    // 1. Log the Action
    const logSql = `INSERT INTO ticket_actions (ticket_id, action_type, payload, created_at) VALUES (?, ?, ?, ?)`;
    db.run(logSql, [id, action_type, JSON.stringify(payload), timestamp], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // 2. Update Ticket Status (if applicable)
        if (newStatus) {
            const updateSql = `UPDATE tickets SET status = ? WHERE id = ?`;
            db.run(updateSql, [newStatus, id], (err) => {
                if (err) return res.status(500).json({ error: err.message });

                // Send Email Notification
                sendEmail('requester@example.com', `Ticket Update: ${newStatus}`, `Your ticket status is now ${newStatus}.`);

                res.json({ message: 'Action recorded and status updated', newStatus });
            });
        } else {
            res.json({ message: 'Action recorded' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
