-- One-time cleanup after a full D1 export.
-- Every pair below was verified to have the same normalized customer name,
-- phone, program, track, delivery, contract total, paid amount, and state.
DROP TABLE IF EXISTS dedupe_orders_stage_20260817;
DROP TABLE IF EXISTS dedupe_enrollments_stage_20260817;
DROP TABLE IF EXISTS dedupe_payments_stage_20260817;
DROP TABLE IF EXISTS dedupe_reservations_stage_20260817;
CREATE TABLE dedupe_orders_stage_20260817(loser_id TEXT PRIMARY KEY, keeper_id TEXT NOT NULL);
INSERT INTO dedupe_orders_stage_20260817(loser_id,keeper_id) VALUES
('ORD-acb4c5bc-5','ORD-ff22d721-0'),
('ORD-f1ce5159-3','ORD-912be4d1-8'),
('OPS-ORD-CLT-898531','OPS-ORD-CLT-302960'),
('OPS-ORD-CLT-469516','OPS-ORD-CLT-144664'),
('OPS-ORD-CLT-657929','OPS-ORD-CLT-189085'),
('OPS-ORD-CLT-991032','OPS-ORD-CLT-353194'),
('ORD-7dff8252-7','ORD-bf926247-c'),
('ORD-42d3b386-b','ORD-a606b08a-8'),
('OPS-ORD-CLT-619162','OPS-ORD-CLT-522171'),
('ORD-fa1a955a-7','ORD-0d10ee8a-e'),
('OPS-ORD-CLT-576509','OPS-ORD-CLT-124975'),
('OPS-ORD-CLT-659225','OPS-ORD-CLT-504399'),
('OPS-ORD-CLT-680269','OPS-ORD-CLT-504884'),
('ORD-0219fcca-6','ORD-3586934f-3');

CREATE TABLE dedupe_enrollments_stage_20260817 AS SELECT id FROM enrollments WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
CREATE TABLE dedupe_payments_stage_20260817 AS SELECT id FROM payments WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
CREATE TABLE dedupe_reservations_stage_20260817 AS SELECT id FROM seat_reservations WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM workflow_tasks
WHERE entity_id IN (SELECT id FROM dedupe_enrollments_stage_20260817)
   OR entity_id IN (SELECT id FROM dedupe_payments_stage_20260817)
   OR entity_id IN (SELECT id FROM dedupe_reservations_stage_20260817)
   OR entity_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM tasks WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM attention_followups WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM finance_notes WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM finance_undo_log WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM withdrawals WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM installments WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM enrollments WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM seat_reservations WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM payments WHERE order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM payment_intents WHERE resulting_order_id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);
DELETE FROM orders WHERE id IN (SELECT loser_id FROM dedupe_orders_stage_20260817);

INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at)
VALUES(
  'AUD-DEDUP-20260817-1',
  'system',
  'MERGE_EXACT_DUPLICATE_ORDERS',
  'orders',
  '14-exact-duplicates',
  '{"rule":"same normalized name and phone plus identical program, track, delivery, totals and state","removed_duplicate_orders":14,"backup":"pre-dedupe-2026-08-17.sql"}',
  datetime('now')
);

DROP TABLE dedupe_enrollments_stage_20260817;
DROP TABLE dedupe_payments_stage_20260817;
DROP TABLE dedupe_reservations_stage_20260817;
DROP TABLE dedupe_orders_stage_20260817;
