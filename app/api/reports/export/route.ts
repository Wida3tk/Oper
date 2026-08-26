import * as XLSX from "xlsx";
import { authorize, can, operationalDb } from "../../_lib/operations";

export const dynamic="force-dynamic";

const groups:Record<string,string[]>={
  customers:["customers","prospects"],
  sales:["orders","payments","payment_intents","payment_reviews","installments","finance_notes","withdrawals"],
  programs:["programs","program_tracks","program_trials","enrollments","seat_reservations","reservation_transfers"],
  operations:["workflow_tasks","tasks","audit_log"],
  users:["staff_roles","staff_accounts"],
  b2b:["b2b_accounts","b2b_contacts","b2b_opportunities","b2b_partnerships","b2b_activities","b2b_meeting_minutes","b2b_documents","b2b_approvals","b2b_partnership_finance","b2b_assignments"],
};
const labels:Record<string,string>={
  customers:"العملاء",prospects:"الطلبات الأولية",orders:"الطلبات",payments:"الدفعات",
  payment_intents:"نوايا الدفع",payment_reviews:"مراجعات الدفع",installments:"الأقساط",
  finance_notes:"الملاحظات المالية",withdrawals:"الانسحابات والاستردادات",
  programs:"البرامج",program_tracks:"مسارات البرامج",program_trials:"عملاء التجربة",
  enrollments:"التسجيلات",seat_reservations:"الحجوزات والمباشر",reservation_transfers:"نقل الحجوزات",
  workflow_tasks:"المهام التشغيلية",tasks:"المهام العامة",audit_log:"سجل الإجراءات",staff_roles:"صلاحيات المستخدمين",
  staff_accounts:"حسابات المستخدمين",
  b2b_accounts:"جهات الشراكات",b2b_contacts:"ممثلو الجهات",b2b_opportunities:"مسارات الجهات",
  b2b_partnerships:"الاتفاقيات",b2b_activities:"سجل تقدم الشراكات",b2b_meeting_minutes:"محاضر الاجتماعات",
  b2b_documents:"مستندات الشراكات",b2b_approvals:"اعتمادات الشراكات",b2b_partnership_finance:"مؤشرات الشراكات المالية",
  b2b_assignments:"إسناد جهات الشراكات",
};

export async function GET(req:Request){
  const auth=await authorize(req,[]);
  if(!auth.ok)return auth.response;
  if(!can(auth,"reports.view"))return Response.json({error:"ليس لديك صلاحية تصدير التقارير"},{status:403});
  const category=new URL(req.url).searchParams.get("category")||"all";
  if(category!=="all"&&!groups[category])return Response.json({error:"تصنيف التصدير غير صالح"},{status:400});
  const tables=category==="all"?Array.from(new Set(Object.values(groups).flat())):groups[category];
  const db=operationalDb(),workbook=XLSX.utils.book_new();
  await db.prepare("CREATE TABLE IF NOT EXISTS withdrawals(id TEXT PRIMARY KEY,order_id TEXT NOT NULL UNIQUE,reason TEXT NOT NULL,withdrawn_at TEXT NOT NULL,gross_paid REAL NOT NULL,non_refundable_amount REAL NOT NULL DEFAULT 0,refund_amount REAL NOT NULL DEFAULT 0,refund_source TEXT NOT NULL,refund_method TEXT NOT NULL,reference TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'مكتمل',created_by_email TEXT NOT NULL,created_at TEXT NOT NULL)").run();
  for(const table of tables){
    const query=table==="staff_accounts"
      ?"SELECT email,display_name,permissions,active,created_at,updated_at FROM staff_accounts ORDER BY created_at"
      :`SELECT * FROM ${table} ORDER BY rowid`;
    const {results}=await db.prepare(query).all<Record<string,unknown>>();
    const rows=results.map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[key,value==null?"":typeof value==="object"?JSON.stringify(value):value])));
    const sheet=XLSX.utils.json_to_sheet(rows.length?rows:[{ملاحظة:"لا توجد بيانات في هذا التصنيف"}]);
    sheet["!autofilter"]={ref:sheet["!ref"]||"A1:A1"};
    sheet["!cols"]=Object.keys(rows[0]||{ملاحظة:""}).map(key=>({wch:Math.min(35,Math.max(12,key.length+4))}));
    XLSX.utils.book_append_sheet(workbook,sheet,(labels[table]||table).slice(0,31));
  }
  const overview=XLSX.utils.aoa_to_sheet([
    ["نسخة بيانات سلوكيرا التشغيلية"],
    ["تاريخ التصدير",new Date().toISOString()],
    ["نطاق التصدير",category==="all"?"نسخة كاملة":category],
    ["عدد التصنيفات",tables.length],
    ["ملاحظة","لا تتضمن النسخة كلمات المرور أو جلسات الدخول حفاظاً على الأمان."],
  ]);
  XLSX.utils.book_append_sheet(workbook,overview,"معلومات النسخة",true);
  const bytes=XLSX.write(workbook,{bookType:"xlsx",type:"array",compression:true}) as ArrayBuffer;
  const date=new Date().toISOString().slice(0,10),filename=`sulukera-${category}-${date}.xlsx`;
  return new Response(bytes,{headers:{
    "content-type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "content-disposition":`attachment; filename="${filename}"`,
    "cache-control":"no-store",
    "x-content-type-options":"nosniff",
  }});
}
