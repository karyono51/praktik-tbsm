#!/usr/bin/env python3
"""Membangun data Peta LKPD (js/akademik-data.js, blok AKD_LKPD_*) dari Matriks_LKPD_TSM_Kelas_X-XII_SKKNI_revisi2.xlsx.
Pemakaian: python3 tools/matriks-lkpd.py <berkas.xlsx>   (mengganti blok di antara penanda MATRIKS-LKPD-MULAI dan MATRIKS-LKPD-SELESAI)."""
import sys, re, json, openpyxl
src = sys.argv[1]
wb = openpyxl.load_workbook(src, data_only=True)
ws = wb['Matriks LKPD']
# Status yang diketahui dari aplikasi (kolom status xlsx tidak mengikuti aplikasi)
# JP satu pertemuan: Kelas X 4 JP, Kelas XI dan XII 6 JP
JP_PERTEMUAN = {'X': 4, 'XI': 6, 'XII': 6}
# Penyesuaian JP Kelas X agar kelipatan 4 JP per pertemuan (total tetap 432 JP)
JP_SESUAI = {"LKPD-X-01": 16, "LKPD-X-03": 20, "LKPD-X-04": 16, "LKPD-X-05": 32, "LKPD-X-06": 20, "LKPD-X-07": 20, "LKPD-X-11": 16, "LKPD-X-12": 16, "LKPD-X-13": 28, "LKPD-X-17": 20, "LKPD-X-18": 8, "LKPD-X-24": 8}
STATUS_APLIKASI = {'LKPD-X-07': 'Draft (master V2)'}
rows = []
for r in ws.iter_rows(min_row=6, values_only=True):
    if not r[1]:
        continue
    kode_unit = str(r[10] or '')
    sk = sorted(set(re.findall(r'G\.45TSM01\.(\d{3})\.2', kode_unit)))
    d = {'k': r[1], 'kl': r[2], 'sm': r[3], 'el': r[4], 'tp': str(r[5] or ''), 'j': r[6], 'jn': r[7],
         'jp': float(r[8]) if float(r[8]) % 1 else int(r[8]), 'mg': float(r[9] or 0), 'sk': sk,
         'st': STATUS_APLIKASI.get(r[1]) or r[12] or 'Belum dibuat'}
    if not sk and kode_unit.strip():
        d['skt'] = kode_unit.strip().split('\n')[0]
    if r[13]:
        d['ct'] = str(r[13]).strip()
    if r[14]:
        d['us'] = str(r[14]).strip()
    rows.append(d)
rg = wb['Ringkasan']
target = {}
for r in rg.iter_rows(values_only=True):
    if r[0] in ('X', 'XI', 'XII') and isinstance(r[6], (int, float)):
        target[r[0]] = {'jp': int(r[6]), 'jpm': int(r[8]), 'jpp': JP_PERTEMUAN[r[0]]}  # jpm = JP per minggu, jpp = JP per pertemuan
for d in rows:  # penyesuaian JP ke kelipatan JP pertemuan
    if d['k'] in JP_SESUAI and d['jp'] != JP_SESUAI[d['k']]:
        n = 'JP disesuaikan dari %d ke %d agar kelipatan 4 JP per pertemuan (total Kelas X tetap 432 JP).' % (d['jp'], JP_SESUAI[d['k']])
        d['ct'] = (d['ct'] + ' ' if d.get('ct') else '') + n
        d['jp'] = JP_SESUAI[d['k']]
for d in rows:  # estimasi minggu dihitung dari JP agar total minggu tidak bergeser karena pembulatan
    d['mg'] = round(d['jp'] / target[d['kl']]['jpm'], 2)
catatan = ''
for r in rg.iter_rows(values_only=True):
    if r[0] and str(r[0]).startswith('Catatan:'):
        catatan = str(r[0])
pkl = wb['Dokumen PKL']
pkl_sumber = ''
for r in pkl.iter_rows(values_only=True):
    if r[0] and str(r[0]).startswith('Sumber:'):
        pkl_sumber = str(r[0])
blok = ('/* MATRIKS-LKPD-MULAI (dibangun dari ' + src.split('/')[-1] + ' oleh tools/matriks-lkpd.py; jangan diubah manual) */\n'
        'var AKD_LKPD_TARGET=' + json.dumps(target, ensure_ascii=False) + ';\n'
        'var AKD_LKPD_CATATAN=' + json.dumps(catatan, ensure_ascii=False) + ';\n'
        'var AKD_LKPD_PKL=' + json.dumps(pkl_sumber, ensure_ascii=False) + ';\n'
        'var AKD_LKPD_MATRIKS=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';\n'
        '/* MATRIKS-LKPD-SELESAI */\n')
p = 'js/akademik-data.js'
s = open(p, encoding='utf-8').read()
if 'MATRIKS-LKPD-MULAI' in s:
    s = re.sub(r'/\* MATRIKS-LKPD-MULAI.*?MATRIKS-LKPD-SELESAI \*/\n', lambda m: blok, s, flags=re.S)
else:
    s = s.rstrip('\n') + '\n\n' + blok
open(p, 'w', encoding='utf-8').write(s)
print(len(rows), 'LKPD;', target)
