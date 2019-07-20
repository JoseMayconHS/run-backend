const express = require('express')
const body_parser = require('body-parser')
const cors = require('cors')

const { middlewarer } = require('../services/authentications/token')

const app = express()
app.use(cors())
const port = process.env.PORT || 3001

app.use('/files', express.static('src/public'))
app.use('/auth', middlewarer)

app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())

require('./routes/index')(app)

app.listen(port, err => console.log(err ? 'Error' : `Server running at http://localhost:${port}`))
