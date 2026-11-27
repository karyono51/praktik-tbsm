#!/bin/sh
# Pasang pembaruan dari zip terbaru di Downloads, periksa, lalu kirim ke GitHub.
# Pakai (dari folder ~/tbsm):  sh up.sh "pesan commit"
set -e
cd "$(dirname "$0")"
if [ "$(basename "$PWD")" != "tbsm" ]; then echo "Folder proyek harus bernama tbsm."; exit 1; fi
Z=$(ls -t "$HOME"/storage/downloads/tbsm*.zip 2>/dev/null | head -n 1)
if [ -z "$Z" ]; then echo "Tidak ada tbsm*.zip di Downloads."; exit 1; fi
echo "Memasang: $Z"
# Jaga CBT_DB (CBT_DB_PAKSA=1 sh up.sh untuk memakai nilai dari zip): ambil nilainya dari js/config.js di repo SEBELUM zip dipasang, pulihkan sesudahnya.
DB_LAMA=$(sed -n "s/.*CBT_DB:'\([a-z]*\)'.*/\1/p" js/config.js | head -n 1)
unzip -oq "$Z" -d "$(dirname "$PWD")"
# Repo ada di ~/tbsm. Folder ~/tbsm/tbsm adalah hasil ekstrak yang salah tempat: hentikan agar diperiksa dulu.
if [ -e tbsm/index.html ]; then echo "Ada folder tbsm/tbsm (salah ekstrak). Periksa, hapus dengan: rm -rf tbsm , lalu jalankan lagi."; exit 1; fi
# Berkas mati yang sudah dibuang dari proyek (zip tidak bisa menghapus): tidak dimuat index.html dan tidak dirujuk berkas lain.
rm -f js/lkpd-v2-banner.js js/lkpd-v2-x07.js tools/uji-lkpd-banner.mjs
if [ -n "$DB_LAMA" ] && [ -z "$CBT_DB_PAKSA" ]; then
  DB_BARU=$(sed -n "s/.*CBT_DB:'\([a-z]*\)'.*/\1/p" js/config.js | head -n 1)
  if [ "$DB_BARU" != "$DB_LAMA" ]; then
    sed -i "s/CBT_DB:'[a-z]*'/CBT_DB:'$DB_LAMA'/" js/config.js
    echo "CBT_DB dipertahankan: $DB_LAMA (zip memuat $DB_BARU)."
  fi
fi
node tools/rilis.mjs --senyap
node tools/periksa.mjs
node tools/audit-izin.mjs
git add -A
if git diff --cached --quiet; then echo "Tidak ada perubahan untuk dikirim."; exit 0; fi
git commit -m "${1:-Pembaruan}"
git push
echo "Selesai. Tunggu deploy hijau di tab Actions, lalu ketuk Perbarui aplikasi."
