/**
 * Service Worker — Aulia Apotek Klinik
 * Fix: path disesuaikan untuk GitHub Pages (/Aulia-Apotek-Klinik/)
 */
const CACHE_NAME = 'aulia-apotek-klinik-v3';
const BASE = '/Aulia-Apotek-Klinik';
const urlsToCache = [
    BASE + '/',
    BASE + '/index.html',
    BASE + '/manifest.json',
    BASE + '/css/style.css',
    BASE + '/js/app.js',
    BASE + '/js/auth.js',
    BASE + '/js/dashboard.js',
    BASE + '/js/apotek/obat.js',
    BASE + '/js/apotek/transaksi.js',
    BASE + '/js/apotek/pembelian.js',
    BASE + '/js/apotek/stockOpname.js',
    BASE + '/js/apotek/notifikasi.js',
    BASE + '/js/apotek/retur.js',
    BASE + '/js/klinik/antrian.js',
    BASE + '/js/klinik/pasien.js',
    BASE + '/js/klinik/rekamMedis.js',
    BASE + '/js/klinik/resep.js',
    BASE + '/js/keuangan/akuntansi.js',
    BASE + '/js/keuangan/laporanKeuangan.js',
    BASE + '/js/keuangan/payroll.js',
    BASE + '/js/laporan/hutang.js',
    BASE + '/js/laporan/pengeluaran.js',
    BASE + '/js/laporan/piutang.js',
    BASE + '/js/laporan/penjualanHarian.js',
    BASE + '/js/manajemen/absensi.js',
    BASE + '/js/manajemen/karyawan.js',
    BASE + '/js/pengaturan/gaji.js',
    BASE + '/js/pengaturan/pembagian.js',
    BASE + '/js/pengaturan/profil.js',
    BASE + '/js/pengaturan/tindakan.js',
    BASE + '/js/pengaturan/users.js',
    BASE + '/icon-192.png',
    BASE + '/icon-512.png'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return Promise.all(urlsToCache.map(function(url) {
                return cache.add(url).catch(function(err) {
                    console.warn('[SW] Gagal cache:', url, err);
                });
            }));
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; })
                                   .map(function(k) { return caches.delete(k); }));
        }).then(function() { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function(event) {
    var req = event.request;
    if (req.method !== 'GET') return;

    var url = new URL(req.url);
    // Jangan cache Firebase API
    if (url.hostname.indexOf('firestore') !== -1 ||
        url.hostname.indexOf('googleapis.com') !== -1 ||
        url.hostname.indexOf('identitytoolkit') !== -1 ||
        url.hostname.indexOf('firebase') !== -1) {
        return;
    }

    event.respondWith(
        caches.match(req).then(function(cached) {
            var fetchPromise = fetch(req).then(function(networkRes) {
                if (networkRes && (networkRes.type === 'basic' || networkRes.type === 'cors' || networkRes.type === 'opaque')) {
                    var clone = networkRes.clone();
                    caches.open(CACHE_NAME).then(function(cache) { cache.put(req, clone); });
                }
                return networkRes;
            }).catch(function() { return cached; });
            return cached || fetchPromise;
        })
    );
});
