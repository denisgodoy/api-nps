![node.js](https://img.shields.io/badge/node.js-3C873A) ![typescript](https://img.shields.io/badge/typescript-007acc) ![typeorm](https://img.shields.io/badge/typeorm-red)

# api-nps :e-mail:

#### API to send Net Promoter Score survey to the user.

- [Setting up](https://github.com/denisgodoy/api-nps#setting-up)
- [Migrations and creating tables](https://github.com/denisgodoy/api-nps#migrations-and-creating-tables)
- [Models](https://github.com/denisgodoy/api-nps#models)
- [Repositories](https://github.com/denisgodoy/api-nps#repositories)
- [Controllers](https://github.com/denisgodoy/api-nps#controllers)
- [Routes](https://github.com/denisgodoy/api-nps#routes)
- [Enabling permissions](https://github.com/denisgodoy/api-nps#enabling-permissions)

## Setting up 
Installing all necessary dependencies to start the project.

```json
yarn add express
         @types/express -D
         ts-node-dev -D
         typescript -D
         uuid
         @types/uuid -D
```

Importing Express to  ```src/server.ts```.

```typescript
import express from 'express';
const app = express();
```

Installing TypeORM and sqlite3.

```
yarn add typeorm 
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
import { createConnection } from 'typeorm';

createConnection();
```

On ```src/server.ts``` import above other imports:

```typescript
import 'reflect-metadata';
import './database';
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
router.get('/surveys', surveysController.show);

export { router }
```

Importing router to ```server.ts``` and specifying retrieved data format as JSON.

```typescript
app.use(express.json());
app.use(router);

app.listen(3333, () => console.log("Server listening on port:3333"));
```

### Enabling permissions

It is mandatory to uncomment the following ```tsconfig.json``` properties in order to give the Controller all necessary permissions.

```json
    "strict": false,                           
    "strictPropertyInitialization": false, 
    "experimentalDecorators": true,        
    "forceConsistentCasingInFileNames": true
```