require('dotenv').config()
const config = {
	database: process.env.DATABASE_DATABASE || '',
	user: process.env.DATABASE_USER || '',
	password: process.env.DATABASE_PASSWORD || ''
}

module.exports = config
