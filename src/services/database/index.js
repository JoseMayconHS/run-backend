const mysql = require('mysql2')
const configDB = require('./.env_connection')

module.exports = mysql.createConnection(configDB)	
