___
Esse modulo concentra as informacoes dos requisitos funcionais do sistema de Figurinhas da copa
___

links: [[Requisitos nao funcionais]]

## RF01: Visualizar vitrine

O sistema deve exibir figurinhas disponíveis para compra na tela principal.

Critérios de aceite:

- visitante consegue ver figurinhas públicas;
- visitante não consegue comprar sem login;
- figurinha sem estoque não deve permitir compra;
- preço deve aparecer claramente.

___
## RF02: Buscar figurinha

O sistema deve permitir buscar por:

- nome;
- código;
- número;
- seleção;
- categoria;
- disponibilidade.

___

## RF03: Cadastro de usuário

O sistema deve permitir cadastro com nome, e-mail, numero de whatsapp e senha.

Critérios:

- e-mail único;
- numero whatsapp;
- senha protegida;
- validação de campos;
- aceite de política de privacidade, se aplicável.

___

## RF04: Login de usuário

O sistema deve autenticar usuários e diferenciar permissões.

Critérios:

- usuário comum acessa área comum;
- administrador acessa painel;
- usuário comum não acessa rotas administrativas nem via URL direta.
___

## RF05: Criar pedido de compra

O usuário logado deve poder criar pedido com uma ou mais figurinhas (no maximo 3 figurinhas por pedido).

Critérios:

- sistema verifica estoque disponível;
- estoque disponível = quantity - reservedQuantity;
- sistema cria pedido com status `pending_admin_approval`;
- sistema cria reserva temporária por 24h;
- sistema não reduz o estoque definitivo na criação do pedido;
- sistema impede criar pedido se não houver quantidade disponível;
- sistema calcula total com base no preço salvo no momento da criação.

---
## RF06: Registrar pagamento presencial

Critérios:

- apenas administrador pode concluir pedido;
- ao concluir, pedido vira `completed`;
- sistema baixa o estoque definitivo;
- sistema libera/encerra a reserva vinculada ao pedido;
- registro deve conter data e responsável pela confirmação.

___

## RF07: Anunciar figurinha para venda

Usuário logado deve poder selecionar uma figurinha do catálogo e oferecer ao administrador.

Critérios:

- oferta aparece apenas para o administrador;
- preço padrão sugerido é R$ 1,50;
- usuário acompanha status da própria oferta;
- usuário não vê ofertas de terceiros.

___

## RF08: Avaliar oferta recebida

Administrador deve poder:

- aceitar;
- recusar;
- cancelar;
- alterar observação;
- registrar compra presencial;
- opcionalmente adicionar ao estoque próprio.

___

## RF09: Configurar preços

Administrador deve poder configurar:

- preço padrão de compra;
- preço padrão de venda;
- preço específico por figurinha.

___
## RF10: Gerenciar catálogo

Administrador deve poder:

- cadastrar figurinha;
- editar figurinha;
- ativar/desativar figurinha;
- importar catálogo, se houver planilha;
- associar imagem.

___

## RF11: Histórico e auditoria

Sistema deve registrar ações importantes:

- criação de pedido;
- alteração de status;
- confirmação de pagamento;
- criação de oferta;
- aceite/recusa de oferta;
- alteração de preço;
- alteração de estoque.

Isso ajuda a responder a clássica pergunta corporativa: “quem fez essa lambança?” Sem log, sobra reunião. E reunião é a punição divina para sistema sem auditoria.