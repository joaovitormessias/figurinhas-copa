___
Esse arquivo divide os fluxos principais do sistema
___

links: [[Status recomendados]]
## Fluxo 1: Visitante compra figurinha

```
1. Visitante acessa a vitrine.
2. Sistema lista figurinhas do estoque público.
3. Sistema calcula disponibilidade usando `quantity - reservedQuantity`.
4. Visitante escolhe uma figurinha.
5. Sistema solicita login/cadastro.
6. Usuário logado confirma pedido.
7. Backend verifica disponibilidade dentro de transação.
8. Sistema cria pedido `pending_admin_approval`.
9. Sistema cria reserva ativa com validade de 24h.
10. Administrador vê pedido.
11. Administrador aceita ou recusa.
12. Se recusar, reserva é liberada.
13. Se passar de 24h sem conclusão, pedido vira `expired` e reserva é liberada.
14. Se aceitar, status vira `approved`.
15. Pagamento acontece presencialmente.
16. Administrador marca como `completed`.
17. Sistema baixa estoque definitivo.
18. Sistema encerra reserva.
```
---
## Fluxo 2: Usuário vende figurinha

```
1. Usuário acessa área "Vender figurinha".
2. Sistema mostra catálogo completo.
3. Usuário seleciona figurinha.
4. Usuário informa quantidade e estado.
5. Sistema sugere valor de R$ 1,50.
6. Usuário envia oferta.
7. Administrador recebe oferta no painel.
8. Administrador aceita ou recusa.
9. Se aceitar, pagamento/entrega ocorre presencialmente.
10. Administrador decide se adiciona ao estoque público.
```

---

## Fluxo 3: Administrador cadastra estoque

```
1. Administrador acessa painel.
2. Seleciona figurinha do catálogo.
3. Define quantidade.
4. Define preço de venda.
5. Marca como visível.
6. Figurinha aparece na vitrine pública.
```

