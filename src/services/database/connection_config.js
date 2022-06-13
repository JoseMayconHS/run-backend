require('dotenv').config()

const config = {
	host: process.env.DATABASE_HOST || '',
	database: process.env.DATABASE_NAME || '',
	user: process.env.DATABASE_USER || '',
	password: process.env.DATABASE_PASSWORD || '',
	port: process.env.DATABASE_PORT || 3306
}

module.exports = config
