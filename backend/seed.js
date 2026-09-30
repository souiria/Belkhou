const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/maintenance.db');

db.serialize(() => {
    // 1. CRITICAL: Make sure the table actually exists first!
    db.run(`CREATE TABLE IF NOT EXISTS dropdown_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        value TEXT NOT NULL
    )`);

    // 2. Clear old data for a clean test
    db.run("DELETE FROM dropdown_lists");

    const stmt = db.prepare("INSERT INTO dropdown_lists (category, value) VALUES (?, ?)");

    // Projects from your list
    const projects = ['CP4X', 'P2QO', 'C84E', 'D3P2', 'OV64', 'D85', 'D34'];
    projects.forEach(p => stmt.run('Project', p));

    // Lines from your list
    const lines = ['L F DOOR P24', 'R F DOOR P24', 'REAR DOOR1 P24', 'VOLET P24', 'PAVILLON P24'];
    lines.forEach(l => stmt.run('Line', l));

    // Stations from your list
    const stations = ['TEST CLIP', 'TEST ELECTRIQUE', 'TEST VISION', 'TORQUE MACHINE', 'LAD', 'CARROUSEL', 'TABLE ASSEMBLAGE'];
    stations.forEach(s => stmt.run('Station', s));

    // Emails from your list
    const emails = ['Mohammed.Belkhou@sews-e.com', 'abderrahim.souirite@sews-e.com'];
    emails.forEach(e => stmt.run('Email', e));

    stmt.finalize();
    console.log("Database structure created and seeded successfully with your Excel lists!");
});
db.close();