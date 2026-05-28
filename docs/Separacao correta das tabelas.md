___
Como esse sistema ira rodar em um mesmo banco de dados eh preciso tomar precaucoes
___
links: [[Fluxos principais]]

Atualmente as informacoes do banco de dados estarao em um mesmo banco de dados de outro sistema por meio do supabase.
## Não misture estas três coisas

### 1. Catálogo

Todas as figurinhas possíveis.
```
StickerCatalog
```

### 2. Estoque público do administrador

Figurinhas do administrador que aparecem na vitrine.
```
AdminStock
```

### 3. Ofertas privadas dos usuários

Figurinhas que usuários querem vender ao administrador.

```
UserOffer
```

### 4. Reservas temporárias

Pedidos pendentes que bloqueiam parte do estoque por tempo limitado.

```
Reservation não é catálogo.
Reservation não é estoque físico.
Reservation não é oferta de usuário.
```

Reservation é apenas um bloqueio temporário ligado a um pedido.