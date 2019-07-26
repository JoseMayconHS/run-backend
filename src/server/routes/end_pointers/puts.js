const express = require('express')
const multer = require('multer')
const config = require('../../../services/upload')

const upload = multer(config)
const Router = express.Router()

const { updateCar, changePart, profile, withdrawal, winOrLose } = require('../controllers/puts')

Router.put('/auth/car/:part', updateCar)

Router.put('/auth/changePart/:table', changePart)
Router.put('/auth/profile', upload.single('image'), profile )
Router.put('/auth/withdrawal', withdrawal)
Router.put('/auth/winOrLose', winOrLose)

module.exports = app => app.use(Router)