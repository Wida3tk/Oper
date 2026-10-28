import { authorize, ensureDirectProgramSchema, ensureProgramPriceSchema, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  await ensureDirectProgramSchema(db);
  await ensureProgramPriceSchema(db);
  const showAll = new URL(req.url).searchParams.get("all") === "1" && auth.roles.includes("admin");
  const { results } = await db.prepare(`SELECT id,code,name,category,program_kind programKind,default_trial_days trialDays,seat_reservation_fee seatFee,active FROM programs ${showAll ? "" : "WHERE active=1"} ORDER BY name`).all<Record<string, unknown>>();
  const { results: tracks } = await db.prepare(`SELECT id,program_id programId,name,sort_order sortOrder,active FROM program_tracks ${showAll ? "" : "WHERE active=1"} ORDER BY sort_order,name`).all<Record<string, unknown>>();
  const prices = (await db.prepare("SELECT program_id programId,track,delivery,price FROM program_prices ORDER BY track,delivery").all()).results as { programId: string; track: string; delivery: string; price: number }[];
  return Response.json({ programs: results.map(program => ({ ...program, tracks: tracks.filter(track => track.programId === program.id), prices: prices.filter(price => price.programId === program.id).map(({ track, delivery, price }) => ({ track, delivery, price })) })) });
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
  if(Array.isArray(body.prices)){
    // Replaces the programme's list prices (VAT included). Keyed by track name, not track id, because saving tracks recreates their ids.
    const prices=new Map<string,{track:string;delivery:string;price:number}>();
    for(const row of body.prices as Record<string,unknown>[]){
      const track=String(row?.track||"").trim(),delivery=String(row?.delivery||"").trim(),price=Math.round(Number(row?.price)*100)/100;
      if(track.length>100||!["مسجل","مباشر","خدمة"].includes(delivery)||!(price>0)||price>1_000_000)return Response.json({error:"كل سعر يحتاج نمطاً صحيحاً ومبلغاً أكبر من صفر"},{status:400});
      prices.set(`${track}|${delivery}`,{track,delivery,price});
    }
    await ensureProgramPriceSchema(db);
    const {results:before}=await db.prepare("SELECT track,delivery,price FROM program_prices WHERE program_id=?").bind(programId).all();
    await db.batch([
      db.prepare("DELETE FROM program_prices WHERE program_id=?").bind(programId),
      ...[...prices.values()].map(row=>db.prepare("INSERT INTO program_prices(program_id,track,delivery,price,updated_by_email,updated_at) VALUES(?,?,?,?,?,?)").bind(programId,row.track,row.delivery,row.price,auth.email,now)),
      db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_PROGRAM_PRICES','program',?,?,?)").bind(id("AUD"),auth.email,programId,JSON.stringify({before,after:[...prices.values()]}),now),
    ]);
  }
  if(Array.isArray(body.tracks)){
    const tracks=body.tracks.map(String).map(x=>x.trim()).filter(Boolean);
    await db.batch([db.prepare("DELETE FROM program_tracks WHERE program_id=?").bind(programId),...tracks.map((track,index)=>db.prepare("INSERT INTO program_tracks(id,program_id,name,sort_order,active,created_at,updated_at) VALUES(?,?,?,?,1,?,?)").bind(id("TRK"),programId,track,index+1,now,now))]);
  }
  if(active!==null)await db.prepare("UPDATE programs SET active=?,updated_at=? WHERE id=?").bind(active,now,programId).run();
  return Response.json({ ok: true });
}
