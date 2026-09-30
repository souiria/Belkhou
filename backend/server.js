const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const fs = require('fs'); // Native Node module for file handling
const { exec } = require('child_process'); // Native Node module to run system scripts

const app = report = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Serve the compiled React frontend files (CRITICAL FOR PORTABLE VERSION)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to Database
const db = new sqlite3.Database('./database/maintenance.db', (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to SQLite database.');
});

// --- DATABASE INITIALIZATION ---
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT, project TEXT NOT NULL, line TEXT NOT NULL,
        station TEXT NOT NULL, problem TEXT NOT NULL, problem_date DATE NOT NULL,
        action TEXT, responsible TEXT, team_leader TEXT, due_date DATE,
        actual_closure_date DATE, status TEXT DEFAULT '0%', sers_num TEXT, comments TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dropdown_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, value TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
        role TEXT CHECK( role IN ('Maintenance', 'Admin') ) NOT NULL
    )`, () => {
        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (row && row.count === 0) {
                db.run("INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'Admin')");
                console.log("Default Admin created -> Username: admin | Password: admin123");
            }
        });
    });

    db.run(`CREATE TABLE IF NOT EXISTS system_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`, () => {
        db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('email_day', '5')`);
        db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('email_time', '16:00')`);
        setTimeout(setupAutomatedEmail, 1000); 
    });

    db.run(`CREATE TABLE IF NOT EXISTS email_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, sent_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
        status TEXT, details TEXT, type TEXT
    )`);
});

// ==========================================
// --- POWERSHELL OUTLOOK EXECUTION LOGIC ---
// ==========================================
async function generateAndSendEmail(triggerType = 'Automated') {
    return new Promise((resolve, reject) => {
        db.all("SELECT value FROM dropdown_lists WHERE category = 'Email'", [], async (err, emailRows) => {
            if (err) return resolve({ success: false, msg: "Database error" });
            const emailList = emailRows.map(row => row.value).join('; ');

            if (!emailList) {
                db.run("INSERT INTO email_logs (status, details, type) VALUES (?, ?, ?)", ['Failed', 'No email addresses configured.', triggerType]);
                return resolve({ success: false, msg: "No email addresses configured." });
            }

            db.all("SELECT * FROM issues WHERE status != '100%'", [], async (err, issues) => {
                if (err) return resolve({ success: false, msg: "Database error" });
                
                if (issues.length === 0) {
                    db.run("INSERT INTO email_logs (status, details, type) VALUES (?, ?, ?)", ['Skipped', 'No open issues to send.', triggerType]);
                    return resolve({ success: true, msg: "No open issues found. Email not sent." });
                }

                let tableHtml = `<table border='1' cellpadding='5' cellspacing='0' style='border-collapse:collapse; font-family: Arial, sans-serif; font-size: 12px; width: 100%; text-align: left;'>
                    <tr style='background-color: #f2f2f2;'>
                        <th>ID</th><th>Project</th><th>Line</th><th>Station</th><th>Problem</th>
                        <th>Problem Date</th><th>Action</th><th>Responsible</th><th>Team Leader</th>
                        <th>Due Date</th><th>Status</th><th>SERS Num</th>
                    </tr>`;

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                issues.forEach(issue => {
                    let bgColor = '#FFFFFF';
                    let textColor = 'black';

                    if (issue.due_date) {
                        const dueDate = new Date(issue.due_date);
                        dueDate.setHours(0, 0, 0, 0);
                        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                        if (diffDays > 0 && diffDays < 4) bgColor = '#FFA500'; 
                        else if (diffDays <= 0) { bgColor = '#FF0000'; textColor = 'white'; } 
                    }

                    tableHtml += `<tr style="background-color: ${bgColor}; color: ${textColor};">
                        <td>${issue.id}</td><td>${issue.project}</td><td>${issue.line}</td>
                        <td>${issue.station}</td><td>${issue.problem}</td><td>${issue.problem_date}</td>
                        <td>${issue.action || ''}</td><td>${issue.responsible || ''}</td><td>${issue.team_leader || ''}</td>
                        <td>${issue.due_date || ''}</td><td>${issue.status}</td><td>${issue.sers_num || ''}</td>
                    </tr>`;
                });

                tableHtml += "</table>";

                // Build full safe HTML template body
                const totalHtmlBody = `<p style="font-family: Arial, sans-serif;">Hello,</p>
                <p style="font-family: Arial, sans-serif;">Please find below the list of all currently open maintenance issues (Urgent issues are highlighted in Red/Orange):</p>
                ${tableHtml}
                <br><p style="font-family: Arial, sans-serif;">Regards,<br>Issue Tracker</p>`;

                // Create a temporary native PowerShell script file
                // Using PowerShell here-strings @' ... '@ handles HTML tags flawlessly without string character escaping conflicts
                const psScriptContent = `
