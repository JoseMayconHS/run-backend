require('dotenv').config()

const config = {
	url: process.env.MONGO_URL_CONNECTION || ''
}

module.exports = config
