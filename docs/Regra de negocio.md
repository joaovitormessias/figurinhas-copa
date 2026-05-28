___
Regra de negocio do sistema
___

links: [[Perfis de usuario]];
## RN01: Vitrine pública

A página inicial deve exibir apenas as figurinhas que pertencem ao estoque do administrador e estão marcadas como disponíveis para venda.

**Exemplo:**

| Figurinha                       | Estoque |   Preço | Visível ao público    |
| ------------------------------- | ------: | ------: | --------------------- |
| Brasil 01                       |       3 | R$ 2,00 | Sim                   |
| Argentina 07                    |       0 | R$ 2,00 | Não ou “Indisponível” |
| França 10 anunciada por usuário |       1 | R$ 1,50 | Não                   |
___

## RN02: Compra pelo usuário

Para comprar, o usuário precisa estar cadastrado e logado.

O sistema não processa pagamento online. Ele apenas registra a intenção de compra e permite que o administrador confirme manualmente depois do pagamento presencial.

Fluxo:

```
Usuário escolhe figurinha
→ adiciona ao pedido
→ confirma interesse
→ sistema cria pedido pendente
→ administrador combina pagamento presencial
→ administrador marca como pago/concluído
```

___

## RN03: Venda de figurinha pelo usuário

Quando um usuário quer vender uma figurinha, ele cadastra uma oferta.

Essa oferta:

- não aparece para outros usuários;
- aparece apenas no painel administrativo;
- tem preço padrão inicial de R$ 1,50;
- pode ser aceita, recusada ou negociada pelo administrador.

Fluxo:

```
Usuário seleciona figurinha do catálogo
→ informa quantidade e estado
→ envia oferta
→ administrador avalia
→ administrador aceita ou rejeita
→ se aceitar, registra compra presencial
→ estoque do administrador pode ser atualizado
```

___

## RN04: Preços configuráveis

O sistema deve ter valores padrão:

|Tipo|Valor padrão|
|---|--:|
|Compra de usuários pelo administrador|R$ 1,50|
|Venda ao público|R$ 2,00|

Mas o administrador deve poder alterar esses valores.

Melhor ainda: permitir preço por figurinha, porque figurinhas repetidas e figurinhas raras não têm o mesmo valor. 

___

## RN05: Catálogo completo

O sistema deve catalogar todas as figurinhas da coleção usada no projeto da Copa do Mundo da FIFA 26 baseado no album da Panini.

___

## RN06: Isolamento de visibilidade

Usuário comum **não pode ver**:

- ofertas feitas por outros usuários;
- estoque oculto;
- preço de compra interno;
- histórico de negociação de terceiros;
- painel administrativo.

Administrador pode ver tudo.

---

## RN07: Reserva e baixa de estoque

Ao criar um pedido, o sistema deve verificar se existe quantidade disponível no estoque do administrador.

Quantidade disponível = quantidade_total - quantidade_reservada.

Quando o pedido é criado:
- o pedido fica com status `pending_admin_approval`;
- o sistema cria uma reserva temporária por 24h;
- a quantidade reservada passa a bloquear novas compras daquela figurinha;
- o estoque definitivo ainda não é baixado.

Quando o pedido é concluído:
- o pedido vira `completed`;
- a reserva é encerrada;
- a quantidade total do estoque é reduzida definitivamente.

Quando o pedido é recusado, cancelado ou expirado:
- a reserva é liberada;
- a quantidade total do estoque não muda.