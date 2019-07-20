const db = require('../')
const { destructingObjects } = require('../functions')

function remove(table = String, settings = Object) {
	return new Promise(resolve => {
		const where = destructingObjects(settings)

		db.query(`DELETE FROM ${table} WHERE ${where}`, [], err => {
			if (err) return resolve({ status: false, message: 'Nada removido' })

			resolve({ status: true, message: `Um item da tabela ${table} foi removida` })
		})
	})
}

module.exports = { remove }