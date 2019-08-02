const bcryptjs = require('bcryptjs')

const { sign, selectWhere } = require('../../../services/database/sqlQuery/select')
const { createAccount } = require('../../../services/database/sqlQuery/insert')
const { gerarToken } = require('../../../services/authentications/token')
const { encryptor } = require('../../../services/authentications/password')

async function login(req, res) {
  const { email, password } = req.body

  const result = await sign(email)

  if (!result.status) return res.status(200).json(result)

  if (!await bcryptjs.compare(password, result.message.password)) return res.status(200).json({ status: false, message: 'Senha inválida' })

  const token = gerarToken({ _id: result.message.id })

  res.status(200).json({ status: true, message: token })
}

async function auth(req, res) {
  try {
    const [ user ] = await selectWhere('users', { id: req.user }, '*')
    const [ car ] = await selectWhere('cars', { id: req.car }, '*')

    user.password = undefined

    res.status(200).json({ status: true, user, car, message: `${user.nickname} conectado!` })
  } catch(e) {
    res.status(500).send()
  }
}

async function insert(req, res) {
  try {
    req.body.password = await encryptor(req.body.password)

    createAccount(req.body)
      .then(id => {
        const message = gerarToken({ _id: id })
        res.status(200).json({ status: true, message })
      }).catch(result => res.status(200).json({ status: false, ...result }))
  } catch(e) {
    res.status(500).send()
  }
}

module.exports = { login, auth, insert  }
