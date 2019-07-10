const { remove } = require('../../../services/database/sql')

module.exports = {
  async doRemove(req, res) {
    const { table, id } = req.query

    const result = await remove(table, { id })

    res.status(200).json({ result })
  }
}