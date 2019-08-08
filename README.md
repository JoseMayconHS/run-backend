# Run-Back-end
API developed in NodeJs (Back-end of Run-Front-end)

# Frontend project
 [Repository](https://github.com/Maycon-PE/Run-Front-end)

# Features
- API with MYSQL integration;
- Authentications;
- Database query functions are in a single sqlQuery folder;
- Command that runs a file that opens the connection, creates the tables, inserts default records, and closes the connection. Build the foundation for the front-end project to work.
- All routes with path `http://localhost:3001/auth` on, will go through the middleware that checks the authentication.

# Dependencies used
- Server `express`
- Authentications `jsonwebtoken`
- Database  `mysql2`
- Encryption `bcryptjs`
- Understand the requisitions `body-parser`
- Make external access `cors`
- Upload images `multer`
- Resize images `sharp`
- Open vsCode after building database `cross-spawn`
- Rerun the project after a change `nodemon`


# Steps
1. Create a database in MYSQL;
2. Inside the project folder, access the .env file -> src/services/database/.env;
3. Make the settings for to connect your database;
4. Run the `yarn database` or `npm run database` command on the terminal and verify that all tables have been created and that all base records have been entered;
5. Finally run the command again in the terminal `yarn start` or `npm start`

# Endpoints
- get('/getAll/:table') = `/getAll/` and the name of the table you want to fetch. This is equivalent to `SELECT * FROM`: table. Example: `/getAll/bots`: Returns the name of the searched table and all records in it;
>{ table: String / data: Array  }


    async getAll(req, res) {
       const table = req.params.table
    
       const data = await selectAny(table, '*')
    
       res.status(200).json({ table, data })
    }

- get('/getWhere?:query') = `/getWhere?` and a sequence of `key=value`. The function responsible for this endpoint will transform this into a valid query. **table=tableName** is required. Example: `/getWhere?table=bots&id=1`,
This returns the name of the table, the constraints of the query, and the result;

>{ table: String / where: Object / data: Array }


    async getWhere(req, res) {
       const table = req.query.table
       delete req.query.table
       const where = req.query
    
       const data = await selectWhere(table, where, '*')
        
       res.status(200).json({ table, where, data })
    }
- get('/getAllParts') = `/getAllParts` returns all the pieces to the cars.
>{ data: Object }


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
- get('/myParts') = `/myParts` returns all the parts your car uses. Part names go into the body of the request with the keys in the same name as the table where it is located

 > { my: Object }
 
    async function getMyParts(req, res) {
		const my = await getTheParts(req.body)

	    res.status(200).json({ my })
    }
- get('/getAllBots') = `/getAllBots` returns all cars and pilots to avoid two API calls
> { data: Object }



    async function bots(req, res) {
	    const bots = await selectAny('bots', '*')
	    const cars = await selectWhere('cars', {'bot': 1}, '*')

	    res.status(200).json({ data: { bots, cars } })
	}

- get('/auth/car') = `/auth/car` Returns the car of the authenticated user (**Private endpoint**)
> { car: Object }

    async function getCar(req, res) {
	    const [ car ] = await selectWhere('cars', { id: req.car }, '*')

	    res.status(200).json({ car })
	}
- get('auth/user') = `/auth/user` returns the user authenticated  (**Private endpoint**)
> { user: Object }
 

    async function getUser(req, res) {
	    const [ user ] = await selectWhere('users', { id: req.user }, '*')

	    res.status(200).json({ user })
	}
- get('/auth/adversary') = `/auth/adversary` returns an array of valid opponents for the race.
> { allAdvs: Object }

    async function adversary(req, res) {
	    const [{ nvl }] = await selectWhere('users', { id: req.user }, 'nvl')

	    const allAdvs = await selectAdversary(nvl, req.user)

	    res.status(200).json({ allAdvs })
	}

- post('/createAccount') = `/createAccount` route that creates an account, checks whether the email already exists, last name, and car name. Then do the inserts and references.
> { status: Boolean / message: String }

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

- post('/login') = `/login` route to the login, receives only an email and a password. Returns status and token in message...
> { status: Boolean / message: String }


    async login(req, res) {
        const { email, password } = req.body
    
        const result = await sign(email)
    
        if (!result.status) return res.status(200).json(result)
    
        if (!await bcryptjs.compare(password, result.message.password)) return res.status(200).json({ status: false, message: 'Senha inválida' })
    
        const token = gerarToken({ _id: result.message.id })
    
        res.status(200).json({ status: true, message: token })
     }
- post('/auth') = `/auth` route to check the token and return the logged on user and your car. (**Private endpoint**)
> { status: Boolean / user = Object / message = String }


    async function auth(req, res) {
	    try {
	        const [ user ] = await selectWhere('users', { id: req.user }, '*')
	        const [ car ] = await selectWhere('cars', { id: req.car }, '*')

	        user.password = undefined

	        res.status(200).json({ status: true, user, car, message: `${user.nickname} conectado!` })
	    } catch(e) {
	        res.status(500).send()
		}
    }
- put('/auth/changePart/:table') = `/auth/changePart/:table` exchange the old part with the new one, whose name came in the body of the requisition. In the body of the requisition is expected the field to be changed, the name of the new piece and the new value of the money already discounted in the Front-end. : table refers to the name of the table where the new piece is located. (**Private endpoint**)
> { status: Boolean / car: Object / gold: Number }

    
	async function changePart(req, res) {
		const table = req.params.table
		const { field, part, costs } = req.body

		await justSetReference({ schema: table, field, id: req.car, part })

	    if (!await update('users', { gold: costs }, { id: req.user })) return res.status(200).json({ status: false, message: 'Não foi possível efetuar a troca da peça!' })

	    const [{ gold }] = await selectWhere('users', { id: req.user }, 'gold')

	    const [ car ] = await selectWhere('cars', { id: req.car }, '*')

	    res.status(200).json({ status: true, car, gold })
	}
- put('/auth/car:part') = `/auth/car:part` responsible for updating the attributes of a part and updating the user's money. `:part` is the name of the field to be updated. (**Private endpoint**)
> { status: Boolean / part: Object / gold: Number }

  
	async function updateCar(req, res) {
	    const part_object = req.params.part
		const descont = req.body.costs
	    delete req.body.costs

	    if (!await update('cars', { [part_object]: JSON.stringify(req.body) }, { id: req.car })) return res.status(200).json({ status: false, message: 'Não foi possivel fazer a atualização!' })

	    if (!await update('users', { gold: descont }, { id: req.user })) return res.status(200).json({ status: false, message: 'Não foi possivel descontar no seu dinheiro!' })
	    const [{ gold }] = await selectWhere('users', { id: req.user }, 'gold')

	    const [ part ] = await selectWhere('cars', { id: req.car }, part_object)

	    res.status(200).json({ status: true, part: part[part_object], gold})
	}
- put('/auth/profile') = `/auth/profile` update user's profile photo. (**Private endpoint**)
> { status: Boolean / src: String }

	async function profile(req, res) {
	    const { filename, destination, path } = req.file

	    const [user] = await selectWhere('users', { id: req.user }, 'src')

	    if (user.src !== 'pilots/default') fs.unlinkSync(resolve(destination, `${user.src}.jpg`))

	    await sharp(path)
	      .resize(180, 180) 
	      .jpeg({ quality: 70 })
	      .toFile(resolve(destination, 'users', `${filename}.jpg`))
  
	    fs.unlinkSync(path)

	    if (!await update('users', { src: `users/${filename}` }, { id: req.user })) return res.status(200).json({ status: false, message: 'Não foi possivel mudar a referência à nova imagem!' })

	    const [{ src }] = await selectWhere('users', { id: req.user }, 'src')

	    res.status(200).json({ status: true, src })
	}

- put('/auth/withdrawal') = `/auth/withdrawal` route that only changes the value of the user's money, to smaller! Called when the user quits the race (**Private endpoint**)
> { status: Boolean / gold: Number }

    async function withdrawal(req, res) {
	    const newGold = req.body.gold
	    if (!await update('users', { gold: newGold }, { id: req.user })) return res.status(200).json({ status: false, message: 'Erro ao descontar no seu dinheiro!' })

	    const [{ gold }] = await selectWhere('users', { id: req.user }, 'gold')

	    res.status(200).json({ status: true, gold })
	}
- put('/auth/winOrLose') = `/auth/winOrLose` upgrades money, experience and power, increases experience level and goal. (**Private endpoint**)
> { status: Boolean / xp: Number / gold: Number / limit_xp: Number / nvl: Number }

    async function winOrLose(req, res) {
	    const { gold: newGold, xp: newXp } = req.body

	    let [{ limit_xp: before_limit_xp, nvl: before_nvl }] = await selectWhere('users', { id: req.user }, 'limit_xp', 'nvl')

	    newXp > before_limit_xp && before_nvl < 50 && (() => {
	      do {
	        before_nvl++
	        before_limit_xp *= 2
	      } while (newXp > before_limit_xp && before_nvl < 50)
	    })()

	    if (!await update('users', { xp: newXp, limit_xp: before_limit_xp, gold: newGold, nvl: before_nvl }, { id: req.user })) return res.status(200).json({ status: false, message: 'Erro ao setar as novas informações após a corrida!' })

	    const [{ xp, gold, limit_xp, nvl }] = await selectWhere('users', { id: req.user }, 'xp', 'gold', 'limit_xp', 'nvl')

	    res.status(200).json({ status: true, xp, gold, limit_xp, nvl })
	}
- put('/auth/info') = `/auth/info` route for update user info. (**Private endpoint**)
> { status: Boolean / message: String}

    async function changeInfo(req, res) {
		  let { field, value } = req.body

		  if (field === 'password') value = await bcryptjs.hash(value, 10)
  
		  if (!await update('users', { [field]: value }, { id: req.user })) return res.status(200).json({ status: false })

		  try {
		    const [{ [field]: newValue }] = await selectWhere('users', { id: req.user }, field)

		    res.status(200).json({ status: true, message: newValue })
		  } catch(e) {
		    console.log(e)
		    res.status(200).json({ status: false })
		  }
	}


- delete('/auth/delete?:query') = `/auth/delete?` and a `key = value` sequence, it is only necessary to pass the table name and id. Example: `...?table=users&id=2`. (**Private endpoint**)
> { result: Object }

    async doRemove(req, res) {
        const { table, id } = req.query
    
        const result = await remove(table, { id })
    
        res.status(200).json(result)
    }
