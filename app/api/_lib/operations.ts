import { env } from "cloudflare:workers";

export type StaffRole = "admin" | "sales" | "finance" | "academy" | "viewer";

export const bootstrapAdmins = new Set(["ro7e.entaa@gmail.com"]);

export function operationalDb() {
  if (!env.DB) throw new Error("قاعدة البيانات غير متاحة");
  return env.DB;
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
  return {
    name: String(body.name || "").trim(),
    phone: String(body.phone || "").replace(/\s/g, ""),
    email: String(body.email || "").trim().toLowerCase(),
  };
}

export function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 10)}`;
}
