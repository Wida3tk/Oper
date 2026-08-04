import { env } from "cloudflare:workers";

export type StaffRole = "admin" | "sales" | "finance" | "academy" | "viewer";

export const bootstrapAdmins = new Set(["ro7e.entaa@gmail.com"]);

export function operationalDb() {
  if (!env.DB) throw new Error("قاعدة البيانات غير متاحة");
  return env.DB;
}

let directProgramSchemaReady:Promise<void>|null=null;
let financeClassificationSchemaReady:Promise<void>|null=null;
let orderNumberSchemaReady:Promise<void>|null=null;

export function orderNumberPrefix(programName:string){
  const name=String(programName||"").trim();
  if(name.includes("تحليل السلوك التطبيقي"))return "ABA";
  if(name.includes("إدارة السلوك التنظيمي"))return "OBM";
  if(name.includes("تقييم الكفاءة"))return "CA";
  return "CEU";
}

export function ensureOrderNumberSchema(db:ReturnType<typeof operationalDb>){
  if(orderNumberSchemaReady)return orderNumberSchemaReady;
  orderNumberSchemaReady=(async()=>{
    try{await db.prepare("ALTER TABLE orders ADD COLUMN order_number TEXT").run()}catch(error){if(!String(error).toLowerCase().includes("duplicate column"))throw error}
    try{await db.prepare("ALTER TABLE orders ADD COLUMN competency_assessment INTEGER NOT NULL DEFAULT 0").run()}catch(error){if(!String(error).toLowerCase().includes("duplicate column"))throw error}
    await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number) WHERE order_number IS NOT NULL").run();
    await db.prepare("CREATE TABLE IF NOT EXISTS order_number_sequences(prefix TEXT PRIMARY KEY,current_value INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL)").run();
    const {results}=await db.prepare("SELECT o.id,COALESCE(p.name,o.program,'') program_name FROM orders o LEFT JOIN programs p ON p.id=o.program_id WHERE o.order_number IS NULL ORDER BY o.created_at,o.id").all<{id:string;program_name:string}>();
    const counters:Record<string,number>={ABA:0,OBM:0,CEU:0,CA:0},now=new Date().toISOString(),updates=[];
    for(const row of results){const prefix=orderNumberPrefix(row.program_name),sequence=++counters[prefix];updates.push(db.prepare("UPDATE orders SET order_number=? WHERE id=? AND order_number IS NULL").bind(`${prefix}-${String(sequence).padStart(6,"0")}`,row.id))}
    for(const prefix of Object.keys(counters))updates.push(db.prepare("INSERT INTO order_number_sequences(prefix,current_value,updated_at) VALUES(?,?,?) ON CONFLICT(prefix) DO UPDATE SET current_value=MAX(current_value,excluded.current_value),updated_at=excluded.updated_at").bind(prefix,counters[prefix],now));
    if(updates.length)await db.batch(updates);
  })().catch(error=>{orderNumberSchemaReady=null;throw error});
  return orderNumberSchemaReady;
}

