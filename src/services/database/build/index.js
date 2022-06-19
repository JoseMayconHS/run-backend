const spawn = require("cross-spawn");
const ProgressBar = require("progress");

const db = require("../");
if (!db) process.exit();
const { cars } = require("./data/cars.json");
const { pilots } = require("./data/pilots.json");
const { cylinders } = require("./data/cylinders.json");
const { engines } = require("./data/engines.json");
const { protections } = require("./data/protections.json");
const { transmissions } = require("./data/transmissions.json");
const { whells } = require("./data/whells.json");

const total =
  cars.length * 6 +
  pilots.length +
  cylinders.length +
  engines.length +
  protections.length +
  transmissions.length +
  whells.length +
  9;

const bar = new ProgressBar("progresso: [:bar]:percent :msg", {
  total,
  complete: "=",
  incomplete: " ",
  width: 40,
});
const timer = setInterval(() => {
  if (bar.complete) {
    clearInterval(timer);
  }
}, 100);

const code = /^-code/.test(process.argv[2]);
const start = /^-dev/.test(process.argv[2]);
let wall = {};
console.log(`Abrir VsCode (${code ? "SIM" : "NÃO"})`);

function step1(next) {
  db.connect((err) => {
    console.info(
      err
        ? `
	A conexão falhou!!!
	Vefirique:
	  Você criou o banco de dados? Vá ao seu SGBD e crie um banco de dados 'CREATE DATABASE *nomeDoBanco*;'; \n
	  Suas configurações de conexão estão corretas? :/ \n
	  Depois execute esse comando novamente`
        : "Conectado"
    );

    if (!err) return next();

    process.exit();
  });
}

function step2(next) {
  db.query(
    `
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
		)`,
    [],
    (err) => {
      if (err) {
        wall = { status: true, message: "Tabela -engines- não foi criada" };
        finish();
      } else {
        bar.tick({
          msg: "Criando as tabelas",
        });
      }
    }
  );

  db.query(
    `
		CREATE TABLE IF NOT EXISTS transmissions (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			acceleration smallint unsigned,
			speed smallint unsigned,
			resistance smallint unsigned,
			price int not null,
			update_config varchar(200)
		)`,
    [],
    (err) => {
      if (err) {
        wall = {
          status: true,
          message: "Tabela -transmissions- não foi criada",
        };
        finish();
      } else {
        bar.tick();
      }
    }
  );

  db.query(
    `
		CREATE TABLE IF NOT EXISTS whells (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			speed smallint unsigned,
			acceleration smallint unsigned,
			brake tinyint unsigned,
			price int not null,
			update_config varchar(200)
		)`,
    [],
    (err) => {
      if (err) {
        wall = { status: true, message: "Tabela -whells- não foi criada" };
        finish();
      } else {
        bar.tick();
      }
    }
  );

  db.query(
    `
		CREATE TABLE IF NOT EXISTS cylinders (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			turbo smallint unsigned,
			speed smallint unsigned,
			acceleration smallint unsigned,
			resistance smallint unsigned,
			price int not null,
			update_config varchar(200)
		)`,
    [],
    (err) => {
      if (err) {
        wall = { status: true, message: "Tabela -cylinders- não foi criada" };
        finish();
      } else {
        bar.tick();
      }
    }
  );

  db.query(
    `
		CREATE TABLE IF NOT EXISTS protections (
			id int auto_increment primary key,
			name varchar(15) not null unique,
			resistance smallint unsigned,
			price int not null,
			update_config varchar(200)
		)`,
    [],
    (err) => {
      if (err) {
        wall = { status: true, message: "Tabela -protections- não foi criada" };
        finish();
      } else {
        bar.tick();
      }
    }
  );

  db.query(
    `
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
		)`,
    [],
    (err) => {
      if (err) {
        wall = { status: true, message: "Tabela -cars- não foi criada" };
        finish();
      } else {
        bar.tick();
      }
    }
  );

  db.query(
    `
		CREATE TABLE IF NOT EXISTS bots (
			id int auto_increment primary key,
			nickname varchar(30) unique,
			genre varchar(20) not null,
			country varchar(20),
			nvl tinyint unsigned,
			src tinytext,
			car_id int not null unique,
			foreign key (car_id) references cars (id)
		)`,
    [],
    (err) => {
      if (err) {
        wall = { status: true, message: "Tabela -bots- não foi criada" };
        finish();
      } else {
        bar.tick();
      }
    }
  );

  db.query(
    `
		CREATE TABLE IF NOT EXISTS users (
			id int auto_increment primary key,
			name varchar(30) not null,
			email varchar(50) unique not null,
			password varchar(500) not null,
			nickname varchar(15) unique not null,
			genre varchar(20) not null,
			country varchar(20) not null,
			xp bigint default 0,
			limit_xp bigint default 200,
			gold int default 200000,
			nvl tinyint default 1,
			src varchar(3000) default 'pilots/default' ,
			car_id int,
			foreign key (car_id) references cars (id),
			unique key (car_id)
		)
	`,
    [],
    (err) => {
      if (err) {
        wall = { status: true, message: "Tabela -users- não foi criada" };
        finish();
      } else {
        bar.tick();
      }
    }
  );

  next();
}

