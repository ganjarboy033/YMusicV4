# Kruzen Spatial Audio — Capacitor Edition

Versi ini mengubah **seluruh antarmuka mixer dari Jetpack Compose menjadi HTML + CSS + JavaScript vanilla**, sementara DSP real-time dan layanan Android yang memang memerlukan akses native tetap berada di Kotlin. UI web dibundle dengan Vite dan ditampilkan melalui Capacitor WebView.

## Yang sudah dipindahkan ke HTML/CSS/JS

- Halaman 8D Spatial, visualizer jalur, pemilih 10 lintasan, gerakan, kecepatan orbit, lebar dan posisi ruang.
- Analyzer visual 24-band (menerima nilai spectrum dari native engine ketika engine berjalan; preview web menampilkan kondisi menunggu sinyal, bukan data audio palsu).
- Equalizer 10-band dan 9 preset EQ.
- Enhancement: preamp, bass boost, sub-bass punch, vocal exciter, channel balance, volume.
- Filter high-pass / low-pass dan mode Karaoke, Acapella, Bass Only.
- Preset ruang: Standar, Studio, Car Audio, Concert Hall, Sound Lapangan, Cathedral.
- Reverb, decay, echo delay/feedback/mix.
- Tempo, keep-pitch, pitch, drive/saturasi, compressor, limiter.
- Preset 8D bawaan, preset pribadi, penyimpanan lokal, impor/ekspor JSON.
- Panel Mode Melayang untuk meminta native floating bubble dan floating lyrics.

## Yang tetap native Kotlin (memang perlu Android)

- `MixerEngine`, `BinauralPanner`, `MotionOrbit`, `PathLib`, `Biquad`, `PartitionedConvolver`.
- `MixerProcessor` untuk jalur PCM Media3/ExoPlayer host.
- `Universal8DService` untuk MediaProjection + AudioPlaybackCapture (Android 10+ dan persetujuan pengguna).
- `FloatingBubbleService`, `Quick8DTileService`, `SystemGlobalEqManager`.
- `MixerRepository` dan model/preset native.
- Capacitor bridge `SpatialAudioPlugin.kt` yang menghubungkan JS dengan repository dan Android service.

UI Compose tidak disalin ke paket native. Dengan begitu tidak perlu plugin Compose maupun material-icons-extended untuk halaman mixer ini. Efek Chorus, Tremolo, Wah-Wah, Telephone/Radio tetap tidak ada.

## Jalankan sebagai web preview

Memerlukan Node.js dan npm.

```bash
npm install
npm run dev
```

Preview bisa dibuka di browser. Native audio DSP, overlay Android, Global EQ dan Universal Capture tidak berjalan di browser.

## Siapkan Android Capacitor

```bash
npm install
npm run build
npx cap add android
npm run copy:native
npx cap sync android
```

Script `copy:native` menyalin source Kotlin DSP/audio, plugin Capacitor dan ikon tile ke proyek Android yang baru dibuat. Script tidak mengubah `MainActivity` maupun Manifest host secara otomatis.

Capacitor 8 adalah jalur stable yang ditargetkan paket ini. Setelah perintah `cap add android`, salin folder `native/android/src/main/java/dev/bagja/spatialaudio/` ke folder `android/app/src/main/java/dev/bagja/spatialaudio/` yang dihasilkan Capacitor.

Lalu:

1. Salin `native/android/MainActivity.kt.example` sebagai referensi untuk `MainActivity.kt` host. Sesuaikan package `dev.bagja.kruzenspatial` dengan package aplikasi aktual. Panggil `registerPlugin(SpatialAudioPlugin::class.java)` sebelum `super.onCreate()`.
2. Gabungkan permission dan deklarasi service dari `integration/AndroidManifest-snippet.xml` ke Manifest host. Jangan mengganti seluruh Manifest; gabungkan isinya ke elemen yang sudah ada.
3. Tambahkan dependency dari `integration/native-dependencies.gradle.txt` ke `android/app/build.gradle`.
4. Salin `native/android/src/main/res/drawable/ic_tile_8d.xml` ke `android/app/src/main/res/drawable/` (script `copy:native` sudah melakukan ini).
5. Ikuti `integration/README-INTEGRASI-HOST.md` untuk memasang `MixerProcessor` pada AudioSink Media3 dan menghubungkan kontrol player/lirik.
6. Jalankan `npx cap sync android`, buka Android Studio, lalu build.

## Penting tentang audio player host

Mengubah kontrol ke JS tidak dengan sendirinya memasang DSP ke pemutar musik. Untuk player Media3/ExoPlayer native, aplikasi host tetap harus memasang `MixerProcessor` pada pipeline PCM. Contoh awal ada di `integration/MixerProcessor-host-example.kt.txt`; bagian `AudioSink` harus disesuaikan dengan versi Media3 aplikasi host.

Universal Capture adalah layanan khusus Android. Audio dari aplikasi lain hanya dapat tertangkap jika sumber mengizinkan playback capture dan pengguna menyetujui MediaProjection. Global EQ session 0 bisa ditolak oleh beberapa perangkat/ROM. Floating bubble memerlukan izin overlay.

## Hal yang tetap membutuhkan aplikasi host

- Callback Play/Pause dan pembaruan lirik harus dihubungkan ke instance player host melalui `SpatialHostBridge`; contoh tersedia di `integration/HostPlaybackBridge.kt.example`.
- `MixerProcessor` harus benar-benar dipasang ke AudioSink Media3/ExoPlayer host. Sekadar menyalin file Kotlin tidak otomatis memproses audio.
- Pengaturan web disimpan di `localStorage`; repository native menyimpan state ke SharedPreferences. Native bridge menyinkronkan setelan ketika pengguna mengubah kontrol.
- Pemilih custom `.wav` memakai Android Storage Access Framework, menyimpan izin URI persisten, dan meneruskan `content://` ke `MixerSettings.customIrUri`. `MixerEngine` memuat IR melalui `PartitionedConvolver` di worker executor.

## Pengurangan bobot aplikasi

- UI tanpa React, Angular, Ionic, Compose, paket ikon besar, atau font eksternal. Font sistem dipakai agar asset offline lebih ringan.
- Vite hanya alat build, bukan runtime APK.
- Build minify CSS/JS dan menonaktifkan sourcemap produksi.
- WebView Capacitor memakai Android System WebView perangkat; assets web lokal dibundle dalam APK.
- Tidak menghapus engine native yang diperlukan untuk DSP real-time, MediaProjection, floating overlay dan Quick Settings. Memaksa semua DSP ke JS akan mengubah jalur audio dan berisiko menambah latensi / putus saat app masuk background.

## Pembaruan integrasi

- Native plugin menyediakan pemilih IR WAV, status judul/lirik, dan permintaan toggle/pause playback host.
- `MixerProcessor` mengambil konfigurasi terbaru langsung dari `MixerRepository` dan melakukan cache jalur gerak agar tidak membangun ulang path pada setiap blok PCM.
- Contoh wiring player host tersedia di `integration/HostPlaybackBridge.kt.example`.

## Status verifikasi

Source JS diperiksa secara sintaks dengan Node.js. Instalasi paket/build Vite tidak dapat diverifikasi pada sesi ini karena pengunduhan dependensi npm tidak selesai. **APK belum dikompilasi dan belum diuji di perangkat Android.** Integrasi `AudioSink` tetap perlu disesuaikan dengan versi Media3 aplikasi host; tanpa langkah itu UI dapat mengubah setelan, tetapi efek tidak akan terdengar pada pemutar host.
