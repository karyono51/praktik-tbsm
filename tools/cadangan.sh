#!/bin/sh
# Cadangan dan rollback rilis (Termux / Linux).
#   sh tools/cadangan.sh buat          tandai rilis saat ini (git tag cadangan-<tanggal>) dan simpan zip di ~/cadangan-tbsm
#   sh tools/cadangan.sh daftar        daftar tag cadangan
#   sh tools/cadangan.sh pulihkan TAG  kembalikan isi aplikasi ke TAG lewat commit baru (riwayat tidak dihapus), lalu deploy
# Pulihkan memakai commit baru, bukan reset paksa, jadi aman dan bisa dibatalkan lagi.
set -e
cd "$(dirname "$0")/.."
tanda="$(date +%Y%m%d-%H%M)"
case "$1" in
  buat)
    mkdir -p "$HOME/cadangan-tbsm"
    git tag "cadangan-$tanda"
    git archive --format=zip -o "$HOME/cadangan-tbsm/tbsm-$tanda.zip" HEAD
    git push origin "cadangan-$tanda" 2>/dev/null || echo "Tag belum terkirim ke GitHub (offline?). Jalankan lagi: git push origin cadangan-$tanda"
    echo "Cadangan: tag cadangan-$tanda dan $HOME/cadangan-tbsm/tbsm-$tanda.zip"
    ;;
  daftar)
    git tag -l 'cadangan-*' | sort
    ;;
  pulihkan)
    [ -n "$2" ] || { echo "Pakai: sh tools/cadangan.sh pulihkan <tag>"; exit 1; }
    git rev-parse -q --verify "refs/tags/$2" >/dev/null || { echo "Tag $2 tidak ada. Lihat: sh tools/cadangan.sh daftar"; exit 1; }
    [ -z "$(git status --porcelain)" ] || { echo "Ada perubahan yang belum di-commit. Commit atau simpan dulu."; exit 1; }
    git rm -r -q . >/dev/null
    git checkout "$2" -- .
    git add -A
    git commit -q -m "pulihkan ke $2" || { echo "Tidak ada perbedaan dengan $2."; exit 0; }
    git push
    echo "Dipulihkan ke $2. Tunggu GitHub Actions selesai, lalu muat ulang aplikasi dua kali."
    ;;
  *)
    echo "Pakai: sh tools/cadangan.sh buat | daftar | pulihkan <tag>"
    ;;
esac
