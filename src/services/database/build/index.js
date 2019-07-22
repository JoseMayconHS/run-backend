const db = require('../')
const { cars } = require('./data/cars.json')
const { pilots } = require('./data/pilots.json')
const { cylinders } = require('./data/cylinders.json')
const { engines } = require('./data/engines.json')
const { protections } = require('./data/protections.json')
const { transmissions } = require('./data/transmissions.json')
const { whells } = require('./data/whells.json')

function step1(next) {
	db.connect(err => {
		console.info(err ? `
	Connection failed!!!
	Verify: 
	  DATABASE 'run' not exists? Go to your SGBD and execute this comand 'CREATE DATABASE run;';
	  Your configurations for to connect to database are corrects? Look the documentation of mysql2 for more details.
  
	And after execute (npm run build-database || yarn build-database) again in console of project`: `Connected ${db.threadId}`)

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
		)`, [], err => console.log(err ? "Table 'engines' creation failed!!!": "Table 'engines' created successy!!!"))	

	db.query(`
		CREATE TABLE IF NOT EXISTS transmissions (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			acceleration smallint unsigned,
			speed smallint unsigned,
			turbo smallint unsigned,
			resistance smallint unsigned,
			price int not null,
			update_config varchar(200)
		)`, [], err => console.log(err ? "Table 'transmissions' creation failed!!!": "Table 'transmissions' created successy!!!"))	
		
	db.query(`
		CREATE TABLE IF NOT EXISTS whells (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			speed smallint unsigned,
			acceleration smallint unsigned,
			brake tinyint unsigned,
			price int not null,
			update_config varchar(200)
		)`, [], err => console.log(err ? "Table 'whells' creation failed!!!": "Table 'whells' created successy!!!"))
		
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
		)`, [], err => console.log(err ? "Table 'cylinders' creation failed!!!": "Table 'cylinders' created successy!!!"))

	db.query(`
		CREATE TABLE IF NOT EXISTS protections (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			resistance smallint unsigned,
			price int not null,
			update_config varchar(200)
		)`, [], err => console.log(err ? "Table 'protections' creation failed!!!": "Table 'protections' created successy!!!"))

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
		)`, [], err => console.log(err ? "Table 'cars' creation failed!!!" : "Table 'cars' created successy!!!"))

	db.query(`
		CREATE TABLE IF NOT EXISTS bots (
			id int auto_increment primary key,
			name varchar(30) unique,
			genre varchar(20) not null,
			country varchar(20),
			nvl tinyint unsigned,
			src tinytext,
			car_id int not null unique,
			foreign key (car_id) references cars (id)
		)`, [], err => console.log(err ? "Table 'boots' creation failed!!!" : "Table 'boots' created successy!!!"))	
		
	db.query(`
		CREATE TABLE IF NOT EXISTS users (
			id int auto_increment primary key,
			name varchar(30) not null,
			email varchar(50) unique not null,
			password varchar(500) not null,
			nickname varchar(15) unique not null,
			genre varchar(20) not null,
			country varchar(20) not null,
			xp int default 0,
			gold int default 99999999,
			nvl tinyint default 1,
			src varchar(3000) default 'default/default' ,
			car_id int,
			foreign key (car_id) references cars (id),
			unique key (car_id) 
		)
	`, [], err => console.log(err ? "Table 'users' creation failed!!!" : "Table 'users' created successy!!!"))		


	next()
}

function step3() {
	
	cars.forEach(({ model, engine, transmission, whells, cylinder, protection}, indice) => {
		db.query(`
			INSERT INTO cars (model, engine, transmission, whells, cylinder, protection, bot) VALUES (?, ?, ?, ?, ?, ?, 1)
		`, [model, engine, transmission, whells, cylinder, protection], err => {
			console.log(err? `${model} wasn't created`
			: `Car ${model} created = ${Math.ceil(100 * (indice + 1) / cars.length)}%`)
		})
	})

	pilots.forEach(({ name, genre, country, nvl, src, car_id }, indice) => {
		db.query(`
			INSERT INTO bots (name, genre, country, nvl, src, car_id) VALUES (?, ?, ?, ?, ?, ?)
		`, [name, genre, country, nvl, src, car_id], err => {
			console.log(err? `${name} wans't created`
			: `Pilot ${name} created = ${Math.ceil(100 * (indice + 1) / pilots.length)}%`)
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

	transmissions.forEach(({ name, acceleration, speed, turbo, resistance, update, price }, indice) => {
		db.query(`
			INSERT INTO transmissions (name, acceleration, speed, turbo, resistance, update_config, price) VALUES (?, ?, ?, ?, ?, ?, ?)
		`, [name, acceleration, speed, turbo, resistance, JSON.stringify(update), price], err => {
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


	db.end()
}

function middlewarer(...steps) {
	function stepByStep(indice) {
		steps && indice < steps.length && steps[indice](() => stepByStep(indice + 1))
	}

	stepByStep(0)
}

middlewarer(step1, step2, step3)
