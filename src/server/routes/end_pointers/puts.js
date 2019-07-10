const express = require('express')

const Router = express.Router()

const { updateTupla } = require('../controllers/puts')

Router.put('/update?:settings', updateTupla)

module.exports = app => app.use(Router)