const sharp = require('sharp')
const bcryptjs = require('bcryptjs')
const { resolve } = require('path')
const fs = require('fs')

const { selectWhere } = require('../../../services/database/mysql/sqlQuery/select')
const { justSetReference, update } = require('../../../services/database/mysql/sqlQuery/update')

async function updateCar(req, res) {
  const part_object = req.params.part
  const descont = req.body.costs
  delete req.body.costs

  if (!await update('cars', { [part_object]: JSON.stringify(req.body) }, { id: req.car })) return res.status(200).json({ status: false, message: 'Não foi possivel fazer a atualização!' })

  if (!await update('users', { gold: descont }, { id: req.user })) return res.status(200).json({ status: false, message: 'Não foi possivel descontar no seu dinheiro!' })

  const [{ gold }] = await selectWhere('users', { id: req.user }, 'gold')

  const [ part ] = await selectWhere('cars', { id: req.car }, part_object)

  res.status(200).json({ status: true, part: part[part_object], gold})
}

async function changePart(req, res) {
  const table = req.params.table
  const { field, part, costs } = req.body

  await justSetReference({ schema: table, field, id: req.car, part })

  if (!await update('users', { gold: costs }, { id: req.user })) return res.status(200).json({ status: false, message: 'Não foi possível efetuar a troca da peça!' })

  const [{ gold }] = await selectWhere('users', { id: req.user }, 'gold')

  const [ car ] = await selectWhere('cars', { id: req.car }, '*')

  res.status(200).json({ status: true, car, gold })
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

  if (!await update('users', { src: `users/${filename}` }, { id: req.user })) return res.status(200).json({ status: false, message: 'Não foi possivel mudar a referência à nova imagem!' })

  const [{ src }] = await selectWhere('users', { id: req.user }, 'src')

  res.status(200).json({ status: true, src })
}

async function withdrawal(req, res) {
  const newGold = req.body.gold
  if (!await update('users', { gold: newGold }, { id: req.user })) return res.status(200).json({ status: false, message: 'Erro ao descontar no seu dinheiro!' })

  const [{ gold }] = await selectWhere('users', { id: req.user }, 'gold')

  res.status(200).json({ status: true, gold })
}

async function winOrLose(req, res) {
  const { gold: newGold, xp: newXp } = req.body

  let [{ limit_xp: before_limit_xp, nvl: before_nvl }] = await selectWhere('users', { id: req.user }, 'limit_xp', 'nvl')

  newXp > before_limit_xp && before_nvl < 50 && (() => {
    do {
      before_nvl++
      before_limit_xp *= 2
    } while (newXp > before_limit_xp && before_nvl < 50)
  })()

  if (!await update('users', { xp: newXp, limit_xp: before_limit_xp, gold: newGold, nvl: before_nvl }, { id: req.user })) return res.status(200).json({ status: false, message: 'Erro ao setar as novas informações após a corrida!' })

  const [{ xp, gold, limit_xp, nvl }] = await selectWhere('users', { id: req.user }, 'xp', 'gold', 'limit_xp', 'nvl')

  res.status(200).json({ status: true, xp, gold, limit_xp, nvl })
}

async function changeInfo(req, res) {
  let { field, value } = req.body

  if (field === 'password') value = await bcryptjs.hash(value, 10)
  
  if (!await update('users', { [field]: value }, { id: req.user })) return res.status(200).json({ status: false })

  try {
    const [{ [field]: newValue }] = await selectWhere('users', { id: req.user }, field)

    res.status(200).json({ status: true, message: newValue })
  } catch(e) {
    console.log(e)
    res.status(200).json({ status: false })
  }
}

module.exports = { updateCar, changePart, profile, withdrawal, winOrLose, changeInfo }
