const express = require('express')

const Router = express.Router()

const { insertv1, login, auth, insertv2 } = require('../controllers/posts')

Router.post('/api/v1/insert/:table', insertv1)
Router.post('/login', login)
Router.post('/auth', auth)

Router.post('/api/v2/createAccount', insertv2)

module.exports = app => app.use(Router)