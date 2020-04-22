const PORT = process.env.PORT || 3000;
const express = require('express');
const path = require('path')
const mysql = require('mysql2');
const { DB_HOST, DB_NAME, PASSWORD, USERNAME } = process.env || require('./utils/config.json');
const moment = require('moment');

const db = mysql.createConnection({
    host: process.env.DB_HOST || DB_HOST,
    user: process.env.USERNAME || USERNAME,
    password: process.env.PASSWORD || PASSWORD,
    database: process.env.DB_NAME || DB_NAME
});

db.connect(err => {
    if (err) throw err;
    else console.log(`MySQL connected to ${DB_HOST}`);
});

const app = express();
// middleware
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

function dbGetRequest(sql, res) {
    try {
        db.query(sql, (err, result) => {
            if (err) throw err;
            res.json(result)
        });
    } catch (error) {
        console.log(error)
    }
};

app.get('/:page', (req, res) => {
    const chosen = req.params.page;
    res.sendFile(path.join(__dirname, chosen));
});

app.get('/api/notes', (req, res) => {
    dbGetRequest('SELECT * FROM notes;', res);
});

app.get('/api/notes?q=:id', (req, res) => {
    const sql = `SELECT * FROM notes WHERE id = ${req.params.id}`
    dbGetRequest(sql, res);
});

app.get('/api/users', (req, res) => {
    const sql = `SELECT * FROM users`;
    dbGetRequest(sql, res);
});

app.listen(PORT, (err) => {
    if (err) throw err;
    else console.log(`Listening on ${PORT}.`);
});