export async function nextOrderNumber(db:ReturnType<typeof operationalDb>,programName:string){
  await ensureOrderNumberSchema(db);
  const prefix=orderNumberPrefix(programName),now=new Date().toISOString();
  const row=await db.prepare("INSERT INTO order_number_sequences(prefix,current_value,updated_at) VALUES(?,1,?) ON CONFLICT(prefix) DO UPDATE SET current_value=current_value+1,updated_at=excluded.updated_at RETURNING current_value").bind(prefix,now).first<{current_value:number}>();
  return `${prefix}-${String(Number(row?.current_value||1)).padStart(6,"0")}`;
}
export function ensureFinanceClassificationSchema(db:ReturnType<typeof operationalDb>){
  if(financeClassificationSchemaReady)return financeClassificationSchemaReady;
  financeClassificationSchemaReady=(async()=>{
    for(const sql of [
      "ALTER TABLE payments ADD COLUMN flow_type TEXT NOT NULL DEFAULT 'sale'",
      "ALTER TABLE payments ADD COLUMN classification_status TEXT NOT NULL DEFAULT 'confirmed'",
      "ALTER TABLE orders ADD COLUMN finance_review_status TEXT NOT NULL DEFAULT 'not_required'",
      "ALTER TABLE orders ADD COLUMN base_total REAL NOT NULL DEFAULT 0",
      "ALTER TABLE orders ADD COLUMN discount_percent REAL NOT NULL DEFAULT 0",
      "ALTER TABLE installments ADD COLUMN reminder_count INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE installments ADD COLUMN first_reminder_at TEXT",
      "ALTER TABLE installments ADD COLUMN second_reminder_at TEXT",
      "ALTER TABLE installments ADD COLUMN last_reminded_by_email TEXT",
    ]){try{await db.prepare(sql).run()}catch(error){if(!String(error).toLowerCase().includes("duplicate column"))throw error}}
    await db.prepare("CREATE TABLE IF NOT EXISTS monthly_sales_targets(month_key TEXT PRIMARY KEY,target_amount REAL NOT NULL DEFAULT 0,updated_by_email TEXT NOT NULL,updated_at TEXT NOT NULL)").run();
    await db.prepare("CREATE TABLE IF NOT EXISTS system_migrations(key TEXT PRIMARY KEY,applied_at TEXT NOT NULL)").run();
    await db.prepare("UPDATE installments SET reminder_count=CASE WHEN status IN ('تذكير ثانٍ','تذكير ثالث','إنذار','تطبيق السياسة') THEN 2 WHEN status='تذكير أول' THEN 1 ELSE reminder_count END WHERE reminder_count=0").run();
    const migrated=await db.prepare("SELECT key FROM system_migrations WHERE key='financial-flow-v1'").first();
    if(!migrated)await db.batch([
        db.prepare(`UPDATE payments SET flow_type='legacy',classification_status='confirmed' WHERE order_id IN (
          SELECT o.id FROM orders o WHERE COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.order_id=o.id),0)>=o.total
        )`),
        db.prepare(`UPDATE orders SET finance_review_status='pending' WHERE payment_plan='أقساط' AND COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.order_id=orders.id),0)<total`),
        db.prepare(`UPDATE payments SET classification_status='pending' WHERE order_id IN (SELECT id FROM orders WHERE finance_review_status='pending')`),
        db.prepare(`UPDATE payments SET flow_type='collection' WHERE id IN (SELECT paid_payment_id FROM installments WHERE paid_payment_id IS NOT NULL) AND classification_status!='pending'`),
        db.prepare("INSERT INTO system_migrations(key,applied_at) VALUES('financial-flow-v1',?)").bind(new Date().toISOString()),
      ]);
  })().catch(error=>{financeClassificationSchemaReady=null;throw error});
  return financeClassificationSchemaReady;
}
export function ensureDirectProgramSchema(db:ReturnType<typeof operationalDb>){
  if(directProgramSchemaReady)return directProgramSchemaReady;
  directProgramSchemaReady=(async()=>{
    let addedProgramKind=false;
    try{await db.prepare("ALTER TABLE programs ADD COLUMN program_kind TEXT NOT NULL DEFAULT 'شهادة'").run();addedProgramKind=true}catch(error){if(!String(error).toLowerCase().includes("duplicate column"))throw error}
    try{await db.prepare("ALTER TABLE seat_reservations ADD COLUMN reservation_kind TEXT NOT NULL DEFAULT 'حجز مقعد'").run()}catch(error){if(!String(error).toLowerCase().includes("duplicate column"))throw error}
    if(addedProgramKind)await db.prepare("UPDATE programs SET program_kind=CASE WHEN name LIKE '%تحليل السلوك التطبيقي%' THEN 'شهادة' ELSE 'برنامج مباشر' END").run();
    await db.prepare("INSERT OR IGNORE INTO programs(id,code,name,category,program_kind,default_trial_days,seat_reservation_fee,active,created_at,updated_at) VALUES('PRG-SUP','SUP','الإشراف','خدمة','خدمة مستقلة',0,50,1,?,?)").bind(new Date().toISOString(),new Date().toISOString()).run();
  })().catch(error=>{directProgramSchemaReady=null;throw error});
  return directProgramSchemaReady;
}

export function actorEmail(req: Request) {
  const host = new URL(req.url).hostname.toLowerCase();
  const cloudflareIdentity = req.headers.get("cf-access-authenticated-user-email");
  const openAiIdentity = req.headers.get("oai-authenticated-user-email");
  // workers.dev is protected by Cloudflare Access. Never trust the OpenAI
  // identity header there because a public caller could forge it.
  const email = host.endsWith(".workers.dev") ? cloudflareIdentity : (cloudflareIdentity || openAiIdentity);
  return (email || "").trim().toLowerCase();
}

