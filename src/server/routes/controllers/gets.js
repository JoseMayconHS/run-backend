const { 
	selectAny, selectWhere, getTheParts, 
	selectAdversary 
} = require('../../../services/database/sqlQuery/select')

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
	
	res.status(200).json({ table, where, count: data.length, data })
}


async function bots(req, res) {
	const bots = await selectAny('bots', '*')
	const cars = await selectWhere('cars', {'bot': 1}, '*')

	res.status(200).json({ data: { bots, cars } })
}

async function parts(req, res) {
	const engines = await selectAny('engines', '*')
	const transmissions = await selectAny('transmissions', '*')
	const whells = await selectAny('whells', '*')
	const cylinders = await selectAny('cylinders', '*')
	const protections = await selectAny('protections', '*')

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

async function getCar(req, res) {
	const [ car ] = await selectWhere('cars', { id: req.car }, '*')

	car.engine_object = JSON.parse(car.engine_object)
	car.transmission_object = JSON.parse(car.transmission_object)
	car.whells_object = JSON.parse(car.whells_object)
	car.cylinder_object = JSON.parse(car.cylinder_object)
	car.protection_object = JSON.parse(car.protection_object)

	res.status(200).json({ car })
}

async function getUser(req, res) {
	const [ user ] = await selectWhere('users', { id: req.user }, '*')

	user.password = undefined

	res.status(200).json({ user })
}

async function getMyParts(req, res) {
	const my = await getTheParts(req.body)

	res.status(200).json({ my })
}

async function adversary(req, res) {
	const [{ nvl }] = await selectWhere('users', { id: req.user }, 'nvl')

	const allAdvs = await selectAdversary(nvl, req.user)

	res.status(200).json({ allAdvs })
}

module.exports = { getAll, getWhere, bots, parts, getCar, getUser, getMyParts, adversary }
