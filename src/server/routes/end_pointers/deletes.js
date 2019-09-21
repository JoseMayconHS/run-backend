const Router = require('express').Router()

const { 
	doRemove 
} = require('../controllers/deletes')


Router.delete('/auth/delete', doRemove)

module.exports = app => app.use(Router)
