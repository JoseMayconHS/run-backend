const sharp = require('sharp')
const { resolve } = require('path')
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

  const [{ gold }] = await selectWhere('users', { id: req.user }, 'gold')

  const [ part ] = await selectWhere('cars', { id: req.car }, part_object)

  res.status(200).json({ part: part[part_object], gold})
}

async function changePart(req, res) {
  const table = req.params.table
  const { field, part, costs } = req.body

  await justSetReference({ schema: table, field, id: req.car, part })

  await update('users', { gold: costs }, { id: req.user })

  const [{ gold }] = await selectWhere('users', { id: req.user }, 'gold')

  const [ car ] = await selectWhere('cars', { id: req.car }, '*')

  res.status(200).json({ car, gold })
}

async function profile(req, res) {
  const { filename, destination, path } = req.file

  const [user] = await selectWhere('users', { id: req.user }, 'src')

  if (user.src !== 'pilots/default') fs.unlinkSync(resolve(destination, `${user.src}.jpg`))

  await sharp(path)
    .resize(180, 180) 
    .jpeg({ quality: 70 })
    .toFile(resolve(destination, 'users', `${filename}.jpg`))
  
  fs.unlinkSync(path)

  await update('users', { src: `users/${filename}` }, { id: req.user })

  const [{ src }] = await selectWhere('users', { id: req.user }, 'src')

  res.status(200).json({ src })
}

async function withdrawal(req, res) {
  const newGold = req.body.gold
  await update('users', { gold: newGold }, { id: req.user })

  const [{ gold }] = await selectWhere('users', { id: req.user }, 'gold')

  res.status(200).json({ gold })
}

async function winOrLose(req, res) {
  const { gold: newGold, xp: newXp } = req.body

  let [{ limit_xp: before_limit_xp, nvl: before_nvl }] = await selectWhere('users', { id: req.user }, 'limit_xp', 'nvl')

  newXp > before_limit_xp && before_nvl < 50 && (() => {
    before_nvl++
    before_limit_xp *= 2
  })()

  await update('users', { xp: newXp, limit_xp: before_limit_xp, gold: newGold, nvl: before_nvl }, { id: req.user })

  const [{ xp, gold, limit_xp, nvl }] = await selectWhere('users', { id: req.user }, 'xp', 'gold', 'limit_xp', 'nvl')

  res.status(200).json({ xp, gold, limit_xp, nvl })
}

module.exports = { updateCar, changePart, profile, withdrawal, winOrLose }