function step3(next) {
  cars.forEach(
    ({ model, engine, transmission, whells, cylinder, protection }, indice) => {
      db.query(
        `
			INSERT INTO cars (model, engine, transmission, whells, cylinder, protection, bot) VALUES (?, ?, ?, ?, ?, ?, 1)
		`,
        [model, engine, transmission, whells, cylinder, protection],
        (err) => {
          if (err) {
            wall = { status: true, message: "Erro ao inserir carros" };
            finish();
          } else {
            bar.tick({
              msg: "Inserindo carros",
            });
          }
        }
      );
    }
  );

  pilots.forEach(({ nickname, genre, country, nvl, src, car_id }, indice) => {
    db.query(
      `
			INSERT INTO bots (nickname, genre, country, nvl, src, car_id) VALUES (?, ?, ?, ?, ?, ?)
		`,
      [nickname, genre, country, nvl, src, car_id],
      (err) => {
        if (err) {
          wall = { status: true, message: "Erro ao inserir pilotos" };
          finish();
        } else {
          bar.tick({
            msg: "Inserindo pilotos",
          });
        }
      }
    );
  });

  engines.forEach(
    (
      {
        name,
        exchange,
        exchange_rates,
        speed,
        acceleration,
        resistance,
        turbo,
        update,
        price,
      },
      indice
    ) => {
      db.query(
        `
			INSERT INTO engines (name, exchange, exchange_rates, speed, acceleration, resistance, turbo, update_config, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
        [
          name,
          exchange,
          JSON.stringify(exchange_rates),
          speed,
          acceleration,
          resistance,
          turbo,
          JSON.stringify(update),
          price,
        ],
        (err) => {
          if (err) {
            wall = { status: true, message: "Erro ao inserir motores" };
            finish();
          } else {
            bar.tick({
              msg: "Inserindo motores",
            });
          }
        }
      );
    }
  );

  transmissions.forEach(
    ({ name, acceleration, speed, resistance, update, price }, indice) => {
      db.query(
        `
			INSERT INTO transmissions (name, acceleration, speed, resistance, update_config, price) VALUES (?, ?, ?, ?, ?, ?)
		`,
        [name, acceleration, speed, resistance, JSON.stringify(update), price],
        (err) => {
          if (err) {
            wall = { status: true, message: "Erro ao inserir transmissões" };
            finish();
          } else {
            bar.tick({
              msg: "Inserindo transmissões",
            });
          }
        }
      );
    }
  );

  whells.forEach(
    ({ name, speed, acceleration, brake, update, price }, indice) => {
      db.query(
        `
			INSERT INTO whells (name, speed, acceleration, brake, update_config, price) VALUES (?, ?, ?, ?, ?, ?)
		`,
        [name, speed, acceleration, brake, JSON.stringify(update), price],
        (err) => {
          if (err) {
            wall = { status: true, message: "Erro ao inserir rodas" };
            finish();
          } else {
            bar.tick({
              msg: "Inserindo rodas",
            });
          }
        }
      );
    }
  );

  cylinders.forEach(
    (
      { name, turbo, speed, acceleration, resistance, update, price },
      indice
    ) => {
      db.query(
        `
			INSERT INTO cylinders (name, turbo, speed, acceleration, resistance, update_config, price) VALUES (?, ?, ?, ?, ?, ?, ?)
		`,
        [
          name,
          turbo,
          speed,
          acceleration,
          resistance,
          JSON.stringify(update),
          price,
        ],
        (err) => {
          if (err) {
            wall = { status: true, message: "Erro ao inserir cilindros" };
            finish();
          } else {
            bar.tick({
              msg: "Inserindo cilindros",
            });
          }
        }
      );
    }
  );

  protections.forEach(({ name, resistance, update, price }, indice) => {
    db.query(
      `
			INSERT INTO protections (name, resistance, update_config, price) VALUES (?, ?, ?, ?)
		`,
      [name, resistance, JSON.stringify(update), price],
      (err) => {
        if (err) {
          wall = { status: true, message: "Erro ao inserir proteções" };
          finish();
        } else {
          bar.tick({
            msg: "Inserindo proteções",
          });
        }
      }
    );
  });

  next();
}

function step4() {
  const partsName = [
    "engine",
    "transmission",
    "whells",
    "cylinder",
    "protection",
  ];
  cars.forEach((car, index) => {
    partsName.forEach((field, index2) => {
      const schema =
        field.charAt(field.length - 1) === "s" ? field : field + "s";
      db.query(
        `SELECT * FROM ${schema} WHERE name = '${car[field]}'`,
        [],
        (err, result) => {
          if (err) {
            wall = { status: true, message: "Erro ao buscar peças" };
            finish();
          }

          const p = result[0];
          let object = {};

          if (schema === "engines") {
            object = {
              exchange: p.exchange,
              exchange_rates: JSON.parse(p.exchange_rates),
              speed: p.speed,
              acceleration: p.acceleration,
              resistance: p.resistance,
              turbo: p.turbo,
              update_config: JSON.parse(p.update_config),
              ups: 0,
              price: p.price,
            };
          }
          if (schema === "transmissions") {
            object = {
              acceleration: p.acceleration,
              speed: p.speed,
              resistance: p.resistance,
              update_config: JSON.parse(p.update_config),
              ups: 0,
              price: p.price,
            };
          }
          if (schema === "cylinders") {
            object = {
              turbo: p.turbo,
              speed: p.speed,
              acceleration: p.acceleration,
              resistance: p.resistance,
              update_config: JSON.parse(p.update_config),
              ups: 0,
              price: p.price,
            };
          }
          if (schema === "whells") {
            object = {
              speed: p.speed,
              acceleration: p.acceleration,
              brake: p.brake,
              update_config: JSON.parse(p.update_config),
              ups: 0,
              price: p.price,
            };
          }
          if (schema === "protections") {
            object = {
              resistance: p.resistance,
              update_config: JSON.parse(p.update_config),
              ups: 0,
              price: p.price,
            };
          }

          db.query(
            `UPDATE cars SET ${field}_object = '${JSON.stringify(
              object
            )}' WHERE model = '${car.model}'`,
            [],
            (err) => {
              if (err) {
                wall = { status: true, message: "Erro ao mesclar peça" };
                finish();
              } else {
                bar.tick({
                  msg: "Montando carros",
                });
              }
              index + 1 === cars.length &&
                index2 === 4 &&
                (() => {
                  !wall.status && code && spawn.sync("code", ["."]);
                  bar.tick({
                    msg: "Finalizado",
                  });
                  finish();
                })();
            }
          );
        }
      );
    });
  });
}

function finish() {
  console.log("\n", {
    status: wall.status
      ? "Ocorreu um erro (DELETE e CRIE o banco novamente)"
      : "OK",
    messages: wall.status
      ? wall.message
      : start
      ? "Inicializando"
      : code
      ? "Abrindo o VsCode..."
      : "Execute npm start ou yarn start",
  });
  bar.curr !== total &&
    (() => {
      console.log(
        "\x1b[41m",
        "\x1b[37m",
        "Banco de dados incompleto!",
        "\x1b[0m"
      );
      clearInterval(timer);
    })();

  process.exit();
}

function middlewer(...steps) {
  function stepByStep(indice) {
    steps &&
      indice < steps.length &&
      steps[indice](() => stepByStep(indice + 1));
  }

  stepByStep(0);
}

middlewer(step1, step2, step3, step4);
