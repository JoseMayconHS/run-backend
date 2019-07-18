const { update, selectWhere } = require('../../../services/database/sql/api-v1')
const { justSetReference } = require('../../../services/database/sql/api-v2')

const { verifyToken } = require('../../../services/authentications/token')

async function updatev1(req, res) {
  const token = req.headers.authorization || false

  verifyToken(token, async auth => {
    if (!auth.status) return res.status(200).json(auth)

    const settings = req.body
    const { table } = req.query

    const result = await update(table, settings, { id: auth.message })

    if (!result.status) return res.status(200).json({ result })

    res.status(200).json({ result })
  })
}

async function updateCarv2(req, res) {
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


module.exports = { updatev1, updateCarv2, changePart }