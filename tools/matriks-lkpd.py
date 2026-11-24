#!/usr/bin/env python3
"""Membangun data Peta LKPD (js/akademik-data.js, blok AKD_LKPD_TARGET dan AKD_LKPD_MATRIKS) dari
Matriks_LKPD_TSM_Kelas_X-XII_ringkas_jam_revisi.xlsx (54 LKPD; sheet Ringkasan, Matriks Ringkas, Pembagian JP).
Pemakaian: python3 tools/matriks-lkpd.py <berkas.xlsx>   (mengganti blok di antara penanda MATRIKS-LKPD-MULAI dan MATRIKS-LKPD-SELESAI;
baris AKD_LKPD_CATATAN dan AKD_LKPD_PKL di dalam blok dipertahankan).
JP per pertemuan dibaca dari Ringkasan I5:I7 (X 4 JP, XI 6 JP, XII 6 JP). Berkas harus sudah dihitung ulang (nilai rumus tersimpan)."""
import sys, re, json, openpyxl
src = sys.argv[1]
wb = openpyxl.load_workbook(src, data_only=True)
ELEMEN = {'X.1': 'Wawasan Dunia Otomotif', 'X.2': 'Kecakapan Kerja Dasar, K3, dan Budaya Kerja', 'X.3': 'Gambar Teknik Otomotif',
          'X.4': 'Peralatan dan Perlengkapan Tempat Kerja', 'X.5': 'Dasar Kelistrikan dan Elektronika Otomotif', 'X.6': 'Komponen Otomotif',
          'X.7': 'Dasar Sistem Hidrolik dan Pneumatik'}
for k in ('XI', 'XII'):
    for n, e in {1: 'Perawatan dan perbaikan engine', 2: 'Perawatan dan perbaikan sasis', 3: 'Perawatan dan perbaikan sistem pemindah tenaga',
                 4: 'Perawatan dan perbaikan sistem kelistrikan', 5: 'Perawatan dan perbaikan sepeda motor listrik dan hybrid',
                 6: 'Perawatan dan perbaikan engine management system (EMS)', 7: 'Pengelolaan bengkel sepeda motor'}.items():
        ELEMEN['%s.%d' % (k, n)] = e
STATUS_APLIKASI = {'LKPD-X-06': 'Draft (master V2)', 'LKPD-XI-17': 'Draft (V2)', 'LKPD-XI-18': 'Draft (V2)',
                   'LKPD-X-12': 'Draft (V2)', 'LKPD-X-18': 'Draft (V2)'}
rg = wb['Ringkasan']
target = {}
for r in rg.iter_rows(min_row=5, max_row=7, values_only=True):
    target[r[0]] = {'jp': int(r[4]), 'jpm': int(r[6]), 'jpp': int(r[8])}   # E target JP, G JP per minggu, I JP per pertemuan
ws = wb['Matriks Ringkas']
rows = []
for r in ws.iter_rows(min_row=5, values_only=True):
    if not r[0]:
        continue
    kode, kls_sm, judul, jenis, jp, tp, unit, l2, cat = r[:9]
    kl, sm = [x.strip() for x in kls_sm.split('/')]
    sk = sorted(set(re.findall(r'\b(\d{3})\b', str(unit or ''))))
    d = {'k': kode, 'kl': kl, 'sm': sm, 'el': ELEMEN[str(tp).split(',')[0].strip().rsplit('.', 1)[0]], 'tp': str(tp or ''), 'j': judul, 'jn': jenis,
         'jp': int(jp) if float(jp) % 1 == 0 else float(jp), 'mg': round(float(jp) / target[kl]['jpm'], 2), 'sk': sk,
         'st': STATUS_APLIKASI.get(kode, 'Belum dibuat'), 'l2': l2}
    c = str(cat or '').strip()
    if not sk:
        d['skt'] = ('Lintas unit: tidak ada unit khusus' if re.search(r'lintas unit|K3 lintas', c, re.I)
                    else 'Belum ditetapkan (cakupan Kelas X belum diputuskan)' if 'belum ditetapkan' in c
                    else 'Tidak ada padanan unit SKKNI (Kepmenaker 147/2019)')
    if c:
        d['ct'] = c
    rows.append(d)
p = 'js/akademik-data.js'
s = open(p, encoding='utf-8').read()
m = re.search(r'/\* MATRIKS-LKPD-MULAI.*?MATRIKS-LKPD-SELESAI \*/\n', s, re.S)
lama = m.group(0)
catatan = re.search(r'var AKD_LKPD_CATATAN=.*?;\n', lama, re.S).group(0)
pkl = re.search(r'var AKD_LKPD_PKL=.*?;\n', lama, re.S).group(0)
blok = ('/* MATRIKS-LKPD-MULAI (dibangun dari ' + src.split('/')[-1] + ' oleh tools/matriks-lkpd.py; jangan diubah manual) */\n'
        'var AKD_LKPD_TARGET=' + json.dumps(target, ensure_ascii=False) + ';\n' + catatan + pkl +
        'var AKD_LKPD_MATRIKS=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';\n'
        '/* MATRIKS-LKPD-SELESAI */\n')
s = s.replace(lama, blok)
open(p, 'w', encoding='utf-8').write(s)
tot = {}
for d in rows:
    tot[d['kl']] = tot.get(d['kl'], 0) + d['jp']
print(len(rows), 'LKPD;', target, tot)
