const Router = require('express').Router()

const {
	getAll, getWhere, parts,
	bots, getCar, getUser,
	getMyParts, adversary
} = require('../controllers/gets')

Router.get('/getAll/:table', getAll)
Router.get('/getWhere?:query', getWhere)
Router.get('/getAllParts', parts)
Router.get('/myParts', getMyParts)
Router.get('/getAllBots', bots)

Router.get('/auth/adversary', adversary)
Router.get('/auth/car', getCar)
Router.get('/auth/user', getUser)
Router.get('/healthcheck', (req, res) => {
	res.json({
		ok: true
	})
})

module.exports = app => app.use(Router)
