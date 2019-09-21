const { remove } = require('../../../services/database/sqlQuery/delete')

async function doRemove(req, res) {
  const result = await remove({ user: req.user, car: req.car })

  res.status(200).json(result)
} 

module.exports = { doRemove }
