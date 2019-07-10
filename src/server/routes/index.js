const fs = require('fs')
const path = require('path')

const files = fs.readdirSync(path.resolve(__dirname, 'end_pointers'))

module.exports = app =>	files.forEach(file => require(`./end_pointers/${file}`)(app) )
