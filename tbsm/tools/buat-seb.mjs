#!/usr/bin/env node
/* Membuat file konfigurasi Safe Exam Browser (.seb, XML polos, tanpa enkripsi) untuk ujian CBT.
   Pakai:  node tools/buat-seb.mjs https://alamat-aplikasi.example [--keluar=KATA_SANDI] [--nama=Ujian-TBSM] [--selesai=https://alamat/selesai]
           [--sekolah=medina|df] [--go=cbt] [--sesi=ID_SESI]
   --go=cbt  : setelah masuk, siswa langsung ke halaman CBT Online (satu file .seb untuk semua sesi, satu Config Key).
   --sesi=ID : sesi itu tampil paling atas dan diberi tanda (ikut membawa --go=cbt). Tiap sesi = file .seb dan Config Key sendiri;
               gabungkan semua key di SEB_CONFIG_KEYS (dipisah koma). Ujian tidak dimulai otomatis, siswa tetap menekan Mulai ujian.
   Hasil: Ujian-TBSM.seb. Buka dengan SEB Config Tool, periksa, simpan, lalu salin Config Key ke variabel SEB_CONFIG_KEYS fungsi server. */
import fs from 'node:fs';
import crypto from 'node:crypto';
const a = process.argv.slice(2), url = a.find((x) => /^https?:\/\//.test(x));
const opt = (k, d) => { const f = a.find((x) => x.startsWith('--' + k + '=')); return f ? f.slice(k.length + 3) : d; };
if (!url) { console.error('Alamat aplikasi wajib, contoh: node tools/buat-seb.mjs https://tbsm.example.sch.id'); process.exit(1); }
const sekolah = opt('sekolah', ''), go = opt('go', ''), sesi = opt('sesi', '');
if (sekolah && !/^[a-z0-9_-]{1,20}$/i.test(sekolah)) { console.error('--sekolah hanya huruf, angka, - dan _'); process.exit(1); }
if (go && go !== 'cbt') { console.error('--go hanya mendukung: cbt'); process.exit(1); }
if (sesi && !/^[A-Za-z0-9_-]{1,64}$/.test(sesi)) { console.error('--sesi hanya huruf, angka, - dan _ (maksimal 64)'); process.exit(1); }
const q = new URLSearchParams(); if (sekolah) q.set('s', sekolah); if (go || sesi) q.set('go', 'cbt'); if (sesi) q.set('sesi', sesi);
const mulai = q.toString() ? url.replace(/\/+$/, '') + '/?' + q : url;
const nama = opt('nama', 'Ujian-TBSM').replace(/[^\w.-]/g, '_'), sandi = opt('keluar', ''), selesai = opt('selesai', url.replace(/\/$/, '') + '/?' + (sekolah ? 's=' + sekolah + '&' : '') + 'selesai=1');
const x = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const S = (k, v) => `\t<key>${k}</key>\n\t<string>${x(v)}</string>\n`, B = (k, v) => `\t<key>${k}</key>\n\t<${v ? 'true' : 'false'}/>\n`, I = (k, v) => `\t<key>${k}</key>\n\t<integer>${v}</integer>\n`;
let o = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n';
o += S('startURL', mulai) + S('quitURL', selesai) + B('allowQuit', true) + B('quitURLConfirm', false);
if (sandi) o += S('hashedQuitPassword', crypto.createHash('sha256').update(sandi).digest('hex'));
o += I('sebConfigPurpose', 0) + I('browserViewMode', 1) + B('showTaskBar', true) + B('showTime', true) + B('showReloadButton', true) + B('browserWindowAllowReload', true);
o += B('allowSpellCheck', false) + B('allowDictionaryLookup', false) + B('allowBrowsingBackForward', false) + B('enableLogging', false) + B('examSessionClearCookiesOnStart', false) + B('enableURLFilter', false);
o += '</dict>\n</plist>\n';
fs.writeFileSync(nama + '.seb', o);
console.log('Dibuat: ' + nama + '.seb\nMulai dari: ' + mulai + '\nAlamat keluar (quitURL, opsional): ' + selesai + (sandi ? '\nKata sandi keluar terpasang (hash).' : '\nTanpa kata sandi keluar.'));
