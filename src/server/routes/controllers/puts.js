const { update } = require('../../../services/database/sql')

module.exports = {
  async updateTupla(req, res) {
    const settings = req.body
    const { table, id } = req.query

    const result = await update(table, settings, { id })

    if (!result.status) return res.status(200).json({ result })

    res.status(200).json({ result })
  }
}