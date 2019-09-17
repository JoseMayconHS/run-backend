require('dotenv').config()
require('../services/database/mongodb')
require('../services/database/mongodb/updateStats')

const express = require('express')
const body_parser = require('body-parser')
const cors = require('cors')

const port = process.env.SERVER_PORT || 8080

const { middlewarer } = require('../services/authentications/token')

const app = express()

app.use(cors())
app.use('/files', express.static('src/public'))
app.use('/auth', middlewarer)

app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())

require('./routes/index')(app)

app.listen(port, err => console.log(err ? 'Error' : `Server running at http://localhost:${port}`))
