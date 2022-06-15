const mysql = require('mysql2')
const configDB = require('./connection_config')

if (Object.values(configDB).includes('')) {
	console.log('\x1b[41m', '\x1b[37m', 'Dados da conexão insuficientes!', '\x1b[0m')
	module.exports = null
} else {
	module.exports = mysql.createConnection(configDB)
}
