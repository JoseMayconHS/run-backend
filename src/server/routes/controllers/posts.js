const bcryptjs = require('bcryptjs')

const { insert, sign, selectWhere, update } = require('../../../services/database/sql/api-v1')
const { createAccount } = require('../../../services/database/sql/api-v2')
const { gerarToken, verifyToken } = require('../../../services/authentications/token')
const { encryptor } = require('../../../services/authentications/password')

function getFields(table) {
  const fields = {
    users: 'name, email, password, nickname, genre, country',
    cars: 'model',
    boots: 'name, genre, country, nvl, src',
    engines: 'name, exchange, exchange_rates, speed, acceleration, resistance, turbo',
    transmissions: 'name, acceleration, speed, turbo, resistance',
    whells: 'name, speed, acceleration, brake',
    cylinders: 'name, turbo, speed, acceleration, resistance',
    protections: 'name, resistance'
  }

  return fields[table]
}

//V1
async function insertv1(req, res) {
  const table = req.params.table

  try {
    if (table === 'users') {
      const passwordCypted = await bcryptjs.hash(req.body.password, 10)

      req.body.password = passwordCypted
    }

    let pilotDrive = false

    if (table === 'cars') {
      const token = req.headers.authorization || false

      verifyToken(token, auth => {
        if (!auth.status) return res.status(200).json(auth)

        pilotDrive = auth.message
      })
    }

    const values = Object.values(req.body)
    
    let result = await insert(table, getFields(table), values)

    if (!result.status) return res.status(200).json(result)

    if (table === 'users') {
      const newUser = await selectWhere('users', { email: req.body.email }, 'id')

      result.message = gerarToken({ _id: newUser[0].id })
    }

    if (table === 'cars') {
      const newCar = await selectWhere('cars', { model: req.body.model }, 'id')
      const driver = await update('users', { ['car_id']: newCar[0].id }, { id: pilotDrive  })

      result.message = driver.message
      result.status = driver.status
    }

    res.status(200).json(result)
  } catch(e) {
    res.status(500).send()
  }
}


async function login(req, res) {
  const { email, password } = req.body

  const result = await sign(email)

  if (!result.status) return res.status(200).json(result)

  if (!await bcryptjs.compare(password, result.message.password)) return res.status(200).json({ status: false, message: 'Senha inválida' })

  const token = gerarToken({ _id: result.message.id })

  res.status(200).json({ status: true, message: token })
}

function auth(req, res) {
  const token = req.headers.authorization || false

  verifyToken(token, async validation => {
    try {
      if (!validation.status) return res.status(200).json(validation)

      const user = await selectWhere('users', { id: validation.message }, '*')
      const car = await selectWhere('cars', {id: user[0].car_id}, '*')

      user[0].password = ''
      console.log(car[0])

      res.status(200).json({ status: true, user: user[0], car: car[0], message: `${user[0].nickname} conectado!` })
    } catch(e) {
      res.status(500).send()
    }
  }) 
}

//V2

async function insertv2(req, res) {
  try {
    req.body.password = await encryptor(req.body.password)

    createAccount(req.body)
      .then(id => {
        const message = gerarToken({ _id: id })
        res.status(200).json({ status: true, message })
      })
      .catch(result => res.status(200).json({ status: false, ...result }))
  } catch(e) {
    res.status(500).send()
  }
}


module.exports = {  insertv1, login, auth, insertv2  }