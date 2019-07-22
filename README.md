
# Run-Back-end
API developed in NodeJs (Back-end of Run-Front-end)

# Features
- API with MYSQL integration;
- Authentications;
- Database query functions are in a single sql.js file;
- Command that runs a file that opens the connection, creates the tables, inserts default records, and closes the connection. Build the foundation for the front-end project to work.
- All routes with path `http://localhost:3001/auth` on, will go through the middleware that checks the authentication.

# Dependencies used
- API `express`
- Authentications `jsonwebtoken`
- Database  `mysql2`
- Encryption `bcryptjs`
- Understand the requisitions `body-parser`
- Make external access `cors`
- Upload images `multer`
- Resize images `sharp`


# Steps
1. Create a database in MYSQL;
2. Inside the project folder, access the .env file -> src/services/database/.env
3. Make the settings for to connect your database;
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


    async function parts(req, res) {
    const engines = await selectAny('engines', '*')
    const transmissions = await selectAny('transmissions', '*')
    const whells = await selectAny('whells', '*')
    const cylinders = await selectAny('cylinders', '*')
    const protections = await selectAny('protections', '*')

    engines.forEach(engine => {
      engine.exchange_rates = JSON.parse(engine.exchange_rates)
      engine.update_config = JSON.parse(engine.update_config)
    })
  
    transmissions.forEach(transmission => transmission.update_config = JSON.parse(transmission.update_config))
    whells.forEach(whells => whells.update_config = JSON.parse(whells.update_config))
    cylinders.forEach(cylinder => cylinder.update_config = JSON.parse(cylinder.update_config))
    protections.forEach(protection => protection.update_config = JSON.parse(protection.update_config))

    res.status(200).json({ data: { engines, transmissions, whells, cylinders, protections } })
  }
- get('/myParts') = myParts returns all the parts your car uses. Part names go into the body of the request with the keys in the same name as the table where it is located

 > { my = Object }

  async function getMyParts(req, res) {
    const my = await getTheParts(req.body)

    res.status(200).json({ my })
  }`
- get('/getAllBots') = getAllBots returns all cars and pilots to avoid two API calls
> { data = Object / data.boots and data.cars = Array / data.boots[index] and data.cars[index] = Object }



    async function bots(req, res) {
    const bots = await selectAny('bots', '*')
    const cars = await selectWhere('cars', {'bot': 1}, '*')

    res.status(200).json({ data: { bots, cars } })
  }

- get('/auth/car') = auth/car returns the car of the authenticated user (**Private endpoint**)
> { car = Object }

    async function getCar(req, res) {
    const car_id = await selectWhere('users', { id: req.user }, 'car_id')
    const car = await selectWhere('cars', { id: car_id[0].car_id }, '*')

    res.status(200).json({ car: car[0] })
  }
- get('auth/user') = auth/user returns the user authenticated  (**Private endpoint**)
> { user = Object }
 

    async function getUser(req, res) {
    const user = await selectWhere('users', { id: req.user }, '*')

    res.status(200).json({ user: user[0] })
  }

- post('/createAccount') = /createAccount route that creates an account, checks whether the email already exists, last name, and car name. Then do the inserts and references.
> { status: Boolean / message = String }

    async function insert(req, res) {
    try {
      req.body.password = await encryptor(req.body.password)

      createAccount(req.body)
        .then(id => {
            const message = gerarToken({ _id: id })
            res.status(200).json({ status: true, message })
        }).catch(result => res.status(200).json({ status: false, ...result }))
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
- post('/auth') = /auth route to check the token and return the logged on user and your car. (**Private endpoint**)
> { status: Boolean / user = Object / message = String }


    async function auth(req, res) {
    try {
      const user = await selectWhere('users', { id: req.user }, '*')
      const car = await selectWhere('cars', { id: req.car }, '*')

      user[0].password = ''

      res.status(200).json({ status: true, user: user[0], car: car[0], message: `${user[0].nickname} conectado!` })
    } catch(e) {
      res.status(500).send()
    }
  }
- put('/auth/changePart/:table') = /auth/changePart/:table Exchange the old part with the new one, whose name came in the body of the requisition. In the body of the requisition is expected the field to be changed, the name of the new piece and the new value of the money already discounted in the Front-end. : table refers to the name of the table where the new piece is located. (**Private endpoint**)
> { status: Boolean / car = Object / user = Object }

    async function changePart(req, res) {
    const table = req.params.table
    const { field, part, costs } = req.body

    await justSetReference({ schema: table, field, id: req.car, part })

    await update('users', { gold: costs }, { id: req.user })

    const user = await selectWhere('users', { id: req.user }, '*')
    user[0].password = undefined

    const car = await selectWhere('cars', { id: req.car }, '*')

    res.status(200).json({ status: true, car: car[0], user: user[0] })
  }
-put('/auth/car:part') = /auth/car:part responsible for updating the attributes of a part and updating the user's money. :part is the name of the field to be updated. (**Private endpoint**)
> { status: Boolean / car: Object / user = Object }

  async function updateCar(req, res) {
    const part_object = req.params.part
    const descont = req.body.costs
    delete req.body.costs

    const result = await update('cars', { [part_object]: JSON.stringify(req.body) }, { id: req.car })
    const resultCosts = await update('users', { gold: descont }, { id: req.user })

    if (!result.status && !resultCosts.status) return res.status(200).json({ status: false, result: { result, resultCosts } })

    const user = await selectWhere('users', { id: req.user }, '*')
    user[0].password = undefined

    const car = await selectWhere('cars', { id: req.car }, '*')

    res.status(200).json({ status: true, car: car[0], user: user[0] })
  }
- put('/auth/profile') = /auth/profile Update user's profile photo. (**Private endpoint**)
> { status = Boolean / user = Object / car = Object }

    async function profile(req, res) {
    const { filename: src } = req.file

    let user = await selectWhere('users', { id: req.user }, 'src')

    if (user[0].src !== 'default/default') fs.unlinkSync(path.resolve(req.file.destination, 'users', `${user[0].src}.jpg`))

    await sharp(req.file.path)
      .resize(180, 180) 
      .jpeg({ quality: 70 })
      .toFile(path.resolve(req.file.destination, 'users', `${src}.jpg`))
  
    fs.unlinkSync(req.file.path)

    await update('users', { src }, { id: req.user })

    user = await selectWhere('users', { id: req.user }, '*')
    user[0].password = undefined

    const car = await selectWhere('cars', { id: req.car }, '*')

    res.json({ status: true, user: user[0], car: car[0] })
  }


- delete('/auth/delete?:query') = /auth/delete? and a key = value sequence, it is only necessary to pass the table name and id. Example: `?table=users&id=2``. (**Private endpoint**)
> { status = Boolean }


      async doRemove(req, res) {
        const { table, id } = req.query
    
        const result = await remove(table, { id })
    
        res.status(200).json(result)
     }
