const express = require('express')

const Router = express.Router()

const { updateCar, changePart } = require('../controllers/puts')


Router.put('/auth/car/:part', updateCar)

Router.put('/auth/changePart/:table', changePart)

module.exports = app => app.use(Router)