const { connect } = require('mongoose')
const config = require('./connection_config')

if (Object.values(config).includes('')) {
	console.log('\x1b[41m', '\x1b[37m', 'Dados da conexão insuficientes! (Mongo não conectado)', '\x1b[0m')
	module.exports = null
} else {
	module.exports = connect(config.url, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
}

