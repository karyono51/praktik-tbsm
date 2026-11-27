# Cara memasang pembaruan (satu perintah)

> **CATATAN PENTING: push repo dari `~/tbsm`, bukan `~/tbsm/tbsm`.**
> Zip pembaruan sudah berawalan folder `tbsm/`, jadi harus diekstrak ke folder induk (`unzip -d ..`, sudah dikerjakan `up.sh`). Jangan memakai `unzip -d .` di dalam `~/tbsm`, karena akan terbentuk `~/tbsm/tbsm` dan berkas di akar repo tidak ikut diperbarui.
> Periksa: `ls ~/tbsm/tbsm` harus menjawab "No such file or directory". Bila folder itu ada, pastikan isinya hanya salinan lama, lalu hapus: `rm -rf ~/tbsm/tbsm`.

Pertama kali saja (karena up.sh baru ada di zip ini), jalankan cara lama sekali:
```
cp ~/storage/downloads/tbsm-ringkas.zip ~/tbsm/ && cd ~/tbsm && unzip -o tbsm-ringkas.zip -d .. && rm tbsm-ringkas.zip
```
Sesudah itu, setiap ada zip baru di Downloads:
```
cd ~/tbsm && sh up.sh "pesan singkat"
```
up.sh mengerjakan semuanya: memasang zip terbaru bernama tbsm*.zip, menstempel versi, memeriksa sintaks, rahasia, dan izin koleksi
(sama seperti yang dijalankan GitHub Actions, jadi galat ketahuan di ponsel sebelum deploy), lalu commit dan push.
Bila ada pemeriksaan yang gagal, up.sh berhenti dan tidak mengirim apa pun.
