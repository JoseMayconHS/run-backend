const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const secret = 'a53108f7543b75adbb34afc035d4cdf6'

const { insert, sign, selectWhere } = require('../../../services/database/sql')

function getFields(table) {
  const fields = {
    users: 'name, email, password, nickname, genre, country, xp, nvl, src',
    cars: 'model, engine, transmission, whells, cylinder, protection',
    boots: 'name, genre, country, nvl, src',
    engines: 'name, exchange, exchange_rates, speed, acceleration, resistance, turbo',
    transmissions: 'name, acceleration, speed, turbo, resistance',
    whells: 'name, speed, acceleration, brake',
    cylinders: 'name, turbo, speed, acceleration, resistance',
    protections: 'name, resistance'
  }

  return fields[table]
}

function gerarToken(obj = Object) {
  const token = 'Bearer ' + jwt.sign(obj, secret, {
    expiresIn: 86400
  })

  return token
}

function verifyToken(key = String, cb = Function) {
  if (!key) return cb({ status: false, message: 'Token não providênciado!' })

  if (key.split(' ').length !== 2) return cb({ status: false, message: 'Token mal formatado!' })

  const [bearer, token] = key.split(' ')

  if (!/^Bearer$/i.test(bearer)) return cb({ status: false, message: 'Token não indêntificado!' })

  jwt.verify(token, secret, (err, user) => {
    if (err) return cb({ status: false, message: 'Token expirado!' })

    cb({ status: true, message: user._id })
  })
}

module.exports = {
  async insert(req, res) {
    const table = req.params.table

    try {
      if (table === 'users') {
        const passwordCypted = await bcryptjs.hash(req.body.password, 10)
  
        req.body.password = passwordCypted
      }
  
      const values = Object.values(req.body)
      
      let result = await insert(table, getFields(table), values)
  
      if (!result.status) return res.status(200).json(result)
  
      if (result.status && table === 'users') {
        const newUser = await selectWhere('users', { email: req.body.email }, 'id')
  
        result.message = gerarToken({ _id: newUser[0].id }, secret)
      }
  
      res.status(200).json({ status: result.status, message: result.message })
    } catch(e) {
      res.status(500).send()
    }
  },
  async login(req, res) {
    const { email, password } = req.body

    const result = await sign(email)

    if (!result.status) return res.status(200).json(result)

    if (!await bcryptjs.compare(password, result.message.password)) return res.status(200).json({ status: false, message: 'Senha inválida' })

    const token = gerarToken({ _id: result.message.id })

    res.status(200).json({ status: true, message: token })
  },
  auth(req, res) {
    const token = req.headers.authorization || false

    verifyToken(token, async validation => {
      try {
        if (!validation.status) return res.status(200).json(validation)

        const user = await selectWhere('users', { id: validation.message }, '*')

        user[0].password = undefined

        res.status(200).json({ status: true, user: user[0], message: `${user[0].nickname} conectado!` })
      } catch(e) {
        res.status(500).send()
      }
    })    
  }
}