const { Schema, model } = require('mongoose')

const Stats = new Schema({
	users: Number,
	bots: Number
}, {
	timestamps: true
})

// Stats.pre('save', async next => {

// 	const stats = await Stats.findOne()

// 	if 
// 	Stats.remove({ sort: { 'createdAt': -1 } }, )

// 	next()
// })

module.exports = model('stats', Stats)
