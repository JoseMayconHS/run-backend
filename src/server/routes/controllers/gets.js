const { selectAny, selectWhere } = require('../../../services/database/sql/api-v1')
const { getTheParts } = require('../../../services/database/sql/api-v2')

async function getAll(req, res) {
	const table = req.params.table

	const data = await selectAny(table, '*')

	res.status(200).json({ table, data })
}

async function getWhere(req, res) {
	const table = req.query.table
	delete req.query.table
	const where = req.query

	const data = await selectWhere(table, where, '*')
	
	res.status(200).json({ table, where, data })
}


async function boots(req, res) {
	const boots = await selectAny('boots', '*')
	const cars = await selectAny('cars', '*')

	res.status(200).json({ data: { boots, cars } })
}

async function parts(req, res) {
	const engines = await selectAny('engines', '*')
	const transmissions = await selectAny('transmissions', '*')
	const whells = await selectAny('whells', '*')
	const cylinders = await selectAny('cylinders', '*')
	const protections = await selectAny('protections', '*')

	function getObject(str) {
		const strReady = str.replace(/'/g, '"')

		return JSON.parse(strReady)
	}

	engines.forEach(engine => {
		engine.exchange_rates = JSON.parse(engine.exchange_rates)
		engine.update_config = JSON.parse(engine.update_config)
	})
	
	transmissions.forEach(transmission => transmission.update_config = JSON.parse(transmission.update_config))
	whells.forEach(whells => whells.update_config = JSON.parse(whells.update_config))
	cylinders.forEach(cylinder => cylinder.update_config = JSON.parse(cylinder.update_config))
	protections.forEach(protection => protection.update_config = JSON.parse(protection.update_config))

	res.status(200).json({ data: { engines, transmissions, whells, cylinders, protections } })
}

//V2 
async function getCar(req, res) {
	const car_id = await selectWhere('users', { id: req.user }, 'car_id')
	const car = await selectWhere('cars', { id: car_id[0].car_id }, '*')

	res.status(200).json({ car })
}

async function getUser(req, res) {
	const user = await selectWhere('users', { id: req.user }, 'car_id')

	res.status(200).json({ user })
}

async function getMyParts(req, res) {
	const my = await getTheParts(req.body)

	res.send({ my })
}




module.exports = { getAll, getWhere, boots, parts, getCar, getUser, getMyParts }