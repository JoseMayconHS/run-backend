const { DeleteObjectCommand } = require('@aws-sdk/client-s3')

const { s3 } = require('../../../services/upload');
const { selectWhere } = require('../../../services/database/sqlQuery/select');
const { remove } = require('../../../services/database/sqlQuery/delete');

async function doRemove(req, res) {
  const [user] = await selectWhere("users", { id: req.user }, "src");

  if (user.src !== 'pilots/default') {
    const Key = user.src.split('amazonaws.com/')[1]

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key
    })

    await s3.send(command)
  }


  const result = await remove({ user: req.user, car: req.car })

  res.status(200).json(result)
}

module.exports = { doRemove }
