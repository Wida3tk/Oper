import { authorize, can, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

const partnershipStages = ["جهة مسندة","تم التواصل","تم الاجتماع","أُرسل العرض","بانتظار التوقيع","تم التوقيع","تم التفعيل","مغلقة"];
const trainingStages = ["جهة مسندة","تم التواصل","تم تحديد الاحتياج","أُرسل العرض","تم قبول العرض","تم الجدولة","قيد التنفيذ","تم التنفيذ","مغلقة"];
const businessStages = [...new Set([...partnershipStages,...trainingStages])];
const partnershipStatuses = ["بانتظار التفعيل","نشطة","تحتاج متابعة","تجديد قريب","قيد التجديد","منتهية","ملغاة"];
const paths = ["ABA","OBM"];

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
    db.prepare("CREATE INDEX IF NOT EXISTS idx_b2b_opportunities_stage ON b2b_opportunities(stage,updated_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_b2b_partnerships_status ON b2b_partnerships(status,end_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_b2b_assignments_email ON b2b_assignments(email,account_id)"),
  ]);
  await addColumn(db,"ALTER TABLE b2b_accounts ADD COLUMN path TEXT NOT NULL DEFAULT 'ABA'");
  await addColumn(db,"ALTER TABLE b2b_accounts ADD COLUMN team_id TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'approved'");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN approved_by_email TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN approved_at TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN opportunity_kind TEXT NOT NULL DEFAULT 'partnership'");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN trainee_count INTEGER");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN requested_program TEXT");
  await addColumn(db,"ALTER TABLE b2b_opportunities ADD COLUMN delivery_date TEXT");
  await db.batch([
    db.prepare("UPDATE b2b_opportunities SET stage='جهة مسندة' WHERE stage='جهة جديدة'"),
    db.prepare("UPDATE b2b_opportunities SET stage='تم التواصل' WHERE stage='تواصل أولي'"),
    db.prepare("UPDATE b2b_opportunities SET stage='تم الاجتماع' WHERE stage IN ('تأهيل الاحتياج','اجتماع أو عرض تعريفي')"),
    db.prepare("UPDATE b2b_opportunities SET stage='أُرسل العرض' WHERE stage IN ('إعداد العرض','عرض مرسل')"),
    db.prepare("UPDATE b2b_opportunities SET stage='بانتظار التوقيع' WHERE stage='تفاوض'"),
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
    const {results}=await db.prepare("SELECT id,account_id,opportunity_id,partnership_id,activity_type,details,due_at,completed_at,actor_email,created_at FROM b2b_activities WHERE account_id=? ORDER BY created_at DESC").bind(accountId).all();
    return Response.json({activities:results});
  }
  const section=params.get("section")||"business";
  if(section==="partnerships"){
    const {results}=await db.prepare(`SELECT p.*,a.name account_name,a.type account_type,a.region,a.city,a.path,a.owner_email,a.team_id,
      c.name contact_name,c.job_title contact_title,c.phone contact_phone,c.email contact_email,
      (SELECT COUNT(*) FROM b2b_activities x WHERE x.partnership_id=p.id) activity_count
      FROM b2b_partnerships p JOIN b2b_accounts a ON a.id=p.account_id
      LEFT JOIN b2b_contacts c ON c.id=p.primary_contact_id WHERE 1=1${scope.sql}
      ORDER BY CASE p.status WHEN 'تجديد قريب' THEN 0 WHEN 'تحتاج متابعة' THEN 1 WHEN 'نشطة' THEN 2 ELSE 3 END,p.end_date`).bind(...scope.bind).all();
    return Response.json({partnerships:results,statuses:partnershipStatuses,scope:isAdmin(auth)?"all":"assigned",canCreatePartnership:isAdmin(auth)||can(auth,"b2b.partnerships.create"),canDelete:isAdmin(auth),viewerEmail:auth.email});
  }
  const reviewAccess=can(auth,"b2b.review"),businessScope=isAdmin(auth)?{sql:"",bind:[]}:reviewAccess?{sql:` AND (${scope.sql.replace(/^ AND /,"")} OR o.approval_status='pending')`,bind:scope.bind}:scope;
  const {results}=await db.prepare(`SELECT o.*,a.name account_name,a.type account_type,a.region,a.city,a.activity,a.source,a.owner_email,a.priority,a.path,a.team_id,
    c.id contact_id,c.name contact_name,c.job_title contact_title,c.phone contact_phone,c.email contact_email,c.contact_role,c.preferred_channel,
    (SELECT COUNT(*) FROM b2b_activities x WHERE x.opportunity_id=o.id) activity_count,
    (SELECT MAX(x.created_at) FROM b2b_activities x WHERE x.opportunity_id=o.id AND x.activity_type IN ('تم التواصل','تواصل أولي','اتصال','واتساب','بريد إلكتروني')) last_contact_at
    FROM b2b_opportunities o JOIN b2b_accounts a ON a.id=o.account_id
    LEFT JOIN b2b_contacts c ON c.account_id=a.id AND c.is_primary=1
    WHERE NOT EXISTS(SELECT 1 FROM b2b_partnerships p WHERE p.opportunity_id=o.id)${businessScope.sql}
    ORDER BY CASE o.approval_status WHEN 'pending' THEN 0 ELSE 1 END,CASE o.stage WHEN 'بانتظار التوقيع' THEN 0 WHEN 'أُرسل العرض' THEN 1 WHEN 'تم الاجتماع' THEN 2 ELSE 3 END,o.updated_at DESC`).bind(...businessScope.bind).all();
  return Response.json({opportunities:results,stages:businessStages,partnershipStages,trainingStages,paths,scope:isAdmin(auth)?"all":"assigned",canReview:reviewAccess||isAdmin(auth),canCreatePartnership:can(auth,"b2b.partnerships.create"),canDelete:isAdmin(auth),viewerEmail:auth.email});
}

