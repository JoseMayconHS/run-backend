const { remove } = require('../../../services/database/sqlQuery/delete')

async function doRemove(req, res) {
  const { table, id } = req.query

  const result = await remove(table, { id })

  res.status(200).json(result)
} 

module.exports = { doRemove }
