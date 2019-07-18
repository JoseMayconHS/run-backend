const db = require('../')

function destructingObjects(obj = Object, sqlComand = String) {
	const keysValues = Object.entries(obj)

	const query = keysValues.reduce((acompliant, current, indice) => {

		if (Number.parseInt(current[1])) current[1] = Number.parseInt(current[1])
		else current[1] = "'" + current[1] + "'"

		if (indice === 0 && keysValues.length === 1) {
			acompliant = current[0] + ' = ' + current[1]
		} else {
			if (indice === 0) {
				acompliant = current[0] + ' = ' + current[1] + sqlComand
			} else if (indice < keysValues.length - 1) {
				acompliant += current[0] + ' = ' + current[1] + sqlComand
			} else {
				acompliant += current[0] + ' = ' + current[1]
			}
		}
		return acompliant
	}, '')

	return query
}

function select(table = String, where = Object, ...selects) {
	return new Promise(resolve => {
		const queryWhere = destructingObjects(where, ' AND ')			
	
		db.query(`SELECT ${selects} FROM ${table} WHERE ${queryWhere}`, [], (err, result) => resolve(result))
	})
}

//V1
function selectAny(table = String, ...params) {
	return new Promise(resolve => {
		db.query(`SELECT ${params} FROM ${table}`, [], (err, result) =>	resolve(result))
	})
}

async function selectWhere(table = String, where = Object, ...selects) {
	const elements = await select(table, where, ...selects)

	return elements.length? elements: { warning: 'Ninguém encontrado!' }
}

function update(table = String, settings = Object, where = Object) {
	return new Promise(resolve => {

		const querySet = destructingObjects(settings, ' , ')
		const queryWhere = destructingObjects(where, ' AND ')

		db.query(`
			UPDATE ${table} SET ${querySet} WHERE ${queryWhere}
		`, [], err => {
			if (err) resolve({ status: false, message: 'Atualização não executada!' })

			resolve({ status: true, message: 'Sucesso!!!'})
		})
	})
}

function insert(table = String, fields = String, values = Array) {
	return new Promise(resolve => {

		values.forEach((value, indice) => { 
			if (Number.parseInt(value) || value == 0) values[indice] = Number.parseInt(value)	
			else values[indice] = " \"" + value + "\" "
		})

		db.query(`INSERT INTO ${table} (${fields}) VALUES (${values})
		`, [], err => {
			if (err) return resolve({ status: false, message: err.sqlMessage })

			resolve({ status: true, message: 'Criado' })
		})
	})
}

function remove(table = String, settings = Object) {
	return new Promise(resolve => {
		const where = destructingObjects(settings)

		db.query(`DELETE FROM ${table} WHERE ${where}`, [], err => {
			console.log(err)
			if (err) return resolve({ status: false, message: 'Nada removido' })

			resolve({ status: true, message: `Um item da tabela ${table} foi removida` })
		})
	})
}

function sign(email) {
	return new Promise(resolve => {
		db.query(`SELECT id, password FROM users WHERE email = '${email}'`, [], (err, user) => {
			if (err) return resolve({ status: false, message: 'Erro na consulta' })

			if (!user.length) return resolve({ status: false, message: 'Usuário não encontrado' })

			resolve({ status: true, message: user[0] })
		})
	})
}

module.exports = { selectAny, selectWhere, update, insert, remove, sign }