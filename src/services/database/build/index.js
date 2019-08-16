const spawn = require('cross-spawn')

const db = require('../')
const { cars } = require('./data/cars.json')
const { pilots } = require('./data/pilots.json')
const { cylinders } = require('./data/cylinders.json')
const { engines } = require('./data/engines.json')
const { protections } = require('./data/protections.json')
const { transmissions } = require('./data/transmissions.json')
const { whells } = require('./data/whells.json')

const code = /^-code/.test(process.argv[2])
const start = /^-start/.test(process.argv[2])
let wall = { status: false, message: [start? 'Starting' : 'Execute npm start or yarn start'] }
console.log('open vsCode ', code)

function step1(next) {
	db.connect(err => {
		console.info(err ? `
	Connection failed!!!
	Verify: 
	  Did you create the DATABASE? Go to your SGBD and execute this comand 'CREATE DATABASE (databaseName);';
	  Your configurations for to connect to database are corrects? Look the documentation of mysql2 for more details.
  
	And after execute this comand again in console of project`: `Connected ${db.threadId}`)

		if (!err) next()
	})
}

function step2(next) {

	db.query(`
		CREATE TABLE IF NOT EXISTS engines (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			exchange tinyint unsigned,
			exchange_rates varchar(200) not null,
			speed smallint unsigned,
			acceleration smallint unsigned,
			resistance tinyint unsigned,
			turbo tinyint unsigned,
			price int not null,
			update_config varchar(200)
		)`, [], err => {
			if (err) wall = { status: true, message: ["Table -engines- not created"] }
			console.log(err ? "Table 'engines' creation failed!!!": "Table 'engines' created successy!!!")
		})	

	db.query(`
		CREATE TABLE IF NOT EXISTS transmissions (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			acceleration smallint unsigned,
			speed smallint unsigned,
			resistance smallint unsigned,
			price int not null,
			update_config varchar(200)
		)`, [], err => {
			if (err) wall = { status: true, message: [...wall.message, "Table -transmissions- not created"] }
			console.log(err ? "Table 'transmissions' creation failed!!!": "Table 'transmissions' created successy!!!")
		})	
		
	db.query(`
		CREATE TABLE IF NOT EXISTS whells (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			speed smallint unsigned,
			acceleration smallint unsigned,
			brake tinyint unsigned,
			price int not null,
			update_config varchar(200)
		)`, [], err => {
			if (err) wall = { status: true, message: [...wall.message, "Table -whells- not created"] }
			console.log(err ? "Table 'whells' creation failed!!!": "Table 'whells' created successy!!!")
		})
		
	db.query(`
		CREATE TABLE IF NOT EXISTS cylinders (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			turbo smallint unsigned,
			speed smallint unsigned,
			acceleration smallint unsigned,
			resistance smallint unsigned,
			price int not null,
			update_config varchar(200)
		)`, [], err => {
			if (err) wall = { status: true, message: [...wall.message, "Table -cylinders- not created"] }
			console.log(err ? "Table 'cylinders' creation failed!!!": "Table 'cylinders' created successy!!!")
		})

	db.query(`
		CREATE TABLE IF NOT EXISTS protections (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			resistance smallint unsigned,
			price int not null,
			update_config varchar(200)
		)`, [], err => {
			if (err) wall = { status: true, message: [...wall.message, "Table -protections- not created"] }
			console.log(err ? "Table 'protections' creation failed!!!": "Table 'protections' created successy!!!")
		})

	db.query(`
	  CREATE TABLE IF NOT EXISTS cars (
			id int auto_increment primary key,
			model varchar(15) not null unique,
			engine varchar(30) default 'v1 Pure' not null,
			engine_object varchar(3000),
			transmission varchar(30) default 't-1 Pure' not null,
			transmission_object varchar(3000),
			whells varchar(30) default 'w-1 Pure' not null,
			whells_object varchar(3000),
			cylinder varchar(30) default 'Cylinder 0.1' not null,
			cylinder_object varchar(3000),
			protection varchar(30) default 'p-1 Hard' not null,
			protection_object varchar(3000),
			bot smallint default 0
		)`, [], err => {
			if (err) wall = { status: true, message: [...wall.message, "Table -cars- not created"] }
			console.log(err ? "Table 'cars' creation failed!!!" : "Table 'cars' created successy!!!")
		})

	db.query(`
		CREATE TABLE IF NOT EXISTS bots (
			id int auto_increment primary key,
			nickname varchar(30) unique,
			genre varchar(20) not null,
			country varchar(20),
			nvl tinyint unsigned,
			src tinytext,
			car_id int not null unique,
			foreign key (car_id) references cars (id)
		)`, [], err => {
			if (err) wall = { status: true, message: [...wall.message, "Table -bots- not created"] }
			console.log(err ? "Table 'bots' creation failed!!!" : "Table 'bots' created successy!!!")
		})	
		
	db.query(`
		CREATE TABLE IF NOT EXISTS users (
			id int auto_increment primary key,
			name varchar(30) not null,
			email varchar(50) unique not null,
			password varchar(500) not null,
			nickname varchar(15) unique not null,
			genre varchar(20) not null,
			country varchar(20) not null,
			xp bigint default 2,
			limit_xp bigint default 200,
			gold int default 100000,
			nvl tinyint default 1,
			src varchar(3000) default 'pilots/default' ,
			car_id int,
			foreign key (car_id) references cars (id),
			unique key (car_id) 
		)
	`, [], err => {
		if (err) wall = { status: true, message: [...wall.message, "Table -users- not created"] }
		console.log(err ? "Table 'users' creation failed!!!" : "Table 'users' created successy!!!")
	})		

	next()
}

