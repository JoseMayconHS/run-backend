const Router = require('express').Router()

const upload = require('../../../services/upload')

const {
	updateCar, changePart, profile,
	withdrawal, winOrLose, changeInfo
} = require('../controllers/puts')

Router.put('/auth/car/:part', updateCar)

Router.put('/auth/changePart/:table', changePart)
Router.put('/auth/profile', upload.production.single('image'), profile )
Router.put('/auth/withdrawal', withdrawal)
Router.put('/auth/winOrLose', winOrLose)
Router.put('/auth/info', changeInfo)

module.exports = app => app.use(Router)
