# REST API com NestJS

API REST para gestão de usuários administradores, desenvolvida com NestJS,
PostgreSQL, autenticação JWT, validação de DTOs e documentação Swagger.

## Objetivo

O projeto fornece uma API para que um administrador autenticado possa cadastrar,
editar, listar, consultar e desativar usuários. A desativação utiliza soft delete,
preservando os registros no banco de dados.

Existe apenas um perfil de acesso: administrador. Todas as rotas são protegidas
por JWT, exceto a rota de autenticação.

## Pré-requisitos

- Node.js 22 ou superior
- npm
- PostgreSQL 16 ou superior
- Docker e Docker Compose, caso prefira executar em containers

## Variáveis de ambiente

Crie um arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Principais variáveis:

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta HTTP da API |
| `DB_HOST` | Host do PostgreSQL |
| `DB_PORT` | Porta do PostgreSQL |
| `DB_USERNAME` | Usuário do PostgreSQL |
| `DB_PASSWORD` | Senha do PostgreSQL |
| `DB_DATABASE` | Banco de dados utilizado |
| `DB_SYNCHRONIZE` | Sincroniza o schema automaticamente em ambiente local |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens |
| `JWT_EXPIRES_IN` | Tempo de expiração do token |
| `ADMIN_NAME` | Nome do administrador inicial |
| `ADMIN_EMAIL` | E-mail do administrador inicial |
| `ADMIN_PASSWORD` | Senha do administrador inicial |

Ao subir a aplicação, o administrador inicial é criado automaticamente quando o
e-mail configurado em `ADMIN_EMAIL` ainda não existe.

## Execução local

Instale as dependências:

```bash
npm install
```

Garanta que o PostgreSQL esteja em execução e que o banco configurado em
`DB_DATABASE` exista. Depois execute:

```bash
npm run start:dev
```

A API ficará disponível em:

```text
http://localhost:3000/api
```

## Execução com Docker

Execute a aplicação e o PostgreSQL:

```bash
docker compose up --build
```

A API ficará disponível em:

```text
http://localhost:3000/api
```

Para parar os containers:

```bash
docker compose down
```

## Swagger

Com a aplicação em execução, acesse a documentação Swagger em:

```text
http://localhost:3000/api/docs
```

Use o endpoint de login para obter o token e informe-o no botão **Authorize** no
formato Bearer.

Credenciais padrão do ambiente Docker e do `.env.example`:

```text
E-mail: admin@example.com
Senha: admin123456
```

## Endpoints

Todas as rotas abaixo usam o prefixo `/api`.

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Não | Autentica o administrador e retorna um token JWT |
| `POST` | `/users` | Sim | Cadastra um novo usuário administrador |
| `GET` | `/users` | Sim | Lista usuários ativos; aceita `includeInactive=true` para incluir desativados |
| `GET` | `/users/:id` | Sim | Consulta um usuário por ID; aceita `includeInactive=true` |
| `PATCH` | `/users/:id` | Sim | Edita nome, e-mail e/ou senha de um usuário |
| `DELETE` | `/users/:id` | Sim | Desativa um usuário com soft delete |

## Autenticação

Envie o token JWT nas rotas protegidas usando o cabeçalho:

```text
Authorization: Bearer <token>
```

## Scripts úteis

```bash
npm run start:dev
npm run build
npm run lint
npm test
```
