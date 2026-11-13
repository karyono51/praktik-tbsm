/* Appwrite Function "akun-admin": admin mengatur sandi akun login dari aplikasi.
   Runtime Node.js 18+ . Scope API key: users.read, users.write. Execute access: Users (semua yang login),
   tetapi fungsi ini hanya melayani pemanggil berlabel "admin". */
import { Client, Users, Databases, ID, Query } from 'node-appwrite';

export default async ({ req, res, error }) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(req.headers['x-appwrite-key']);
    const users = new Users(client);

    const callerId = req.headers['x-appwrite-user-id'];
    if (!callerId) return res.json({ ok: false, error: 'Harus login.' }, 401);
    const caller = await users.get(callerId);

    let body = {};
    try { body = req.bodyJson || JSON.parse(req.bodyText || req.body || '{}'); } catch (e) { return res.json({ ok: false, error: 'Data tidak valid.' }, 400); }

    /* Aksi "claim" (semua pengguna login): catat pemetaan ID login -> ID akun aplikasi di uid_map.
       Email diambil dari akun Auth pemanggil di server, bukan dari kiriman klien. Perlu scope databases.read dan databases.write. */
    if (body.action === 'claim') {
      const db = new Databases(client);
      const DB = process.env.DB_ID || 'tbsm';
      const mail = String(caller.email || '').trim().toLowerCase();
      if (!mail) return res.json({ ok: false, error: 'Akun login tidak punya email.' }, 400);
      const f = await db.listDocuments(DB, 'akun', [Query.equal('email', [mail]), Query.limit(1)]);
      if (!f.total) return res.json({ ok: false, error: 'Email belum terdaftar di daftar akun.' }, 404);
      const akun = f.documents[0];
      if (akun.aktif === false) return res.json({ ok: false, error: 'Akun nonaktif.' }, 403);
      const data = { sid: akun.$id, email: mail };
      try { await db.createDocument(DB, 'uid_map', callerId, data); }
      catch (e) { if (e && e.code === 409) await db.updateDocument(DB, 'uid_map', callerId, data); else throw e; }
      return res.json({ ok: true, sid: akun.$id });
    }

    if (!(caller.labels || []).includes('admin')) return res.json({ ok: false, error: 'Hanya admin yang boleh mengatur sandi.' }, 403);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || '').trim().slice(0, 128) || email;
    if (body.action !== 'setpw') return res.json({ ok: false, error: 'Aksi tidak dikenal.' }, 400);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.json({ ok: false, error: 'Email tidak valid.' }, 400);
    if (password.length < 8 || password.length > 256) return res.json({ ok: false, error: 'Sandi 8 sampai 256 karakter.' }, 400);

    const found = await users.list([Query.equal('email', [email]), Query.limit(1)]);
    if (found.total > 0) {
      await users.updatePassword(found.users[0].$id, password);
      return res.json({ ok: true, created: false });
    }
    await users.create(ID.unique(), email, undefined, password, name);
    return res.json({ ok: true, created: true });
  } catch (e) {
    error(String(e && e.message ? e.message : e));
    return res.json({ ok: false, error: 'Gagal di server: ' + (e && e.message ? e.message : e) }, 500);
  }
};
