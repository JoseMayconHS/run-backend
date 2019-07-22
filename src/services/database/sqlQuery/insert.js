const db = require('../')

const { getTheParts } = require('./select')

function createAccount({ name = String, nickname = String, email = String, password = String, country = String, genre = String, model = String } = Object) {
  return new Promise((resolve, reject) => {
    function verifyEmail(next) {
      db.query(`SELECT id FROM users WHERE email = '${email}'`, [], (err, result) => {
        if (result.length) return reject({ message: 'Email já existe' })

        db.query(`SELECT id FROM users WHERE nickname = '${nickname}'`, [], (err, result) => {
          if (result.length) return reject({ message: 'Nickname já existe' })

          next()
        })
      })
    }

    function verifyModel(next) {
      db.query(`SELECT id FROM cars WHERE model = '${model}'`, [], (err, result) => {
        if (result.length) return reject({ message: 'Nome do carro já existe' })

        next()
      })
    }

    function createUser(next) {
      db.query(`INSERT INTO users (name, nickname, email, password, country, genre)
        VALUES ('${name}', '${nickname}', '${email}', '${password}', '${country}', '${genre}')`, [], err => {
          if (err) return reject({ message: 'Usuário não criado!', error: err.sqlMessage })

          next()
      })
    }

    function createCar(next) {
      db.query(`INSERT INTO cars (model) VALUES ('${model}')`, [], err => {
        if (err) return reject({ message: 'Carro não criado!', error: err.sqlMessage })

        next()
      })
    }

    function link(next) {
      db.query(`SELECT id from cars WHERE model = '${model}'`, [], (err, result) => {
        if (err || !result.length) return reject({ message: `Carro ${model} não encontrado`, error: err.sqlMessage })

        db.query(`UPDATE users SET car_id = ${result[0].id} WHERE email = '${email}'`, [], err => {
          if (err) return reject({ message: 'Erro ao vincular', error: err.sqlMessage })

          next()
        })
      })
    }

    function setReferences(next) {
      db.query(`SELECT engine, transmission, cylinder, whells, protection FROM cars WHERE model = '${model}'`, [],async (err, result) => {
        if (err) return reject({ message: 'Erro ao pegar referências das peças' })

        const my = await getTheParts(result[0])

        const e = my.engine
        const engine_object = { exchange: e.exchange, exchange_rates: e.exchange_rates, speed: e.speed, acceleration: e.acceleration, resistance: e.resistance, turbo: e.turbo, update_config: e.update_config, ups: 0, price: e.price }

        const t = my.transmission
        const transmission_object = { acceleration: t.acceleration, speed: t.speed, resistance: t.resistance, update_config: t.update_config, ups: 0, price: t.price }
        
        const c = my.cylinder 
        const cylinder_object = { turbo: c.turbo, speed: c.speed, acceleration: c.acceleration, resistance: c.resistance, update_config: c.update_config, ups: 0, price: c.price }

        const w = my.whells 
        const whells_object = { speed: w.speed, acceleration: w.acceleration, brake: w.brake, update_config: w.update_config, ups: 0, price: w.price }

        const p = my.protection
        const protection_object = { resistance: p.resistance, update_config: p.update_config, ups: 0, price: p.price }

        db.query(`UPDATE cars SET engine_object = '${JSON.stringify(engine_object)}', transmission_object = '${JSON.stringify(transmission_object)}',
          cylinder_object = '${JSON.stringify(cylinder_object)}', whells_object = '${JSON.stringify(whells_object)}', protection_object = '${JSON.stringify(protection_object)}' 
          WHERE model = '${model}'`, [], err => {
            if (err) return reject({ message: 'Erro ao tentar setar referências', err })

            next()
          })
      })
    }

    function returnId() {
      db.query(`SELECT id FROM users WHERE email = '${email}'`, [], (err, result) => {
        if (err) return reject({ message: 'Criado, porém não encontrado', error: err.sqlMessage })

        resolve(result[0].id)
      })
    }

    //START
    function stepByStep(...steps) {
      function start(indice) {
        steps && indice < steps.length && steps[indice](() => start(indice + 1))
      }

      start(0)
    }

    stepByStep(verifyEmail, verifyModel, createUser, createCar, link, setReferences, returnId)
  })
}

module.exports = { createAccount }
