const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const { selectWhere } = require('../../../services/database/sqlQuery/select')
const { justSetReference, update } = require('../../../services/database/sqlQuery/update')

async function updateCar(req, res) {
  const part_object = req.params.part
  const descont = req.body.costs
  delete req.body.costs

  const result = await update('cars', { [part_object]: JSON.stringify(req.body) }, { id: req.car })
  const resultCosts = await update('users', { gold: descont }, { id: req.user })

  if (!result.status && !resultCosts.status) return res.status(200).json({ status: false, result: { result, resultCosts } })

  const user = await selectWhere('users', { id: req.user }, '*')
  user[0].password = undefined

  const car = await selectWhere('cars', { id: req.car }, '*')

  res.status(200).json({ status: true, car: car[0], user: user[0] })
}

async function changePart(req, res) {
  const table = req.params.table
  const { field, part, costs } = req.body

  await justSetReference({ schema: table, field, id: req.car, part })

  await update('users', { gold: costs }, { id: req.user })

  const user = await selectWhere('users', { id: req.user }, '*')
  user[0].password = undefined

  const car = await selectWhere('cars', { id: req.car }, '*')

  res.status(200).json({ status: true, car: car[0], user: user[0] })
}

async function profile(req, res) {
  const { filename: src } = req.file

  let user = await selectWhere('users', { id: req.user }, 'src')

  if (user[0].src !== 'default/default') fs.unlinkSync(path.resolve(req.file.destination, 'users', `${user[0].src}.jpg`))

  await sharp(req.file.path)
    .resize(180, 180) 
    .jpeg({ quality: 70 })
    .toFile(path.resolve(req.file.destination, 'users', `${src}.jpg`))
  
  fs.unlinkSync(req.file.path)

  await update('users', { src }, { id: req.user })

  user = await selectWhere('users', { id: req.user }, '*')
  user[0].password = undefined

  const car = await selectWhere('cars', { id: req.car }, '*')

  res.json({ status: true, user: user[0], car: car[0] })
}

module.exports = { updateCar, changePart, profile }