function step3(next) {
	
	cars.forEach(({ model, engine, transmission, whells, cylinder, protection}, indice) => {
		db.query(`
			INSERT INTO cars (model, engine, transmission, whells, cylinder, protection, bot) VALUES (?, ?, ?, ?, ?, ?, 1)
		`, [model, engine, transmission, whells, cylinder, protection], err => {
			console.log(err? `${model} wasn't created`
			: `Car ${model} created = ${Math.ceil(100 * (indice + 1) / cars.length)}%`)
		})
	})

	pilots.forEach(({ nickname, genre, country, nvl, src, car_id }, indice) => {
		db.query(`
			INSERT INTO bots (nickname, genre, country, nvl, src, car_id) VALUES (?, ?, ?, ?, ?, ?)
		`, [nickname, genre, country, nvl, src, car_id], err => {
			console.log(err? `${nickname} wans't created`
			: `Pilot ${nickname} created = ${Math.ceil(100 * (indice + 1) / pilots.length)}%`)
		})
	})

	engines.forEach(({ name, exchange, exchange_rates, speed, acceleration, resistance, turbo, update, price }, indice) => {
		db.query(`
			INSERT INTO engines (name, exchange, exchange_rates, speed, acceleration, resistance, turbo, update_config, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, [name, exchange, JSON.stringify(exchange_rates), speed, acceleration, resistance, turbo, JSON.stringify(update), price], err => {
			console.log(err? `${name} wans't created`
			: `Engine ${name} created = ${Math.ceil(100 * (indice + 1) / engines.length)}%`)
		})
	})

	transmissions.forEach(({ name, acceleration, speed, resistance, update, price }, indice) => {
		db.query(`
			INSERT INTO transmissions (name, acceleration, speed, resistance, update_config, price) VALUES (?, ?, ?, ?, ?, ?)
		`, [name, acceleration, speed, resistance, JSON.stringify(update), price], err => {
			console.log(err? `${name} wasn't created`
			: `Transmission ${name} created = ${Math.ceil(100 * (indice + 1) / transmissions.length)}%`)
		})
	})

	whells.forEach(({ name, speed, acceleration, brake, update, price }, indice) => {
		db.query(`
			INSERT INTO whells (name, speed, acceleration, brake, update_config, price) VALUES (?, ?, ?, ?, ?, ?)
		`, [name, speed, acceleration, brake, JSON.stringify(update), price], err => {
			console.log(err? `${name} wasn't created`
			: `Whells ${name} created = ${Math.ceil(100 * (indice + 1) / whells.length)}%`)
		})
	})

	cylinders.forEach(({ name, turbo, speed, acceleration, resistance, update, price }, indice) => {
		db.query(`
			INSERT INTO cylinders (name, turbo, speed, acceleration, resistance, update_config, price) VALUES (?, ?, ?, ?, ?, ?, ?)
		`, [name, turbo, speed, acceleration, resistance, JSON.stringify(update), price], err => {
			console.log(err? `${name} wasn't created`
			: `Cylinder ${name} created = ${Math.ceil(100 * (indice + 1) / cylinders.length)}%`)
		})
	})

	protections.forEach(({ name, resistance, update, price }, indice) => {
		db.query(`
			INSERT INTO protections (name, resistance, update_config, price) VALUES (?, ?, ?, ?)
		`, [name, resistance, JSON.stringify(update), price], err => {
			console.log(err? `${name} wans't created`
			: `Protection ${name} created = ${Math.ceil(100 * (indice + 1) / protections.length)}%`)
		})
	})


	next()
}

