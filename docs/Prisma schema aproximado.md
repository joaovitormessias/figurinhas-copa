___
Esse eh o esquema prisma aproximado do que deve ser feito, ainda faltando coisas  a mais
___

```prisma
model StickerCatalog {
  id          String   @id @default(uuid())
  code        String   @unique
  albumNumber String?
  playerName  String?
  teamName    String?
  category    String?
  collection  String   @default("FIFA World Cup 2026 Panini")
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  stockItems  AdminStock[]
  offers      UserOffer[]
  orderItems  PurchaseOrderItem[]

  @@schema("figurinhas")
}

model AdminStock {
  id               String   @id @default(uuid())
  stickerId        String
  quantity         Int      @default(0)
  reservedQuantity Int      @default(0)
  salePrice        Decimal  @default(2.00)
  isVisible        Boolean  @default(true)
  status           String   @default("available")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  sticker       StickerCatalog @relation(fields: [stickerId], references: [id])
  orderItems    PurchaseOrderItem[]
  reservations  Reservation[]

  @@schema("figurinhas")
}

model PurchaseOrder {
  id                 String   @id @default(uuid())
  userId             String
  status             String   @default("pending_admin_approval")
  totalAmount        Decimal  @default(0)
  expiresAt          DateTime
  paymentMethod      String   @default("presential")
  negotiationChannel String?  @default("whatsapp")
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  items              PurchaseOrderItem[]
  reservations       Reservation[]

  @@schema("figurinhas")
}

model PurchaseOrderItem {
  id           String  @id @default(uuid())
  orderId      String
  stickerId    String
  adminStockId String
  quantity     Int
  unitPrice    Decimal
  subtotal     Decimal

  order      PurchaseOrder  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  sticker    StickerCatalog @relation(fields: [stickerId], references: [id])
  adminStock AdminStock     @relation(fields: [adminStockId], references: [id])

  @@schema("figurinhas")
}

model UserOffer {
  id              String   @id @default(uuid())
  userId          String
  stickerId       String
  quantity        Int
  suggestedPrice  Decimal?
  systemPrice     Decimal  @default(1.50)
  adminFinalPrice Decimal?
  status          String   @default("pending")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  sticker         StickerCatalog @relation(fields: [stickerId], references: [id])

  @@schema("figurinhas")
}

model Reservation {
  id          String    @id @default(uuid())
  orderId     String
  stockId     String
  stickerId   String
  quantity    Int
  status      String    @default("active")
  expiresAt   DateTime
  releasedAt  DateTime?
  convertedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  order   PurchaseOrder  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  stock   AdminStock     @relation(fields: [stockId], references: [id])
  sticker StickerCatalog @relation(fields: [stickerId], references: [id])

  @@index([orderId])
  @@index([stockId])
  @@index([status])
  @@index([expiresAt])
  @@schema("figurinhas")
}
```