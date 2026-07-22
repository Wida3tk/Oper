import { actorEmail, bootstrapAdmins, operationalDb } from "../_lib/operations";

export const dynamic="force-dynamic";
const enc=new TextEncoder();
const hex=(buffer:ArrayBuffer)=>Array.from(new Uint8Array(buffer)).map(x=>x.toString(16).padStart(2,"0")).join("");
const random=()=>{const bytes=crypto.getRandomValues(new Uint8Array(32));return Array.from(bytes).map(x=>x.toString(16).padStart(2,"0")).join("")};
async function hashPassword(password:string,salt:string){const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);return hex(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:enc.encode(salt),iterations:210000},key,256))}
async function tokenHash(token:string){return hex(await crypto.subtle.digest("SHA-256",enc.encode(token)))}
const cookie=(token:string,maxAge:number)=>`sulukera_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

export async function GET(req:Request){
 const accessEmail=actorEmail(req),db=operationalDb(),cookieValue=req.headers.get("cookie")?.match(/(?:^|;\s*)sulukera_session=([^;]+)/)?.[1];
 if(cookieValue){const digest=await tokenHash(decodeURIComponent(cookieValue)),session=await db.prepare("SELECT s.email FROM staff_sessions s JOIN staff_accounts a ON a.email=s.email WHERE s.token_hash=? AND s.expires_at>? AND a.active=1").bind(digest,new Date().toISOString()).first<{email:string}>();if(session)return Response.json({authenticated:true,email:session.email})}
 const setupRequired=bootstrapAdmins.has(accessEmail)&&!(await db.prepare("SELECT email FROM staff_accounts WHERE email=?").bind(accessEmail).first());
 return Response.json({authenticated:false,setupRequired,email:setupRequired?accessEmail:""},{status:401});
}

export async function POST(req:Request){
 const body=await req.json() as Record<string,unknown>,action=String(body.action||"login"),db=operationalDb(),now=new Date();
 if(action==="setup"){
  const email=actorEmail(req),password=String(body.password||"");if(!bootstrapAdmins.has(email))return Response.json({error:"إعداد المدير غير متاح"},{status:403});if(password.length<8)return Response.json({error:"كلمة المرور يجب ألا تقل عن 8 أحرف"},{status:400});
  const salt=random(),hash=await hashPassword(password,salt),stamp=now.toISOString();await db.prepare("INSERT INTO staff_accounts(email,password_hash,password_salt,permissions,active,created_at,updated_at) VALUES(?,?,?,'[\"*\"]',1,?,?) ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash,password_salt=excluded.password_salt,active=1,updated_at=excluded.updated_at").bind(email,hash,salt,stamp,stamp).run();return createSession(db,email,now);
 }
 const email=String(body.email||"").trim().toLowerCase(),password=String(body.password||""),account=await db.prepare("SELECT email,password_hash,password_salt FROM staff_accounts WHERE email=? AND active=1").bind(email).first<{email:string;password_hash:string;password_salt:string}>();
 if(!account||await hashPassword(password,account.password_salt)!==account.password_hash)return Response.json({error:"البريد الإلكتروني أو كلمة المرور غير صحيحة"},{status:401});return createSession(db,email,now);
}

async function createSession(db:ReturnType<typeof operationalDb>,email:string,now:Date){const token=random(),digest=await tokenHash(token),expires=new Date(now.getTime()+12*60*60*1000);await db.prepare("INSERT INTO staff_sessions(id,email,token_hash,expires_at,created_at) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(),email,digest,expires.toISOString(),now.toISOString()).run();return new Response(JSON.stringify({ok:true,email}),{headers:{"content-type":"application/json","set-cookie":cookie(token,43200)}})}

export async function DELETE(req:Request){const token=decodeURIComponent(req.headers.get("cookie")?.match(/(?:^|;\s*)sulukera_session=([^;]+)/)?.[1]||"");if(token)await operationalDb().prepare("DELETE FROM staff_sessions WHERE token_hash=?").bind(await tokenHash(token)).run();return new Response(JSON.stringify({ok:true}),{headers:{"content-type":"application/json","set-cookie":cookie("",0)}})}
