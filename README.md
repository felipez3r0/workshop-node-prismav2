# Workshop - TS / Express e Prisma

## Objetivo

O objetivo deste workshop é criar uma aplicação simples de gerenciamento de usuários e tarefas utilizando TypeScript, Express e Prisma.

## Requisitos

- Node.js (22 ou superior)

## Etapas

### Etapa 1 - Inicialização do projeto

Vamos começar criando um novo projeto Node.js utilizando o TypeScript.

```bash
npm init -y
npm install -D typescript ts-node @types/node
npx tsc --init
```

Vamos adicionar as dependências do Express e de seus tipos.

```bash
npm install express
npm install -D @types/express
```

### Etapa 2 - Configuração do Prisma

Vamos instalar o Prisma e inicializá-lo no projeto.

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

Isso criará uma pasta `prisma` com um arquivo `schema.prisma`. Vamos configurar o banco de dados SQLite para este workshop. Ajuste os dados da fonte de dados no arquivo `schema.prisma` para o seguinte:

```schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Agora, crie (ou altere) um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
DATABASE_URL="file:./database.db"
```

Instale o pacote `dotenv` para carregar as variáveis de ambiente:

```bash
npm install dotenv
```

Ajuste o arquivo `prisma.config.ts` para importar o dotenv no início do arquivo:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

> **Nota:** O import do `dotenv/config` é necessário para que o Prisma consiga carregar as variáveis de ambiente do arquivo `.env` ao executar comandos como `npx prisma generate`.

Em seguida, vamos definir os modelos de Usuário e Tarefa no arquivo `schema.prisma`:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  tasks     Task[]
}

model Task {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  user      User?    @relation(fields: [userId], references: [id])
  userId    Int?
}
```

Vamos ajustar o package.json para usar o type module. Adicione o seguinte campo no `package.json`:

```json
"type": "module",
```

Ajuste também o `tsconfig.json` para configurar os diretórios de entrada e saída. Descomente e ajuste as seguintes linhas:

```json
"rootDir": "./src",
"outDir": "./dist",
```

Agora, vamos gerar o cliente Prisma e criar o banco de dados.

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Etapa 3 - Estrutura do Projeto

Para esse projeto vamos adotar uma arquitetura com a separação de rotas, controladores, serviços, repositórios e entidades. Vamos começar criando a estrutura de pastas do projeto. A estrutura de pastas que vamos adotar é a seguinte:

```
src/
  controllers/
  entities/
  repositories/
  routes/
  services/
```

A pasta src é o diretório `source`, nele vão ficar nossos arquivos TypeScript. Depois de compilado o projeto vai ser armaenado na pasta `dist`.

Nessa arquitetura cada uma das camadas tem uma responsabilidade diferente e vamos seguir a seguinte lógica:

- **Rotas**: Responsável por definir as rotas da aplicação e chamar os controladores.
- **Controladores**: Responsável por receber as requisições, realizar a validação dos dados e chamar os serviços.
- **Serviços**: Responsável por implementar a lógica de negócio da aplicação e chamar os repositórios.
- **Repositórios**: Responsável por realizar a comunicação com o banco de dados.
- **Entidades**: Responsável por definir a estrutura dos dados que serão utilizados na aplicação (nesse caso vamos utilizar os modelos do Prisma).

Vamos criar as pastas necessárias dentro da pasta `src`:

```bash
mkdir -p src/controllers src/entities src/repositories src/routes src/services
```

Vamos começar criando a entidade de Usuário. Crie um arquivo `user.entity.ts` dentro da pasta `src/entities` com o seguinte conteúdo:

```typescript
import { PrismaClient } from "../../generated/prisma/client.js"

const prisma = new PrismaClient()

export default prisma.user
```

> **Nota:** O Prisma gera o cliente em `generated/prisma/client.js` devido à configuração customizada no `schema.prisma`.

> **Nota:** O Prisma gera o cliente em `generated/prisma/client.js` devido à configuração customizada no `schema.prisma`.

Agora vamos criar o repositório de Usuário. Crie um arquivo `user.repository.ts` dentro da pasta `src/repositories` com o seguinte conteúdo:

```typescript
import User from "../entities/user.entity.js"

export async function create(data: { name: string; email: string }) {
  return User.create({ data })
}

export async function findAll() {
  return User.findMany()
}

export async function findById(id: number) {
  return User.findUnique({ where: { id } })
}
```

Em seguida, crie o serviço de Usuário. Crie um arquivo `user.service.ts` dentro da pasta `src/services` com o seguinte conteúdo:

```typescript
import * as userRepository from "../repositories/user.repository.js"

export async function createUser(data: { name: string; email: string }) {
  return await userRepository.create(data)
}

export async function getAllUsers() {
  return await userRepository.findAll()
}

export async function getUserById(id: number) {
  return await userRepository.findById(id)
}
```

Agora, crie o controlador de Usuário. Crie um arquivo `user.controller.ts` dentro da pasta `src/controllers` com o seguinte conteúdo:

```typescript
import type express from "express"
import * as userService from "../services/user.service.js"

export async function createUser(req: express.Request, res: express.Response) {
  const { name, email } = req.body
  const user = await userService.createUser({ name, email })
  res.status(201).json(user)
}

export async function getAllUsers(req: express.Request, res: express.Response) {
  const users = await userService.getAllUsers()
  res.status(200).json(users)
}

export async function getUserById(req: express.Request, res: express.Response) {
  const { id } = req.params
  const user = await userService.getUserById(Number(id))
  if (user) {
    res.status(200).json(user)
  } else {
    res.status(404).json({ message: "User not found" })
  }
}
```

Finalmente, crie as rotas de Usuário. Crie um arquivo `user.routes.ts` dentro da pasta `src/routes` com o seguinte conteúdo:

```typescript
import { Router } from "express"
import * as userController from "../controllers/user.controller.js"

const router = Router()
router.post("/users", userController.createUser)
router.get("/users", userController.getAllUsers)
router.get("/users/:id", userController.getUserById)

export default router
```

### Etapa 4 - Configuração do Servidor Express

Agora, vamos configurar o servidor Express para utilizar as rotas que criamos. Crie um arquivo `src/server.ts` com o seguinte conteúdo:
```typescript
import "dotenv/config"
import express from "express"
import userRoutes from "./routes/user.routes.js"

const app = express()
app.use(express.json())
app.use(userRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`)
})
```

> **Nota:** O import do `dotenv/config` no início do arquivo é essencial para que as variáveis de ambiente do `.env` sejam carregadas antes do Prisma Client ser inicializado.

### Etapa 5 - Executando o Projeto

Para executar o projeto em modo de desenvolvimento, vamos instalar o `tsx`, que é uma ferramenta moderna para executar TypeScript:

```bash
npm install -D tsx
```

Agora, vamos adicionar os scripts no `package.json`. Adicione os seguintes scripts na seção `scripts` do `package.json`:

```json
"build": "tsc",
"start": "npm run build && node dist/server.js",
"dev": "tsx src/server.ts"
```

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

Para compilar e executar em produção:

```bash
npm start
```
