const db = require('../')
const { destructingObjects } = require('../functions')

function remove(table, settings) {
	return new Promise(resolve => {
		const where = destructingObjects(settings)

		db.query(`DELETE FROM ${table} WHERE ${where}`, [], err => {
			if (err) return resolve({ status: false, message: 'Nada removido' })

			resolve({ status: true })
		})
	})
}

module.exports = { remove }
