const Router = require('express').Router()

const { 
	doRemove 
} = require('../controllers/deletes')


Router.delete('/auth/delete?:query', doRemove)

module.exports = app => app.use(Router)
