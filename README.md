# Run-Backend
API desenvolvida em NodeJS (Backend do Run-Frontend).

## Projeto client-side
 - [Repositório](https://github.com/Maycon-PE/Run-Front-end "Run-Frontend").

## Características
- Integração com o banco de dados relacional MYSQL;
- Integração com o bando de dados não relacional MongoDB;
- Autenticações;
- Consultas ao banco de dados estão em uma única pasta `sqlQuery/`;
- Comando `yarn database` ou `npm run database` que cria as tabelas, insere os dados e deixa a base do projeto pronta para funcionar;
- Todas as rotas sobre o caminho `.../auth`, precisarão do token de autenticação para prosseguir na rota.

## Dependências usadas
- Produção & Desenvolvimento
	- Cria o servidor `express`
	- Carregando as variáveis de ambiente `dotenv`
	- Gera e verifica os tokens `jsonwebtoken`
	- Conecta com o banco de dados  `mysql2`
	- Encripta e compara as senhas `bcryptjs`
	- Modela as requisições `body-parser`
	- Libera acesso externo `cors`
	- Upload de imagens `multer`
	- Redimenciona as imagens `sharp`
- Somente desenvolvimento
	- Executa algo na linha de comando `cross-spawn`
	- Reenstarta a aplicação após alguma alteração `nodemon`.	
	- Animação da barra de progresso ao construir a base de dados `progress`


## Passos
1. Crie um banco de dados **MYSQL** e um banco no MongoDB (Mongo Atlas);
2. Copie o texto no arquivo `env_model` e crie um arquivo `.env` no mesmo nível e defina as variáveis de ambiente;
4. Execute `yarn database` ou `npm run database` e verifique se deu tudo certo na preparação do banco antes de iniciar o projeto.
- **Dica:**
	- execute `yarn database-dev` ou `npm run database-dev` para preparar o banco e inicializar a aplicação;
	- execute `yarn database-code-dev` ou `npm run database-code-dev` para preparar o banco, abrir o VsCode e inicializar a aplicação! (**Necessita ter o vsCode instalado colocado no path do sistema**).
5. Execute `yarn dev` ou `npm dev` no terminal para começar (**Se não já estiver inicializado**).

## Rotas
- `get('/getAll/:table')` = `/getAll/:` e o nome da tabela que você quer fazer a busca. Isso é equivalente a `SELECT * FROM :table`. Exemplo: `/getAll/bots`: retorna o nome da tabela consultada e os dados nela.
>{ table: String / data: Array  }


    async getAll(req, res) {
       const table = req.params.table
    
       const data = await selectAny(table, '*')
    
       res.status(200).json({ table, data })
    }

- `get('/getWhere?:query')` = `/getWhere?` e uma sequência de `chave=valor`. Essa rota consultará o banco de dados transformando a query da URL em um comando SQL válido. **table=tableName** é indispensável. Exemplo: `/getWhere?table=bots&id=1` retornará a tupla da tabela bots com o id 1. Essa rota retorna o nome da tabela, a consulta realizada e os dados.

>{ table: String / where: Object / data: Array }


    async getWhere(req, res) {
       const table = req.query.table
       delete req.query.table
       const where = req.query
    
       const data = await selectWhere(table, where, '*')
        
       res.status(200).json({ table, where, data })
    }
- `get('/getAllParts')` = `/getAllParts` retorna todas as peças de carro.
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
- `get('/myParts')` = `/myParts` retorna as peças que você deseja, uma por tabela. 

Exemplo de requisição `JSON`: 
> {
>		"engine": "v1 Pure",
>		"transmission": "t-1 Pure",
>		"whells": "w-1 Pure",
>		"cylinder": "Cylinder 0.1",
>		"protection": "p-9 Hard"
>	}
.

 > { my: Object }
 
    async function getMyParts(req, res) {
			const my = await getTheParts(req.body)

	    res.status(200).json({ my })
    }
- `get('/getAllBots')` = `/getAllBots` retorna todos os pilotos e carros padrões do projeto.
> { data: Object }



    async function bots(req, res) {
	    const bots = await selectAny('bots', '*')
	    const cars = await selectWhere('cars', {'bot': 1}, '*')

	    res.status(200).json({ data: { bots, cars } })
	}

- `get('/stats')` = `/stats` retorna a quantidade de bots e usuarios registrados.
> { data: Object }

		async function stats(req, res) {
			const data = await Stats.findOne()

			res.status(200).json({ data })
		}
- `get('/auth/car')` = `/auth/car` retorna o carro do usuário autênticado. (**Rota protegida**)
> { car: Object }

    async function getCar(req, res) {
	    const [ car ] = await selectWhere('cars', { id: req.car }, '*')

	    car.engine_object = JSON.parse(car.engine_object)
			car.transmission_object = JSON.parse(car.transmission_object)
			car.whells_object = JSON.parse(car.whells_object)
			car.cylinder_object = JSON.parse(car.cylinder_object)
			car.protection_object = JSON.parse(car.protection_object)

	    res.status(200).json({ car })
	}
- `get('auth/user')` = `/auth/user` retorna o usuário autênticado. (**Rota protegida**)
> { user: Object }
 

    async function getUser(req, res) {
	    const [ user ] = await selectWhere('users', { id: req.user }, '*')

	    user.password = undefined

	    res.status(200).json({ user })
	}
- `get('/auth/adversary')` = `/auth/adversary` retorna um array com adversários válidos para a corrida.
> { allAdvs: Object }

    async function adversary(req, res) {
	    const [{ nvl }] = await selectWhere('users', { id: req.user }, 'nvl')

	    const allAdvs = await selectAdversary(nvl, req.user)

	    res.status(200).json({ allAdvs })
	}

- `post('/createAccount')` = `/createAccount` rota responsável pela criação de uma conta.
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
				res.status(400).send(e)
	    }	
		}

