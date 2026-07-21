import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const programs = sqliteTable("programs", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("برنامج"),
  defaultTrialDays: integer("default_trial_days").notNull().default(0),
  seatReservationFee: real("seat_reservation_fee"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("programs_code_uq").on(table.code)]);

// A prospect is not yet an operational customer. It becomes one only after an
// approved payment or a trial granted by Sales.
export const prospects = sqliteTable("prospects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  intendedProgramId: text("intended_program_id").references(() => programs.id),
  status: text("status").notNull().default("بانتظار الدفع"),
  createdByEmail: text("created_by_email").notNull(),
  convertedCustomerId: text("converted_customer_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("prospects_phone_idx").on(table.phone), index("prospects_email_idx").on(table.email)]);

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  customerType: text("customer_type").notNull().default("مسجل"),
  admittedVia: text("admitted_via"),
  admissionSourceId: text("admission_source_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
}, (table) => [uniqueIndex("customers_phone_uq").on(table.phone), uniqueIndex("customers_email_uq").on(table.email)]);

export const programTrials = sqliteTable("program_trials", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id),
  programId: text("program_id").notNull().references(() => programs.id),
  status: text("status").notNull().default("فعالة"),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  grantedBySalesEmail: text("granted_by_sales_email").notNull(),
  convertedOrderId: text("converted_order_id"),
  outcome: text("outcome"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("program_trials_customer_idx").on(table.customerId), index("program_trials_status_idx").on(table.status)]);

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id),
  orderType: text("order_type").notNull().default("برنامج"),
  programId: text("program_id").references(() => programs.id),
  program: text("program").notNull(),
  track: text("track").notNull(),
  delivery: text("delivery").notNull(),
  language: text("language").notNull(),
  purchaseSource: text("purchase_source").notNull(),
  paymentPlan: text("payment_plan").notNull(),
  total: real("total").notNull().default(0),
  paid: real("paid").notNull().default(0),
  status: text("status").notNull().default("جديد"),
  academyStatus: text("academy_status").notNull(),
  owner: text("owner").notNull().default("غير مسند"),
  competency: integer("competency", { mode: "boolean" }).notNull().default(false),
  seatReservation: integer("seat_reservation", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("orders_customer_idx").on(table.customerId), index("orders_program_id_idx").on(table.programId)]);

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  amount: real("amount").notNull(),
  dueDate: text("due_date"),
  paidAt: text("paid_at"),
  status: text("status").notNull(),
  method: text("method"),
  reference: text("reference"),
  proofAssetKey: text("proof_asset_key"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("payments_order_idx").on(table.orderId), index("payments_status_idx").on(table.status)]);

// Captures money evidence before a customer/order exists. Finance approval is
// the admission event that promotes the prospect and creates durable records.
export const paymentIntents = sqliteTable("payment_intents", {
  id: text("id").primaryKey(),
  prospectId: text("prospect_id").notNull().references(() => prospects.id),
  programId: text("program_id").notNull().references(() => programs.id),
  purchaseType: text("purchase_type").notNull().default("برنامج"),
  amount: real("amount").notNull(),
  method: text("method").notNull(),
  reference: text("reference"),
  proofAssetKey: text("proof_asset_key"),
  status: text("status").notNull().default("مسجلة"),
  reviewedByFinanceEmail: text("reviewed_by_finance_email"),
  reviewedAt: text("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  resultingCustomerId: text("resulting_customer_id").references(() => customers.id),
  resultingOrderId: text("resulting_order_id").references(() => orders.id),
  createdByEmail: text("created_by_email").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("payment_intents_prospect_idx").on(table.prospectId), index("payment_intents_status_idx").on(table.status)]);

export const paymentReviews = sqliteTable("payment_reviews", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id").notNull().references(() => payments.id),
  status: text("status").notNull().default("بانتظار المالية"),
  reviewedByFinanceEmail: text("reviewed_by_finance_email"),
  reviewedAt: text("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: text("created_at").notNull(),
}, (table) => [uniqueIndex("payment_reviews_payment_uq").on(table.paymentId)]);

export const seatReservations = sqliteTable("seat_reservations", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id),
  programId: text("program_id").notNull().references(() => programs.id),
  orderId: text("order_id").notNull().references(() => orders.id),
  feeAmount: real("fee_amount").notNull(),
  status: text("status").notNull().default("بانتظار الدفع"),
  cohortLabel: text("cohort_label"),
  convertedEnrollmentId: text("converted_enrollment_id"),
  confirmedAt: text("confirmed_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("seat_reservations_customer_idx").on(table.customerId), index("seat_reservations_status_idx").on(table.status)]);

export const reservationTransfers = sqliteTable("reservation_transfers", {
  id: text("id").primaryKey(),
  fromReservationId: text("from_reservation_id").notNull().references(() => seatReservations.id),
  toReservationId: text("to_reservation_id").references(() => seatReservations.id),
  targetProgramId: text("target_program_id").notNull().references(() => programs.id),
  targetCohortLabel: text("target_cohort_label"),
  status: text("status").notNull().default("بانتظار المالية"),
  requestedByEmail: text("requested_by_email").notNull(),
  requestedAt: text("requested_at").notNull(),
  reviewedByFinanceEmail: text("reviewed_by_finance_email"),
  reviewedAt: text("reviewed_at"),
  financialDecision: text("financial_decision"),
  notes: text("notes"),
}, (table) => [index("reservation_transfers_from_idx").on(table.fromReservationId), index("reservation_transfers_status_idx").on(table.status)]);

export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull().references(() => customers.id),
  programId: text("program_id").notNull().references(() => programs.id),
  orderId: text("order_id").notNull().references(() => orders.id),
  sourceReservationId: text("source_reservation_id").references(() => seatReservations.id),
  status: text("status").notNull().default("جديد"),
  ownerEmail: text("owner_email"),
  accountCreatedAt: text("account_created_at"),
  assignedAt: text("assigned_at"),
  accessVerifiedAt: text("access_verified_at"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("enrollments_customer_idx").on(table.customerId), index("enrollments_status_idx").on(table.status)]);

export const workflowTasks = sqliteTable("workflow_tasks", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  department: text("department").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("مفتوحة"),
  priority: text("priority").notNull().default("عادية"),
  assigneeEmail: text("assignee_email"),
  dueAt: text("due_at"),
  createdByEmail: text("created_by_email").notNull(),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
}, (table) => [index("workflow_tasks_entity_idx").on(table.entityType, table.entityId), index("workflow_tasks_assignee_idx").on(table.assigneeEmail, table.status)]);

export const staffRoles = sqliteTable("staff_roles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  grantedByEmail: text("granted_by_email").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("staff_roles_email_role_uq").on(table.email, table.role), index("staff_roles_email_idx").on(table.email)]);

// Kept while the current UI is migrated to workflow_tasks.
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  department: text("department").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("مفتوحة"),
  assignee: text("assignee"),
  dueAt: text("due_at"),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("audit_log_entity_idx").on(table.entityType, table.entityId), index("audit_log_created_idx").on(table.createdAt)]);
