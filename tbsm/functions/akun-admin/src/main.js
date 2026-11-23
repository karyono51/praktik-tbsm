/* Appwrite Function "akun-admin": admin mengatur sandi akun login dari aplikasi.
   Runtime Node.js 18+ . Scope API key: users.read, users.write. Execute access: Users (semua yang login),
   tetapi fungsi ini hanya melayani pemanggil berlabel "admin". */
import { Client, Users, Databases, ID, Query } from 'node-appwrite';
import { cbtHandle, CBT_AKSI } from './cbt.js';   /* salinan functions/cbt/src/main.js, dibuat oleh tools/gabung-cbt.mjs (paket gratis: maks 2 fungsi) */

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

    /* Aksi ujian CBT (mulai, simpan, kirim, periksa, ulasan, akhiri, akhiriSemua) dilayani kode CBT yang sama dengan fungsi cbt. */
    if (CBT_AKSI.has(body.action)) return cbtHandle({ req, res, error, body });

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
    /* Aksi "setlabel" (admin): samakan label Auth (admin, guru, proktor) dengan kolom peran di daftar akun.
       Kiriman: { email, peran } atau { items: [{ email, peran }, ...] } (maks 200). Label lain (bukan admin/guru/proktor) dibiarkan.
       Admin tidak bisa mencabut label admin dari akunnya sendiri. Perlu scope users.read dan users.write. */
    if (body.action === 'setlabel') {
      const KELOLA = ['admin', 'guru', 'proktor'];
      const items = Array.isArray(body.items) ? body.items : [{ email: body.email, peran: body.peran }];
      if (!items.length || items.length > 200) return res.json({ ok: false, error: 'Kirim 1 sampai 200 akun.' }, 400);
      const hasil = [];
      for (const it of items) {
        const em = String((it && it.email) || '').trim().toLowerCase();
        const peran = (Array.isArray(it && it.peran) ? it.peran : String((it && it.peran) || '').split(/[,\s]+/)).map((x) => String(x).trim().toLowerCase());
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { hasil.push({ email: em, status: 'email-tidak-valid' }); continue; }
        try {
          const f = await users.list([Query.equal('email', [em]), Query.limit(1)]);
          if (!f.total) { hasil.push({ email: em, status: 'belum-ada-login' }); continue; }
          const u = f.users[0];
          const lama = u.labels || [];
          const baru = lama.filter((l) => !KELOLA.includes(l)).concat(KELOLA.filter((l) => peran.includes(l)));
          if (u.$id === callerId && !baru.includes('admin')) { hasil.push({ email: em, status: 'ditolak-admin-sendiri' }); continue; }
          const sama = baru.length === lama.length && baru.every((l) => lama.includes(l));
          if (!sama) await users.updateLabels(u.$id, baru);
          hasil.push({ email: em, status: sama ? 'sudah-sama' : 'diubah', labels: baru.filter((l) => KELOLA.includes(l)) });
        } catch (e) { hasil.push({ email: em, status: 'gagal', pesan: String(e && e.message ? e.message : e).slice(0, 120) }); }
      }
      return res.json({ ok: true, hasil });
    }

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
