# Run-Back-end
API developed in NodeJs (Back-end of Run-Front-end)

# Features
- API with MYSQL integration;
- Authentications;
- Database query functions are in a single sql.js file;
- Command that runs a file that opens the connection, creates the tables, inserts default records, and closes the connection. Build the foundation for the front-end project to work.

# Dependencies used
- API `express`
- Authentications `jsonwebtoken`
- Database  `mysql2`
- encryption `bcryptjs`
- understand the requisitions `body-parser`
- make external access `cors`


# Steps
1. Create a database in MYSQL;
2. Inside the project folder, access the .env file -> src/services/database/.env
3. Make the settings for connecting your database;
4. Run the `yarn build-database` or `npm run build-database` command on the terminal and verify that all tables have been created and that all base records have been entered;
5. Finally run the command again in the terminal `yarn start` or `npm start`

# Endpoints
- get('/getAll/:table') = getAll / and the name of the table you want to fetch. This is equivalent to `SELECT * FROM`: table. Example: `/getAll/boots`, Returns the name of the searched table and all records in it;
>{ table = String / data = Array / data[index] = Object }


    async getAll(req, res) {
       const table = req.params.table
    
       const data = await selectAny(table, '*')
    
       res.status(200).json({ table, data })
    }

- get('/getWhere?:query') = getWhere? and a sequence of `key=value`. The function responsible for this endpoint will transform this into a valid query. **table=tableName** is required. Example: `/getWhere?table=boots&id=1`,
This returns the name of the table, the constraints of the query, and the result;

>{ table = String / where = Object / data = Array / data[index] = Object }


    async getWhere(req, res) {
       const table = req.query.table
       delete req.query.table
       const where = req.query
    
       const data = await selectWhere(table, where, '*')
    		
       res.status(200).json({ table, where, data })
    }
- get('/getAllParts') = getAllParts returns all the pieces to the cars.
>{ data = Object / data.nameOfPieces = Array / data.nameOfPieces[index] = Object }


    async parts(req, res) {
       const engines = await selectAny('engines', '*')
       const transmissions = await selectAny('transmissions', '*')
       const whells = await selectAny('whells', '*')
       const cylinders = await selectAny('cylinders', '*')
       const protections = await selectAny('protections', '*')
    
       function getObject(str) {
          const strReady = str.replace(/'/g, '"')
    
          return JSON.parse(strReady)
       }
    
       engines.forEach(engine => {
          engine.exchange_rates = getObject(engine.exchange_rates)
       })
    
       res.status(200).json({ data: { engines, transmissions, whells, cylinders, protections } })
    }
- get('/getAllBots') = getAllBots returns all cars and pilots to avoid two API calls
> { data = Object / data.boots and data.cars = Array / data.boots[index] and data.cars[index] = Object }


    async boots(req, res) {
       const boots = await selectAny('boots', '*')
       const cars = await selectAny('cars', '*')
    
       res.status(200).json({ data: { boots, cars } })
    }
- post('/insert/:table') = insert/:table is used to insert into any of the tables.
Returns the state, if true, the insert was successful, and a message.
> { status = Boolean / message = String }

**Attention: When requesting this route, in the body of the request, the data must be in its proper position.**
> users: [name, email, password, nickname, genre, country, xp, nvl, src]

> cars: [model, engine, transmission, whells, cylinder, protection]

> boots: [name, genre, country, nvl, src]

> engines: [name, exchange, exchange_rates, speed, acceleration, resistance, turbo]

> transmissions: [name, acceleration, speed, turbo, resistance] 

> whells: [name, speed, acceleration, brake]

> cylinders: [name, turbo, speed, acceleration, resistance]

> protections: [name, resistance]

  

    async insert(req, res) {
        const table = req.params.table
    
        try {
           if (table === 'users') {
             const passwordCypted = await bcryptjs.hash(req.body.password, 10)
    
             req.body.password = passwordCypted
           }
    
           const values = Object.values(req.body)
        
           let result = await insert(table, getFields(table), values)
        
           if (!result.status) return res.status(200).json(result)
    
           if (result.status && table === 'users') {
             const newUser = await selectWhere('users', { email: req.body.email }, 'id')
    
             result.message = gerarToken({ _id: newUser[0].id }, secret)
           }
    
           res.status(200).json({ status: result.status, message: result.message })
        } catch(e) {
           res.status(500).send()
        }
     }
- post('/login') = /login route to the login, receives only an email and a password. Returns status and token in message...
> { status = Boolean / message = String }


    async login(req, res) {
        const { email, password } = req.body
    
        const result = await sign(email)
    
        if (!result.status) return res.status(200).json(result)
    
        if (!await bcryptjs.compare(password, result.message.password)) return res.status(200).json({ status: false, message: 'Senha inválida' })
    
        const token = gerarToken({ _id: result.message.id })
    
        res.status(200).json({ status: true, message: token })
     }
- post('/auth') = /auth route to check the token and return the logged on user.
> { status: Boolean / user = Object / message = String }


    auth(req, res) {
        const token = req.headers.authorization || false
    
        verifyToken(token, async validation => {
           try {       
              if (!validation.status) return res.status(200).json(validation)
    
              const user = await selectWhere('users', { id: validation.message }, '*')
    
              user[0].password = undefined
    
              res.status(200).json({ status: true, user: user[0], message: `${user[0].nickname} conectado!` })
           } catch (e) {
              res.status(500).send()
           }
        })    
     }
- put('/update?:settings') = /update? and a `key=value` sequence, it is only necessary to pass the table name and id. Example: `?table=users&id=2`. Returns the status and a message in a object `result `.
> { result = Object / status = Boolean / message = String }


    async updateTupla(req, res) {
        const settings = req.body
        const { table, id } = req.query
    
        const result = await update(table, settings, { id })
        
        if (!result.status) return res.status(200).json({ result })
    
        res.status(200).json({ result })
     }
- delete('/delete?:query') = /delete? and a key = value sequence, it is only necessary to pass the table name and id. Example: `?table=users&id=2`. Returns the status and a message in a object `result `.
> { result = Object / status = Boolean / message = String }


      async doRemove(req, res) {
        const { table, id } = req.query
    
        const result = await remove(table, { id })
    
        res.status(200).json({ result })
     }
