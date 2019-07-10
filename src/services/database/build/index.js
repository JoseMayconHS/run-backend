const db = require('../')
const cars = require('./data/cars.json')
const pilots = require('./data/pilots.json')
const parts = require('./data/parts.json')
const countries = require('./data/countries.json')

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
		CREATE TABLE IF NOT EXISTS countries (
			id int auto_increment primary key,
			name varchar(30) unique,
			continent varchar(2)
		)`, [], err => console.log(err ? "Table 'countries' creation failed!!!" : "Table 'countries' created successy!!!"))

	db.query(`
		CREATE TABLE IF NOT EXISTS boots (
			id int auto_increment primary key,
			name varchar(30) unique,
			genre char(1),
			country varchar(15),
			nvl tinyint unsigned,
			src tinytext
		)`, [], err => console.log(err ? "Table 'boots' creation failed!!!" : "Table 'boots' created successy!!!"))

	db.query(`
		CREATE TABLE IF NOT EXISTS engines (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			exchange tinyint unsigned,
			exchange_rates varchar(200) not null,
			speed smallint unsigned,
			acceleration smallint unsigned,
			resistance tinyint unsigned,
			turbo tinyint unsigned
		)`, [], err => console.log(err ? "Table 'engines' creation failed": "Table 'engines' created successy!!!"))	

	db.query(`
		CREATE TABLE IF NOT EXISTS transmissions (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			acceleration smallint unsigned,
			speed smallint unsigned,
			turbo smallint unsigned,
			resistance smallint unsigned
		)`, [], err => console.log(err ? "Table 'transmissions' creation failed": "Table 'transmissions' created successy!!!"))	
		
	db.query(`
		CREATE TABLE IF NOT EXISTS whells (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			speed smallint unsigned,
			acceleration smallint unsigned,
			brake tinyint unsigned
		)`, [], err => console.log(err ? "Table 'whells' creation failed": "Table 'whells' created successy!!!"))
		
	db.query(`
		CREATE TABLE IF NOT EXISTS cylinders (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			turbo smallint unsigned,
			speed smallint unsigned,
			acceleration smallint unsigned,
			resistance smallint unsigned
		)`, [], err => console.log(err ? "Table 'cylinders' creation failed": "Table 'cylinders' created successy!!!"))

	db.query(`
		CREATE TABLE IF NOT EXISTS protections (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			resistance smallint unsigned
		)`, [], err => console.log(err ? "Table 'protections' creation failed": "Table 'protections' created successy!!!"))

	db.query(`
	  CREATE TABLE IF NOT EXISTS cars (
			id int auto_increment primary key,
			model varchar(15) not null unique,
			engine int,
			transmission int,
			whells int,
			cylinder int,
			protection int
		)`, [], err => console.log(err ? "Table 'cars' creation failed!!!" : "Table 'cars' created successy!!!"))
		
	db.query(`
		CREATE TABLE IF NOT EXISTS users (
			id int auto_increment primary key,
			name varchar(30) not null,
			email varchar(50) unique not null,
			password varchar(250) not null,
			nickname varchar(15) unique not null,
			genre varchar(1) not null,
			country varchar(20) not null,
			xp int,
			nvl tinyint,
			src varchar(255),
			car_id int,
			foreign key (car_id) references cars(id)
		)
	`, [], err => console.log(err ? "Table 'users' creation failed!!!" : "Table 'users' created successy!!!"))		


	next()
}

function step3() {
	
	countries.countries.forEach(({ name, cn }, indice) => {
		db.query(`
			INSERT INTO countries (name, continent) VALUES (?, ?)
		`, [name, cn], err => {
			console.log(err? `${name} wasn't created`
			: `Country ${name} created = ${Math.ceil(100 * (indice + 1) / countries.countries.length)}%`)
		})
	})
	
	cars.cars.forEach(({ model, engine, transmission, whells, cylinder, protection }, indice) => {
		db.query(`
			INSERT INTO cars (model, engine, transmission, whells, cylinder, protection) VALUES (?, ?, ?, ?, ?, ?)
		`, [model, engine, transmission, whells, cylinder, protection], err => {
			console.log(err? `${model} wasn't created`
			: `Car ${model} created = ${Math.ceil(100 * (indice + 1) / cars.cars.length)}%`)
		})
	})

	pilots.pilots.forEach(({ name, genre, country, nvl, src }, indice) => {
		db.query(`
			INSERT INTO boots (name, genre, country, nvl, src) VALUES (?, ?, ?, ?, ?)
		`, [name, genre, country, nvl, src], err => {
			console.log(err? `${name} wans't created`
			: `Pilot ${name} created = ${Math.ceil(100 * (indice + 1) / pilots.pilots.length)}%`)
		})
	})

	parts.parts.engines.forEach(({ name, exchange, exchange_rates, speed, acceleration, resistance, turbo }, indice) => {
		db.query(`
			INSERT INTO engines (name, exchange, exchange_rates, speed, acceleration, resistance, turbo) VALUES (?, ?, ?, ?, ?, ?, ?)
		`, [name, exchange, exchange_rates, speed, acceleration, resistance, turbo], err => {
			console.log(err? `${name} wans't created`
			: `Engine ${name} created = ${Math.ceil(100 * (indice + 1) / parts.parts.engines.length)}%`)
		})
	})

	parts.parts.transmissions.forEach(({ name, acceleration, speed, turbo, resistance }, indice) => {
		db.query(`
			INSERT INTO transmissions (name, acceleration, speed, turbo, resistance) VALUES (?, ?, ?, ?, ?)
		`, [name, acceleration, speed, turbo, resistance], err => {
			console.log(err? `${name} wasn't created`
			: `Transmission ${name} created = ${Math.ceil(100 * (indice + 1) / parts.parts.transmissions.length)}%`)
		})
	})

	parts.parts.whells.forEach(({ name, speed, acceleration, brake }, indice) => {
		db.query(`
			INSERT INTO whells (name, speed, acceleration, brake) VALUES (?, ?, ?, ?)
		`, [name, speed, acceleration, brake], err => {
			console.log(err? `${name} wasn't created`
			: `Whells ${name} created = ${Math.ceil(100 * (indice + 1) / parts.parts.whells.length)}%`)
		})
	})

	parts.parts.cylinders.forEach(({ name, turbo, speed, acceleration, resistance }, indice) => {
		db.query(`
			INSERT INTO cylinders (name, turbo, speed, acceleration, resistance) VALUES (?, ?, ?, ?, ?)
		`, [name, turbo, speed, acceleration, resistance], err => {
			console.log(err? `${name} wasn't created`
			: `Cylinder ${name} created = ${Math.ceil(100 * (indice + 1) / parts.parts.cylinders.length)}%`)
		})
	})

	parts.parts.protections.forEach(({ name, resistance }, indice) => {
		db.query(`
			INSERT INTO protections (name, resistance) VALUES (?, ?)
		`, [name, resistance], err => {
			console.log(err? `${name} wans't created`
			: `Protection ${name} created = ${Math.ceil(100 * (indice + 1) / parts.parts.protections.length)}%`)
		})
	})


	db.end()
}

function middewares(...steps) {
	function stepByStep(indice) {
		steps && indice < steps.length && steps[indice](() => stepByStep(indice + 1))
	}

	stepByStep(0)
}

middewares(step1, step2, step3)
