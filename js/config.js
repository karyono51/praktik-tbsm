/* Konfigurasi. Kosongkan APPWRITE_* untuk mode lokal (tanpa server).
   Nilai ini bukan rahasia: endpoint dan project ID memang publik. Jangan pernah menaruh API key di sini. */
window.APP_CONFIG={
  APPWRITE_ENDPOINT:'',            // contoh: 'https://cloud.appwrite.io/v1' atau 'https://sgp.cloud.appwrite.io/v1'
  APPWRITE_PROJECT:'',             // Project ID dari Console Appwrite
  DB:'tbsm',                       // ID database (sesuai appwrite.json)
  ADMIN_EMAIL:''                   // email yang otomatis menjadi admin saat login pertama
};
