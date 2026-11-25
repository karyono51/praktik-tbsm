#!/usr/bin/env python3
"""Membangun data Peta LKPD (js/akademik-data.js, blok AKD_LKPD_TARGET dan AKD_LKPD_MATRIKS) dari
Matriks_LKPD_TSM_Kelas_X-XII_ringkas_jam_revisi.xlsx (54 LKPD; sheet Ringkasan, Matriks Ringkas, Pembagian JP).
Pemakaian: python3 tools/matriks-lkpd.py <berkas.xlsx>   (mengganti blok di antara penanda MATRIKS-LKPD-MULAI dan MATRIKS-LKPD-SELESAI;
baris AKD_LKPD_CATATAN dan AKD_LKPD_PKL di dalam blok dipertahankan).
JP per pertemuan dibaca dari Ringkasan I5:I7 (X 4 JP, XI 6 JP, XII 6 JP). Berkas harus sudah dihitung ulang (nilai rumus tersimpan).
KODE BARU: LKPD-<PRODI>-<CP>-<NN> (mis. LKPD-DDO-ALT-02, LKPD-TSM-PMT-03). Tingkat (X, XI, XII) bukan bagian kode, disimpan di isian kl,
sehingga LKPD bisa naik atau turun tingkat tanpa mengubah kode. Kode lama (LKPD-X-06 dst.) disimpan di isian ka dan di AKD_LKPD_ALIAS.
Nomor NN stabil: yang sudah tercatat di AKD_LKPD_ALIAS dipertahankan, LKPD baru mendapat nomor berikutnya dalam CP-nya.
Mode --migrasi (tanpa xlsx): mengonversi blok yang sudah ada di js/akademik-data.js dari kode lama ke kode baru."""
import sys, re, json
P_DATA = 'js/akademik-data.js'
MIGRASI = len(sys.argv) > 1 and sys.argv[1] == '--migrasi'
src = 'akademik-data.js' if MIGRASI else sys.argv[1]
if not MIGRASI:
    import openpyxl
    wb = openpyxl.load_workbook(src, data_only=True)
PRODI = {'DDO': 'Dasar-Dasar Program Keahlian Teknik Otomotif (bersama semua prodi otomotif)', 'TSM': 'Teknik Sepeda Motor', 'TKR': 'Teknik Kendaraan Ringan'}
CP_KODE = {'DDO': {'Wawasan Dunia Otomotif': 'BIS', 'Kecakapan Kerja Dasar, K3, dan Budaya Kerja': 'K3', 'Gambar Teknik Otomotif': 'GBR',
                   'Peralatan dan Perlengkapan Tempat Kerja': 'ALT', 'Dasar Kelistrikan dan Elektronika Otomotif': 'ELK', 'Komponen Otomotif': 'KOM',
                   'Dasar Sistem Hidrolik dan Pneumatik': 'HID'},
           'TSM': {'Pengelolaan bengkel sepeda motor': 'BKL', 'Perawatan dan perbaikan engine': 'ENG', 'Perawatan dan perbaikan sasis': 'SAS',
                   'Perawatan dan perbaikan sistem pemindah tenaga': 'PMT', 'Perawatan dan perbaikan sistem kelistrikan': 'KEL',
                   'Perawatan dan perbaikan sepeda motor listrik dan hybrid': 'LST', 'Perawatan dan perbaikan engine management system (EMS)': 'EMS'}}
def prodi_cp(kl, el):
    pr = 'DDO' if kl == 'X' else 'TSM'      # Kelas X = fase E dasar bersama; XI-XII = konsentrasi TSM
    return pr, CP_KODE[pr][el]
def beri_kode(rows, alias):
    """rows berisi 'k' (kode lama), 'kl', 'el'. Mengisi k (baru), ka, pr, cp. alias = {lama: baru} yang sudah tercatat."""
    pakai = {}
    for b in alias.values():
        m = re.match(r'^LKPD-(\w+)-(\w+)-(\d+)$', b)
        if m: pakai[(m.group(1), m.group(2))] = max(pakai.get((m.group(1), m.group(2)), 0), int(m.group(3)))
    for d in rows:
        lama = d['k']; pr, cp = prodi_cp(d['kl'], d['el'])
        if lama not in alias:
            pakai[(pr, cp)] = pakai.get((pr, cp), 0) + 1
            alias[lama] = 'LKPD-%s-%s-%02d' % (pr, cp, pakai[(pr, cp)])
        d.update({'k': alias[lama], 'ka': lama, 'pr': pr, 'cp': cp})
    return rows, alias
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
p = P_DATA
s = open(p, encoding='utf-8').read()
m0 = re.search(r'/\* MATRIKS-LKPD-MULAI.*?MATRIKS-LKPD-SELESAI \*/\n', s, re.S)
lama = m0.group(0)
am = re.search(r'var AKD_LKPD_ALIAS=(\{.*?\});\n', lama, re.S)
alias = json.loads(am.group(1)) if am else {}
if MIGRASI:
    target = json.loads(re.search(r'var AKD_LKPD_TARGET=(\{.*?\});\n', lama, re.S).group(1))
    rows = json.loads(re.search(r'var AKD_LKPD_MATRIKS=(\[.*?\]);\n', lama, re.S).group(1))
    for d in rows:                       # blok lama: k = kode lama; blok baru: ka = kode lama
        if 'ka' in d: d['k'] = d['ka']
else:
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
rows, alias = beri_kode(rows, alias)
catatan = re.search(r'var AKD_LKPD_CATATAN=.*?;\n', lama, re.S).group(0)
pkl = re.search(r'var AKD_LKPD_PKL=.*?;\n', lama, re.S).group(0)
blok = ('/* MATRIKS-LKPD-MULAI (dibangun dari ' + src.split('/')[-1] + ' oleh tools/matriks-lkpd.py; jangan diubah manual) */\n'
        'var AKD_LKPD_TARGET=' + json.dumps(target, ensure_ascii=False) + ';\n' + catatan + pkl +
        'var AKD_LKPD_PRODI=' + json.dumps(PRODI, ensure_ascii=False) + ';\n' +
        'var AKD_LKPD_CP=' + json.dumps({pr: {v: k for k, v in cp.items()} for pr, cp in CP_KODE.items()}, ensure_ascii=False) + ';\n' +
        'var AKD_LKPD_ALIAS=' + json.dumps(alias, ensure_ascii=False, separators=(',', ':')) + ';\n' +
        'var AKD_LKPD_MATRIKS=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';\n'
        '/* MATRIKS-LKPD-SELESAI */\n')
s = s.replace(lama, blok)
open(p, 'w', encoding='utf-8').write(s)
tot = {}
for d in rows:
    tot[d['kl']] = tot.get(d['kl'], 0) + d['jp']
print(len(rows), 'LKPD;', target, tot, '; alias', len(alias))
