![node.js](https://img.shields.io/badge/node.js-3C873A) ![typescript](https://img.shields.io/badge/typescript-007acc)

# api-nps :e-mail:

#### API to send Net Promoter Score survey to the user.

- [Setting up](https://github.com/denisgodoy/api-nps#setting-up)

## Setting up 
Installing all necessary dependencies to the project.

```json
yarn add express
         @types/express
         ts-node-dev
         typescript
```

Importing Express to  ```src/server.ts```.

```typescript
import express from 'express';
const app = express();
```
