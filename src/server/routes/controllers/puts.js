const { selectWhere } = require('../../../services/database/sqlQuery/select')
const { justSetReference, update } = require('../../../services/database/sqlQuery/update')

async function updateCar(req, res) {
  const part_object = req.params.part
  const descont = req.body.costs
  delete req.body.costs
  
  const car_id = await selectWhere('users', { id: req.user }, 'car_id')

  const result = await update('cars', { [part_object]: JSON.stringify(req.body) }, { id: car_id[0].car_id })
  const resultCosts = await update('users', { gold: descont }, { id: req.user })

  if (!result.status && !resultCosts.status) return res.status(200).json({ status: false, result: { result, resultCosts } })

  const user = await selectWhere('users', { id: req.user }, '*')
  user[0].password = undefined

  const car = await selectWhere('cars', { id: user[0].car_id }, '*')

  res.status(200).json({ car: car[0], user: user[0] })
}

async function changePart(req, res) {
  const table = req.params.table
  const { field, part, costs } = req.body

  const car_id = await selectWhere('users', { id: req.user }, 'car_id')

  await justSetReference({ schema: table, field, id: car_id[0].car_id, part })

  await update('users', { gold: costs }, { id: req.user })

  const user = await selectWhere('users', { id: req.user }, '*')
  user[0].password = ''

  const car = await selectWhere('cars', { id: car_id[0].car_id }, '*')

  res.status(200).json({ status: true, car: car[0], user: user[0] })
}


module.exports = { updateCar, changePart }