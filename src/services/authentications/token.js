const jwt = require('jsonwebtoken')

const secret = 'a53108f7543b75adbb34afc035d4cdf6'

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

      next()
    } catch(e) {
      res.status(500).send()
    }
  }) 
}

module.exports = { gerarToken, verifyToken, middlewarer }
