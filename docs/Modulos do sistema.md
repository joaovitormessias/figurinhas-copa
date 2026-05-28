___
Aqui eh divida as responsabilidades do sistema 
___

links: [[Requisitos funcionais]]
## Módulo de autenticação

Funcionalidades:

- cadastro;
- login;
- logout;
- recuperação de senha;
- proteção de rotas;
- controle de sessão;
- diferenciação entre usuário comum e administrador.

Dados mínimos no cadastro:

|Campo|Obrigatório|Observação|
|---|---|---|
|Nome|Sim|Identificação básica|
|E-mail|Sim|Login e contato|
|Telefone/WhatsApp|Talvez|Útil para combinar pagamento|
|Senha|Sim|Deve ser armazenada com hash|
|Cidade|Talvez|Se houver entrega/encontro presencial|
___

## Módulo de catálogo

O catálogo é a base geral de todas as figurinhas possíveis.

Exemplo de campos:

|Campo|Tipo|Exemplo|
|---|---|---|
|ID|UUID/int|123|
|Código|string|BRA-01|
|Nome|string|Neymar|
|Seleção|string|Brasil|
|Categoria|string|Jogador, escudo, especial|
|Número no álbum|int/string|45|
|Imagem|arquivo/url|imagem da figurinha|
|Coleção|string|Copa 2026|
|Ativa|boolean|Sim/Não|

Importante: o catálogo **não é estoque**. Catálogo diz que a figurinha existe. Estoque diz que alguém tem aquela figurinha.

Esse é um dos pontos em que muita gente se perde, porque mistura “tipo de produto” com “item disponível”. Aí nasce aquele banco de dados que parece planilha de pastelaria.

___

## Módulo de estoque do administrador

Controla as figurinhas que aparecem na vitrine pública.

Campos possíveis:

| Campo         | Tipo     | Observação                          |
| ------------- | -------- | ----------------------------------- |
| ID            | UUID/int | Identificador                       |
| Figurinha ID  | FK       | Referência ao catálogo              |
| Quantidade    | int      | Quantidade disponível               |
| Preço venda   | decimal  | Ex: R$ 2,00                         |
| Status        | enum     | disponível, indisponível, reservado |
| Visível       | boolean  | Controla exibição pública           |
| Criado em     | datetime | Auditoria                           |
| Atualizado em | datetime | Auditoria                           |

___

## Módulo de ofertas de usuários

Quando alguém quer vender uma figurinha ao administrador.

Campos possíveis:

| Campo              | Tipo     | Observação                            |
| ------------------ | -------- | ------------------------------------- |
| ID                 | UUID/int | Identificador                         |
| Usuário ID         | FK       | Quem ofertou                          |
| Figurinha ID       | FK       | Qual figurinha                        |
| Quantidade         | int      | Quantas unidades                      |
| Preço solicitado   | decimal  | Padrão R$ 1,50                        |
| Estado             | enum     | nova, boa, usada, danificada          |
| Observação         | text     | Opcional                              |
| Status             | enum     | pendente, aceita, recusada, cancelada |
| Visível ao público | boolean  | Sempre falso                          |
| Criado em          | datetime | Auditoria                             |
Regra crítica:
```
Usuário só pode ver suas próprias ofertas.
Administrador pode ver todas.
```

___

## Módulo de pedidos de compra

Quando usuário quer comprar figurinhas do administrador.
Campos possíveis:

|Campo|Tipo|Observação|
|---|---|---|
|ID|UUID/int|Identificador|
|Usuário ID|FK|Comprador|
|Status|enum|pendente, confirmado, pago, entregue, cancelado|
|Valor total|decimal|Soma dos itens|
|Forma pagamento|enum|presencial|
|Observação|text|Local/combinação|
|Criado em|datetime|Auditoria|

___

## Módulo administrativo

O painel administrativo deve permitir:

- ver resumo:
    - figurinhas em estoque;
    - pedidos pendentes;
    - ofertas pendentes;
    - valor total vendido;
    - valor total comprado;
- gerenciar catálogo;
- gerenciar estoque;
- gerenciar pedidos;
- gerenciar ofertas;
- configurar preços padrão;
- registrar pagamento presencial;
- consultar histórico.

___