export async function DELETE(req:Request){
  const auth=await authorize(req,["b2b"]);if(!auth.ok)return auth.response;
  if(!isAdmin(auth))return Response.json({error:"حذف الجهات متاح لحساب الإدارة فقط"},{status:403});
  const body=await req.json() as Record<string,unknown>,accountId=String(body.accountId||"");if(!accountId)return Response.json({error:"معرّف الجهة مطلوب"},{status:400});
  const db=operationalDb();await ensureSchema(db);const account=await db.prepare("SELECT id,name,type,path,owner_email FROM b2b_accounts WHERE id=?").bind(accountId).first<Record<string,unknown>>();if(!account)return Response.json({error:"الجهة غير موجودة"},{status:404});const now=new Date().toISOString();
  const counts=await db.prepare(`SELECT (SELECT COUNT(*) FROM b2b_opportunities WHERE account_id=?) opportunities,(SELECT COUNT(*) FROM b2b_partnerships WHERE account_id=?) partnerships,(SELECT COUNT(*) FROM b2b_activities WHERE account_id=?) activities`).bind(accountId,accountId,accountId).first();
  await db.batch([
    db.prepare("DELETE FROM b2b_activities WHERE account_id=?").bind(accountId),
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
  if(action==="create_partnership"){
    if(!isAdmin(auth)&&!can(auth,"b2b.partnerships.create"))return Response.json({error:"ليس لديك صلاحية إضافة جهة إلى الشراكات"},{status:403});
    const name=String(body.name||"").trim(),contactName=String(body.contactName||"").trim(),signedAt=String(body.signedAt||""),startDate=String(body.startDate||""),endDate=String(body.endDate||""),path=paths.includes(String(body.path))?String(body.path):"ABA";
    if(!name||!contactName||![signedAt,startDate,endDate].every(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)))return Response.json({error:"اسم الجهة والمسؤول وتواريخ الاتفاقية مطلوبة"},{status:400});
    const accountId=id("B2BA"),contactId=id("B2BC"),opportunityId=id("B2BO"),partnershipId=id("B2BP");
    await db.batch([
      db.prepare("INSERT INTO b2b_accounts(id,name,type,region,city,activity,source,owner_email,priority,status,created_by_email,created_at,updated_at,path) VALUES(?,?,?,?,?,?,?,?,'متوسطة','نشطة',?,?,?,?)").bind(accountId,name,String(body.type||"مركز"),String(body.region||""),String(body.city||""),String(body.activity||""),String(body.source||""),String(body.ownerEmail||auth.email),auth.email,now,now,path),
      db.prepare("INSERT INTO b2b_contacts(id,account_id,name,job_title,phone,email,contact_role,preferred_channel,is_primary,created_at,updated_at) VALUES(?,?,?,?,?,?,?,'واتساب',1,?,?)").bind(contactId,accountId,contactName,String(body.jobTitle||""),String(body.phone||""),String(body.email||""),"مسؤول الجهة",now,now),
      db.prepare("INSERT INTO b2b_opportunities(id,account_id,stage,created_by_email,created_at,updated_at,approval_status,approved_by_email,approved_at,signed_at) VALUES(?,?,'تم التوقيع',?,?,?,'approved',?,?,?)").bind(opportunityId,accountId,auth.email,now,now,auth.email,now,signedAt),
      db.prepare("INSERT INTO b2b_partnerships(id,account_id,opportunity_id,agreement_number,signed_at,start_date,end_date,value,scope,services,status,internal_owner_email,primary_contact_id,document_url,created_by_email,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,'بانتظار التفعيل',?,?,?,?,?,?)").bind(partnershipId,accountId,opportunityId,String(body.agreementNumber||""),signedAt,startDate,endDate,Number(body.value||0),String(body.scope||""),String(body.services||""),String(body.ownerEmail||auth.email),contactId,String(body.documentUrl||""),auth.email,now,now),
      db.prepare("INSERT OR IGNORE INTO b2b_assignments(account_id,email,assigned_by_email,created_at) VALUES(?,?,?,?)").bind(accountId,String(body.ownerEmail||auth.email),auth.email,now),
      db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,partnership_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,?,'إضافة شراكة','تمت إضافة الجهة مباشرة إلى سجل الشراكات',?,?)").bind(id("B2BX"),accountId,opportunityId,partnershipId,auth.email,now),
    ]);return Response.json({ok:true,id:partnershipId});
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
    await db.batch([db.prepare("INSERT INTO b2b_partnerships(id,account_id,opportunity_id,agreement_number,signed_at,start_date,end_date,value,payment_terms,scope,services,renewal_terms,status,internal_owner_email,primary_contact_id,document_url,created_by_email,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(partnershipId,opportunity.account_id,opportunityId,String(body.agreementNumber||""),signedAt,startDate,endDate,Number(body.value||0),String(body.paymentTerms||""),String(body.scope||""),String(body.services||""),String(body.renewalTerms||""),"بانتظار التفعيل",String(body.internalOwnerEmail||auth.email),opportunity.contact_id||null,String(body.documentUrl||""),auth.email,now,now),db.prepare("UPDATE b2b_opportunities SET stage='تم التوقيع',signed_at=?,updated_at=? WHERE id=?").bind(signedAt,now,opportunityId),db.prepare("INSERT INTO b2b_activities(id,account_id,opportunity_id,partnership_id,activity_type,details,actor_email,created_at) VALUES(?,?,?,?,'توقيع الاتفاقية','تم تحويل الفرصة إلى شراكة',?,?)").bind(id("B2BX"),opportunity.account_id,opportunityId,partnershipId,auth.email,now)]);return Response.json({ok:true,id:partnershipId});
  }
  if(action==="update_partnership"){
    if(!can(auth,"b2b.partnerships.manage"))return Response.json({error:"ليس لديك صلاحية تعديل الشراكات"},{status:403});const partnershipId=String(body.partnershipId||""),status=String(body.status||"");if(!partnershipId||!partnershipStatuses.includes(status))return Response.json({error:"الشراكة أو الحالة غير صحيحة"},{status:400});const row=await db.prepare("SELECT account_id FROM b2b_partnerships WHERE id=?").bind(partnershipId).first<{account_id:string}>();if(!row||!await assertAccess(row.account_id))return Response.json({error:"الشراكة غير متاحة ضمن نطاق عملك"},{status:403});await db.prepare("UPDATE b2b_partnerships SET status=?,start_date=COALESCE(?,start_date),end_date=COALESCE(?,end_date),updated_at=? WHERE id=?").bind(status,String(body.startDate||"")||null,String(body.endDate||"")||null,now,partnershipId).run();return Response.json({ok:true});
  }
  return Response.json({error:"الإجراء غير مدعوم"},{status:400});
}
