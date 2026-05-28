___  
Esse arquivo concentra os status principais das compras, reservas, ofertas e estoque do sistema.  
___  
  
links: [[Telas necessarias]]; [[Fluxos principais]]; [[Regra de negocio]];  
  
# Status recomendados  
  
## Convenção usada  
  
Os valores de status usados no código, no banco e na API devem ficar em **inglês**, no formato `snake_case`.  
  
A tradução para português deve acontecer apenas na interface do usuário.  
  
Exemplo:  
  
| Valor técnico | Texto exibido no frontend |  
|---|---|  
| `pending_admin_approval` | Aguardando aprovação |  
| `cancelled_by_user` | Cancelado pelo usuário |  
| `out_of_stock` | Esgotado |  
  
Regra prática:  
  
```txt  
Banco/API/backend: inglês em snake_case.  
Frontend: traduz para português.  
Documentação: mostra o valor técnico e o significado em português.  
```  
  
---  
  
## Pedido de compra  
  
Representa a intenção de compra de uma ou mais figurinhas do estoque do administrador.  
  
| Status | Quem muda | Significado | Efeito na reserva/estoque |  
|---|---|---|---|  
| `pending_admin_approval` | Sistema | Pedido criado e aguardando avaliação do administrador | Cria reserva temporária |  
| `approved` | Admin | Administrador aprovou o pedido | Mantém reserva ativa |  
| `rejected` | Admin | Administrador recusou o pedido | Libera reserva |  
| `cancelled_by_user` | Usuário | Usuário cancelou o pedido | Libera reserva |  
| `cancelled_by_admin` | Admin | Administrador cancelou o pedido | Libera reserva |  
| `expired` | Sistema | Pedido passou do prazo de 24h | Libera reserva |  
| `completed` | Admin | Pagamento e entrega presenciais foram concluídos | Baixa estoque definitivo |  
  
### Transições permitidas  
  
```txt  
pending_admin_approval -> approved  
pending_admin_approval -> rejected  
pending_admin_approval -> cancelled_by_user  
pending_admin_approval -> expired  
  
approved -> completed  
approved -> cancelled_by_admin  
approved -> expired  
```  
  
### Regras importantes  
  
```txt  
completed baixa estoque definitivo.  
rejected libera reserva.  
cancelled_by_user libera reserva.  
cancelled_by_admin libera reserva.  
expired libera reserva.  
```  
  
---  
  
## Reserva  
  
Representa o bloqueio temporário de estoque vinculado a um pedido.  
  
Reserva não é venda concluída.  
Reserva não é estoque físico.  
Reserva é apenas uma trava temporária para evitar venda duplicada.  
  
| Status | Quem muda | Significado |  
|---|---|---|  
| `active` | Sistema | Reserva criada e ainda válida |  
| `released` | Sistema/Admin/Usuário | Reserva liberada por rejeição ou cancelamento |  
| `expired` | Sistema | Reserva passou do prazo de validade |  
| `converted_to_sale` | Sistema | Reserva virou venda concluída |  
  
### Transições permitidas  
  
```txt  
active -> released  
active -> expired  
active -> converted_to_sale  
```  
  
### Regra de disponibilidade  
  
```txt  
available_quantity = quantity - reserved_quantity  
```  
  
O sistema só deve permitir novo pedido quando:  
  
```txt  
available_quantity >= requested_quantity  
```  
  
---  
  
## Oferta de venda  
  
Representa uma figurinha que o usuário quer vender para o administrador.  
  
A oferta aparece apenas para o próprio usuário e para o administrador.  
  
| Status | Quem muda | Significado |  
|---|---|---|  
| `pending` | Sistema | Usuário enviou a oferta |  
| `under_review` | Admin | Administrador está avaliando a oferta |  
| `accepted` | Admin | Administrador aceitou comprar a figurinha |  
| `rejected` | Admin | Administrador recusou a oferta |  
| `cancelled_by_user` | Usuário | Usuário cancelou a própria oferta |  
| `cancelled_by_admin` | Admin | Administrador cancelou a oferta |  
| `completed` | Admin | Compra presencial concluída |  
  
### Transições permitidas  
  
```txt  
pending -> under_review  
pending -> cancelled_by_user  
pending -> rejected  
pending -> accepted  
  
under_review -> accepted  
under_review -> rejected  
under_review -> cancelled_by_admin  
  
accepted -> completed  
accepted -> cancelled_by_admin  
```  
  
