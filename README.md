![node.js](https://img.shields.io/badge/node.js-3C873A) ![typescript](https://img.shields.io/badge/typescript-007acc) ![typeorm](https://img.shields.io/badge/typeorm-red)

# api-nps :e-mail:

#### API to send Net Promoter Score survey.

- [Setting up](https://github.com/denisgodoy/api-nps#setting-up)
- [Migrations and creating tables](https://github.com/denisgodoy/api-nps#migrations-and-creating-tables)
- [Models](https://github.com/denisgodoy/api-nps#models)
- [Repositories](https://github.com/denisgodoy/api-nps#repositories)
- [Controllers](https://github.com/denisgodoy/api-nps#controllers)
- [Routes](https://github.com/denisgodoy/api-nps#routes)
- [Enabling permissions](https://github.com/denisgodoy/api-nps#enabling-permissions)
- [Sending Email](https://github.com/denisgodoy/api-nps#sending-email)
- [Receiving user rating](https://github.com/denisgodoy/api-nps#receiving-user-rating)
- [Calculating NPS](https://github.com/denisgodoy/api-nps#calculating-nps)

## Setting up 
Installing all necessary dependencies to start the project.

```
yarn add express
         uuid
         typeorm 
         reflect-metadata
         sqlite3
```

Creating ```ormconfig.json``` **in the project root** that holds TypeORM configuration.

```json
{ 
    "type": "sqlite",
    "database": "./src/database/database.sqlite"
}
```

Creating connection on ```src/database/index.ts```.

```typescript
import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async (): Promise<Connection> => {
    const defaultOptions = await getConnectionOptions();

    return createConnection(
        Object.assign(defaultOptions, {
            database: process.env.NODE_ENV === 'test' ? './src/database/database.test' : defaultOptions.database
        })
    );
};
```

Calling it on ```app.ts```.

```typescript
import 'reflect-metadata';
import express from 'express';
import createConnection from './database';
import { router } from './routes';

createConnection();

app.use(express.json());
app.use(router);

export { app };
```

Then import ```app``` to ```server.ts``` and run.

```typescript
import { app } from './app';

app.listen(3333, () => console.log("Server listening on port:3333"));
```

## Migrations and creating tables
Adding migrations path to ```ormconfig.json```.

```json
    "migrations": ["./src/database/migrations/**.ts"],
    "entities": ["./src/models/**.ts"],
    "cli": {
        "migrationsDir": "./src/database/migrations"
    }
}

```

Running ```typeorm``` script to create a new migration inside ```src/database/migrations```.

```yarn typeorm migration:create -n <MigrationName>```

Creating table with users fields inside the ```up``` function in the generated file. ```down``` function to revert table.

```typescript
export class CreateUsers1614088105675 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true
                    },
                    {
                        name: 'name',
                        type: 'varchar'
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()'
                    }
                ]
            }
            )
        );
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
```

Then migrate table.

```yarn typeorm migration:run```

### Models
Creating an ```Entity``` inside  ```src/models```.

```typescript
import { Entity } from "typeorm";
```

Importing ```uuid``` library to automatically create a primary key (PK).

```typescript
import { v4 as uuid } from 'uuid'
```

Populating Entity's attributes.

```typescript
@Entity('surveys')

class Survey {

    @PrimaryColumn()
    readonly id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @CreateDateColumn()
    created_at: Date;

    constructor(){
        if(!this.id){
            this.id = uuid()
        }
    }
}

export { Survey }
```

### Repositories
Repositories will manage the database by accessing ```Repository``` methods extending Models.

```typescript
import { EntityRepository, Repository } from "typeorm";
import { <Model> } from "../models/<Model>";

@EntityRepository(<Model>)
class <Repository> extends Repository<<Model>> {}

export { <Respository> };
```

### Controllers
Creating a ```Controller``` that receives a method to get and send JSON.

```typescript
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { <Name>Repository } from '../repositories/<Name>Respository';
```

Creating ```<Name>Controller.ts``` to save to custom repository.

```typescript
class SurveysController {
    async create(request: Request, response: Response){
        const {title, description} = request.body;

        const surveysRepository = getCustomRepository(SurveysRepository);
```

Receiving data from JSON and saving to the repository.

```typescript
        const survey = surveysRepository.create({
            title,
            description
        });

        await surveysRepository.save(survey)
        return response.status(201).json(survey)
    }
 ```

Retrieving JSON from repository data.

 ```typescript
    async show(request: Request, response: Response){
        const surveysRepository = getCustomRepository(SurveysRepository);
        const all = await surveysRepository.find();

        return response.json(all)
    }
}

export { SurveysController }
```

### Routes
Generating routes to the server.

```typescript
import { Router } from 'express';
import { UserController }  from './controllers/UserController';
import { SurveysController }  from './controllers/SurveysController';

const router = Router();
const userController = new UserController();
const surveysController = new SurveysController();

router.post('/users', userController.create);
router.post('/surveys', surveysController.create);
router.get('/surveys', surveysController.show);

export { router }
```

### Enabling permissions
It is mandatory to uncomment the following ```tsconfig.json``` properties in order to give the Controller all necessary permissions.

```json
    "strict": false,                           
    "strictPropertyInitialization": false, 
    "experimentalDecorators": true,        
    "forceConsistentCasingInFileNames": true
```

### Sending Email
Running ```yarn add nodemailer``` to install the module.

Setting up a ```Controller```, importing repositories.

```typescript
class SendMailController {
    async execute(req: Request, res: Response){
        const {email, survey_id} = req.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({email});

        if(!user){
            return res.status(400).json({
                error: 'User does not exist.'
            });
        };

        const survey = await surveysRepository.findOne({id: survey_id});

        if(!survey){
            return res.status(400).json({
                error: 'Survey does not exist.'
            });
        };
```

Creating variables to fill up the template with retrieved users and surveys data within HTML file.

```typescript
        const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs');
        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            user_id: user.id,
            link: process.env.URL_MAIL
        };
```

Prevent users from receiveing the same survey if not yet answered.

```typescript
        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: [{user_id: user.id, value: null}],
            relations: ['user', 'survey']
        });

        if(surveyUserAlreadyExists){
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return res.json(surveyUserAlreadyExists);
        };
        
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id,
        });

        await surveysUsersRepository.save(surveyUser);

        await SendMailService.execute(email, survey.title, variables, npsPath);

        return res.json(surveyUser);
    };
};

export { SendMailController };
```

Setting up nodemailer and Ethereal services for this example project.

```typescript
class SendMailService {
    private client: Transporter;

    constructor(){
        nodemailer.createTestAccount().then(account => { 
            const transporter = nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: {
                    user: account.user,
                    pass: account.pass
                }
            });
            this.client = transporter;
        });      
    };
```

Sending email and filling up template.

```typescript
    async execute(to: string, subject: string, variables: object, path: string){
        const templateFileContent = fs.readFileSync(path).toString('utf8');

        const mailTemplateParse = handlebars.compile(templateFileContent);
        const html = mailTemplateParse(variables);

        const message = await this.client.sendMail({
            from: 'NPS <noreply@nps.com.br>',
            to,
            subject,
            html
        });

        console.log('Message sent: %s', message.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message));
    };
};

export default new SendMailService();
```

## Receiving user rating
Executing Controller to define the user's rating from URL params.

```typescript
class AnswerController {
    async execute(req: Request, res: Response){
        const { value } = req.params;
        const { u } = req.query;

        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
        const surveyUser = await surveysUsersRepository.findOne({id: String(u)});

            if (!surveyUser){
                throw new AppError('Survey User does not exist.')
            };

            surveyUser.value = Number(value);
        
        await surveysUsersRepository.save(surveyUser);
        return res.json(surveyUser);
    };
};

export { AnswerController };
```

## Calculating NPS
Retrieving rating from the URL params and search answers on the database if valid.

```typescript
class NpsController {
    async execute(req: Request, res: Response){

        const { survey_id } = req.params;

        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);
        const surveysUsers = await surveysUsersRepository.find({
            survey_id,
            value: Not(IsNull())
        });
```

Calculating NPS and return JSON.

```typescript
        const detractors = surveysUsers.filter(survey => survey.value <= 6).length;
        const passives = surveysUsers.filter(survey => survey.value >= 7 && survey.value <= 8).length;
        const promoters = surveysUsers.filter(survey => survey.value >= 9).length;
        
        const totalAnswers = surveysUsers.length;

        const calculate = Number(
            (((promoters - detractors) / totalAnswers) * 100).toFixed(2)
        );
        
        return res.json({
            detractors,
            promoters,
            passives,
            totalAnswers,
            nps: calculate
        });
    };
};

export { NpsController };
```