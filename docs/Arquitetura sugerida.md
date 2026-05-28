___
Arquitetura geral sugerida para o sistema
___

```
Frontend React
    |
    | HTTPS
    v
Backend NestJS
    |
    | Prisma
    v
PostgreSQL/Supabase
    |
    +--> Supabase Auth
    +--> Supabase Storage
```

O frontend **não deve sair falando direto com o banco para tudo**. Para esse projeto, eu faria o backend como autoridade principal.

## Regra técnica crítica: estoque e reserva

Toda criação, cancelamento, expiração e conclusão de pedido deve passar pelo backend.

O frontend nunca calcula disponibilidade como fonte de verdade.
O frontend apenas exibe o resultado vindo da API.

A API deve usar transação ao:
- criar pedido;
- criar reserva;
- liberar reserva;
- concluir pedido;
- baixar estoque.

## Por quê?

Porque suas regras são sensíveis:

- usuário só vê as próprias ofertas;
- administrador vê todas;
- pedido reserva estoque por 24h;
- máximo de 3 figurinhas por pedido;
- usuário e admin podem cancelar;
- pagamento é presencial;
- negociação pode ir para WhatsApp;
- oferta pode ter valor sugerido pelo usuário, mas decisão final é do admin.

Isso é **regra de negócio**, não é só CRUD. Supabase sozinho até faz muita coisa com RLS, mas para esse caso, um backend dedicado deixa o controle mais claro.

Separacao logica:

```
apps/
 ├── accounts/
 ├── stickers/
 ├── inventory/
 ├── offers/
 ├── orders/
 ├── admin_panel/
 └── audit/
```

## Estrutura do backend NestJS

```
src/
 ├── app.module.ts
 ├── prisma/
 │   ├── prisma.module.ts
 │   └── prisma.service.ts
 ├── auth/
 │   ├── auth.module.ts
 │   ├── auth.guard.ts
 │   └── roles.guard.ts
 ├── users/
 ├── stickers/
 │   ├── stickers.controller.ts
 │   ├── stickers.service.ts
 │   └── dto/
 ├── inventory/
 │   ├── inventory.controller.ts
 │   ├── inventory.service.ts
 │   └── dto/
 ├── orders/
 │   ├── orders.controller.ts
 │   ├── orders.service.ts
 │   └── dto/
 ├── offers/
 │   ├── offers.controller.ts
 │   ├── offers.service.ts
 │   └── dto/
 ├── admin/
 ├── config/
 └── audit/
```