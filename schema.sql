CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  name       VARCHAR(255),
  image      TEXT,                          -- Google profile picture URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  color      VARCHAR(7)   NOT NULL DEFAULT '#22C55E',
  icon       VARCHAR(50)            DEFAULT 'tag',
  is_default BOOLEAN               DEFAULT FALSE,
  created_at TIMESTAMPTZ           DEFAULT NOW()
);

INSERT INTO categories (user_id, name, color, icon, is_default) VALUES
  (NULL, 'Food & Dining',     '#EF4444', 'utensils',         TRUE),
  (NULL, 'Transport',         '#3B82F6', 'car',              TRUE),
  (NULL, 'Shopping',          '#8B5CF6', 'shopping-bag',     TRUE),
  (NULL, 'Entertainment',     '#F59E0B', 'film',             TRUE),
  (NULL, 'Health',            '#10B981', 'heart',            TRUE),
  (NULL, 'Bills & Utilities', '#6B7280', 'zap',              TRUE),
  (NULL, 'Education',         '#EC4899', 'book',             TRUE),
  (NULL, 'Other',             '#9CA3AF', 'more-horizontal',  TRUE)
ON CONFLICT DO NOTHING;



CREATE TABLE IF NOT EXISTS expenses (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER      NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  category_id INTEGER               REFERENCES categories(id) ON DELETE SET NULL,
  amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description TEXT,
  expense_date        DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ           DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS budgets (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER      NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
  category_id   INTEGER      NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  monthly_limit NUMERIC(12,2) NOT NULL CHECK (monthly_limit > 0),
  month         INTEGER      NOT NULL CHECK (month BETWEEN 1 AND 12),
  year          INTEGER      NOT NULL CHECK (year  BETWEEN 2000 AND 2100),
  created_at    TIMESTAMPTZ           DEFAULT NOW(),

  UNIQUE (user_id, category_id, month, year)
);


CREATE INDEX IF NOT EXISTS idx_expenses_user_date
  ON expenses(user_id, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_user_category
  ON expenses(user_id, category_id);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month
  ON budgets(user_id, month, year);

CREATE INDEX IF NOT EXISTS idx_categories_user
  ON categories(user_id);