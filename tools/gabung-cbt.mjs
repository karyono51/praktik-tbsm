#!/usr/bin/env node
/* Menyalin kode fungsi CBT ke fungsi akun-admin supaya project Appwrite paket gratis (maksimal 2 fungsi:
   akun-admin dan foto-drive) tetap bisa memakai CBT aman tanpa fungsi ketiga.
   Jalankan setiap kali functions/cbt/src/main.js atau js/soal-tka.js berubah:  node tools/gabung-cbt.mjs
   Lalu deploy ulang fungsi akun-admin, dan di js/config.js isi  FN_CBT:'akun-admin'. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, [path.join(root, 'tools/bangun-bawaan.mjs')], { stdio: 'inherit' });
const src = path.join(root, 'functions/cbt/src'), dst = path.join(root, 'functions/akun-admin/src');
fs.copyFileSync(path.join(src, 'main.js'), path.join(dst, 'cbt.js'));
fs.copyFileSync(path.join(src, 'bawaan.json'), path.join(dst, 'bawaan.json'));
console.log('Disalin ke functions/akun-admin/src: cbt.js dan bawaan.json');
console.log('Berikutnya: deploy ulang fungsi akun-admin; scope tambahan yang diperlukan: databases.read, databases.write, users.read.');
