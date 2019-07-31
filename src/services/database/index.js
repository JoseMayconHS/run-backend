const mysql = require('mysql2')
const configDB = require('./.env')

try { 
	const connection = mysql.createConnection(configDB)
	module.exports = connection
} catch(e) {
	process.exit()
}


