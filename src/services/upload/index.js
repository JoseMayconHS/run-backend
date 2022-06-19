const multer = require('multer')
const multerS3 = require('multer-s3')
const { S3Client } = require('@aws-sdk/client-s3')
const path = require('path')
const { uuid } = require('uuidv4')

exports.s3 = new S3Client({
	region: 'sa-east-1'
})

exports.production = multer({
	storage: multerS3({
		s3: this.s3,
		bucket: process.env.AWS_BUCKET_NAME,
		acl: 'public-read',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: (req, file, cb) => {
			const filename = `profile_${ req.user }_${ path.extname(file.originalname) }`

			const folder = 'run-backend/users/'

			cb(null, folder + filename);
		}
	})
})

exports.local = multer({
	storage: new multer.diskStorage({
		destination: path.resolve(__dirname, '..', '..', 'public'),
		filename: (req, file, cb) => cb(null, String(Date.now()))
	})
})