function step4() {
	const partsName = ['engine', 'transmission', 'whells', 'cylinder', 'protection']
	cars.forEach((car, index) => {
		partsName.forEach((field, index2) => {
			const schema = field.charAt(field.length - 1) === 's'? field: field + 's'
			db.query(`SELECT * FROM ${schema} WHERE name = '${car[field]}'`, [], (err, result) => {
				if (err) return console.log('Error em buscar os objetos das peças')

				const p = result[0]
				let object = {}

				if (schema === 'engines') {
					object = { exchange: p.exchange, exchange_rates: JSON.parse(p.exchange_rates), speed: p.speed, acceleration: p.acceleration, resistance: p.resistance, turbo: p.turbo, update_config: JSON.parse(p.update_config), ups: 0, price: p.price }
				}
				if (schema === 'transmissions') {
					object = { acceleration: p.acceleration, speed: p.speed, resistance: p.resistance, update_config: JSON.parse(p.update_config), ups: 0, price: p.price }
				}
				if (schema === 'cylinders') {
					object = { turbo: p.turbo, speed: p.speed, acceleration: p.acceleration, resistance: p.resistance, update_config: JSON.parse(p.update_config), ups: 0, price: p.price }
				}
				if (schema === 'whells') {
					object = { speed: p.speed, acceleration: p.acceleration, brake: p.brake, update_config: JSON.parse(p.update_config), ups: 0, price: p.price }
				}
				if (schema === 'protections') {
					object = { resistance: p.resistance, update_config: JSON.parse(p.update_config), ups: 0, price: p.price }
				}

				db.query(`UPDATE cars SET ${field}_object = '${JSON.stringify(object)}' WHERE model = '${car.model}'` , [], err => {
					!err && index2 === 4 && console.log(`Car ${car.model} finished = ${Math.ceil(100 * (index + 1) / cars.length)}%`)

					index + 1 === cars.length && index2 === 4 && db.end(err => {
						console.log({ status: wall.status? 'Error': 'Ready', messages: code? 'Opening vsCode' : wall.message.join(', ') })
						err == undefined && !wall.status && code && spawn.sync('code', ['.'])
					})
				})
			})
		})
	})
}

function middlewarer(...steps) {
	function stepByStep(indice) {
		steps && indice < steps.length && steps[indice](() => stepByStep(indice + 1))
	}

	stepByStep(0)
}

middlewarer(step1, step2, step3, step4)
