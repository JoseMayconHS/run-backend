const db = require('../')
const { destructingObjects } = require('../functions')

function select(table = String, where = Object, ...selects) {
	return new Promise(resolve => {
		const queryWhere = destructingObjects(where, ' AND ')			
	
		db.query(`SELECT ${selects} FROM ${table} WHERE ${queryWhere}`, [], (err, result) => resolve(result))
	})
}

function selectAny(table = String, ...params) {
	return new Promise(resolve => {
		db.query(`SELECT ${params} FROM ${table}`, [], (err, result) =>	resolve(result))
	})
}

async function selectWhere(table = String, where = Object, ...selects) {
	const elements = await select(table, where, ...selects)

	return elements.length? elements: { warning: 'Ninguém encontrado!' }
}

function selectAdversary(nvl = Number, i = Number) {
  const advs = nvl => {
    if (nvl < 15) return 1
    if (nvl < 25) return 2
    if (nvl < 40) return 3
    return 4
  }
  return new Promise(resolve => {
    db.query(`SELECT * FROM bots WHERE nvl >= ${nvl - 5} AND nvl <= ${nvl + 5}`, [], (err, resultsBots) => {
        db.query(`SELECT * FROM users WHERE nvl >= ${nvl - 5} AND nvl <= ${nvl + 5} AND id != ${i}`, [], async (err, resultsUsers) => {
          const tot = resultsBots.concat(resultsUsers)
          let loop = 0
          let bots = ''
          const result = []
          do {
            const i = String(Math.floor(Math.random() * tot.length))
            bots.indexOf(i) === -1 && (function() {
              result.push({ pilot: tot[Number(i)] })
              bots += i
              loop++
            })()
          } while (loop < advs(nvl))
          const allAdvs = await selectCarsOfAdversary(result)      
          resolve(allAdvs)
        })
      }
    )}
  )
}

function selectCarsOfAdversary(advs = Array) {
  return new Promise(resolve => {
    const res = []
    advs.forEach(async (obj, index) => {
      const [ car ] = await selectWhere('cars', { id: obj.pilot.car_id }, '*')
      res.push({
        ...obj,
        car
      })
      index === advs.length - 1 && resolve(res)
    }) 
  })
}

function sign(email = String) {
	return new Promise(resolve => {
		db.query(`SELECT id, password FROM users WHERE email = '${email}'`, [], (err, user) => {
			if (err) return resolve({ status: false, message: 'Erro na consulta' })

			if (!user.length) return resolve({ status: false, message: 'Usuário não encontrado' })

			resolve({ status: true, message: user[0] })
		})
	})
}

async function getTheParts({ engine, transmission, cylinder, whells, protection } = Object) {
  return new Promise(resolve => {
    function ready(obj = Object) {
      Object.values(obj).forEach(part => part.update_config = JSON.parse(part.update_config))
  
      resolve(obj)
    }
    
    let parts = {}
  
    function getEngine(next) {
      if (engine) return db.query(`SELECT * FROM engines WHERE name = '${engine}'`, [], (err, result) => {
  
          result[0].exchange_rates = JSON.parse(result[0].exchange_rates)
          parts = { ...parts, engine: result[0] }
    
          next()
        })

      next()  
    }
  
    function getTransmission(next) {
      if (transmission) return db.query(`SELECT * FROM transmissions WHERE name = '${transmission}'`, [], (err, result) => {
          parts = { ...parts, transmission: result[0] }
    
          next()
        })

      next()  
    }
  
    function getCylinder(next) {
      if (cylinder) return db.query(`SELECT * FROM cylinders WHERE name = '${cylinder}'`, [], (err, result) => {
          parts = { ...parts, cylinder: result[0] }
    
          next()
        })

      next()  
    }
  
    function getWhells(next) {
      if (whells) return db.query(`SELECT * FROM whells WHERE name = '${whells}'`, [], (err, result) => {
        parts = { ...parts, whells: result[0] }
  
        next()
      })

      next()  
    }
  
    function getProtection() {
      if (protection) return db.query(`SELECT * FROM protections WHERE name = '${protection}'`, [], (err, result) => {
          parts = { ...parts, protection: result[0] }
    
          ready(parts)
        })

      ready(parts)  
    }

    function stepsBySteps(...steps) {
      function start(indice) {
        steps && indice < steps.length && steps[indice](() => start(indice + 1))
      }

      start(0)
    }

    stepsBySteps(getEngine, getTransmission, getCylinder, getWhells, getProtection)
  })
}

module.exports = { select, selectAny, selectWhere, sign, getTheParts, selectAdversary }
