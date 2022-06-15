const { DeleteObjectCommand } = require('@aws-sdk/client-s3')

const { s3 } = require('../../../services/upload');
const { remove, selectWhere } = require('../../../services/database/sqlQuery/delete');

async function doRemove(req, res) {
  const [user] = await selectWhere("users", { id: req.user }, "src");

  const command = await DeleteObjectCommand(user.src)

  await s3.send(command)

  const result = await remove({ user: req.user, car: req.car })

  res.status(200).json(result)
}

module.exports = { doRemove }
