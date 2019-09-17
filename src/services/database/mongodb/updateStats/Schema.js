const { Schema, model } = require('mongoose')

const Stats = new Schema({
	users: Number,
	bots: Number,
	online: Number
})

Stats.pre('save', next => {
	console.log('novo stats')

	next()
})

module.exports = model('stats', Stats)
