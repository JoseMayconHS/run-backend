const express = require('express')

const Router = express.Router()

const { login, auth, insert } = require('../controllers/posts')

Router.post('/login', login)
Router.post('/auth', auth)
Router.post('/createAccount', insert)

module.exports = app => app.use(Router)