export async function authorize(req: Request, allowed: StaffRole[]) {
  const cookie=req.headers.get("cookie")||"",token=decodeURIComponent(cookie.match(/(?:^|;\s*)sulukera_session=([^;]+)/)?.[1]||"");
  let email="",permissions:string[]=[];
  if(token){const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,"0")).join("");const session=await operationalDb().prepare("SELECT s.email,a.permissions FROM staff_sessions s JOIN staff_accounts a ON a.email=s.email WHERE s.token_hash=? AND s.expires_at>? AND a.active=1").bind(digest,new Date().toISOString()).first<{email:string;permissions:string}>();if(session){email=session.email;try{permissions=JSON.parse(session.permissions||"[]")}catch{permissions=[]}}}
  if (!email) return { ok: false as const, response: Response.json({ error: "يلزم تسجيل الدخول" }, { status: 401 }) };
  if (bootstrapAdmins.has(email)) return { ok: true as const, email, roles: ["admin"] as StaffRole[], permissions:["*"] };
  const db = operationalDb();
  const { results } = await db.prepare("SELECT role FROM staff_roles WHERE email=? AND active=1").bind(email).all<{ role: StaffRole }>();
  const roles = results.map((row) => row.role);
  if (!roles.includes("admin") && !roles.some((role) => allowed.includes(role))) {
    return { ok: false as const, response: Response.json({ error: "ليس لديك صلاحية لتنفيذ هذا الإجراء" }, { status: 403 }) };
  }
  return { ok: true as const, email, roles, permissions };
}

export function can(auth:{roles:StaffRole[];permissions:string[]},permission:string){return auth.roles.includes("admin")||auth.permissions.includes("*")||auth.permissions.includes(permission)}

export function cleanContact(body: Record<string, unknown>) {
  const rawPhone = String(body.phone || "").replace(/[^\d+]/g, "");
  return {
    name: String(body.name || "").trim(),
    phone: rawPhone.replace(/^\+/, "00"),
    email: String(body.email || "").trim().toLowerCase(),
  };
}

export function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 10)}`;
}

export async function promoteDueReservations(db:ReturnType<typeof operationalDb>,actorEmail="system@sulukera"){
  const dateParts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Riyadh",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const part=(type:string)=>dateParts.find(item=>item.type===type)?.value||"";
  const today=`${part("year")}-${part("month")}-${part("day")}`;
  const {results}=await db.prepare("SELECT * FROM seat_reservations WHERE assignment_date IS NOT NULL AND assignment_date<=? AND converted_enrollment_id IS NULL AND status IN ('مؤكد','بانتظار البدء','بانتظار الإسناد') ORDER BY assignment_date LIMIT 100").bind(today).all<Record<string,unknown>>();
  for(const reservation of results){
    const enrollmentId=id("ENR"),now=new Date().toISOString();
    try{await db.batch([
      db.prepare("INSERT INTO enrollments(id,customer_id,program_id,order_id,source_reservation_id,status,started_at,created_at,updated_at) SELECT ?,customer_id,program_id,order_id,id,'تم التواصل',start_date,?,? FROM seat_reservations WHERE id=? AND converted_enrollment_id IS NULL").bind(enrollmentId,now,now,reservation.id),
      db.prepare("UPDATE seat_reservations SET status='تم التحويل',converted_enrollment_id=?,updated_at=? WHERE id=? AND converted_enrollment_id IS NULL").bind(enrollmentId,now,reservation.id),
      db.prepare("UPDATE orders SET order_type=CASE WHEN order_type='إشراف' THEN 'إشراف' ELSE 'برنامج' END,academy_status='تم التواصل',cohort_label=?,scheduled_start_date=?,updated_at=? WHERE id=?").bind(reservation.cohort_label||null,reservation.start_date||null,now,reservation.order_id),
      db.prepare("UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE entity_type='reservation' AND entity_id=? AND status!='مكتملة'").bind(now,reservation.id),
      db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'enrollment',?,'التشغيلية','تهيئة العميل واستكمال بياناته','مفتوحة','عالية',?,?)").bind(id("TSK"),enrollmentId,actorEmail,now),
      db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'AUTO_ASSIGN_RESERVATION','enrollment',?,?,?)").bind(id("AUD"),actorEmail,enrollmentId,JSON.stringify({reservationId:reservation.id,assignmentDate:reservation.assignment_date,startDate:reservation.start_date}),now)
    ])}catch(error){if(!String(error).includes("UNIQUE"))throw error}
  }
  return results.length;
}
