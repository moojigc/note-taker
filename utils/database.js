// const { DB_HOST, DB_NAME, PASSWORD, USERNAME } = require('./config.json');

// const pool  = mysql.createPool({
//     host: process.env.DB_HOST || DB_HOST,
//     user: process.env.DB_USER || USERNAME,
//     password: process.env.DB_PASS || PASSWORD,
//     database: process.env.DB_NAME || DB_NAME,
//     multipleStatements: true
// });

// module.exports.query = function (query, value) {
//     let connection;

//     return pool.getConnection().then(conn => {
//         connection = conn;
//         console.log(`Connected to ${DB_HOST}.`)
//         return connection.query(query, value);
//     })
//     .then(res => res[0])
//     .catch(err => err)
//     .then(res => {
//         connection.release();
//         console.log('Connection released.')
//         return res;
//     });
// };