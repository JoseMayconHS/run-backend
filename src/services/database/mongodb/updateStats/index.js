const Stats = require('./Schema')
const { selectAny } = require('../../mysql/sqlQuery/select')
let c = 0

setInterval(async () => {

 const stats = await Stats.findOne({}, {}, { sort: { 'createdAt': -1 } })

 if (stats) {
 	const users = await selectAny('users', 'id')
 	
 	const bots = await selectAny('bots', 'id')

 	if (users.length !== stats.users || bots.length !== stats.bots) {

 		await Stats.updateOne({ _id: stats._id }, {
	 		users: users.length,
	 		bots: bots.length
	 	})
	 	console.log('Status atualizados!')
 	}
 } else {
 	Stats.create({
 		users: 0,
 		bots: 0
 	})
 }
}, 10000)
