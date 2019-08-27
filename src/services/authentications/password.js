const bcryptjs = require('bcryptjs')

async function encryptor(password) {
  const crypt = await bcryptjs.hash(password, 10)

  return crypt
}

async function verifyPassword(passPassword, userPassword) {
  const result = await bcryptjs.compare(passPassword, userPassword)

  return result
}

module.exports = { encryptor, verifyPassword }
