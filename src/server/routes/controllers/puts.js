const bcryptjs = require("bcryptjs");
const { DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { Upload } = require('@aws-sdk/lib-storage')
const sharp = require('sharp')
const { uuid } = require('uuidv4')
const { Blob } = require('buffer')

const { selectWhere } = require("../../../services/database/sqlQuery/select");
const { s3 } = require("../../../services/upload");

const {
  justSetReference,
  update,
} = require("../../../services/database/sqlQuery/update");

async function updateCar(req, res) {
  const part_object = req.params.part;
  const descont = req.body.costs;
  delete req.body.costs;

  if (
    !(await update(
      "cars",
      { [part_object]: JSON.stringify(req.body) },
      { id: req.car }
    ))
  )
    return res.status(200).json({
      status: false,
      message: "Não foi possível fazer a atualização!",
    });

  if (!(await update("users", { gold: descont }, { id: req.user })))
    return res.status(200).json({
      status: false,
      message: "Não foi possível descontar no seu dinheiro!",
    });

  const [{ gold }] = await selectWhere("users", { id: req.user }, "gold");

  const [part] = await selectWhere("cars", { id: req.car }, part_object);

  res.status(200).json({ status: true, part: part[part_object], gold });
}

async function changePart(req, res) {
  const table = req.params.table;
  const { field, part, costs } = req.body;

  await justSetReference({ schema: table, field, id: req.car, part });

  if (!(await update("users", { gold: costs }, { id: req.user })))
    return res.status(200).json({
      status: false,
      message: "Não foi possível efetuar a troca da peça!",
    });

  const [{ gold }] = await selectWhere("users", { id: req.user }, "gold");

  const [car] = await selectWhere("cars", { id: req.car }, "*");

  res.status(200).json({ status: true, car, gold });
}

async function profile(req, res) {
  try {
    const Bucket = process.env.AWS_BUCKET_NAME

    const { location, key } = req.file;

    const [user] = await selectWhere("users", { id: req.user }, "src");

    if (user.src !== "pilots/default") {
      try {
        const Key = `${ user.src.split(`.com/`)[1] }`

        const command = new DeleteObjectCommand({
          Bucket,
          Key
        })

        await s3.send(command)
      } catch(e) {
        console.error('DeleteObjectCommand Error: ', e.message)
      }
    }

    const without_filename = location.split(`profile`)[0]
    const [bucket_url, folder] = without_filename.split(`.com/`)
    const key_resized = `${ folder }profile_${ req.user }_${ uuid() }.jpg`

    const getCommand = new GetObjectCommand({
      Bucket,
      Key: key,
      ResponseContentType: 'application/octet-stream'
    })

    const image = await s3.send(getCommand)

    await new Promise(async resolve => {
      let chunks = []

      image.Body.on('data', chunk => {
        chunks.push(chunk)
      })

      image.Body.on('error', err => {
        console.log('error ', err)
        resolve({
          status: 500
        })
      })

      image.Body.on('end', async () => {

        const blob = new Blob(chunks)

        const resized = await sharp(Buffer.from(await blob.arrayBuffer()))
          .resize({ width: 180, height: 180, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 100, progressive: true })
          .toBuffer()

        const parallelUploads3 = new Upload({
          client: s3,
          params: {
            Bucket, ContentType: 'image/jpeg',
            Key: key_resized, ACL: 'public-read',  Body: resized
          },
          tags: [
            /*...*/
          ], // optional tags
          queueSize: 4, // optional concurrency configuration
          partSize: 1024 * 1024 * 10, // optional size of each part, in bytes, at least 5MB
          leavePartsOnError: false, // optional manually handle dropped parts
        });

        await parallelUploads3.done();

        const deleteCommand = new DeleteObjectCommand({
          Bucket,
          Key: key
        })

        await s3.send(deleteCommand)

        resolve()
      })
    })

    const src = bucket_url + '.com/' + key_resized

    if (!(await update("users", { src }, { id: req.user })))
      return res.status(200).json({
        status: false,
        message: "Não foi possível mudar a referência à nova imagem!",
      });

    res.status(200).json({ status: true, src  });
  } catch (error) {
    console.log(error.message)
    res.status(500).send()
  }
}

async function withdrawal(req, res) {
  const newGold = req.body.gold;
  if (!(await update("users", { gold: newGold }, { id: req.user })))
    return res
      .status(200)
      .json({ status: false, message: "Erro ao descontar no seu dinheiro!" });

  const [{ gold }] = await selectWhere("users", { id: req.user }, "gold");

  res.status(200).json({ status: true, gold });
}

async function winOrLose(req, res) {
  const { gold: newGold, xp: newXp } = req.body;

  let [{ limit_xp: before_limit_xp, nvl: before_nvl }] = await selectWhere(
    "users",
    { id: req.user },
    "limit_xp",
    "nvl"
  );

  newXp > before_limit_xp &&
    before_nvl < 50 &&
    (() => {
      do {
        before_nvl++;
        before_limit_xp *= 3;
      } while (newXp > before_limit_xp && before_nvl < 50);
    })();

  if (
    !(await update(
      "users",
      { xp: newXp, limit_xp: before_limit_xp, gold: newGold, nvl: before_nvl },
      { id: req.user }
    ))
  )
    return res.status(200).json({
      status: false,
      message: "Erro ao setar as novas informações após a corrida!",
    });

  const [{ xp, gold, limit_xp, nvl }] = await selectWhere(
    "users",
    { id: req.user },
    "xp",
    "gold",
    "limit_xp",
    "nvl"
  );

  res.status(200).json({ status: true, xp, gold, limit_xp, nvl });
}

async function changeInfo(req, res) {
  let { field, value } = req.body;

  if (field === "password") value = await bcryptjs.hash(value, 10);

  if (!(await update("users", { [field]: value }, { id: req.user })))
    return res.status(200).json({ status: false });

  try {
    const [{ [field]: newValue }] = await selectWhere(
      "users",
      { id: req.user },
      field
    );

    res.status(200).json({ status: true, message: newValue });
  } catch (e) {
    console.log(e);
    res.status(200).json({ status: false });
  }
}

module.exports = {
  updateCar,
  changePart,
  profile,
  withdrawal,
  winOrLose,
  changeInfo,
};
