import { authorize, cleanContact, findExistingCustomers, operationalDb } from "../../_lib/operations";

export const dynamic = "force-dynamic";

// Tells the registration form, while it is being filled, which existing file intake would attach the order to.
export async function POST(req: Request) {
  const auth = await authorize(req, ["sales"]);
  if (!auth.ok) return auth.response;
  const { phone, email } = cleanContact(await req.json() as Record<string, unknown>);
  const validPhone = /^00[1-9]\d{8,14}$/.test(phone), validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!validPhone && !validEmail) return Response.json({ matches: [] });
  // An invalid half must not match anything, so it is replaced by a value no row holds.
  const rows = await findExistingCustomers(operationalDb(), validPhone ? phone : "\u0000", validEmail ? email : "\u0000");
  return Response.json({ matches: rows.map((row) => ({ id: row.id, name: row.name, phone: row.phone, email: row.email, deleted: Boolean(row.deleted_at) })) });
}
