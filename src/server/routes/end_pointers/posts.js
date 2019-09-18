const Router = require('express').Router()

const { 
	login, auth, insert,
	confirmPassword 
} = require('../controllers/posts')

Router.post('/login', login)
Router.post('/auth', auth)
Router.post('/createAccount', insert)
Router.post('/auth/confirm', confirmPassword)

module.exports = app => app.use(Router)