$Outlook = New-Object -ComObject Outlook.Application
$Mail = $Outlook.CreateItem(0)
$Mail.To = "${emailList}"
$Mail.Subject = "Summary of All Open Maintenance Issues (${triggerType})"
$Mail.HTMLBody = @'
${totalHtmlBody}
'@
$Mail.Send()
`;

                const tempScriptPath = path.join(__dirname, 'send_email_temp.ps1');
                
                try {
                    fs.writeFileSync(tempScriptPath, psScriptContent, 'utf-8');

                    // Run the native Windows execution command bypass sequence
                    exec(`powershell -ExecutionPolicy Bypass -File "${tempScriptPath}"`, (psError, stdout, stderr) => {
                        // Delete the temporary file immediately after completion
                        if (fs.existsSync(tempScriptPath)) fs.unlinkSync(tempScriptPath);

                        if (psError) {
                            console.error("PowerShell Engine Error: ", stderr);
                            db.run("INSERT INTO email_logs (status, details, type) VALUES (?, ?, ?)", ['Failed', stderr || 'PowerShell execution failed', triggerType]);
                            return resolve({ success: false, msg: "PowerShell engine rejected mail generation call." });
                        }

                        db.run("INSERT INTO email_logs (status, details, type) VALUES (?, ?, ?)", ['Success', `Sent ${issues.length} issues via native Outlook instance.`, triggerType]);
                        resolve({ success: true, msg: "Report sent successfully via local Outlook app!" });
                    });

                } catch (writeErr) {
                    if (fs.existsSync(tempScriptPath)) fs.unlinkSync(tempScriptPath);
                    resolve({ success: false, msg: "Failed creating internal runtime configuration files." });
                }
            });
        });
    });
}

// --- BACKGROUND SCHEDULER ---
let activeCronJob = null;

function setupAutomatedEmail() {
    db.all("SELECT * FROM system_settings WHERE key IN ('email_day', 'email_time')", [], (err, rows) => {
        if (err || rows.length < 2) return;
        
        let day = rows.find(r => r.key === 'email_day').value;
        let time = rows.find(r => r.key === 'email_time').value;
        let [hour, minute] = time.split(':');

        if (activeCronJob) activeCronJob.stop();

        let cronString = `${minute} ${hour} * * ${day}`;
        console.log(`⏰ Automated Email Scheduled: Runs on Day ${day} at ${time} (${cronString})`);

        activeCronJob = cron.schedule(cronString, async () => {
            console.log("⏳ Triggering automated weekly email...");
            await generateAndSendEmail('Automated');
        });
    });
}

// ==========================================
// --- AUTOMATION ROUTES ---
// ==========================================
app.get('/api/automation', (req, res) => {
    db.all("SELECT * FROM system_settings WHERE key IN ('email_day', 'email_time')", [], (err, settings) => {
        db.all("SELECT * FROM email_logs ORDER BY id DESC LIMIT 10", [], (err, logs) => {
            res.json({ settings, logs });
        });
    });
});

app.post('/api/automation', (req, res) => {
    const { email_day, email_time } = req.body;
    db.run("UPDATE system_settings SET value = ? WHERE key = 'email_day'", [email_day]);
    db.run("UPDATE system_settings SET value = ? WHERE key = 'email_time'", [email_time], () => {
        setupAutomatedEmail();
        res.json({ message: "Schedule updated securely." });
    });
});

app.post('/api/send-report', async (req, res) => {
    const result = await generateAndSendEmail('Manual');
    if (result.success) res.json({ message: result.msg });
    else res.status(500).json({ error: result.msg });
});

// ==========================================
// --- USER & AUTHENTICATION ROUTES ---
// ==========================================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT id, username, role FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid username or password" });
        res.json(row);
    });
});

app.get('/api/users', (req, res) => {
    db.all("SELECT id, username, role FROM users", [], (err, rows) => res.json(rows));
});

app.post('/api/users', (req, res) => {
    const { username, password, role } = req.body;
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, password, role], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: "Username already exists." });
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: "User created successfully!" });
    });
});

app.put('/api/users/:id', (req, res) => {
    const { username, password, role } = req.body;
    if (password) {
        db.run("UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?", [username, password, role, req.params.id], () => res.json({ message: "Success!" }));
    } else {
        db.run("UPDATE users SET username = ?, role = ? WHERE id = ?", [username, role, req.params.id], () => res.json({ message: "Success!" }));
    }
});

// ==========================================
// --- DASHBOARD & DROPDOWN ROUTES ---
// ==========================================
app.get('/api/stats', (req, res) => {
    db.all("SELECT status as name, COUNT(*) as value FROM issues GROUP BY status", [], (err, rows) => res.json(rows));
});

app.get('/api/dropdowns', (req, res) => {
    db.all("SELECT * FROM dropdown_lists", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/dropdowns', (req, res) => {
    db.run("INSERT INTO dropdown_lists (category, value) VALUES (?, ?)", [req.body.category, req.body.value], function() { res.json({ id: this.lastID, message: "Success!" }); });
});

app.delete('/api/dropdowns/:id', (req, res) => {
    db.run("DELETE FROM dropdown_lists WHERE id = ?", [req.params.id], () => res.json({ message: "Success!" }));
});

// ==========================================
// --- ISSUES TRACKER ROUTES ---
// ==========================================
app.get('/api/issues', (req, res) => {
    db.all("SELECT * FROM issues ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/issues', (req, res) => {
    const { project, line, station, problem, problem_date } = req.body;
    const query = `INSERT INTO issues (project, line, station, problem, problem_date) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [project, line, station, problem, problem_date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Issue logged successfully!" });
    });
});

app.put('/api/issues/:id', (req, res) => {
    const { action, responsible, team_leader, due_date, actual_closure_date, status, sers_num, comments } = req.body;
    const query = `UPDATE issues SET action = ?, responsible = ?, team_leader = ?, due_date = ?, actual_closure_date = ?, status = ?, sers_num = ?, comments = ? WHERE id = ?`;
    db.run(query, [action, responsible, team_leader, due_date, actual_closure_date, status, sers_num, comments, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Issue updated successfully!" });
    });
});

// ==========================================
// --- PORTABILITY CATCH-ALL ROUTE ---
// ==========================================
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});