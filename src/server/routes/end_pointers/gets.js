const express = require('express')

const Router = express.Router()

const { getAll, getWhere, parts, boots } = require('../controllers/gets')

Router.get('/getAll/:table', getAll)

Router.get('/getWhere?:query', getWhere)

Router.get('/getAllParts', parts)

Router.get('/getAllBots', boots)


module.exports = app => app.use(Router)