import { authorize, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  const showAll = new URL(req.url).searchParams.get("all") === "1" && auth.roles.includes("admin");
  const { results } = await db.prepare(`SELECT id,code,name,category,default_trial_days trialDays,seat_reservation_fee seatFee,active FROM programs ${showAll ? "" : "WHERE active=1"} ORDER BY name`).all();
  return Response.json({ programs: results });
}

export async function POST(req: Request) {
  const auth = await authorize(req, []);
  if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string, unknown>;
  const name = String(body.name || "").trim();
  const code = String(body.code || "").trim().toUpperCase();
  const category = String(body.category || "برنامج").trim();
  const trialDays = Math.max(0, Number(body.trialDays || 0));
  const seatFee = body.seatFee === "" || body.seatFee == null ? null : Math.max(0, Number(body.seatFee));
  if (!name || !code) return Response.json({ error: "اسم البرنامج والرمز مطلوبان" }, { status: 400 });
  const now = new Date().toISOString();
  try {
    await operationalDb().prepare("INSERT INTO programs(id,code,name,category,default_trial_days,seat_reservation_fee,active,created_at,updated_at) VALUES(?,?,?,?,?,?,1,?,?)")
      .bind(id("PRG"), code, name, category, trialDays, seatFee, now, now).run();
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "رمز البرنامج مستخدم مسبقاً" }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  const auth = await authorize(req, []);
  if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string, unknown>;
  const programId = String(body.programId || "");
  const active = body.active ? 1 : 0;
  if (!programId) return Response.json({ error: "البرنامج مطلوب" }, { status: 400 });
  await operationalDb().prepare("UPDATE programs SET active=?,updated_at=? WHERE id=?").bind(active, new Date().toISOString(), programId).run();
  return Response.json({ ok: true });
}
