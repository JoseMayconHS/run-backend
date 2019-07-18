const express = require('express')

const Router = express.Router()

const { updatev1, updateCarv2, changePart } = require('../controllers/puts')

Router.put('/update?:settings', updatev1)

Router.put('/api/v2/auth/car/:part', updateCarv2)

Router.put('/api/v2/auth/changePart/:table', changePart)

module.exports = app => app.use(Router)