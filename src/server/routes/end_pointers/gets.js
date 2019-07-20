const express = require('express')

const Router = express.Router()

const { getAll, getWhere, parts, bots, getCar, getUser, getMyParts } = require('../controllers/gets')

Router.get('/getAll/:table', getAll)

Router.get('/getWhere?:query', getWhere)

Router.get('/getAllParts', parts)

Router.get('/getAllBots', bots)

Router.get('/auth/car', getCar)
Router.get('/auth/user', getUser)
Router.get('/myParts', getMyParts)


module.exports = app => app.use(Router)