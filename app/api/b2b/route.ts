import { authorize, can, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

const partnershipStages = ["جهة مسندة","تم التواصل","تم الاجتماع","أُرسل العرض","بانتظار التوقيع","تم التوقيع","تم التفعيل","مغلقة"];
const trainingStages = ["جهة مسندة","تم التواصل","تم تحديد الاحتياج","أُرسل العرض","تم قبول العرض","تم الجدولة","قيد التنفيذ","تم التنفيذ","مغلقة"];
const businessStages = [...new Set([...partnershipStages,...trainingStages])];
const partnershipStatuses = ["بانتظار التفعيل","نشطة","تحتاج متابعة","تجديد قريب","قيد التجديد","منتهية","ملغاة"];
const paths = ["ABA","OBM","BOTH"];
const lifecycleStages = ["الاستكشاف والتقييم","التفاوض والاتفاقية","التفعيل والعمليات","قياس الأثر","التجديد أو الخروج"];
const documentTypes = ["الملف التعريفي","اتفاقية السرية NDA","مسودة العقد","النموذج المالي","العقد النهائي","خطة العمل","تقرير أداء ربع سنوي","محضر اجتماع","تقرير التقييم النهائي","ملحق التجديد"];
const approvalTypes = ["مدير الشراكات","الإدارة القانونية","الإدارة المالية","الاعتماد النهائي"];

async function addColumn(db:ReturnType<typeof operationalDb>,sql:string){try{await db.prepare(sql).run()}catch(error){if(!String(error).toLowerCase().includes("duplicate column"))throw error}}
async function ensureSchema(db:ReturnType<typeof operationalDb>) {
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_accounts(id TEXT PRIMARY KEY,name TEXT NOT NULL,type TEXT NOT NULL DEFAULT 'مركز',region TEXT,city TEXT,activity TEXT,employee_count INTEGER,source TEXT,owner_email TEXT,priority TEXT NOT NULL DEFAULT 'متوسطة',status TEXT NOT NULL DEFAULT 'نشطة',created_by_email TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_contacts(id TEXT PRIMARY KEY,account_id TEXT NOT NULL,name TEXT NOT NULL,job_title TEXT,phone TEXT,email TEXT,contact_role TEXT,preferred_channel TEXT,is_primary INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_opportunities(id TEXT PRIMARY KEY,account_id TEXT NOT NULL,stage TEXT NOT NULL DEFAULT 'جهة مسندة',expected_value REAL NOT NULL DEFAULT 0,expected_close_date TEXT,recommended_services TEXT,next_follow_up TEXT,loss_reason TEXT,signed_at TEXT,created_by_email TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_partnerships(id TEXT PRIMARY KEY,account_id TEXT NOT NULL,opportunity_id TEXT NOT NULL UNIQUE,agreement_number TEXT,signed_at TEXT NOT NULL,start_date TEXT NOT NULL,end_date TEXT NOT NULL,value REAL NOT NULL DEFAULT 0,payment_terms TEXT,scope TEXT,services TEXT,renewal_terms TEXT,status TEXT NOT NULL DEFAULT 'بانتظار التفعيل',internal_owner_email TEXT,primary_contact_id TEXT,document_url TEXT,created_by_email TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_activities(id TEXT PRIMARY KEY,account_id TEXT NOT NULL,opportunity_id TEXT,partnership_id TEXT,activity_type TEXT NOT NULL,details TEXT,due_at TEXT,completed_at TEXT,actor_email TEXT NOT NULL,created_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_teams(id TEXT PRIMARY KEY,name TEXT NOT NULL,lead_email TEXT,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_team_members(team_id TEXT NOT NULL,email TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,PRIMARY KEY(team_id,email))"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_assignments(account_id TEXT NOT NULL,email TEXT NOT NULL,team_id TEXT,assigned_by_email TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(account_id,email))"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_documents(id TEXT PRIMARY KEY,account_id TEXT NOT NULL,opportunity_id TEXT,partnership_id TEXT,document_type TEXT NOT NULL,title TEXT NOT NULL,url TEXT NOT NULL,quarter_label TEXT,uploaded_by_email TEXT NOT NULL,created_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_approvals(id TEXT PRIMARY KEY,account_id TEXT NOT NULL,opportunity_id TEXT,partnership_id TEXT,approval_type TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',note TEXT,decided_by_email TEXT,decided_at TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_meeting_minutes(id TEXT PRIMARY KEY,account_id TEXT NOT NULL,opportunity_id TEXT NOT NULL,meeting_at TEXT,meeting_mode TEXT,topic TEXT,attendees_internal TEXT,attendees_external TEXT,summary TEXT,needs TEXT,opportunities TEXT,decisions TEXT,next_step TEXT,next_follow_up TEXT,created_by_email TEXT NOT NULL,created_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS b2b_partnership_finance(partnership_id TEXT PRIMARY KEY,coupon_code TEXT,discount_percent REAL NOT NULL DEFAULT 0,commission_percent REAL NOT NULL DEFAULT 0,gross_sales REAL NOT NULL DEFAULT 0,coordination_cost REAL NOT NULL DEFAULT 0,commission_due REAL NOT NULL DEFAULT 0,commission_paid REAL NOT NULL DEFAULT 0,payout_status TEXT NOT NULL DEFAULT 'غير مستحق',updated_by_email TEXT,updated_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_b2b_opportunities_stage ON b2b_opportunities(stage,updated_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_b2b_partnerships_status ON b2b_partnerships(status,end_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_b2b_assignments_email ON b2b_assignments(email,account_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_b2b_documents_account ON b2b_documents(account_id,document_type)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_b2b_approvals_account ON b2b_approvals(account_id,approval_type,status)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_b2b_meeting_minutes_opportunity ON b2b_meeting_minutes(opportunity_id,created_at)"),
  ]);
  await addColumn(db,"ALTER TABLE b2b_accounts ADD COLUMN path TEXT NOT NULL DEFAULT 'ABA'");
  await addColumn(db,"ALTER TABLE b2b_accounts ADD COLUMN team_id TEXT");
  await addColumn(db,"ALTER TABLE b2b_accounts ADD COLUMN partnership_type TEXT");
  await addColumn(db,"ALTER TABLE b2b_accounts ADD COLUMN contact_status TEXT");
  await addColumn(db,"ALTER TABLE b2b_accounts ADD COLUMN logo_data TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'approved'");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN approved_by_email TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN approved_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN opportunity_kind TEXT NOT NULL DEFAULT 'partnership'");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN trainee_count INTEGER");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN requested_program TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN delivery_date TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN workspace TEXT NOT NULL DEFAULT 'business'");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN lifecycle_stage TEXT NOT NULL DEFAULT 'الاستكشاف والتقييم'");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN lifecycle_updated_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_scheduled_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_mode TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_completed_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_attendees_internal TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_attendees_external TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_topic TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_summary TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_needs TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_opportunities TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_decisions TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN meeting_next_step TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN fit_decision TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN fit_reason TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN fit_decided_by_email TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN fit_decided_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN data_form_sent_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN data_form_completed_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN agreement_sent_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN agreement_signed_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_partnerships ADD COLUMN lifecycle_stage TEXT NOT NULL DEFAULT 'التفعيل والعمليات'");
  await addColumn(db,"ALTER TABLE b2b_partnerships ADD COLUMN work_plan_ready INTEGER NOT NULL DEFAULT 0");
  await addColumn(db,"ALTER TABLE b2b_partnerships ADD COLUMN final_approval INTEGER NOT NULL DEFAULT 0");
  await addColumn(db,"ALTER TABLE b2b_partnerships ADD COLUMN activated_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_partnerships ADD COLUMN last_quarterly_report_at TEXT");
  await db.batch([
    db.prepare("UPDATE b2b_opportunities SET workspace='partnerships' WHERE stage='مرحلة الملاءمة'"),
    db.prepare("UPDATE b2b_opportunities SET stage='جهة مسندة' WHERE stage='جهة جديدة'"),
    db.prepare("UPDATE b2b_opportunities SET stage='تم التواصل' WHERE stage='تواصل أولي'"),
    db.prepare("UPDATE b2b_opportunities SET stage='تم الاجتماع' WHERE stage IN ('تأهيل الاحتياج','اجتماع أو عرض تعريفي')"),
    db.prepare("UPDATE b2b_opportunities SET stage='أُرسل العرض' WHERE stage IN ('إعداد العرض','عرض مرسل')"),
    db.prepare("UPDATE b2b_opportunities SET stage='بانتظار التوقيع' WHERE stage='تفاوض'"),
    db.prepare("UPDATE b2b_opportunities SET lifecycle_stage=CASE WHEN signed_at IS NOT NULL OR stage IN ('تم التوقيع','تم التفعيل') THEN 'التفعيل والعمليات' WHEN stage IN ('تم الاجتماع','أُرسل العرض','بانتظار التوقيع') THEN 'التفاوض والاتفاقية' ELSE 'الاستكشاف والتقييم' END WHERE lifecycle_stage IS NULL OR lifecycle_stage=''")
  ]);
  await db.batch([
    db.prepare("UPDATE b2b_opportunities SET lifecycle_stage='التفاوض والاتفاقية' WHERE lifecycle_stage='التفاوض والهيكلة'"),
    db.prepare("UPDATE b2b_partnerships SET lifecycle_stage='التفاوض والاتفاقية' WHERE lifecycle_stage='التفاوض والهيكلة'")
  ]);
}

function isAdmin(auth:{roles:string[]}){return auth.roles.includes("admin")}
function scopeSql(auth:{email:string;roles:string[]},alias="a"){
  return isAdmin(auth)?{sql:"",bind:[]}:{sql:` AND (${alias}.owner_email=? OR EXISTS(SELECT 1 FROM b2b_assignments ba WHERE ba.account_id=${alias}.id AND ba.email=?))`,bind:[auth.email,auth.email]};
}

export async function GET(req: Request) {
  const auth = await authorize(req,["b2b"]); if(!auth.ok) return auth.response;
  if(!can(auth,"b2b.view")) return Response.json({error:"ليس لديك صلاحية عرض قطاع الأعمال"},{status:403});
  const db=operationalDb(); await ensureSchema(db);
  const params=new URL(req.url).searchParams,accountId=params.get("accountId")||"",scope=scopeSql(auth);
  if(accountId){
    const allowed=await db.prepare(`SELECT a.id FROM b2b_accounts a WHERE a.id=?${scope.sql}`).bind(accountId,...scope.bind).first();
    if(!allowed)return Response.json({error:"الجهة غير متاحة ضمن نطاق عملك"},{status:403});
    const [{results:activities},{results:documents},{results:approvals},{results:meetings}]=await Promise.all([
      db.prepare("SELECT id,account_id,opportunity_id,partnership_id,activity_type,details,due_at,completed_at,actor_email,created_at FROM b2b_activities WHERE account_id=? ORDER BY created_at DESC").bind(accountId).all(),
      db.prepare("SELECT * FROM b2b_documents WHERE account_id=? ORDER BY created_at DESC").bind(accountId).all(),
      db.prepare("SELECT ap.*,(SELECT s.display_name FROM staff_accounts s WHERE lower(s.email)=lower(ap.decided_by_email) LIMIT 1) decided_by_name FROM b2b_approvals ap WHERE ap.account_id=? ORDER BY ap.created_at DESC").bind(accountId).all(),
      db.prepare("SELECT * FROM b2b_meeting_minutes WHERE account_id=? ORDER BY COALESCE(meeting_at,created_at) DESC,created_at DESC").bind(accountId).all(),
    ]);
    return Response.json({activities,documents,approvals,meetings,documentTypes,approvalTypes});
  }
  const {results:staff}=await db.prepare("SELECT email,display_name FROM staff_accounts WHERE active=1 ORDER BY display_name,email").all();
  const section=params.get("section")||"business";
  if(section==="partnerships"){
    const {results}=await db.prepare(`SELECT COALESCE(p.id,o.id) id,p.id partnership_id,o.id opportunity_id,o.account_id,
      o.stage opportunity_stage,o.lifecycle_stage opportunity_lifecycle_stage,o.next_follow_up,o.expected_value,o.created_at opportunity_created_at,
      o.meeting_scheduled_at,o.meeting_mode,o.meeting_completed_at,o.meeting_attendees_internal,o.meeting_attendees_external,o.meeting_topic,o.meeting_summary,o.meeting_needs,o.meeting_opportunities,o.meeting_decisions,o.meeting_next_step,
      o.fit_decision,o.fit_reason,o.fit_decided_by_email,o.fit_decided_at,o.data_form_sent_at,o.data_form_completed_at,o.agreement_sent_at,o.agreement_signed_at,
      COALESCE(p.lifecycle_stage,o.lifecycle_stage,'الاستكشاف والتقييم') lifecycle_stage,
      p.agreement_number,p.signed_at,p.start_date,p.end_date,p.value,p.payment_terms,p.scope,p.services,p.renewal_terms,
      COALESCE(p.status,CASE WHEN o.approval_status='pending' THEN 'بانتظار الاعتماد' ELSE 'فرصة قائمة' END) status,
      p.internal_owner_email,p.primary_contact_id,p.document_url,p.work_plan_ready,p.final_approval,p.activated_at,p.last_quarterly_report_at,
      a.name account_name,a.type account_type,a.region,a.city,a.path,a.owner_email,(SELECT s.display_name FROM staff_accounts s WHERE lower(s.email)=lower(a.owner_email) LIMIT 1) owner_name,a.team_id,a.source,a.priority,a.partnership_type,a.contact_status,a.logo_data,
      c.name contact_name,c.job_title contact_title,c.phone contact_phone,c.email contact_email,
      (SELECT COUNT(*) FROM b2b_activities x WHERE x.opportunity_id=o.id) activity_count,
      (SELECT COUNT(*) FROM b2b_documents d WHERE d.opportunity_id=o.id OR (p.id IS NOT NULL AND d.partnership_id=p.id)) document_count,
      (SELECT COUNT(*) FROM b2b_approvals ap WHERE (ap.opportunity_id=o.id OR (p.id IS NOT NULL AND ap.partnership_id=p.id)) AND ap.status='pending') pending_approvals,
      f.coupon_code,f.discount_percent,f.commission_percent,f.gross_sales,f.coordination_cost,f.commission_due,f.commission_paid,f.payout_status
      FROM b2b_opportunities o JOIN b2b_accounts a ON a.id=o.account_id
      LEFT JOIN b2b_partnerships p ON p.opportunity_id=o.id
      LEFT JOIN b2b_contacts c ON c.account_id=a.id AND c.is_primary=1
      LEFT JOIN b2b_partnership_finance f ON f.partnership_id=p.id WHERE 1=1${scope.sql}
      AND o.opportunity_kind='partnership'
      ORDER BY CASE COALESCE(p.lifecycle_stage,o.lifecycle_stage) ${lifecycleStages.map((stage,index)=>`WHEN '${stage}' THEN ${index}`).join(" ")} ELSE 5 END,o.updated_at DESC`).bind(...scope.bind).all();
    return Response.json({partnerships:results,statuses:partnershipStatuses,lifecycleStages,staff,scope:isAdmin(auth)?"all":"assigned",canCreatePartnership:isAdmin(auth)||can(auth,"b2b.partnerships.create"),canDelete:isAdmin(auth),canApprove:isAdmin(auth)||can(auth,"b2b.review")||can(auth,"b2b.partnerships.manage"),viewerEmail:auth.email});
  }
  const reviewAccess=can(auth,"b2b.review"),businessScope=isAdmin(auth)?{sql:"",bind:[]}:reviewAccess?{sql:` AND (${scope.sql.replace(/^ AND /,"")} OR o.approval_status='pending')`,bind:scope.bind}:scope;
  const {results}=await db.prepare(`SELECT o.*,a.name account_name,a.type account_type,a.region,a.city,a.activity,a.source,a.owner_email,(SELECT s.display_name FROM staff_accounts s WHERE lower(s.email)=lower(a.owner_email) LIMIT 1) owner_name,a.priority,a.path,a.team_id,a.logo_data,
    c.id contact_id,c.name contact_name,c.job_title contact_title,c.phone contact_phone,c.email contact_email,c.contact_role,c.preferred_channel,
    (SELECT COUNT(*) FROM b2b_activities x WHERE x.opportunity_id=o.id) activity_count,
    (SELECT MAX(x.created_at) FROM b2b_activities x WHERE x.opportunity_id=o.id AND x.activity_type IN ('تم التواصل','تواصل أولي','اتصال','واتساب','بريد إلكتروني')) last_contact_at
    FROM b2b_opportunities o JOIN b2b_accounts a ON a.id=o.account_id
    LEFT JOIN b2b_contacts c ON c.account_id=a.id AND c.is_primary=1
    WHERE NOT EXISTS(SELECT 1 FROM b2b_partnerships p WHERE p.opportunity_id=o.id) AND COALESCE(o.workspace,'business')='business'${businessScope.sql}
    ORDER BY CASE o.approval_status WHEN 'pending' THEN 0 ELSE 1 END,CASE o.stage WHEN 'بانتظار التوقيع' THEN 0 WHEN 'أُرسل العرض' THEN 1 WHEN 'تم الاجتماع' THEN 2 ELSE 3 END,o.updated_at DESC`).bind(...businessScope.bind).all();
  return Response.json({opportunities:results,stages:businessStages,partnershipStages,trainingStages,lifecycleStages,paths,staff,scope:isAdmin(auth)?"all":"assigned",canReview:reviewAccess||isAdmin(auth),canCreatePartnership:can(auth,"b2b.partnerships.create"),canDelete:isAdmin(auth),viewerEmail:auth.email});
}

export async function DELETE(req:Request){
  const auth=await authorize(req,["b2b"]);if(!auth.ok)return auth.response;
  if(!isAdmin(auth))return Response.json({error:"حذف الجهات متاح لحساب الإدارة فقط"},{status:403});
  const body=await req.json() as Record<string,unknown>,accountId=String(body.accountId||"");if(!accountId)return Response.json({error:"معرّف الجهة مطلوب"},{status:400});
  const db=operationalDb();await ensureSchema(db);const account=await db.prepare("SELECT id,name,type,path,owner_email FROM b2b_accounts WHERE id=?").bind(accountId).first<Record<string,unknown>>();if(!account)return Response.json({error:"الجهة غير موجودة"},{status:404});const now=new Date().toISOString();
  const counts=await db.prepare(`SELECT (SELECT COUNT(*) FROM b2b_opportunities WHERE account_id=?) opportunities,(SELECT COUNT(*) FROM b2b_partnerships WHERE account_id=?) partnerships,(SELECT COUNT(*) FROM b2b_activities WHERE account_id=?) activities`).bind(accountId,accountId,accountId).first();
  await db.batch([
    db.prepare("DELETE FROM b2b_activities WHERE account_id=?").bind(accountId),
    db.prepare("DELETE FROM b2b_documents WHERE account_id=?").bind(accountId),
    db.prepare("DELETE FROM b2b_approvals WHERE account_id=?").bind(accountId),
    db.prepare("DELETE FROM b2b_partnership_finance WHERE partnership_id IN (SELECT id FROM b2b_partnerships WHERE account_id=?)").bind(accountId),
    db.prepare("DELETE FROM b2b_partnerships WHERE account_id=?").bind(accountId),
    db.prepare("DELETE FROM b2b_opportunities WHERE account_id=?").bind(accountId),
    db.prepare("DELETE FROM b2b_contacts WHERE account_id=?").bind(accountId),
    db.prepare("DELETE FROM b2b_assignments WHERE account_id=?").bind(accountId),
    db.prepare("DELETE FROM b2b_accounts WHERE id=?").bind(accountId),
    db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'DELETE_B2B_ACCOUNT','b2b_account',?,?,?)").bind(id("AUD"),auth.email,accountId,JSON.stringify({account,counts}),now),
  ]);
  return Response.json({ok:true,deleted:accountId});
}

export async function POST(req:Request){
  const auth=await authorize(req,["b2b"]);if(!auth.ok)return auth.response;
  if(!can(auth,"b2b.manage"))return Response.json({error:"ليس لديك صلاحية تعديل بيانات قطاع الأعمال"},{status:403});
  const body=await req.json() as Record<string,unknown>,action=String(body.action||""),db=operationalDb(),now=new Date().toISOString();await ensureSchema(db);
  const assertAccess=async(accountId:string)=>{const scope=scopeSql(auth);return db.prepare(`SELECT a.id FROM b2b_accounts a WHERE a.id=?${scope.sql}`).bind(accountId,...scope.bind).first()};
  if(action==="update_account"){
    const accountId=String(body.accountId||"");
    if(!accountId||!await assertAccess(accountId))return Response.json({error:"الجهة غير متاحة ضمن نطاق عملك"},{status:403});
    const name=String(body.name||"").trim(),path=paths.includes(String(body.path))?String(body.path):"",ownerEmail=String(body.ownerEmail||"").trim().toLowerCase(),logoData=String(body.logoData||"");
    if(!name)return Response.json({error:"اسم الجهة مطلوب"},{status:400});
    if(logoData&&(!/^data:image\/(png|jpe?g|webp);base64,/i.test(logoData)||logoData.length>750000))return Response.json({error:"الشعار يجب أن يكون صورة PNG أو JPG أو WebP وحجمه أقل من 500KB"},{status:400});
    const before=await db.prepare("SELECT name,type,region,city,source,owner_email,priority,path,partnership_type FROM b2b_accounts WHERE id=?").bind(accountId).first();
    const contact=await db.prepare("SELECT id FROM b2b_contacts WHERE account_id=? ORDER BY is_primary DESC,created_at LIMIT 1").bind(accountId).first<{id:string}>();
    const changes=[
      db.prepare("UPDATE b2b_accounts SET name=?,type=?,region=?,city=?,source=?,owner_email=?,priority=?,path=?,partnership_type=?,logo_data=?,updated_at=? WHERE id=?").bind(name,String(body.type||""),String(body.region||""),String(body.city||""),String(body.source||""),ownerEmail,String(body.priority||""),path,String(body.partnershipType||""),logoData||null,now,accountId),
      db.prepare("DELETE FROM b2b_assignments WHERE account_id=? AND team_id IS NULL").bind(accountId),
      db.prepare("INSERT INTO b2b_activities(id,account_id,activity_type,details,actor_email,created_at) VALUES(?,?, 'تعديل بيانات الجهة',?,?,?)").bind(id("B2BX"),accountId,`تم تحديث البيانات الأساسية للجهة ${name}`,auth.email,now),
      db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_B2B_ACCOUNT','b2b_account',?,?,?)").bind(id("AUD"),auth.email,accountId,JSON.stringify({before,after:{name,type:body.type,region:body.region,city:body.city,source:body.source,ownerEmail,priority:body.priority,path,partnershipType:body.partnershipType}}),now),
    ];
    if(contact)changes.push(db.prepare("UPDATE b2b_contacts SET name=?,job_title=?,phone=?,email=?,updated_at=? WHERE id=?").bind(String(body.contactName||""),String(body.jobTitle||""),String(body.phone||""),String(body.email||"").trim().toLowerCase(),now,contact.id));
    else changes.push(db.prepare("INSERT INTO b2b_contacts(id,account_id,name,job_title,phone,email,is_primary,created_at,updated_at) VALUES(?,?,?,?,?,?,1,?,?)").bind(id("B2BC"),accountId,String(body.contactName||""),String(body.jobTitle||""),String(body.phone||""),String(body.email||"").trim().toLowerCase(),now,now));
    if(ownerEmail)changes.push(db.prepare("INSERT OR IGNORE INTO b2b_assignments(account_id,email,assigned_by_email,created_at) VALUES(?,?,?,?)").bind(accountId,ownerEmail,auth.email,now));
    await db.batch(changes);return Response.json({ok:true,accountId});
  }
  if(action==="create_business"){
    const name=String(body.name||"").trim(),type=String(body.type||"مركز"),contactName=String(body.contactName||"").trim(),phone=String(body.phone||"").trim(),email=String(body.email||"").trim().toLowerCase(),path=paths.includes(String(body.path))?String(body.path):"ABA",opportunityKind=String(body.opportunityKind)==="corporate_training"?"corporate_training":"partnership",allowedStages=opportunityKind==="corporate_training"?trainingStages:partnershipStages;
    if(!name||!contactName)return Response.json({error:"اسم الجهة واسم الشخص المسؤول مطلوبان"},{status:400});
    const accountId=id("B2BA"),contactId=id("B2BC"),opportunityId=id("B2BO"),stage=allowedStages.includes(String(body.stage))?String(body.stage):"جهة مسندة",autoApprove=isAdmin(auth)||can(auth,"b2b.review"),ownerEmail=autoApprove?String(body.ownerEmail||auth.email).trim().toLowerCase():auth.email,approvalStatus=autoApprove?"approved":"pending",traineeCount=Math.max(0,Math.floor(Number(body.traineeCount||0))),requestedProgram=String(body.requestedProgram||"").trim(),deliveryDate=String(body.deliveryDate||"")||null;
    if(opportunityKind==="corporate_training"&&(!requestedProgram||traineeCount<1))return Response.json({error:"اسم التدريب وعدد المتدربين مطلوبان لطلب التدريب المؤسسي"},{status:400});
    await db.batch([
      db.prepare("INSERT INTO b2b_accounts(id,name,type,region,city,activity,employee_count,source,owner_email,priority,status,created_by_email,created_at,updated_at,path,team_id) VALUES(?,?,?,?,?,?,?,?,?,?,'نشطة',?,?,?,?,?)").bind(accountId,name,type,String(body.region||""),String(body.city||""),String(body.activity||""),Number(body.employeeCount||0)||null,String(body.source||""),ownerEmail,String(body.priority||"متوسطة"),auth.email,now,now,path,String(body.teamId||"")||null),
      db.prepare("INSERT INTO b2b_contacts(id,account_id,name,job_title,phone,email,contact_role,preferred_channel,is_primary,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,1,?,?)").bind(contactId,accountId,contactName,String(body.jobTitle||""),phone,email,String(body.contactRole||"صاحب قرار"),String(body.preferredChannel||"واتساب"),now,now),
      db.prepare("INSERT INTO b2b_opportunities(id,account_id,stage,expected_value,expected_close_date,recommended_services,next_follow_up,created_by_email,created_at,updated_at,approval_status,approved_by_email,approved_at,opportunity_kind,trainee_count,requested_program,delivery_date) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(opportunityId,accountId,stage,Number(body.expectedValue||0),String(body.expectedCloseDate||"")||null,String(body.recommendedServices||""),String(body.nextFollowUp||"")||null,auth.email,now,now,approvalStatus,autoApprove?auth.email:null,autoApprove?now:null,opportunityKind,traineeCount||null,requestedProgram||null,deliveryDate),
      db.prepare("INSERT OR IGNORE INTO b2b_assignments(account_id,email,team_id,assigned_by_email,created_at) VALUES(?,?,?,?,?)").bind(accountId,ownerEmail,String(body.teamId||"")||null,auth.email,now),
      db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,'إسناد الجهة','تم إنشاء الجهة وإسنادها',?,?)").bind(id("B2BX"),accountId,opportunityId,auth.email,now),
      db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'CREATE_B2B_OPPORTUNITY','b2b_opportunity',?,?,?)").bind(id("AUD"),auth.email,opportunityId,JSON.stringify({accountId,name,stage,path,ownerEmail,opportunityKind,traineeCount,requestedProgram}),now),
    ]);return Response.json({ok:true,id:opportunityId,approvalStatus});
  }
  if(action==="review_business"){
    if(!isAdmin(auth)&&!can(auth,"b2b.review"))return Response.json({error:"ليس لديك صلاحية اعتماد الجهات"},{status:403});
    const opportunityId=String(body.opportunityId||""),decision=String(body.decision||"");if(!opportunityId||!["approved","rejected"].includes(decision))return Response.json({error:"قرار الاعتماد غير صحيح"},{status:400});
    const row=await db.prepare("SELECT account_id,approval_status FROM b2b_opportunities WHERE id=?").bind(opportunityId).first<{account_id:string;approval_status:string}>();if(!row)return Response.json({error:"الجهة غير موجودة"},{status:404});
    await db.batch([db.prepare("UPDATE b2b_opportunities SET approval_status=?,approved_by_email=?,approved_at=?,updated_at=? WHERE id=?").bind(decision,auth.email,now,now,opportunityId),db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,'اعتماد الجهة',?,?,?)").bind(id("B2BX"),row.account_id,opportunityId,decision==="approved"?"تم اعتماد الجهة":"تم رفض الجهة",auth.email,now)]);return Response.json({ok:true});
  }
  if(action==="create_partnership_initial"){
    if(!isAdmin(auth)&&!can(auth,"b2b.partnerships.create"))return Response.json({error:"ليس لديك صلاحية إضافة جهة إلى الشراكات"},{status:403});
    const name=String(body.name||"").trim(),contactName=String(body.contactName||"").trim(),email=String(body.email||"").trim().toLowerCase(),path=paths.includes(String(body.path))?String(body.path):"",ownerEmail=String(body.ownerEmail||"").trim().toLowerCase(),logoData=String(body.logoData||"");
    if(logoData&&(!/^data:image\/(png|jpe?g|webp);base64,/i.test(logoData)||logoData.length>750000))return Response.json({error:"الشعار يجب أن يكون صورة PNG أو JPG أو WebP وحجمه أقل من 500KB"},{status:400});
    const accountId=id("B2BA"),contactId=id("B2BC"),opportunityId=id("B2BO"),changes=[
      db.prepare("INSERT INTO b2b_accounts(id,name,type,region,city,activity,source,owner_email,priority,status,created_by_email,created_at,updated_at,path,partnership_type,contact_status) VALUES(?,?,?,?,?,?,?,?,?,'فرصة أولية',?,?,?,?,?,?)").bind(accountId,name,"",String(body.region||""),String(body.city||""),"",String(body.source||""),ownerEmail,String(body.priority||""),auth.email,now,now,path,String(body.partnershipType||""),String(body.contactStatus||"")),
      db.prepare("INSERT INTO b2b_contacts(id,account_id,name,job_title,phone,email,contact_role,preferred_channel,is_primary,created_at,updated_at) VALUES(?,?,?,'','',?,'مسؤول الجهة','',1,?,?)").bind(contactId,accountId,contactName,email,now,now),
      db.prepare("INSERT INTO b2b_opportunities(id,account_id,stage,created_by_email,created_at,updated_at,approval_status,approved_by_email,approved_at,opportunity_kind,lifecycle_stage,lifecycle_updated_at,workspace) VALUES(?,?,'مرحلة الملاءمة',?,?,?,'approved',?,?,'partnership','الاستكشاف والتقييم',?,'partnerships')").bind(opportunityId,accountId,auth.email,now,now,auth.email,now,now),
      db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,'إضافة بيانات أولية','تم إنشاء سجل أولي للجهة في مرحلة الملاءمة',?,?)").bind(id("B2BX"),accountId,opportunityId,auth.email,now),
    ];
    if(logoData)changes.push(db.prepare("UPDATE b2b_accounts SET logo_data=? WHERE id=?").bind(logoData,accountId));
    if(ownerEmail)changes.push(db.prepare("INSERT OR IGNORE INTO b2b_assignments(account_id,email,assigned_by_email,created_at) VALUES(?,?,?,?)").bind(accountId,ownerEmail,auth.email,now));
    await db.batch(changes);return Response.json({ok:true,id:opportunityId,stage:"مرحلة الملاءمة"});
  }
  if(action==="create_partnership"){
    if(!isAdmin(auth)&&!can(auth,"b2b.partnerships.create"))return Response.json({error:"ليس لديك صلاحية إضافة جهة إلى الشراكات"},{status:403});
    const name=String(body.name||"").trim(),contactName=String(body.contactName||"").trim(),signedAt=String(body.signedAt||""),startDate=String(body.startDate||""),endDate=String(body.endDate||""),path=paths.includes(String(body.path))?String(body.path):"ABA";
    if(!name||!contactName||![signedAt,startDate,endDate].every(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)))return Response.json({error:"اسم الجهة والمسؤول وتواريخ الاتفاقية مطلوبة"},{status:400});
    const accountId=id("B2BA"),contactId=id("B2BC"),opportunityId=id("B2BO"),partnershipId=id("B2BP"),ownerEmail=String(body.ownerEmail||auth.email);
    await db.batch([
      db.prepare("INSERT INTO b2b_accounts(id,name,type,region,city,activity,source,owner_email,priority,status,created_by_email,created_at,updated_at,path,partnership_type,contact_status) VALUES(?,?,?,?,?,?,?,?,'متوسطة','نشطة',?,?,?,?,?,?)").bind(accountId,name,String(body.type||"مركز"),String(body.region||""),String(body.city||""),String(body.activity||""),String(body.source||""),ownerEmail,auth.email,now,now,path,String(body.partnershipType||""),String(body.contactStatus||"")),
      db.prepare("INSERT INTO b2b_contacts(id,account_id,name,job_title,phone,email,contact_role,preferred_channel,is_primary,created_at,updated_at) VALUES(?,?,?,?,?,?,?,'واتساب',1,?,?)").bind(contactId,accountId,contactName,String(body.jobTitle||""),String(body.phone||""),String(body.email||""),"مسؤول الجهة",now,now),
      db.prepare("INSERT INTO b2b_opportunities(id,account_id,stage,created_by_email,created_at,updated_at,approval_status,approved_by_email,approved_at,signed_at) VALUES(?,?,'تم التوقيع',?,?,?,'approved',?,?,?)").bind(opportunityId,accountId,auth.email,now,now,auth.email,now,signedAt),
      db.prepare("INSERT INTO b2b_partnerships(id,account_id,opportunity_id,agreement_number,signed_at,start_date,end_date,value,scope,services,status,internal_owner_email,primary_contact_id,document_url,created_by_email,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,'بانتظار التفعيل',?,?,?,?,?,?)").bind(partnershipId,accountId,opportunityId,String(body.agreementNumber||""),signedAt,startDate,endDate,Number(body.value||0),String(body.scope||""),String(body.services||""),ownerEmail,contactId,String(body.documentUrl||""),auth.email,now,now),
      db.prepare("UPDATE b2b_opportunities SET lifecycle_stage='التفاوض والاتفاقية',lifecycle_updated_at=? WHERE id=?").bind(now,opportunityId),
      db.prepare("UPDATE b2b_partnerships SET lifecycle_stage='التفاوض والاتفاقية' WHERE id=?").bind(partnershipId),
      db.prepare("INSERT OR IGNORE INTO b2b_assignments(account_id,email,assigned_by_email,created_at) VALUES(?,?,?,?)").bind(accountId,ownerEmail,auth.email,now),
      db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,partnership_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,?,'إضافة شراكة','تمت إضافة الجهة مباشرة إلى سجل الشراكات',?,?)").bind(id("B2BX"),accountId,opportunityId,partnershipId,auth.email,now),
    ]);return Response.json({ok:true,id:partnershipId});
  }
  if(action==="save_document"){
    const accountId=String(body.accountId||""),opportunityId=String(body.opportunityId||"")||null,partnershipId=String(body.partnershipId||"")||null,documentType=String(body.documentType||""),title=String(body.title||documentType).trim(),url=String(body.url||"").trim();
    if(!accountId||!documentTypes.includes(documentType)||!title||!/^https?:\/\/\S+$/i.test(url))return Response.json({error:"نوع المستند واسمه ورابطه الصحيح مطلوبة"},{status:400});
    if(!await assertAccess(accountId))return Response.json({error:"الجهة غير متاحة ضمن نطاق عملك"},{status:403});
    await db.batch([
      db.prepare("INSERT INTO b2b_documents(id,account_id,opportunity_id,partnership_id,document_type,title,url,quarter_label,uploaded_by_email,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)").bind(id("B2BD"),accountId,opportunityId,partnershipId,documentType,title,url,String(body.quarterLabel||"")||null,auth.email,now),
      db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,partnership_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(id("B2BX"),accountId,opportunityId,partnershipId,"إضافة مستند",documentType,auth.email,now),
    ]);return Response.json({ok:true});
  }
  if(action==="update_partnership_pipeline"){
    const opportunityId=String(body.opportunityId||""),row=await db.prepare("SELECT account_id,fit_decision FROM b2b_opportunities WHERE id=?").bind(opportunityId).first<{account_id:string;fit_decision?:string}>();
    if(!row||!await assertAccess(row.account_id))return Response.json({error:"الجهة غير متاحة ضمن نطاق عملك"},{status:403});
    const contactStatus=String(body.contactStatus||""),fitDecision=String(body.fitDecision||""),fitReason=String(body.fitReason||"").trim();
    if(fitDecision&&!['اعتماد','رفض','تأجيل'].includes(fitDecision))return Response.json({error:"قرار الملاءمة غير صحيح"},{status:400});
    if(fitDecision&&!fitReason)return Response.json({error:"ملاحظات قرار الملاءمة مطلوبة"},{status:400});
    const meetingCompleted=String(body.meetingCompletedAt||"")||null,decisionChanged=fitDecision&&fitDecision!==String(row.fit_decision||""),meetingSignature=JSON.stringify([meetingCompleted,String(body.meetingTopic||""),String(body.meetingSummary||""),String(body.meetingAttendeesInternal||""),String(body.meetingAttendeesExternal||"")]);
    const latestMeeting=meetingCompleted?await db.prepare("SELECT meeting_at,topic,summary,attendees_internal,attendees_external FROM b2b_meeting_minutes WHERE opportunity_id=? ORDER BY created_at DESC LIMIT 1").bind(opportunityId).first<Record<string,unknown>>():null;
    const latestSignature=latestMeeting?JSON.stringify([latestMeeting.meeting_at||null,latestMeeting.topic||"",latestMeeting.summary||"",latestMeeting.attendees_internal||"",latestMeeting.attendees_external||""]):"";
    const changes=[
      db.prepare("UPDATE b2b_accounts SET contact_status=?,updated_at=? WHERE id=?").bind(contactStatus,now,row.account_id),
      db.prepare(`UPDATE b2b_opportunities SET stage=?,meeting_scheduled_at=?,meeting_mode=?,meeting_completed_at=?,meeting_attendees_internal=?,meeting_attendees_external=?,meeting_topic=?,meeting_summary=?,meeting_needs=?,meeting_opportunities=?,meeting_decisions=?,meeting_next_step=?,next_follow_up=?,fit_decision=?,fit_reason=?,fit_decided_by_email=CASE WHEN ? THEN ? ELSE fit_decided_by_email END,fit_decided_at=CASE WHEN ? THEN ? ELSE fit_decided_at END,data_form_sent_at=?,data_form_completed_at=?,agreement_sent_at=?,agreement_signed_at=?,updated_at=? WHERE id=?`).bind(contactStatus||'مرحلة الملاءمة',String(body.meetingScheduledAt||"")||null,String(body.meetingMode||"")||null,meetingCompleted,String(body.meetingAttendeesInternal||""),String(body.meetingAttendeesExternal||""),String(body.meetingTopic||""),String(body.meetingSummary||""),String(body.meetingNeeds||""),String(body.meetingOpportunities||""),String(body.meetingDecisions||""),String(body.meetingNextStep||""),String(body.nextFollowUp||"")||null,fitDecision,fitReason,decisionChanged?1:0,auth.email,decisionChanged?1:0,now,String(body.dataFormSentAt||"")||null,String(body.dataFormCompletedAt||"")||null,String(body.agreementSentAt||"")||null,String(body.agreementSignedAt||"")||null,now,opportunityId),
      db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,'تحديث مسار الشراكة',?,?,?)").bind(id("B2BX"),row.account_id,opportunityId,fitDecision?`حالة التواصل: ${contactStatus||'غير محددة'} · قرار الملاءمة: ${fitDecision} · ${fitReason}`:`حالة التواصل: ${contactStatus||'غير محددة'}${meetingCompleted?' · تم حفظ محضر الاجتماع':''}`,auth.email,now),
    ];
    if(meetingCompleted&&meetingSignature!==latestSignature)changes.push(db.prepare("INSERT INTO b2b_meeting_minutes(id,account_id,opportunity_id,meeting_at,meeting_mode,topic,attendees_internal,attendees_external,summary,needs,opportunities,decisions,next_step,next_follow_up,created_by_email,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id("B2BM"),row.account_id,opportunityId,meetingCompleted,String(body.meetingMode||""),String(body.meetingTopic||""),String(body.meetingAttendeesInternal||""),String(body.meetingAttendeesExternal||""),String(body.meetingSummary||""),String(body.meetingNeeds||""),String(body.meetingOpportunities||""),String(body.meetingDecisions||""),String(body.meetingNextStep||""),String(body.nextFollowUp||"")||null,auth.email,now));
    await db.batch(changes);return Response.json({ok:true,meetingAdded:Boolean(meetingCompleted&&meetingSignature!==latestSignature)});
  }
  if(action==="record_approval"){
    const accountId=String(body.accountId||""),opportunityId=String(body.opportunityId||"")||null,partnershipId=String(body.partnershipId||"")||null,approvalType=String(body.approvalType||""),decision=String(body.decision||""),note=String(body.note||"").trim();
    if(!accountId||!approvalTypes.includes(approvalType)||!["approved","rejected"].includes(decision))return Response.json({error:"بيانات الاعتماد غير صحيحة"},{status:400});
    const managerAllowed=isAdmin(auth)||can(auth,"b2b.review"),financeAllowed=auth.roles.includes("finance")||isAdmin(auth)||can(auth,"b2b.partnerships.manage"),governanceAllowed=isAdmin(auth)||can(auth,"b2b.partnerships.manage");
    if((approvalType==="مدير الشراكات"&&!managerAllowed)||(approvalType==="الإدارة المالية"&&!financeAllowed)||(["الإدارة القانونية","الاعتماد النهائي"].includes(approvalType)&&!governanceAllowed))return Response.json({error:"ليست لديك صلاحية هذا الاعتماد"},{status:403});
    if(!await assertAccess(accountId)&&!isAdmin(auth))return Response.json({error:"الجهة غير متاحة ضمن نطاق عملك"},{status:403});
    const existing=await db.prepare("SELECT id FROM b2b_approvals WHERE account_id=? AND approval_type=? ORDER BY created_at DESC LIMIT 1").bind(accountId,approvalType).first<{id:string}>(),approvalId=existing?.id||id("B2BAp");
    await db.batch([
      existing?db.prepare("UPDATE b2b_approvals SET status=?,note=?,decided_by_email=?,decided_at=?,updated_at=? WHERE id=?").bind(decision,note,auth.email,now,now,approvalId):db.prepare("INSERT INTO b2b_approvals(id,account_id,opportunity_id,partnership_id,approval_type,status,note,decided_by_email,decided_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)").bind(approvalId,accountId,opportunityId,partnershipId,approvalType,decision,note,auth.email,now,now,now),
      db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,partnership_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(id("B2BX"),accountId,opportunityId,partnershipId,"اعتماد",`${approvalType}: ${decision==="approved"?"معتمد":"مرفوض"}${note?` · ${note}`:""}`,auth.email,now),
    ]);return Response.json({ok:true});
  }
  if(action==="update_lifecycle"){
    const partnershipId=String(body.partnershipId||""),opportunityId=String(body.opportunityId||""),target=String(body.stage||"");
    if(!opportunityId||!lifecycleStages.includes(target))return Response.json({error:"مرحلة دورة الحياة غير صحيحة"},{status:400});
    const row=await db.prepare(`SELECT o.account_id,o.id opportunity_id,o.lifecycle_stage opportunity_lifecycle_stage,o.fit_decision,
      p.id partnership_id,p.lifecycle_stage,p.end_date,p.work_plan_ready,p.final_approval
      FROM b2b_opportunities o LEFT JOIN b2b_partnerships p ON p.opportunity_id=o.id WHERE o.id=?`).bind(opportunityId).first<{account_id:string;opportunity_id:string;opportunity_lifecycle_stage:string;fit_decision?:string;partnership_id?:string;lifecycle_stage?:string;end_date?:string;work_plan_ready?:number;final_approval?:number}>();
    if(!row||!await assertAccess(row.account_id))return Response.json({error:"الفرصة غير متاحة ضمن نطاق عملك"},{status:403});
    if(lifecycleStages.indexOf(target)>=2&&!row.partnership_id)return Response.json({error:"يجب توقيع العقد وإنشاء الشراكة قبل الانتقال إلى التفعيل والعمليات"},{status:409});
    const {results:docs}=await db.prepare("SELECT document_type FROM b2b_documents WHERE account_id=?").bind(row.account_id).all<{document_type:string}>(),docSet=new Set(docs.map(x=>x.document_type));
    const {results:approvals}=await db.prepare("SELECT approval_type,status FROM b2b_approvals WHERE account_id=?").bind(row.account_id).all<{approval_type:string;status:string}>(),approved=new Set(approvals.filter(x=>x.status==="approved").map(x=>x.approval_type));
    const missing:string[]=[];
    if(target==="التفاوض والاتفاقية"&&row.fit_decision!=="اعتماد")missing.push("اعتماد قرار الملاءمة");
    if(target==="التفعيل والعمليات"){if(!docSet.has("مسودة العقد"))missing.push("مسودة العقد");if(!docSet.has("النموذج المالي"))missing.push("النموذج المالي");if(!approved.has("الإدارة القانونية"))missing.push("اعتماد القانونية");if(!approved.has("الإدارة المالية"))missing.push("اعتماد المالية")}
    if(target==="قياس الأثر"){if(!docSet.has("خطة العمل"))missing.push("خطة العمل");if(!approved.has("الاعتماد النهائي"))missing.push("الاعتماد النهائي")}
    if(target==="التجديد أو الخروج"&&!row.end_date)missing.push("تاريخ انتهاء الاتفاقية");
    if(missing.length)return Response.json({error:`لا يمكن نقل الشراكة قبل استكمال: ${missing.join("، ")}`,missing},{status:409});
    const active=target==="قياس الأثر",previous=row.lifecycle_stage||row.opportunity_lifecycle_stage||"الاستكشاف والتقييم",changes=[
      db.prepare("UPDATE b2b_opportunities SET lifecycle_stage=?,lifecycle_updated_at=?,updated_at=? WHERE id=?").bind(target,now,now,row.opportunity_id),
      db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,partnership_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,?,'تحديث دورة الحياة',?,?,?)").bind(id("B2BX"),row.account_id,row.opportunity_id,row.partnership_id||null,`${previous} ← ${target}`,auth.email,now),
    ];
    if(row.partnership_id)changes.push(db.prepare("UPDATE b2b_partnerships SET lifecycle_stage=?,status=CASE WHEN ? THEN 'نشطة' ELSE status END,activated_at=CASE WHEN ? THEN COALESCE(activated_at,?) ELSE activated_at END,updated_at=? WHERE id=?").bind(target,active?1:0,active?1:0,now,now,row.partnership_id));
    await db.batch(changes);return Response.json({ok:true,stage:target});
  }
  if(action==="update_partnership_finance"){
    if(!isAdmin(auth)&&!auth.roles.includes("finance")&&!can(auth,"b2b.partnerships.manage"))return Response.json({error:"التحديث المالي متاح للإدارة والمالية فقط"},{status:403});
    const partnershipId=String(body.partnershipId||""),row=await db.prepare("SELECT account_id FROM b2b_partnerships WHERE id=?").bind(partnershipId).first<{account_id:string}>();if(!row)return Response.json({error:"الشراكة غير موجودة"},{status:404});
    const gross=Math.max(0,Number(body.grossSales||0)),cost=Math.max(0,Number(body.coordinationCost||0)),rate=Math.max(0,Number(body.commissionPercent||0)),due=Math.max(0,Number(body.commissionDue||gross*rate/100)),paid=Math.max(0,Number(body.commissionPaid||0));
    await db.prepare("INSERT INTO b2b_partnership_finance(partnership_id,coupon_code,discount_percent,commission_percent,gross_sales,coordination_cost,commission_due,commission_paid,payout_status,updated_by_email,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(partnership_id) DO UPDATE SET coupon_code=excluded.coupon_code,discount_percent=excluded.discount_percent,commission_percent=excluded.commission_percent,gross_sales=excluded.gross_sales,coordination_cost=excluded.coordination_cost,commission_due=excluded.commission_due,commission_paid=excluded.commission_paid,payout_status=excluded.payout_status,updated_by_email=excluded.updated_by_email,updated_at=excluded.updated_at").bind(partnershipId,String(body.couponCode||""),Number(body.discountPercent||0),rate,gross,cost,due,paid,String(body.payoutStatus||"غير مستحق"),auth.email,now).run();return Response.json({ok:true,roi:cost?((gross-cost)/cost)*100:null});
  }
  if(action==="update_stage"){
    const opportunityId=String(body.opportunityId||""),stage=String(body.stage||"");if(!opportunityId||!businessStages.includes(stage))return Response.json({error:"الفرصة أو المرحلة غير صحيحة"},{status:400});
    const row=await db.prepare("SELECT o.account_id,o.stage,o.approval_status,o.opportunity_kind FROM b2b_opportunities o WHERE o.id=?").bind(opportunityId).first<{account_id:string;stage:string;approval_status:string;opportunity_kind:string}>();if(!row)return Response.json({error:"الفرصة غير موجودة"},{status:404});if(row.approval_status!=="approved")return Response.json({error:"يجب اعتماد الجهة قبل تحديث مسارها"},{status:409});const allowed=row.opportunity_kind==="corporate_training"?trainingStages:partnershipStages;if(!allowed.includes(stage))return Response.json({error:"المرحلة لا تتوافق مع نوع الطلب"},{status:400});if(!await assertAccess(row.account_id))return Response.json({error:"الجهة غير متاحة ضمن نطاق عملك"},{status:403});
    await db.batch([db.prepare("UPDATE b2b_opportunities SET stage=?,next_follow_up=COALESCE(?,next_follow_up),updated_at=? WHERE id=?").bind(stage,String(body.nextFollowUp||"")||null,now,opportunityId),db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,'تحديث المرحلة',?,?,?)").bind(id("B2BX"),row.account_id,opportunityId,`${row.stage} ← ${stage}`,auth.email,now)]);return Response.json({ok:true});
  }
  if(action==="log_activity"){
    const opportunityId=String(body.opportunityId||""),partnershipId=String(body.partnershipId||""),accountId=String(body.accountId||""),activityType=String(body.activityType||"").trim(),details=String(body.details||"").trim();if(!accountId||!activityType)return Response.json({error:"نوع التحديث مطلوب"},{status:400});if(!await assertAccess(accountId))return Response.json({error:"الجهة غير متاحة ضمن نطاق عملك"},{status:403});
    await db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,partnership_id,activity_type,details,due_at,completed_at,actor_email,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)").bind(id("B2BX"),accountId,opportunityId||null,partnershipId||null,activityType,details,String(body.dueAt||"")||null,body.completed?now:null,auth.email,now).run();return Response.json({ok:true});
  }
  if(action==="convert_to_partnership"){
    if(!can(auth,"b2b.partnerships.manage"))return Response.json({error:"ليس لديك صلاحية اعتماد الاتفاقيات"},{status:403});
    const opportunityId=String(body.opportunityId||""),startDate=String(body.startDate||""),endDate=String(body.endDate||""),signedAt=String(body.signedAt||"");if(!opportunityId||![startDate,endDate,signedAt].every(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)))return Response.json({error:"تاريخ التوقيع والبداية والنهاية مطلوبة"},{status:400});
    const opportunity=await db.prepare("SELECT o.account_id,o.opportunity_kind,c.id contact_id FROM b2b_opportunities o LEFT JOIN b2b_contacts c ON c.account_id=o.account_id AND c.is_primary=1 WHERE o.id=?").bind(opportunityId).first<{account_id:string;contact_id:string;opportunity_kind:string}>();if(!opportunity)return Response.json({error:"الفرصة غير موجودة"},{status:404});if(opportunity.opportunity_kind==="corporate_training")return Response.json({error:"طلبات التدريب المؤسسي تُغلق بالتنفيذ ولا تتحول إلى شراكات"},{status:409});if(!await assertAccess(opportunity.account_id))return Response.json({error:"الجهة غير متاحة ضمن نطاق عملك"},{status:403});const partnershipId=id("B2BP");
    await db.batch([db.prepare("INSERT INTO b2b_partnerships(id,account_id,opportunity_id,agreement_number,signed_at,start_date,end_date,value,payment_terms,scope,services,renewal_terms,status,internal_owner_email,primary_contact_id,document_url,created_by_email,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(partnershipId,opportunity.account_id,opportunityId,String(body.agreementNumber||""),signedAt,startDate,endDate,Number(body.value||0),String(body.paymentTerms||""),String(body.scope||""),String(body.services||""),String(body.renewalTerms||""),"بانتظار التفعيل",String(body.internalOwnerEmail||auth.email),opportunity.contact_id||null,String(body.documentUrl||""),auth.email,now,now),db.prepare("UPDATE b2b_opportunities SET stage='تم التوقيع',signed_at=?,lifecycle_stage='التفاوض والاتفاقية',lifecycle_updated_at=?,updated_at=? WHERE id=?").bind(signedAt,now,now,opportunityId),db.prepare("UPDATE b2b_partnerships SET lifecycle_stage='التفاوض والاتفاقية' WHERE id=?").bind(partnershipId),db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,partnership_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,?,'توقيع الاتفاقية','تم تحويل الفرصة إلى شراكة',?,?)").bind(id("B2BX"),opportunity.account_id,opportunityId,partnershipId,auth.email,now)]);return Response.json({ok:true,id:partnershipId});
  }
  if(action==="update_partnership"){
    if(!can(auth,"b2b.partnerships.manage"))return Response.json({error:"ليس لديك صلاحية تعديل الشراكات"},{status:403});const partnershipId=String(body.partnershipId||""),status=String(body.status||"");if(!partnershipId||!partnershipStatuses.includes(status))return Response.json({error:"الشراكة أو الحالة غير صحيحة"},{status:400});const row=await db.prepare("SELECT account_id FROM b2b_partnerships WHERE id=?").bind(partnershipId).first<{account_id:string}>();if(!row||!await assertAccess(row.account_id))return Response.json({error:"الشراكة غير متاحة ضمن نطاق عملك"},{status:403});await db.prepare("UPDATE b2b_partnerships SET status=?,start_date=COALESCE(?,start_date),end_date=COALESCE(?,end_date),updated_at=? WHERE id=?").bind(status,String(body.startDate||"")||null,String(body.endDate||"")||null,now,partnershipId).run();return Response.json({ok:true});
  }
  return Response.json({error:"الإجراء غير مدعوم"},{status:400});
}
