require('dotenv').config()

const config = {
	database: process.env.DATABASE_NAME || '',
	user: process.env.DATABASE_USER || '',
	password: process.env.DATABASE_PASSWORD || ''
}

module.exports = config
