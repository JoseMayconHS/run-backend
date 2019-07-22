const multer = require('multer')
const path = require('path')

module.exports = {
	storage: new multer.diskStorage({
		destination: path.resolve(__dirname, '..', '..', 'public'),
		filename: (req, file, cb) => cb(null, String(Date.now()))
	})
}