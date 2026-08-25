import { authorize, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["academy"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  await db.prepare("CREATE TABLE IF NOT EXISTS notification_reads(email TEXT NOT NULL,notification_id TEXT NOT NULL,read_at TEXT NOT NULL,PRIMARY KEY(email,notification_id))").run();
  const { results } = await db.prepare(`
    SELECT a.id,a.created_at,a.actor_email,
      COALESCE(NULLIF(s.display_name,''),a.actor_email) actor_name,
      c.id customer_id,c.name customer_name,
      p.name program_name,o.order_number,nr.read_at
    FROM audit_log a
    JOIN orders o ON o.id=json_extract(a.details,'$.orderId')
    JOIN customers c ON c.id=o.customer_id
    LEFT JOIN programs p ON p.id=o.program_id
    LEFT JOIN staff_accounts s ON s.email=a.actor_email
    LEFT JOIN notification_reads nr ON nr.notification_id=a.id AND nr.email=?
    WHERE a.action='RECORD_PAYMENT_AND_ADMIT'
      AND a.created_at>=datetime('now','-7 days')
      AND c.deleted_at IS NULL
    ORDER BY a.created_at DESC
    LIMIT 20
  `).bind(auth.email).all();
  return Response.json({ notifications: results });
}

export async function POST(req:Request){
  const auth=await authorize(req,["academy"]);if(!auth.ok)return auth.response;
  const db=operationalDb(),now=new Date().toISOString();
  await db.prepare("CREATE TABLE IF NOT EXISTS notification_reads(email TEXT NOT NULL,notification_id TEXT NOT NULL,read_at TEXT NOT NULL,PRIMARY KEY(email,notification_id))").run();
  const body=await req.json().catch(()=>({})) as {ids?:string[]},ids=(body.ids||[]).filter(Boolean).slice(0,100);
  if(ids.length)await db.batch(ids.map(notificationId=>db.prepare("INSERT INTO notification_reads(email,notification_id,read_at) VALUES(?,?,?) ON CONFLICT(email,notification_id) DO UPDATE SET read_at=excluded.read_at").bind(auth.email,notificationId,now)));
  return Response.json({ok:true,readAt:now,count:ids.length});
}
