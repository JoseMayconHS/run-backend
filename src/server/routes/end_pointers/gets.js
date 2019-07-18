const express = require('express')

const Router = express.Router()

const { getAll, getWhere, parts, boots, getCar, getUser, getMyParts } = require('../controllers/gets')

Router.get('/getAll/:table', getAll)

Router.get('/getWhere?:query', getWhere)

Router.get('/getAllParts', parts)

Router.get('/getAllBoots', boots)

Router.get('/api/v2/auth/car', getCar)
Router.get('/api/v2/auth/user', getUser)
Router.get('/api/v2/myParts', getMyParts)


module.exports = app => app.use(Router)