const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database setup
const db = new sqlite3.Database('./backend/data/stories.db');

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT,
        language TEXT,
        category TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS proverbs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proverb TEXT NOT NULL,
        meaning TEXT,
        language TEXT,
        region TEXT,
        contributor TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Routes
// Get all stories
app.get('/api/stories', (req, res) => {
    const { language, category } = req.query;
    let query = 'SELECT * FROM stories';
    let params = [];
    
    if (language || category) {
        query += ' WHERE';
        if (language) {
            query += ' language = ?';
            params.push(language);
        }
        if (language && category) query += ' AND';
        if (category) {
            query += ' category = ?';
            params.push(category);
        }
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new story
app.post('/api/stories', (req, res) => {
    const { title, content, author, language, category, tags } = req.body;
    
    if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
    }

    const stmt = db.prepare(`INSERT INTO stories (title, content, author, language, category, tags) 
                            VALUES (?, ?, ?, ?, ?, ?)`);
    
    stmt.run(title, content, author || 'Anonymous', language || 'English', category || 'General', tags || '');
    stmt.finalize();
    
    res.json({ message: 'Story added successfully' });
});

// Get all proverbs
app.get('/api/proverbs', (req, res) => {
    const { language, region } = req.query;
    let query = 'SELECT * FROM proverbs';
    let params = [];
    
    if (language || region) {
        query += ' WHERE';
        if (language) {
            query += ' language = ?';
            params.push(language);
        }
        if (language && region) query += ' AND';
        if (region) {
            query += ' region = ?';
            params.push(region);
        }
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new proverb
app.post('/api/proverbs', (req, res) => {
    const { proverb, meaning, language, region, contributor } = req.body;
    
    if (!proverb) {
        res.status(400).json({ error: 'Proverb text is required' });
        return;
    }

    const stmt = db.prepare(`INSERT INTO proverbs (proverb, meaning, language, region, contributor) 
                            VALUES (?, ?, ?, ?, ?)`);
    
    stmt.run(proverb, meaning || '', language || 'English', region || 'Unknown', contributor || 'Anonymous');
    stmt.finalize();
    
    res.json({ message: 'Proverb added successfully' });
});

// Get languages list
app.get('/api/languages', (req, res) => {
    db.all(`SELECT DISTINCT language FROM stories UNION SELECT DISTINCT language FROM proverbs`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        const dbLanguages = rows.map(row => row.language).filter(lang => lang && lang.trim() !== '');
        
        // Default languages for Indian stories and proverbs
        const defaultLanguages = [
            'Hindi',
            'English',
            'Tamil',
            'Telugu',
            'Bengali',
            'Marathi',
            'Gujarati',
            'Punjabi',
            'Malayalam',
            'Kannada',
            'Urdu',
            'Odia',
            'Assamese',
            'Sanskrit',
            'Other'
        ];
        
        // Combine database languages with default languages and remove duplicates
        const allLanguages = [...new Set([...dbLanguages, ...defaultLanguages])].sort();
        
        res.json(allLanguages);
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
