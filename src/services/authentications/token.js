const jwt = require('jsonwebtoken')
const { selectWhere } = require('../database/sqlQuery/select')

const { secret } = require('./.env')

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

function middlewarer(req, res, next) {
  const token = req.headers.authorization || false

  verifyToken(token, async validation => {
    try {
      if (!validation.status) return res.status(401).json(validation)

      req.user = validation.message
      const car_id = await selectWhere('users', { id: req.user }, 'car_id')
      const car = await selectWhere('cars', { id: car_id[0].car_id }, 'id')
      req.car = car[0].id

      next()
    } catch(e) {
      res.status(500).send()
    }
  }) 
}

module.exports = { gerarToken, verifyToken, middlewarer }
