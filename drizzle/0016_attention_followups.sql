CREATE TABLE IF NOT EXISTS attention_followups (
  order_id TEXT PRIMARY KEY NOT NULL REFERENCES orders(id),
  state TEXT NOT NULL DEFAULT 'needs_operations',
  first_action_by_email TEXT,
  first_action_at TEXT,
  finance_action_by_email TEXT,
  finance_action_at TEXT,
  final_action_by_email TEXT,
  final_action_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS attention_followups_state_idx ON attention_followups(state);
