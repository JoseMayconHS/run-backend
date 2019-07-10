const mysql = require('mysql2')
const configDB = require('./.env')

const connection = mysql.createConnection(configDB)

module.exports = connection

