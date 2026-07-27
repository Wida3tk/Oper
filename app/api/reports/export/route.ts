import * as XLSX from "xlsx";
import { authorize, operationalDb } from "../../_lib/operations";

export const dynamic="force-dynamic";

const groups:Record<string,string[]>={
  customers:["customers","prospects"],
  sales:["orders","payments","payment_intents","payment_reviews","installments","finance_notes"],
  programs:["programs","program_tracks","program_trials","enrollments","seat_reservations","reservation_transfers"],
  operations:["workflow_tasks","tasks","audit_log"],
  users:["staff_roles","staff_accounts"],
};
const labels:Record<string,string>={
  customers:"العملاء",prospects:"الطلبات الأولية",orders:"الطلبات",payments:"الدفعات",
  payment_intents:"نوايا الدفع",payment_reviews:"مراجعات الدفع",installments:"الأقساط",
  finance_notes:"الملاحظات المالية",
  programs:"البرامج",program_tracks:"مسارات البرامج",program_trials:"عملاء التجربة",
  enrollments:"التسجيلات",seat_reservations:"الحجوزات والمباشر",reservation_transfers:"نقل الحجوزات",
  workflow_tasks:"المهام التشغيلية",tasks:"المهام العامة",audit_log:"سجل الإجراءات",staff_roles:"صلاحيات المستخدمين",
  staff_accounts:"حسابات المستخدمين",
};

export async function GET(req:Request){
  const auth=await authorize(req,[]);
  if(!auth.ok)return auth.response;
  const category=new URL(req.url).searchParams.get("category")||"all";
  if(category!=="all"&&!groups[category])return Response.json({error:"تصنيف التصدير غير صالح"},{status:400});
  const tables=category==="all"?Array.from(new Set(Object.values(groups).flat())):groups[category];
  const db=operationalDb(),workbook=XLSX.utils.book_new();
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