- `post('/login')` = `/login` rota responsável pelo login na aplicação e retorna o token.
> { status: Boolean / message: String }


    async login(req, res) {
        const { email, password } = req.body
    
        const result = await sign(email)
    
        if (!result.status) return res.status(200).json(result)
    
        if (!await bcryptjs.compare(password, result.message.password)) return res.status(200).json({ status: false, message: 'Senha inválida' })
    
        const token = gerarToken({ _id: result.message.id })
    
        res.status(200).json({ status: true, message: token })
     }
- `post('/auth')` = `/auth` rota que verifica o token e retorna o usuário e seu carro. (**Rota protegida**)
> { status: Boolean / user = Object / message = String }


    async function auth(req, res) {
      const [ user ] = await selectWhere('users', { id: req.user }, '*')
      const [ car ] = await selectWhere('cars', { id: req.car }, '*')

      user.password = undefined

      res.status(200).json({ status: true, user, car, message: `${user.nickname} conectado!` })
    }
- `put('/auth/changePart/:table')` = `/auth/changePart/:table` rota que troca a peça do carro. (**Rota protegida**)
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
- `put('/auth/car:part')` = `/auth/car:part` rota que realiza o upgrade na peça do carro. (**Rota protegida**)
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
- `put('/auth/profile')` = `/auth/profile` atualiza a foto do perfil do usuário. (**Rota protegida**)
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

- `put('/auth/withdrawal')` = `/auth/withdrawal` essa rota é chamada quando o usuário desiste da corrida. (**Rota protegida**)
> { status: Boolean / gold: Number }

    async function withdrawal(req, res) {
	    const newGold = req.body.gold
	    if (!await update('users', { gold: newGold }, { id: req.user })) return res.status(200).json({ status: false, message: 'Erro ao descontar no seu dinheiro!' })

	    const [{ gold }] = await selectWhere('users', { id: req.user }, 'gold')

	    res.status(200).json({ status: true, gold })
	}
- `put('/auth/winOrLose')` = `/auth/winOrLose` essa rota é chamada quando a corrida termina. (**Rota protegida**)
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
- `put('/auth/info')` = `/auth/info` rota que muda as informações do usuário. (**Rota protegida**)
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


- `delete('/auth/delete?:query')` = `/auth/delete?` e uma sequência de `chave=valor`, só é necessário o nome da tabela e o id do registro. Exemplo: `...?table=users&id=2`. (**Rota protegida**)
> { result: Object }

    async doRemove(req, res) {
        const { table, id } = req.query
    
        const result = await remove(table, { id })
    
        res.status(200).json(result)
    }
