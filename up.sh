#!/bin/sh
# Pasang pembaruan dari zip terbaru di Downloads, periksa, lalu kirim ke GitHub.
# Pakai (dari folder ~/tbsm):  sh up.sh "pesan commit"
set -e
cd "$(dirname "$0")"
if [ "$(basename "$PWD")" != "tbsm" ]; then echo "Folder proyek harus bernama tbsm."; exit 1; fi
Z=$(ls -t "$HOME"/storage/downloads/tbsm*.zip 2>/dev/null | head -n 1)
if [ -z "$Z" ]; then echo "Tidak ada tbsm*.zip di Downloads."; exit 1; fi
echo "Memasang: $Z"
unzip -oq "$Z" -d "$(dirname "$PWD")"
node tools/rilis.mjs --senyap
node tools/periksa.mjs
node tools/audit-izin.mjs
git add -A
if git diff --cached --quiet; then echo "Tidak ada perubahan untuk dikirim."; exit 0; fi
git commit -m "${1:-Pembaruan}"
git push
echo "Selesai. Tunggu deploy hijau di tab Actions, lalu ketuk Perbarui aplikasi."
