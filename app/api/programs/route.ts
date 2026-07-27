import { authorize, ensureDirectProgramSchema, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  await ensureDirectProgramSchema(db);
  const showAll = new URL(req.url).searchParams.get("all") === "1" && auth.roles.includes("admin");
  const { results } = await db.prepare(`SELECT id,code,name,category,program_kind programKind,default_trial_days trialDays,seat_reservation_fee seatFee,active FROM programs ${showAll ? "" : "WHERE active=1"} ORDER BY name`).all<Record<string, unknown>>();
  const { results: tracks } = await db.prepare(`SELECT id,program_id programId,name,sort_order sortOrder,active FROM program_tracks ${showAll ? "" : "WHERE active=1"} ORDER BY sort_order,name`).all<Record<string, unknown>>();
  return Response.json({ programs: results.map(program => ({ ...program, tracks: tracks.filter(track => track.programId === program.id) })) });
}

export async function POST(req: Request) {
  const auth = await authorize(req, []);
  if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string, unknown>;
  const name = String(body.name || "").trim();
  const code = String(body.code || "").trim().toUpperCase();
  const category = String(body.category || "برنامج").trim();
  const programKind = String(body.programKind || "برنامج مباشر").trim();
  const trialDays = Math.max(0, Number(body.trialDays || 0));
  const seatFee = body.seatFee === "" || body.seatFee == null ? null : Math.max(0, Number(body.seatFee));
  const tracks = Array.isArray(body.tracks) ? body.tracks.map(String).map(x => x.trim()).filter(Boolean) : [];
  if (!name || !code) return Response.json({ error: "اسم البرنامج والرمز مطلوبان" }, { status: 400 });
  const now = new Date().toISOString();
  try {
    const db = operationalDb();
    await ensureDirectProgramSchema(db);
    const programId = id("PRG");
    await db.batch([db.prepare("INSERT INTO programs(id,code,name,category,program_kind,default_trial_days,seat_reservation_fee,active,created_at,updated_at) VALUES(?,?,?,?,?,?,?,1,?,?)").bind(programId, code, name, category, programKind, trialDays, seatFee, now, now),...tracks.map((track,index)=>db.prepare("INSERT INTO program_tracks(id,program_id,name,sort_order,active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)").bind(id("TRK"),programId,track,index+1,now,now))]);
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
  const active = body.active == null ? null : body.active ? 1 : 0;
  if (!programId) return Response.json({ error: "البرنامج مطلوب" }, { status: 400 });
  const db=operationalDb(),now=new Date().toISOString();
  if(Array.isArray(body.tracks)){
    const tracks=body.tracks.map(String).map(x=>x.trim()).filter(Boolean);
    await db.batch([db.prepare("DELETE FROM program_tracks WHERE program_id=?").bind(programId),...tracks.map((track,index)=>db.prepare("INSERT INTO program_tracks(id,program_id,name,sort_order,active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)").bind(id("TRK"),programId,track,index+1,now,now))]);
  }
  if(active!==null)await db.prepare("UPDATE programs SET active=?,updated_at=? WHERE id=?").bind(active,now,programId).run();
  return Response.json({ ok: true });
}
