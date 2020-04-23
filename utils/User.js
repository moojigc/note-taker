var crypto = require('crypto'); 
  
// Creating user schema 
class User {
    constructor(username) {
        this.username = username;
        this.salt;
        this.hash;
        this.id;
    };
    setPassword(password) {
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);       
    };
    validLogin(password) {
        const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
        return this.hash === hash; 
    }
}; 

module.exports = User;