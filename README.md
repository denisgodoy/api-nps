![node.js](https://img.shields.io/badge/node.js-3C873A) ![typescript](https://img.shields.io/badge/typescript-007acc) ![typeorm](https://img.shields.io/badge/typeorm-red)

# api-nps :e-mail:

#### API to send Net Promoter Score survey to the user.

- [Setting up](https://github.com/denisgodoy/api-nps#setting-up)
- [Migrations and creating tables](https://github.com/denisgodoy/api-nps#migrations-and-creating-tables)
- [Controllers](https://github.com/denisgodoy/api-nps#controllers)
- [Routes](https://github.com/denisgodoy/api-nps#routes)
- [Enabling permissions](https://github.com/denisgodoy/api-nps#enabling-permissions)
- [Models](https://github.com/denisgodoy/api-nps#models)

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

Running ```typeorm``` script to create a new class called CreateUsers inside ```src/database/migrations```.

```yarn typeorm migration:create -n CreateUsers```


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

### Controllers

Creating an ```UserController.ts``` that receives a method to create new users from received JSON and importing Express' Request and Response.

```typescript
import { Request, Response } from 'express';
```

Using TypeORM's getRepository to access its methods and manage database. 

```typescript
class UserController {
    async create(request: Request, response: Response){
        const { name, email } = request.body;
        const usersRepository = getRepository(User);

        const userAlreadyExists = await usersRepository.findOne({email});

        if(userAlreadyExists){
            return response.status(400).json({
                error: 'User already exists.'
            });
        };

        const user = usersRepository.create({name, email})

        await usersRepository.save(user);

        return response.json(user)
    };
}

export { UserController };
```

### Routes

Generating routes to the server.

```typescript
import { Router } from 'express';

const router = Router();

export { router }
```

Adding route to ```server.ts``` and specifying retrieved data format as JSON.

```typescript
app.use(express.json());
app.use(router);

app.listen(3333, () => console.log("Server running!"));
```

### Enabling permissions

It is mandatory to uncomment the following ```tsconfig.json``` properties in order to give the Controller all necessary permissions.

```json
    "strict": false,                           
    "strictPropertyInitialization": false, 
    "experimentalDecorators": true,        
    "forceConsistentCasingInFileNames": true
```

### Models

Creating a ```src/models``` folder and file ```User.ts``` to generate an User Entity.

```typescript
import { Entity } from "typeorm";
```

Importing ```uuid``` library to automatically create an unique primary key (PK).


```typescript
import { v4 as uuid } from 'uuid'
```

Populating Entity's attributes.

```typescript
@Entity('users')

class User {
    @PrimaryColumn()
    readonly id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @CreateDateColumn()
    created_at: Date;

    constructor(){
        if(!this.id){
            this.id = uuid()
        }
    }
}

export { User };
```