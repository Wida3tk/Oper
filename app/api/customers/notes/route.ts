import { authorize, id, operationalDb } from "../../_lib/operations";

export const dynamic = "force-dynamic";

async function ensureNotesTable(db: ReturnType<typeof operationalDb>) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS customer_notes(
        id TEXT PRIMARY KEY NOT NULL,
        customer_id TEXT NOT NULL,
        note TEXT NOT NULL,
        created_by_email TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )`,
    )
    .run();
  await db
    .prepare(
      "CREATE INDEX IF NOT EXISTS customer_notes_customer_created_idx ON customer_notes(customer_id,created_at DESC)",
    )
    .run();
}

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  const customerId = new URL(req.url).searchParams.get("customerId") || "";
  if (!customerId)
    return Response.json({ error: "رقم العميل مطلوب" }, { status: 400 });
  const db = operationalDb();
  await ensureNotesTable(db);
  const { results } = await db
    .prepare(
      "SELECT id,note,created_by_email,created_at FROM customer_notes WHERE customer_id=? ORDER BY created_at DESC LIMIT 100",
    )
    .bind(customerId)
    .all();
  return Response.json({ notes: results });
}

export async function POST(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy"]);
  if (!auth.ok) return auth.response;
  const body = (await req.json()) as Record<string, unknown>;
  const customerId = String(body.customerId || "");
  const note = String(body.note || "").trim();
  if (!customerId || !note)
    return Response.json(
      { error: "رقم العميل ونص الملاحظة مطلوبان" },
      { status: 400 },
    );
  if (note.length > 1000)
    return Response.json(
      { error: "الملاحظة يجب ألا تتجاوز 1000 حرف" },
      { status: 400 },
    );
  const db = operationalDb();
  await ensureNotesTable(db);
  const noteId = id("NOTE");
  const now = new Date().toISOString();
  await db.batch([
    db
      .prepare(
        "INSERT INTO customer_notes(id,customer_id,note,created_by_email,created_at) VALUES(?,?,?,?,?)",
      )
      .bind(noteId, customerId, note, auth.email, now),
    db
      .prepare(
        "INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'ADD_CUSTOMER_NOTE','customer',?,?,?)",
      )
      .bind(
        id("AUD"),
        auth.email,
        customerId,
        JSON.stringify({ noteId }),
        now,
      ),
  ]);
  return Response.json(
    {
      ok: true,
      note: {
        id: noteId,
        note,
        created_by_email: auth.email,
        created_at: now,
      },
    },
    { status: 201 },
  );
}
