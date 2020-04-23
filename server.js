const express = require('express');
const path = require('path')
const { Sequelize, QueryTypes } = require('sequelize');
const User = require('./utils/User');

// env variables
const PORT = process.env.PORT || 3000;
const { DB_HOST, DB_NAME, PASSWORD, USERNAME } = process.env.PORT ? process.env : require('./utils/config.json').dev; 

const sequelize = new Sequelize({ // Actually connect to db
    dialect: "mysql",
    host: DB_HOST,
    username: USERNAME,
    password: PASSWORD,
    database: DB_NAME,
});
async function authenticate() {
    try {
        await sequelize.authenticate();
        console.log(`Successfully connected to ${DB_NAME} at ${DB_HOST}.`);
      } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
authenticate(); // Tests connection

async function dbQuery(sql, type, ...query) { // Takes sql escaped value and sends that command to db
    const result = await sequelize.query(
        // sql = Raw SQL command using ? for data replacements
        // query = what you want to search or input
        // type = query type, e.g. select, update, insert
        sql, {
            replacements: query,
            type: type
        }
    );
    console.log("Result is: " + JSON.stringify(result, null, 2));
    // returns query result as an array
    return result;
}
const app = express();

// middleware
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function dbGetRequest(res, sql, ...query) { // res = must pass in res from app.get/post/update/delete() callback
    try {
        const result = await dbQuery(sql, QueryTypes.SELECT, query);
        res.json(result);
    } catch (error) {
        console.log(error)
    }
};
async function dbPostRequest(res, sql, ...query) {
    try {        
        const result = await dbQuery(sql, QueryTypes.INSERT, query);
        res.sendStatus(201);
        return result;
    } catch (error) {
        console.log(error)
    }
};

function getPage() { // serves html pages
    // sends home page
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
    // sends page if it exists
    app.get('/:page', (req, res) => {
        const chosen = req.params.page;
        res.sendFile(path.join(__dirname, chosen));
    });
}

function signUpLogin() {
    // Sign up
    app.post('/signup', async (req, res) => {
        const usernameTaken = async () => {
            const sql = `SELECT * FROM users WHERE username = ?;`;
            const query = await dbQuery(sql, QueryTypes.SELECT, req.body.username);
            console.log(`Returned ${query.length} results.`);
            return query.length;
        }
        if (parseInt(await usernameTaken()) === 0) {
            let newUser = new User(req.body.username);
            newUser.setPassword(req.body.password);
            console.log(newUser);
            let sql = `INSERT INTO users(username, hash, salt) VALUES('${newUser.username}', '${newUser.hash}', '${newUser.salt}');`;
            await dbQuery(sql, QueryTypes.INSERT);
            const createdUser = await dbQuery('SELECT id FROM users WHERE username = ?', QueryTypes.SELECT, req.body.username);
            console.log(newUser);
            res.status(201).send({
                message: "User created",
                succeeded: true,
                user_id: createdUser[0].id,
                username: newUser.username
            })
        }
        else {
            res.send({
                message: `Username already taken!`,
                succeeded: false
            });
            return;
        }
    });
    // Login
    app.post('/login', async (req, res) => {
        let user = new User(req.body.username);
        const userLookUp = async () => {
            let sql = `SELECT * FROM users WHERE username = ?;`;
            const result = await dbQuery(sql, QueryTypes.SELECT, user.username);
    
            if (result.length === 1) {
                user.hash = result[0].hash;
                user.salt = result[0].salt;
                user.id = result[0].id;
                return true;
            } else {
                return false;
            }
        };
        const userFound = await userLookUp();
        console.log(userFound);
        // Check if user is found
        if (!userFound) {
            return res.send({
                message: 'User not found.',
                succeeded: false
            });
        } 
        else {
            console.log(user);
            if (user.validLogin(req.body.password)) {
                return res.status(201).send({ 
                    succeeded: true,
                    message: "User logged in",
                    user_id: user.id,
                    username: user.username
                });
            } else {
                return res.send({
                    succeeded: false,
                    message: "Wrong password."
                })
            }
        }
    })
}

async function startConnection() {
    // HTML Pages
    getPage();

    // Login/signup
    signUpLogin();

    // All notes
    // GET
    app.get('/api/notes', (req, res) => {
        const sql = `SELECT * FROM notes;`;
        dbGetRequest(res, sql, req.body.user_id);
    });
    // Notes by ID
    app.get('/api/notes/:id', (req, res) => {
        const sql = `SELECT * FROM notes WHERE id = ?`;
        dbGetRequest(res, sql, req.params.id);
        console.log(sql);
    });
    // notes by user_id
    app.get('/api/notes/user/:user_id', (req, res) => {
        const sql = `SELECT * FROM notes WHERE user_id = ?`;
        dbGetRequest(res, sql, req.params.user_id);
        console.log(sql);
    });
    // POST
    app.post('/api/notes', (req, res) => {
        const { user_id, post_title, body } = req.body;
        const sql = `INSERT INTO notes(user_id, post_title, body) VALUES(${user_id}, '${post_title}', '${body}');`;
        dbPostRequest(res, sql);
    });

    app.listen(PORT, (err) => {
        if (err) throw err;
        else console.log(`Listening on ${PORT}.`);
    });
};

startConnection();
