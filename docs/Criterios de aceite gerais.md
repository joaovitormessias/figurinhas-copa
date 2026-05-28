---

---
___
Criterios de aceites gerais para considerar o projeto minimamente aceitavel
___

links: [[Arquitetura sugerida]];

O sistema estará minimamente aceitável quando:

1. Visitante conseguir ver apenas figurinhas públicas.
2. Usuário conseguir se cadastrar e logar.
3. Usuário conseguir criar pedido de compra.
4. Usuário conseguir anunciar figurinha para vender.
5. Usuário não conseguir ver ofertas de outros usuários.
6. Administrador conseguir ver todas as ofertas.
7. Administrador conseguir alterar preço e estoque.
8. Administrador conseguir confirmar pagamento presencial.
9. Sistema impedir compra de figurinha sem estoque.
10. Sistema registrar histórico mínimo de ações administrativas.
11. Sistema deve impedir pedido quando `quantity - reservedQuantity` for menor que a quantidade solicitada.
12. Sistema deve criar reserva temporária ao criar pedido.
13. Sistema deve liberar reserva quando pedido for recusado, cancelado ou expirado.
14. Sistema deve baixar estoque definitivo apenas quando pedido for `completed`.
15. Sistema não deve permitir overselling em pedidos concorrentes.