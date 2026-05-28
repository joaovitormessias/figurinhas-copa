___
Esse arquivo concentra os requisitos nao funcionais do sistema de Figurinhas da copa
___

links: [[Modelo conceitual de dados]]
## RNF01: Segurança

O sistema deve ter:

- senhas armazenadas com hash seguro;
- controle de acesso por papel;
- validação no backend;
- proteção contra acesso indevido a dados de outros usuários;
- logs administrativos;
- proteção contra injeção SQL;
- proteção contra CSRF, se usar sessão/cookie;
- HTTPS;
- backups.

___

## RNF02: Privacidade e LGPD

Como o sistema coleta nome, e-mail, telefone e histórico comercial, deve prever:

- política de privacidade simples;
- coleta apenas dos dados necessários;
- possibilidade de exclusão/anonimização quando aplicável;
- controle de acesso aos dados pessoais;
- registro mínimo de operações importantes.

___

## RNF03: Usabilidade

O sistema deve ser simples.

Público provável:

- colecionadores;
- pais;
- crianças/adolescentes supervisionados;
- clientes da Schumacher Tur;
- pessoas sem paciência para interface gourmetizada.

A vitrine precisa responder rápido:

```
Tenho essa figurinha?
Quanto custa?
Como compro?
Como vendo uma minha?
```

___

## RNF04: Performance

Para MVP:

- carregamento inicial rápido;
- paginação ou busca em catálogo grande;
- imagens otimizadas;
- consultas indexadas por código, seleção e nome.

---

## RNF05: Disponibilidade

Como é um projeto pequeno, não precisa começar com arquitetura de banco distribuído como se fosse a bolsa de valores.

Mas precisa de:

- deploy estável;
- backup automático;
- monitoramento básico;
- domínio e SSL funcionando.

---

