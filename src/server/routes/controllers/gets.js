const { selectAny, selectWhere } = require('../../../services/database/sql')

module.exports = {
	async getAll(req, res) {
		const table = req.params.table

		const data = await selectAny(table, '*')

		res.status(200).json({ table, data })
	},
	async getWhere(req, res) {
		const table = req.query.table
		delete req.query.table
		const where = req.query

		const data = await selectWhere(table, where, '*')
		
		res.status(200).json({ table, where, data })
	},
	async boots(req, res) {
		const boots = await selectAny('boots', '*')
		const cars = await selectAny('cars', '*')

		res.status(200).json({ data: { boots, cars } })
	},
	async parts(req, res) {
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
			engine.exchange_rates = getObject(engine.exchange_rates)
		})

		res.status(200).json({ data: { engines, transmissions, whells, cylinders, protections } })
	}
}