const db = require('../')

function remove({ user, car }) {
	return new Promise(resolve => {
		db.query(`DELETE FROM users WHERE id = ${user}`, [], err => {
			if (err) return resolve({ status: false, message: 'Nada removido' })

			db.query(`DELETE FROM cars WHERE id = ${car}`, [], err => {
				if (err) return resolve({ status: false, message: 'Usuário não removido' })
				
				resolve({ status: true })	
			})
		})
	})
}

module.exports = { remove }
