
```SQL
-- ============================================================
-- MARKETPLACE DE FIGURINHAS DA COPA
-- Schema: figurinhas
-- Banco: Supabase/PostgreSQL
-- Auth: Supabase Auth
-- ============================================================

BEGIN;

-- ============================================================
-- 1. EXTENSÕES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 2. SCHEMA
-- ============================================================

CREATE SCHEMA IF NOT EXISTS figurinhas;

-- ============================================================
-- 3. ENUMS
-- PostgreSQL não tem CREATE TYPE IF NOT EXISTS para enum em todas as versões,
-- então usamos DO $$ com tratamento de duplicate_object.
-- ============================================================

DO $$
BEGIN
  CREATE TYPE figurinhas.user_role AS ENUM (
    'user',
    'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE figurinhas.purchase_order_status AS ENUM (
    'pending_admin_approval',
    'approved',
    'rejected',
    'cancelled_by_user',
    'cancelled_by_admin',
    'expired',
    'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE figurinhas.reservation_status AS ENUM (
    'active',
    'released',
    'expired',
    'converted_to_sale'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE figurinhas.user_offer_status AS ENUM (
    'pending',
    'under_review',
    'accepted',
    'rejected',
    'cancelled_by_user',
    'cancelled_by_admin',
    'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE figurinhas.admin_stock_status AS ENUM (
    'available',
    'reserved',
    'unavailable',
    'out_of_stock'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE figurinhas.sticker_condition AS ENUM (
    'new',
    'good',
    'used',
    'damaged'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE figurinhas.payment_method AS ENUM (
    'presential'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 4. FUNÇÃO GENÉRICA PARA updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION figurinhas.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 5. TABELA: user_profile
-- Perfil complementar ao auth.users do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS figurinhas.user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_whatsapp TEXT NOT NULL,

  role figurinhas.user_role NOT NULL DEFAULT 'user',

  city TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_profile_email_basic_check
    CHECK (POSITION('@' IN email) > 1),

  CONSTRAINT user_profile_phone_basic_check
    CHECK (LENGTH(phone_whatsapp) >= 8)
);

CREATE TRIGGER trg_user_profile_updated_at
BEFORE UPDATE ON figurinhas.user_profile
FOR EACH ROW
EXECUTE FUNCTION figurinhas.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_profile_email
ON figurinhas.user_profile(email);

CREATE INDEX IF NOT EXISTS idx_user_profile_role
ON figurinhas.user_profile(role);

-- ============================================================
-- 6. TABELA: sticker_catalog
-- Catálogo geral: diz que a figurinha existe.
-- Não é estoque.
-- ============================================================

CREATE TABLE IF NOT EXISTS figurinhas.sticker_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  code TEXT NOT NULL UNIQUE,
  album_number TEXT,
  player_name TEXT,
  team_name TEXT,
  category TEXT,

  collection TEXT NOT NULL DEFAULT 'FIFA World Cup 2026',

  image_url TEXT,
  image_source TEXT,
  image_license TEXT,
  image_author TEXT,
  image_attribution_url TEXT,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT sticker_catalog_code_not_empty
    CHECK (LENGTH(TRIM(code)) > 0)
);

CREATE TRIGGER trg_sticker_catalog_updated_at
BEFORE UPDATE ON figurinhas.sticker_catalog
FOR EACH ROW
EXECUTE FUNCTION figurinhas.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_sticker_catalog_code
ON figurinhas.sticker_catalog(code);

CREATE INDEX IF NOT EXISTS idx_sticker_catalog_album_number
ON figurinhas.sticker_catalog(album_number);

CREATE INDEX IF NOT EXISTS idx_sticker_catalog_player_name
ON figurinhas.sticker_catalog(player_name);

CREATE INDEX IF NOT EXISTS idx_sticker_catalog_team_name
ON figurinhas.sticker_catalog(team_name);

CREATE INDEX IF NOT EXISTS idx_sticker_catalog_category
ON figurinhas.sticker_catalog(category);

CREATE INDEX IF NOT EXISTS idx_sticker_catalog_is_active
ON figurinhas.sticker_catalog(is_active);

-- ============================================================
-- 7. TABELA: admin_stock
-- Estoque próprio do administrador.
-- Aparece na vitrine pública se is_visible = true.
-- ============================================================

CREATE TABLE IF NOT EXISTS figurinhas.admin_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  sticker_id UUID NOT NULL REFERENCES figurinhas.sticker_catalog(id) ON DELETE RESTRICT,

  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,

  sale_price NUMERIC(10, 2) NOT NULL DEFAULT 2.00,

  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  status figurinhas.admin_stock_status NOT NULL DEFAULT 'available',

  created_by_admin_id UUID REFERENCES figurinhas.user_profile(id) ON DELETE SET NULL,
  updated_by_admin_id UUID REFERENCES figurinhas.user_profile(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT admin_stock_quantity_non_negative
    CHECK (quantity >= 0),

  CONSTRAINT admin_stock_reserved_quantity_non_negative
    CHECK (reserved_quantity >= 0),

  CONSTRAINT admin_stock_reserved_cannot_exceed_quantity
    CHECK (reserved_quantity <= quantity),

  CONSTRAINT admin_stock_sale_price_non_negative
    CHECK (sale_price >= 0),

  CONSTRAINT admin_stock_unique_sticker
    UNIQUE (sticker_id)
);

CREATE TRIGGER trg_admin_stock_updated_at
BEFORE UPDATE ON figurinhas.admin_stock
FOR EACH ROW
EXECUTE FUNCTION figurinhas.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_admin_stock_sticker_id
ON figurinhas.admin_stock(sticker_id);

CREATE INDEX IF NOT EXISTS idx_admin_stock_status
ON figurinhas.admin_stock(status);

CREATE INDEX IF NOT EXISTS idx_admin_stock_is_visible
ON figurinhas.admin_stock(is_visible);

CREATE INDEX IF NOT EXISTS idx_admin_stock_available_lookup
ON figurinhas.admin_stock(is_visible, status, quantity, reserved_quantity);

-- ============================================================
-- 8. TABELA: purchase_order
-- Pedido de compra feito pelo usuário.
-- Pagamento é presencial.
-- ============================================================

CREATE TABLE IF NOT EXISTS figurinhas.purchase_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES figurinhas.user_profile(id) ON DELETE RESTRICT,

  status figurinhas.purchase_order_status NOT NULL DEFAULT 'pending_admin_approval',

  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,

  payment_method figurinhas.payment_method NOT NULL DEFAULT 'presential',
  negotiation_channel TEXT NOT NULL DEFAULT 'whatsapp',

  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

  admin_decision_by UUID REFERENCES figurinhas.user_profile(id) ON DELETE SET NULL,
  admin_decision_at TIMESTAMPTZ,

  completed_by_admin_id UUID REFERENCES figurinhas.user_profile(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,

  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  user_note TEXT,
  admin_note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT purchase_order_total_non_negative
    CHECK (total_amount >= 0),

  CONSTRAINT purchase_order_expires_after_created
    CHECK (expires_at > created_at)
);

CREATE TRIGGER trg_purchase_order_updated_at
BEFORE UPDATE ON figurinhas.purchase_order
FOR EACH ROW
EXECUTE FUNCTION figurinhas.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_purchase_order_user_id
ON figurinhas.purchase_order(user_id);

CREATE INDEX IF NOT EXISTS idx_purchase_order_status
ON figurinhas.purchase_order(status);

CREATE INDEX IF NOT EXISTS idx_purchase_order_expires_at
ON figurinhas.purchase_order(expires_at);

CREATE INDEX IF NOT EXISTS idx_purchase_order_created_at
ON figurinhas.purchase_order(created_at);

-- ============================================================
-- 9. TABELA: purchase_order_item
-- Itens do pedido.
-- Referencia catálogo e estoque do admin.
-- O preço fica salvo no item para preservar histórico.
-- ============================================================

CREATE TABLE IF NOT EXISTS figurinhas.purchase_order_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES figurinhas.purchase_order(id) ON DELETE CASCADE,

  sticker_id UUID NOT NULL REFERENCES figurinhas.sticker_catalog(id) ON DELETE RESTRICT,

  admin_stock_id UUID NOT NULL REFERENCES figurinhas.admin_stock(id) ON DELETE RESTRICT,

  quantity INTEGER NOT NULL,

  unit_price NUMERIC(10, 2) NOT NULL,

  subtotal NUMERIC(10, 2)
    GENERATED ALWAYS AS (quantity * unit_price) STORED,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT purchase_order_item_quantity_positive
    CHECK (quantity > 0),

  CONSTRAINT purchase_order_item_unit_price_non_negative
    CHECK (unit_price >= 0),

  CONSTRAINT purchase_order_item_unique_stock_per_order
    UNIQUE (order_id, admin_stock_id)
);

CREATE INDEX IF NOT EXISTS idx_purchase_order_item_order_id
ON figurinhas.purchase_order_item(order_id);

CREATE INDEX IF NOT EXISTS idx_purchase_order_item_sticker_id
ON figurinhas.purchase_order_item(sticker_id);

CREATE INDEX IF NOT EXISTS idx_purchase_order_item_admin_stock_id
ON figurinhas.purchase_order_item(admin_stock_id);

-- ============================================================
-- 10. TABELA: reservation
-- Reserva temporária de estoque.
-- Bloqueia quantidade por 24h sem baixar estoque definitivo.
-- ============================================================

CREATE TABLE IF NOT EXISTS figurinhas.reservation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES figurinhas.purchase_order(id) ON DELETE CASCADE,

  admin_stock_id UUID NOT NULL REFERENCES figurinhas.admin_stock(id) ON DELETE RESTRICT,

  sticker_id UUID NOT NULL REFERENCES figurinhas.sticker_catalog(id) ON DELETE RESTRICT,

  quantity INTEGER NOT NULL,

  status figurinhas.reservation_status NOT NULL DEFAULT 'active',

  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),

  released_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT reservation_quantity_positive
    CHECK (quantity > 0),

  CONSTRAINT reservation_expires_after_created
    CHECK (expires_at > created_at),

  CONSTRAINT reservation_unique_stock_per_order
    UNIQUE (order_id, admin_stock_id)
);

CREATE TRIGGER trg_reservation_updated_at
BEFORE UPDATE ON figurinhas.reservation
FOR EACH ROW
EXECUTE FUNCTION figurinhas.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_reservation_order_id
ON figurinhas.reservation(order_id);

CREATE INDEX IF NOT EXISTS idx_reservation_admin_stock_id
ON figurinhas.reservation(admin_stock_id);

CREATE INDEX IF NOT EXISTS idx_reservation_sticker_id
ON figurinhas.reservation(sticker_id);

CREATE INDEX IF NOT EXISTS idx_reservation_status
ON figurinhas.reservation(status);

CREATE INDEX IF NOT EXISTS idx_reservation_expires_at
ON figurinhas.reservation(expires_at);

-- ============================================================
-- 11. TABELA: user_offer
-- Oferta privada de usuário querendo vender figurinha ao admin.
-- Não aparece publicamente.
-- ============================================================

CREATE TABLE IF NOT EXISTS figurinhas.user_offer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES figurinhas.user_profile(id) ON DELETE RESTRICT,

  sticker_id UUID NOT NULL REFERENCES figurinhas.sticker_catalog(id) ON DELETE RESTRICT,

  quantity INTEGER NOT NULL,

  condition figurinhas.sticker_condition NOT NULL DEFAULT 'good',

  suggested_price NUMERIC(10, 2),
  system_price NUMERIC(10, 2) NOT NULL DEFAULT 1.50,
  admin_final_price NUMERIC(10, 2),

  status figurinhas.user_offer_status NOT NULL DEFAULT 'pending',

  user_note TEXT,
  admin_note TEXT,

  reviewed_by_admin_id UUID REFERENCES figurinhas.user_profile(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,

  completed_by_admin_id UUID REFERENCES figurinhas.user_profile(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,

  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_offer_quantity_positive
    CHECK (quantity > 0),

  CONSTRAINT user_offer_suggested_price_non_negative
    CHECK (suggested_price IS NULL OR suggested_price >= 0),

  CONSTRAINT user_offer_system_price_non_negative
    CHECK (system_price >= 0),

  CONSTRAINT user_offer_admin_final_price_non_negative
    CHECK (admin_final_price IS NULL OR admin_final_price >= 0)
);

CREATE TRIGGER trg_user_offer_updated_at
BEFORE UPDATE ON figurinhas.user_offer
FOR EACH ROW
EXECUTE FUNCTION figurinhas.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_user_offer_user_id
ON figurinhas.user_offer(user_id);

CREATE INDEX IF NOT EXISTS idx_user_offer_sticker_id
ON figurinhas.user_offer(sticker_id);

CREATE INDEX IF NOT EXISTS idx_user_offer_status
ON figurinhas.user_offer(status);

CREATE INDEX IF NOT EXISTS idx_user_offer_created_at
ON figurinhas.user_offer(created_at);

-- ============================================================
-- 12. TABELA: system_config
-- Configurações do sistema.
-- ============================================================

CREATE TABLE IF NOT EXISTS figurinhas.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,

  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT system_config_key_not_empty
    CHECK (LENGTH(TRIM(key)) > 0)
);

CREATE TRIGGER trg_system_config_updated_at
BEFORE UPDATE ON figurinhas.system_config
FOR EACH ROW
EXECUTE FUNCTION figurinhas.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_system_config_key
ON figurinhas.system_config(key);

-- ============================================================
-- 13. TABELA: audit_log
-- Histórico mínimo de ações administrativas e eventos importantes.
-- ============================================================

CREATE TABLE IF NOT EXISTS figurinhas.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  actor_user_id UUID REFERENCES figurinhas.user_profile(id) ON DELETE SET NULL,

  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,

  old_value JSONB,
  new_value JSONB,

  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT audit_log_action_not_empty
    CHECK (LENGTH(TRIM(action)) > 0),

  CONSTRAINT audit_log_entity_not_empty
    CHECK (LENGTH(TRIM(entity)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor_user_id
ON figurinhas.audit_log(actor_user_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity
ON figurinhas.audit_log(entity);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity_id
ON figurinhas.audit_log(entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
ON figurinhas.audit_log(created_at);

-- ============================================================
-- 14. FUNÇÃO AUXILIAR: verificar se usuário é admin
-- Usada nas políticas RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION figurinhas.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = figurinhas, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM figurinhas.user_profile up
    WHERE up.id = auth.uid()
      AND up.role = 'admin'
      AND up.is_active = TRUE
  );
$$;

-- ============================================================
-- 15. RLS: habilitar em todas as tabelas
-- ============================================================

ALTER TABLE figurinhas.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE figurinhas.sticker_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE figurinhas.admin_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE figurinhas.purchase_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE figurinhas.purchase_order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE figurinhas.reservation ENABLE ROW LEVEL SECURITY;
ALTER TABLE figurinhas.user_offer ENABLE ROW LEVEL SECURITY;
ALTER TABLE figurinhas.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE figurinhas.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 16. POLICIES: user_profile
-- ============================================================

DROP POLICY IF EXISTS "Users can read own profile" ON figurinhas.user_profile;
CREATE POLICY "Users can read own profile"
ON figurinhas.user_profile
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR figurinhas.is_admin()
);

DROP POLICY IF EXISTS "Users can insert own profile" ON figurinhas.user_profile;
CREATE POLICY "Users can insert own profile"
ON figurinhas.user_profile
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid()
  AND role = 'user'
);

DROP POLICY IF EXISTS "Users can update own basic profile" ON figurinhas.user_profile;
CREATE POLICY "Users can update own basic profile"
ON figurinhas.user_profile
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
  OR figurinhas.is_admin()
)
WITH CHECK (
  figurinhas.is_admin()
  OR (
    id = auth.uid()
    AND role = 'user'
  )
);

-- ============================================================
-- 17. POLICIES: sticker_catalog
-- Catálogo ativo pode ser lido publicamente.
-- Admin gerencia tudo.
-- ============================================================

DROP POLICY IF EXISTS "Public can read active stickers" ON figurinhas.sticker_catalog;
CREATE POLICY "Public can read active stickers"
ON figurinhas.sticker_catalog
FOR SELECT
TO anon, authenticated
USING (
  is_active = TRUE
  OR figurinhas.is_admin()
);

DROP POLICY IF EXISTS "Admins can manage sticker catalog" ON figurinhas.sticker_catalog;
CREATE POLICY "Admins can manage sticker catalog"
ON figurinhas.sticker_catalog
FOR ALL
TO authenticated
USING (figurinhas.is_admin())
WITH CHECK (figurinhas.is_admin());

-- ============================================================
-- 18. POLICIES: admin_stock
-- Público pode ver estoque visível.
-- Escrita só admin.
-- ============================================================

DROP POLICY IF EXISTS "Public can read visible admin stock" ON figurinhas.admin_stock;
CREATE POLICY "Public can read visible admin stock"
ON figurinhas.admin_stock
FOR SELECT
TO anon, authenticated
USING (
  is_visible = TRUE
  AND status <> 'unavailable'
);

DROP POLICY IF EXISTS "Admins can manage admin stock" ON figurinhas.admin_stock;
CREATE POLICY "Admins can manage admin stock"
ON figurinhas.admin_stock
FOR ALL
TO authenticated
USING (figurinhas.is_admin())
WITH CHECK (figurinhas.is_admin());

-- ============================================================
-- 19. POLICIES: purchase_order
-- Usuário vê seus pedidos.
-- Admin vê e gerencia todos.
-- Criação idealmente deve passar pelo backend transacional.
-- ============================================================

DROP POLICY IF EXISTS "Users can read own purchase orders" ON figurinhas.purchase_order;
CREATE POLICY "Users can read own purchase orders"
ON figurinhas.purchase_order
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR figurinhas.is_admin()
);

DROP POLICY IF EXISTS "Users can create own purchase orders" ON figurinhas.purchase_order;
CREATE POLICY "Users can create own purchase orders"
ON figurinhas.purchase_order
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status = 'pending_admin_approval'
);

DROP POLICY IF EXISTS "Admins can manage purchase orders" ON figurinhas.purchase_order;
CREATE POLICY "Admins can manage purchase orders"
ON figurinhas.purchase_order
FOR ALL
TO authenticated
USING (figurinhas.is_admin())
WITH CHECK (figurinhas.is_admin());

-- ============================================================
-- 20. POLICIES: purchase_order_item
-- Usuário vê itens dos próprios pedidos.
-- Escrita deve ser feita pelo backend.
-- ============================================================

DROP POLICY IF EXISTS "Users can read own purchase order items" ON figurinhas.purchase_order_item;
CREATE POLICY "Users can read own purchase order items"
ON figurinhas.purchase_order_item
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM figurinhas.purchase_order po
    WHERE po.id = purchase_order_item.order_id
      AND (
        po.user_id = auth.uid()
        OR figurinhas.is_admin()
      )
  )
);

DROP POLICY IF EXISTS "Admins can manage purchase order items" ON figurinhas.purchase_order_item;
CREATE POLICY "Admins can manage purchase order items"
ON figurinhas.purchase_order_item
FOR ALL
TO authenticated
USING (figurinhas.is_admin())
WITH CHECK (figurinhas.is_admin());

-- ============================================================
-- 21. POLICIES: reservation
-- Usuário vê reservas ligadas aos próprios pedidos.
-- Escrita só admin/backend.
-- ============================================================

DROP POLICY IF EXISTS "Users can read own reservations" ON figurinhas.reservation;
CREATE POLICY "Users can read own reservations"
ON figurinhas.reservation
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM figurinhas.purchase_order po
    WHERE po.id = reservation.order_id
      AND (
        po.user_id = auth.uid()
        OR figurinhas.is_admin()
      )
  )
);

DROP POLICY IF EXISTS "Admins can manage reservations" ON figurinhas.reservation;
CREATE POLICY "Admins can manage reservations"
ON figurinhas.reservation
FOR ALL
TO authenticated
USING (figurinhas.is_admin())
WITH CHECK (figurinhas.is_admin());

-- ============================================================
-- 22. POLICIES: user_offer
-- Usuário vê suas próprias ofertas.
-- Admin vê e gerencia todas.
-- ============================================================

DROP POLICY IF EXISTS "Users can read own offers" ON figurinhas.user_offer;
CREATE POLICY "Users can read own offers"
ON figurinhas.user_offer
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR figurinhas.is_admin()
);

DROP POLICY IF EXISTS "Users can create own offers" ON figurinhas.user_offer;
CREATE POLICY "Users can create own offers"
ON figurinhas.user_offer
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND status = 'pending'
);

DROP POLICY IF EXISTS "Admins can manage user offers" ON figurinhas.user_offer;
CREATE POLICY "Admins can manage user offers"
ON figurinhas.user_offer
FOR ALL
TO authenticated
USING (figurinhas.is_admin())
WITH CHECK (figurinhas.is_admin());

-- ============================================================
-- 23. POLICIES: system_config
-- Apenas admin.
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage system config" ON figurinhas.system_config;
CREATE POLICY "Admins can manage system config"
ON figurinhas.system_config
FOR ALL
TO authenticated
USING (figurinhas.is_admin())
WITH CHECK (figurinhas.is_admin());

-- ============================================================
-- 24. POLICIES: audit_log
-- Apenas admin lê.
-- Escrita idealmente pelo backend.
-- ============================================================

DROP POLICY IF EXISTS "Admins can read audit logs" ON figurinhas.audit_log;
CREATE POLICY "Admins can read audit logs"
ON figurinhas.audit_log
FOR SELECT
TO authenticated
USING (figurinhas.is_admin());

DROP POLICY IF EXISTS "Admins can create audit logs" ON figurinhas.audit_log;
CREATE POLICY "Admins can create audit logs"
ON figurinhas.audit_log
FOR INSERT
TO authenticated
WITH CHECK (figurinhas.is_admin());

-- ============================================================
-- 25. GRANTS PARA SCHEMA CUSTOMIZADO
-- Necessário se você quiser acessar figurinhas via Supabase API.
-- Se usar só NestJS/Prisma via conexão direta, ainda não atrapalha.
-- ============================================================

GRANT USAGE ON SCHEMA figurinhas TO anon, authenticated, service_role;

GRANT SELECT ON figurinhas.sticker_catalog TO anon;
GRANT SELECT ON figurinhas.admin_stock TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA figurinhas
TO authenticated;

GRANT ALL
ON ALL TABLES IN SCHEMA figurinhas
TO service_role;

GRANT EXECUTE
ON ALL FUNCTIONS IN SCHEMA figurinhas
TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA figurinhas
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA figurinhas
GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA figurinhas
GRANT EXECUTE ON FUNCTIONS TO authenticated, service_role;

-- ============================================================
-- 26. CONFIGURAÇÕES INICIAIS
-- ============================================================

INSERT INTO figurinhas.system_config (key, value, description)
VALUES
  (
    'default_sale_price',
    '{"amount": 2.00, "currency": "BRL"}',
    'Preço padrão de venda ao público'
  ),
  (
    'default_purchase_price',
    '{"amount": 1.50, "currency": "BRL"}',
    'Preço padrão de compra de figurinhas ofertadas por usuários'
  ),
  (
    'reservation_ttl_hours',
    '{"hours": 24}',
    'Tempo padrão de reserva de pedido em horas'
  ),
  (
    'negotiation_channel',
    '{"channel": "whatsapp"}',
    'Canal padrão de negociação presencial'
  )
ON CONFLICT (key)
DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

COMMIT;
```

# Query para verificar os enums

```SQL
SELECT
  n.nspname AS schema,
  t.typname AS enum_name,
  e.enumlabel AS value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'figurinhas'
ORDER BY t.typname, e.enumsortorder;
```


# Query de disponibilidade real de estoque

Essa é a conta que o backend deve respeitar:

```SQL
SELECT
  sc.code,
  sc.player_name,
  sc.team_name,
  ast.quantity,
  ast.reserved_quantity,
  ast.quantity - ast.reserved_quantity AS available_quantity,
  ast.sale_price,
  ast.status,
  ast.is_visible
FROM figurinhas.admin_stock ast
JOIN figurinhas.sticker_catalog sc
  ON sc.id = ast.sticker_id
WHERE ast.is_visible = TRUE
  AND sc.is_active = TRUE
ORDER BY sc.code;
```