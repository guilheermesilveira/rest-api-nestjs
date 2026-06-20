# REST API com NestJS

API REST para gestão de usuários, desenvolvida com NestJS, PostgreSQL,
autenticação JWT, autorização por perfil, validação de DTOs e documentação
Swagger.

## Objetivo

O projeto fornece uma API para que um administrador autenticado possa cadastrar,
editar, listar, consultar, promover, desativar e reativar usuários. A
desativação utiliza soft delete, preservando os registros no banco de dados.

Existem dois perfis de acesso:

- `ADMIN`: pode acessar as rotas de gerenciamento de usuários.
- `USER`: pode apenas realizar autenticação.

O administrador inicial é criado automaticamente pela aplicação. Depois disso,
todo usuário cadastrado por um administrador é criado com o perfil `USER`. Para
tornar um usuário administrador, use o endpoint específico de promoção.

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

Ao subir a aplicação, o administrador inicial é criado automaticamente com o
perfil `ADMIN` quando o e-mail configurado em `ADMIN_EMAIL` ainda não existe.

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

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Público | Autentica qualquer usuário ativo e retorna um token JWT |
| `POST` | `/users` | `ADMIN` | Cadastra um novo usuário comum (`USER`) |
| `GET` | `/users` | `ADMIN` | Lista usuários ativos; aceita `includeInactive=true` para incluir desativados |
| `GET` | `/users/:id` | `ADMIN` | Consulta um usuário por ID; aceita `includeInactive=true` |
| `PATCH` | `/users/:id` | `ADMIN` | Edita nome, e-mail e/ou senha de um usuário ativo |
| `PATCH` | `/users/:id/promote` | `ADMIN` | Promove um usuário comum ativo para administrador |
| `PATCH` | `/users/:id/activate` | `ADMIN` | Reativa um usuário desativado |
| `DELETE` | `/users/:id` | `ADMIN` | Desativa um usuário ativo com soft delete |

## Exemplos de uso

Autenticação:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456"}'
```

Cadastro de usuário comum:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","email":"maria@example.com","password":"strongPassword123"}'
```

Promoção de usuário comum para administrador:

```bash
curl -X PATCH http://localhost:3000/api/users/<id>/promote \
  -H "Authorization: Bearer <token>"
```

Reativação de usuário desativado:

```bash
curl -X PATCH http://localhost:3000/api/users/<id>/activate \
  -H "Authorization: Bearer <token>"
```

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
