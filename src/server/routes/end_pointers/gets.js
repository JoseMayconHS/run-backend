const express = require('express')

const Router = express.Router()

const { 
	getAll, getWhere, parts, 
	bots, getCar, getUser, 
	getMyParts, adversary, confirmPassword 
} = require('../controllers/gets')

Router.get('/getAll/:table', getAll)
Router.get('/getWhere?:query', getWhere)
Router.get('/getAllParts', parts)
Router.get('/myParts', getMyParts)
Router.get('/getAllBots', bots)

Router.get('/auth/adversary', adversary)
Router.get('/auth/car', getCar)
Router.get('/auth/user', getUser)

module.exports = app => app.use(Router)
