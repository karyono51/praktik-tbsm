#!/bin/sh
# Pasang pemindai cadangan untuk iPhone/Safari: unduh jsQR 1.4.0 (Apache-2.0) ke js/vendor/jsqr.js.
# Jalankan sekali di folder proyek:  sh tools/pasang-jsqr.sh   lalu sh up.sh "pemindai iphone"
cd "$(dirname "$0")/.." || exit 1
mkdir -p js/vendor
curl -fL "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js" -o js/vendor/jsqr.js || { echo "Unduh gagal. Cek sinyal."; exit 1; }
if [ "$(wc -c < js/vendor/jsqr.js)" -lt 50000 ] || ! grep -q "jsQR" js/vendor/jsqr.js; then rm -f js/vendor/jsqr.js; echo "Berkas tidak sesuai, dihapus."; exit 1; fi
echo "Terpasang: js/vendor/jsqr.js ($(wc -c < js/vendor/jsqr.js) bita)"