### Regras importantes  
  
```txt  
accepted não adiciona automaticamente ao estoque público.  
completed confirma que a compra presencial aconteceu.  
Após completed, o administrador decide se adiciona a figurinha ao estoque público.  
```  
  
---  
  
## Estoque do administrador  
  
Representa as figurinhas que pertencem ao administrador e podem ou não aparecer na vitrine pública.  
  
| Status | Quem muda | Significado |  
|---|---|---|  
| `available` | Admin/Sistema | Pode aparecer na vitrine e ser vendido |  
| `reserved` | Sistema | Está temporariamente bloqueado por pedido ativo |  
| `unavailable` | Admin | Não aparece para compra |  
| `out_of_stock` | Sistema | Quantidade zerada |  
  
### Regras importantes  
  
```txt  
available indica que o item pode ser vendido.  
unavailable é decisão manual do administrador.  
out_of_stock acontece quando quantity = 0.  
reserved deve ser usado com cuidado, porque a disponibilidade real deve ser calculada por quantity - reserved_quantity.  
```  
  
Para evitar confusão, a vitrine deve usar a regra:  
  
```txt  
is_visible = true  
status = available  
quantity - reserved_quantity > 0  
```  
  
---  
  
## Mapa de tradução para frontend  
  
Este mapa deve ficar no frontend para exibir os textos em português sem contaminar o banco com status misturados.  
  
```ts  
export const orderStatusLabel = {  
pending_admin_approval: "Aguardando aprovação",  
approved: "Aprovado",  
rejected: "Recusado",  
cancelled_by_user: "Cancelado pelo usuário",  
cancelled_by_admin: "Cancelado pelo administrador",  
expired: "Expirado",  
completed: "Concluído",  
} as const;  
  
export const reservationStatusLabel = {  
active: "Ativa",  
released: "Liberada",  
expired: "Expirada",  
converted_to_sale: "Convertida em venda",  
} as const;  
  
export const offerStatusLabel = {  
pending: "Pendente",  
under_review: "Em análise",  
accepted: "Aceita",  
rejected: "Recusada",  
cancelled_by_user: "Cancelada pelo usuário",  
cancelled_by_admin: "Cancelada pelo administrador",  
completed: "Concluída",  
} as const;  
  
export const stockStatusLabel = {  
available: "Disponível",  
reserved: "Reservado",  
unavailable: "Indisponível",  
out_of_stock: "Esgotado",  
} as const;  
```  
  
---  
  
## Sugestão de enums para o backend  
  
```ts  
export enum PurchaseOrderStatus {  
PendingAdminApproval = "pending_admin_approval",  
Approved = "approved",  
Rejected = "rejected",  
CancelledByUser = "cancelled_by_user",  
CancelledByAdmin = "cancelled_by_admin",  
Expired = "expired",  
Completed = "completed",  
}  
  
export enum ReservationStatus {  
Active = "active",  
Released = "released",  
Expired = "expired",  
ConvertedToSale = "converted_to_sale",  
}  
  
export enum UserOfferStatus {  
Pending = "pending",  
UnderReview = "under_review",  
Accepted = "accepted",  
Rejected = "rejected",  
CancelledByUser = "cancelled_by_user",  
CancelledByAdmin = "cancelled_by_admin",  
Completed = "completed",  
}  
  
export enum AdminStockStatus {  
Available = "available",  
Reserved = "reserved",  
Unavailable = "unavailable",  
OutOfStock = "out_of_stock",  
}  
```  
  
---  
  
## Observação para implementação  
  
O backend deve validar as transições de status.  
  
Não basta aceitar qualquer status enviado pelo frontend.  
  
Exemplo de regra:  
  
```txt  
Usuário pode:  
- criar pedido;  
- cancelar o próprio pedido;  
- criar oferta;  
- cancelar a própria oferta.  
  
Administrador pode:  
- aprovar pedido;  
- recusar pedido;  
- concluir pedido;  
- cancelar pedido;  
- avaliar oferta;  
- aceitar oferta;  
- recusar oferta;  
- concluir oferta.  
  
Sistema pode:  
- criar reserva;  
- expirar pedido;  
- expirar reserva;  
- marcar estoque como out_of_stock.  
```

