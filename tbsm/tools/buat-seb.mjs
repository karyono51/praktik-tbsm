#!/usr/bin/env node
/* Membuat file konfigurasi Safe Exam Browser (.seb, XML polos, tanpa enkripsi) untuk ujian CBT.
   Pakai:  node tools/buat-seb.mjs https://alamat-aplikasi.example [--keluar=KATA_SANDI] [--nama=Ujian-TBSM] [--selesai=https://alamat/selesai]
   Hasil: Ujian-TBSM.seb. Buka dengan SEB Config Tool, periksa, simpan, lalu salin Config Key ke variabel SEB_CONFIG_KEYS fungsi server. */
import fs from 'node:fs';
import crypto from 'node:crypto';
const a = process.argv.slice(2), url = a.find((x) => /^https?:\/\//.test(x));
const opt = (k, d) => { const f = a.find((x) => x.startsWith('--' + k + '=')); return f ? f.slice(k.length + 3) : d; };
if (!url) { console.error('Alamat aplikasi wajib, contoh: node tools/buat-seb.mjs https://tbsm.example.sch.id'); process.exit(1); }
const nama = opt('nama', 'Ujian-TBSM').replace(/[^\w.-]/g, '_'), sandi = opt('keluar', ''), selesai = opt('selesai', url.replace(/\/$/, '') + '/?selesai=1');
const x = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const S = (k, v) => `\t<key>${k}</key>\n\t<string>${x(v)}</string>\n`, B = (k, v) => `\t<key>${k}</key>\n\t<${v ? 'true' : 'false'}/>\n`, I = (k, v) => `\t<key>${k}</key>\n\t<integer>${v}</integer>\n`;
let o = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n';
o += S('startURL', url) + S('quitURL', selesai) + B('allowQuit', true) + B('quitURLConfirm', false);
if (sandi) o += S('hashedQuitPassword', crypto.createHash('sha256').update(sandi).digest('hex'));
o += I('sebConfigPurpose', 0) + I('browserViewMode', 1) + B('showTaskBar', true) + B('showTime', true) + B('showReloadButton', true) + B('browserWindowAllowReload', true);
o += B('allowSpellCheck', false) + B('allowDictionaryLookup', false) + B('allowBrowsingBackForward', false) + B('enableLogging', false) + B('examSessionClearCookiesOnStart', false) + B('enableURLFilter', false);
o += '</dict>\n</plist>\n';
fs.writeFileSync(nama + '.seb', o);
console.log('Dibuat: ' + nama + '.seb\nMulai dari: ' + url + '\nAlamat keluar (quitURL, opsional): ' + selesai + (sandi ? '\nKata sandi keluar terpasang (hash).' : '\nTanpa kata sandi keluar.'));
