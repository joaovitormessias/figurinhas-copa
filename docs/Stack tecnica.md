___ 
Essa eh a stack definida para o desenvolvimento desse projeto
___

## Stack principal

| Camada            | Recomendação                                  |
| ----------------- | --------------------------------------------- |
| Backend           | **NestJS**                                    |
| Linguagem         | **TypeScript**                                |
| ORM               | **Prisma**                                    |
| Banco             | **PostgreSQL do Supabase**                    |
| Auth              | **Supabase Auth** ou auth própria no NestJS   |
| Arquivos/imagens  | **Supabase Storage**                          |
| Validação         | `class-validator`, `class-transformer` ou Zod |
| Deploy            | Docker via Portainer/Hostinger                |
| Proxy/DNS         | Cloudflare                                    |
| Documentação API  | Swagger/OpenAPI                               |
| Jobs/agendamentos | Cron no backend ou worker separado            |

## Stack visual

```
React + Vite + TypeScript
Tailwind CSS
daisyUI
React Router
TanStack Query
React Hook Form + Zod
Axios ou fetch wrapper
```