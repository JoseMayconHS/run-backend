const { Schema, model } = require('mongoose')

const Stats = new Schema({
	users: Number,
	bots: Number
}, {
	timestamps: true
})

module.exports = model('stats', Stats)
