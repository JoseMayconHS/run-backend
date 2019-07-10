const express = require('express')

const Router = express.Router()

const { insert, login, auth } = require('../controllers/posts')

Router.post('/insert/:table', insert)
Router.post('/login', login)
Router.post('/auth', auth)

module.exports = app => app.use(Router)