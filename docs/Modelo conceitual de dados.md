___ 
Esse arquivo concentra o modelo conceitual do banco de dados
___

links: [[Separacao correta das tabelas]]

## Entidades princiapis

```
User
 ├── id
 ├── name
 ├── email
 ├── password_hash
 ├── phone
 ├── role
 └── created_at

StickerCatalog
 ├── id
 ├── code
 ├── album_number
 ├── name
 ├── team
 ├── category
 ├── image_url
 ├── collection
 └── is_active

AdminStock
 ├── id
 ├── sticker_id
 ├── quantity
 ├── reserved_quantity
 ├── sale_price
 ├── is_visible
 └── status

UserOffer
 ├── id
 ├── user_id
 ├── sticker_id
 ├── quantity
 ├── requested_price
 ├── condition
 ├── status
 └── created_at

PurchaseOrder
 ├── id
 ├── user_id
 ├── status
 ├── total_amount
 ├── payment_method
 ├── payment_status
 └── created_at
 
 Reservation
 ├── id
 ├── order_id
 ├── stock_id
 ├── sticker_id
 ├── quantity
 ├── status
 ├── expires_at
 ├── released_at
 ├── converted_at
 ├── created_at
 └── updated_at

PurchaseOrderItem
 ├── id
 ├── order_id
 ├── sticker_id
 ├── quantity
 ├── unit_price
 └── subtotal

SystemConfig
 ├── id
 ├── key
 └── value

AuditLog
 ├── id
 ├── actor_user_id
 ├── action
 ├── entity
 ├── entity_id
 ├── old_value
 ├── new_value
 └── created_at
```


## Minha recomendação

Use **o mesmo PostgreSQL**, mas crie um schema separado:
```SQL
CREATE SCHEMA figurinhas;
```

E coloque as tabelas do projeto dentro dele:
```
figurinhas.sticker_catalog
figurinhas.admin_stock
figurinhas.user_offer
figurinhas.purchase_order
figurinhas.purchase_order_item
figurinhas.reservation
figurinhas.system_config
figurinhas.audit_log
```