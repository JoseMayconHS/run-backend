const db = require('../')
const { destructingObjects } = require('../functions')

function update(table, settings, where) {
	return new Promise(resolve => {

		const querySet = destructingObjects(settings, ' , ')
		const queryWhere = destructingObjects(where, ' AND ')

		db.query(`
			UPDATE ${table} SET ${querySet} WHERE ${queryWhere}
		`, [], err => {
			if (err) return resolve(false)

			resolve(true)
		})
	})
}

async function justSetReference({ schema, id, part, field }) {
  return new Promise(resolve => {
    db.query(`SELECT * from ${schema} WHERE name = '${part}'`, [], (err, result) => {
      const np = result[0]
      let object = {}

      if (schema === 'engines') {
        object = { exchange: np.exchange, exchange_rates: JSON.parse(np.exchange_rates), speed: np.speed, acceleration: np.acceleration, resistance: np.resistance, turbo: np.turbo, update_config: JSON.parse(np.update_config), ups: 0, price: np.price }
      }
      if (schema === 'transmissions') {
        object = { acceleration: np.acceleration, speed: np.speed, resistance: np.resistance, update_config: JSON.parse(np.update_config), ups: 0, price: np.price }
      }
      if (schema === 'cylinders') {
        object = { turbo: np.turbo, speed: np.speed, acceleration: np.acceleration, resistance: np.resistance, update_config: JSON.parse(np.update_config), ups: 0, price: np.price }
      }
      if (schema === 'whells') {
        object = { speed: np.speed, acceleration: np.acceleration, brake: np.brake, update_config: JSON.parse(np.update_config), ups: 0, price: np.price }
      }
      if (schema === 'protections') {
        object = { resistance: np.resistance, update_config: JSON.parse(np.update_config), ups: 0, price: np.price }
      }

      db.query(`UPDATE cars SET ${field}_object = '${JSON.stringify(object)}', ${field} = '${part}' WHERE ${id === String? `model = '${id}'`: `id = ${id}` }`, [], error => {
        if (error) return resolve({ error, status: false })

        resolve({ status: true })
      })
    })
  })
}

module.exports = { update, justSetReference }
