<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;
    protected string $endpoint;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->model = 'gemini-2.5-flash';
        $this->endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";
    }

    public function generate(string $prompt): ?string
    {
        $response = Http::timeout(120)->post("{$this->endpoint}?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 8192,
            ]
        ]);

        if ($response->failed()) {
            Log::error('Gemini API error', ['response' => $response->body()]);
            $body = $response->body();
            if (str_contains($body, '429') || str_contains($body, 'rate') || str_contains($body, 'quota')) {
                throw new \RuntimeException('Kuota Gemini API habis. Tunggu beberapa menit atau isi ulang saldo.');
            }
            if (str_contains($body, '503') || str_contains($body, 'unavailable')) {
                throw new \RuntimeException('Gemini API sedang sibuk. Coba lagi.');
            }
            return null;
        }

        $data = $response->json();
        return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }

    public function generateStream(string $prompt, callable $onChunk): void
    {
        $response = Http::withOptions(['stream' => true])
            ->timeout(120)
            ->post("{$this->endpoint}?key={$this->apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 8192,
                ],
            ]);

        $body = $response->getBody();
        while (!$body->eof()) {
            $line = $body->readLine();
            $data = json_decode($line, true);
            if ($data && isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                $onChunk($data['candidates'][0]['content']['parts'][0]['text']);
            }
        }
    }

    public function generateSoalDariTeks(string $teks, int $jumlah = 5, string $jenis = 'pilihan ganda', string $mapel = '', string $kelas = '', string $semester = '', string $waktu = '90 Menit', string $sekolah = '', string $alamat = '', string $npsn = '', string $email = '', string $tahun_pelajaran = ''): ?array
    {
        $prompt = $this->buildSoalPrompt($teks, $jumlah, $jenis, $mapel, $kelas, $semester, $waktu, $sekolah, $alamat, $npsn, $email, $tahun_pelajaran);
        $result = $this->generate($prompt);
        if (!$result) return null;
        $json = $this->extractJson($result);
        return $json ?: ['raw' => $result];
    }

    protected function buildSoalPrompt(string $teks, int $jumlah, string $jenis, string $mapel = '', string $kelas = '', string $semester = '', string $waktu = '90 Menit', string $sekolah = '', string $alamat = '', string $npsn = '', string $email = '', string $tahun_pelajaran = ''): string
    {
        $sekolah = $sekolah ?: 'SEKOLAH DASAR NEGERI';
        $alamat = $alamat ?: 'Jl. Contoh No. 1';
        $npsn = $npsn ?: '00000000';
        $email = $email ?: 'sekolah@sch.id';
        $tahun_pelajaran = $tahun_pelajaran ?: date('Y') . '/' . (date('Y') + 1);
        $mapel = $mapel ?: '(muatan pelajaran)';
        $kelas_semester = $kelas ? ($semester ? "{$kelas}/ {$semester}" : $kelas) : '(kelas)';

        if ($jenis === 'pilihan ganda') {
            $instruksi = "Buatkan {$jumlah} soal pilihan ganda (masing-masing 4 opsi A, B, C, D) berdasarkan teks berikut.";
            $bagian1Label = 'I'; $bagian1 = "Berilah tanda silang (x) pada huruf a, b, c atau d pada jawaban yang kamu anggap paling benar!";
            $bagian2 = '';
        } elseif ($jenis === 'isian singkat') {
            $instruksi = "Buatkan {$jumlah} soal isian singkat berdasarkan teks berikut. Setiap soal berupa kalimat rumpang yang harus dilengkapi dengan jawaban singkat (1-3 kata).";
            $bagian1Label = 'I'; $bagian1 = "Isilah titik-titik pada soal di bawah ini dengan jawaban yang benar!";
            $bagian2 = '';
        } elseif ($jenis === 'uraian') {
            $instruksi = "Buatkan {$jumlah} soal uraian/essay berdasarkan teks berikut. Setiap soal membutuhkan jawaban berupa penjelasan singkat.";
            $bagian1Label = 'I'; $bagian1 = "Jawablah pertanyaan-pertanyaan di bawah ini dengan benar!";
            $bagian2 = '';
        } else {
            $jmlPg = (int)ceil($jumlah * 0.5);
            $jmlIsian = (int)ceil(($jumlah - $jmlPg) * 0.5);
            $jmlUraian = $jumlah - $jmlPg - $jmlIsian;
            $instruksi = "Buatkan {$jmlPg} soal pilihan ganda (masing-masing 4 opsi A, B, C, D), {$jmlIsian} soal isian singkat, dan {$jmlUraian} soal uraian berdasarkan teks berikut.";
            $bagian1Label = 'I'; $bagian1 = "Berilah tanda silang (x) pada huruf a, b, c atau d pada jawaban yang kamu anggap paling benar!";
            $bagian2 = "II. Jawablah pertanyaan-pertanyaan di bawah ini dengan benar!";
        }

        $pgSoalTemplate = '{
        \"nomor\": 1,
        \"pertanyaan\": \"...\",
        \"opsi\": { \"A\": \"...\", \"B\": \"...\", \"C\": \"...\", \"D\": \"...\" },
        \"jawaban\": \"A\",
        \"pembahasan\": \"...\"
      }';
        $isianSoalTemplate = '{
        \"nomor\": 1,
        \"pertanyaan\": \"... (kalimat rumpang dengan titik-titik) ...\",
        \"jawaban\": \"... (kata kunci jawaban) ...\"
      }';
        $uraianSoalTemplate = '{
        \"nomor\": 1,
        \"pertanyaan\": \"...\",
        \"jawaban\": \"... (kunci jawaban/pedoman penskoran) ...\"
      }';

        $bagian1SoalTemplate = $pgSoalTemplate;
        $bagian2SoalTemplate = $uraianSoalTemplate;

        if ($jenis === 'isian singkat') {
            $bagian1SoalTemplate = $isianSoalTemplate;
        } elseif ($jenis === 'uraian') {
            $bagian1SoalTemplate = $uraianSoalTemplate;
        } elseif ($jenis === 'campuran') {
            $bagian2SoalTemplate = $isianSoalTemplate;
        }

        $bagian1Json = "  \"bagian_1\": {
    \"label\": \"{$bagian1Label}\",
    \"petunjuk\": \"{$bagian1}\",
    \"soal\": [ {$bagian1SoalTemplate} ]
  }";

        if ($jenis === 'campuran') {
            $bagian2Json = ",
  \"bagian_2\": {
    \"label\": \"II\",
    \"petunjuk\": \"Jawablah pertanyaan-pertanyaan di bawah ini dengan benar!\",
    \"soal\": [ {$bagian2SoalTemplate} ]
  },
  \"bagian_3\": {
    \"label\": \"III\",
    \"petunjuk\": \"Jawablah pertanyaan uraian di bawah ini dengan lengkap!\",
    \"soal\": [ {$uraianSoalTemplate} ]
  }";
        } elseif ($bagian2) {
            $bagian2Json = ",
  \"bagian_2\": {
    \"label\": \"II\",
    \"petunjuk\": \"{$bagian2}\",
    \"soal\": [ {$bagian2SoalTemplate} ]
  }";
        } else {
            $bagian2Json = '';
        }

        return "Anda adalah guru profesional. Buatlah soal ASESMEN SUMATIF AKHIR TAHUN (ASAT) dalam format dokumen ujian lengkap.

{$instruksi}

Teks:
{$teks}

FORMAT OUTPUT - Keluarkan HANYA JSON valid tanpa markdown:
{
  \"pemerintah\": \"PEMERINTAH KABUPATEN ...\",
  \"dinas\": \"DINAS PENDIDIKAN\",
  \"sekolah\": \"{$sekolah}\",
  \"alamat\": \"{$alamat}\",
  \"npsn\": \"{$npsn}\",
  \"email\": \"{$email}\",
  \"judul\": \"ASESMEN SUMATIF AKHIR TAHUN (ASAT)\",
  \"tahun_pelajaran\": \"TAHUN PELAJARAN {$tahun_pelajaran}\",
  \"info\": {
    \"muatan_pelajaran\": \"{$mapel}\",
    \"kelas_semester\": \"{$kelas_semester}\",
    \"waktu\": \"{$waktu}\"
  },
{$bagian1Json}{$bagian2Json}
}";
    }

    public function generateModul(string $materi, string $kelas, string $mapel, string $semester, string $alokasi_waktu = '36 JP', string $nama_penyusun = '', string $instansi = '', string $tahun_pelajaran = '', string $fase = ''): ?array
    {
        $prompt = $this->buildModulPrompt($materi, $kelas, $mapel, $semester, $alokasi_waktu, $nama_penyusun, $instansi, $tahun_pelajaran, $fase);
        $result = $this->generate($prompt);
        if (!$result) return null;
        $json = $this->extractJson($result);
        return $json ?: ['raw' => $result];
    }

    protected function buildModulPrompt(string $materi, string $kelas, string $mapel, string $semester, string $alokasi_waktu, string $nama_penyusun, string $instansi, string $tahun_pelajaran, string $fase): string
    {
        $faseMap = ['1' => 'A', '2' => 'A', '3' => 'B', '4' => 'B', '5' => 'C', '6' => 'C', '7' => 'D', '8' => 'D', '9' => 'E', '10' => 'E', '11' => 'F', '12' => 'F'];
        $fase = $fase ?: ($faseMap[$kelas] ?? 'B');
        $tahun_pelajaran = $tahun_pelajaran ?: date('Y') . '/' . (date('Y') + 1);
        $instansi = $instansi ?: "SDN ...";
        $nama_penyusun = $nama_penyusun ?: '…………………';

        return "Anda adalah guru profesional Indonesia. Buatlah MODUL AJAR KURIKULUM MERDEKA (TINGKAT SD) untuk:
- Mata Pelajaran: {$mapel}
- Kelas: {$kelas} SD
- Semester: {$semester}
- Fase: {$fase}
- Materi: {$materi}
- Alokasi Waktu: {$alokasi_waktu}
- Nama Penyusun: {$nama_penyusun}
- Instansi: {$instansi}
- Tahun Pelajaran: {$tahun_pelajaran}

Buat konten yang DETAIL, PANJANG, dan LENGKAP sesuai format berikut.

Keluarkan HANYA JSON valid tanpa markdown, dengan struktur:

{
  \"informasi_umum\": {
    \"nama_penyusun\": \"{$nama_penyusun}\",
    \"instansi\": \"{$instansi}\",
    \"tahun_penyusunan\": \"...\",
    \"jenjang_sekolah\": \"Sekolah Dasar (SD)\",
    \"mata_pelajaran\": \"{$mapel}\",
    \"fase_kelas\": \"Fase {$fase} / Kelas {$kelas}\",
    \"bab_tema\": \"{$materi}\",
    \"alokasi_waktu\": \"{$alokasi_waktu}\"
  },
  \"profil_pelajar_pancasila\": {
    \"deskripsi\": \"... (deskripsi profil yang dipilih) ...\",
    \"pilihan\": [
      { \"label\": \"Beriman, bertakwa kepada Tuhan YME, dan berakhlak mulia\", \"terpilih\": true, \"sub_elemen\": \"...\" },
      { \"label\": \"Berkebinekaan global\", \"terpilih\": false, \"sub_elemen\": \"\" },
      { \"label\": \"Gotong royong\", \"terpilih\": true, \"sub_elemen\": \"...\" },
      { \"label\": \"Mandiri\", \"terpilih\": false, \"sub_elemen\": \"\" },
      { \"label\": \"Bernalar kritis\", \"terpilih\": true, \"sub_elemen\": \"...\" },
      { \"label\": \"Kreatif\", \"terpilih\": false, \"sub_elemen\": \"\" }
    ]
  },
  \"sarana_prasarana\": {
    \"media_pembelajaran\": [ \"Laptop\", \"Proyektor\", \"...\" ],
    \"sumber_belajar\": [ \"Buku Siswa Kemendikbudristek Kelas {$kelas}\", \"...\" ]
  },
  \"target_peserta_didik\": {
    \"reguler\": true,
    \"pencapaian_tinggi\": false,
    \"kesulitan_belajar\": false
  },
  \"model_metode\": {
    \"model_pembelajaran\": \"...\",
    \"metode\": [ \"...\", \"...\" ]
  },
  \"capaian_pembelajaran\": {
    \"fase\": \"{$fase}\",
    \"cp_text\": \"... (teks Capaian Pembelajaran resmi) ...\"
  },
  \"tujuan_pembelajaran\": [ \"...\", \"...\" ],
  \"pemahaman_bermakna\": [ \"...\", \"...\" ],
  \"pertanyaan_pemantik\": [ \"...\", \"...\" ],
  \"kegiatan_pembelajaran\": [
    {
      \"pertemuan\": \"Pertemuan 1\",
      \"pendahuluan\": \"...(15 Menit)...\\n1. ...\\n2. ...\\n3. ...\",
      \"inti\": \"...(60 Menit)...\\nLangkah 1: ...\\nLangkah 2: ...\\nLangkah 3: ...\",
      \"penutup\": \"...(15 Menit)...\\n1. ...\\n2. ...\"
    }
  ],
  \"asesmen\": {
    \"jenis\": [ \"Asesmen Individu\", \"Asesmen Kelompok\" ],
    \"teknik\": [ \"Tertulis\", \"Unjuk Kerja\", \"Produk\", \"Observasi\" ]
  },
  \"pengayaan_remedial\": {
    \"pengayaan\": \"...\",
    \"remedial\": \"...\"
  },
  \"refleksi\": {
    \"guru\": [ \"...\", \"...\" ],
    \"peserta_didik\": [ \"...\", \"...\" ]
  },
  \"lampiran\": {
    \"lkpd\": \"...\",
    \"bahan_bacaan\": \"...\",
    \"glosarium\": [ {\"istilah\": \"...\", \"definisi\": \"...\"} ],
    \"daftar_pustaka\": [ \"...\", \"...\" ]
  }
}";
    }

    public function generateLkpd(string $materi, string $kelas, string $mapel): ?array
    {
        $prompt = $this->buildLkpdPrompt($materi, $kelas, $mapel);
        $result = $this->generate($prompt);
        if (!$result) return null;
        $json = $this->extractJson($result);
        return $json ?: ['raw' => $result];
    }


    public function generateRpp(string $materi, string $kelas, string $mapel, string $semester, string $alokasi_waktu = '2 x 35 menit'): ?array
    {
        $prompt = $this->buildRppPrompt($materi, $kelas, $mapel, $semester, $alokasi_waktu);
        $result = $this->generate($prompt);
        if (!$result) return null;
        $json = $this->extractJson($result);
        return $json ?: ['raw' => $result];
    }


    public function generateKisi(string $materi, string $kelas, string $mapel, string $semester, int $jumlah_soal = 10): ?array
    {
        $prompt = $this->buildKisiPrompt($materi, $kelas, $mapel, $semester, $jumlah_soal);
        $result = $this->generate($prompt);
        if (!$result) return null;
        $json = $this->extractJson($result);
        return $json ?: ['raw' => $result];
    }


    public function generateRubrik(string $materi, string $kelas, string $mapel, string $tipe = 'presentasi'): ?array
    {
        $prompt = $this->buildRubrikPrompt($materi, $kelas, $mapel, $tipe);
        $result = $this->generate($prompt);
        if (!$result) return null;
        $json = $this->extractJson($result);
        return $json ?: ['raw' => $result];
    }

    protected function buildRubrikPrompt(string $materi, string $kelas, string $mapel, string $tipe): string
    {
        return "Anda adalah guru profesional Indonesia. Buatkan 4 tabel rubrik penilaian Kurikulum Merdeka untuk:
- Mapel: {$mapel}
- Kelas: {$kelas}
- Materi: {$materi}

Buat 4 tabel rubrik berikut:
1. Tabel 5.2 Rubrik Penilaian Presentasi
2. Tabel 4.3 Rubrik Penilaian Proyek
3. Tabel 5.4 Rubrik Diskusi Kelompok
4. Tabel 5.5 Rubrik Mewarnai

Setiap tabel memiliki:
- Judul tabel (Tabel X.X Rubrik Penilaian [Nama])
- Header kolom: Kriteria/ Skor | Skor 86-100 Baik Sekali 4 | Skor 71-85 Baik 3 | Skor 61-70 cukup 2 | Skor = 60 Kurang 1
- Baris kriteria sesuai tipe rubrik (3-6 kriteria per tabel)
- Sertakan juga baris P3 (Profil Pelajar Pancasila) seperti: Berkebinekaan Global, Bernalar Kritis, Kreatif, Gotong Royong, Mandiri dengan deskripsi yang sesuai

Keluarkan HANYA JSON valid tanpa markdown:
{
  \"tables\": [
    {
      \"nomor_tabel\": \"5.2\",
      \"judul\": \"Rubrik Penilaian Presentasi\",
      \"kriteria\": [
        {
          \"nama\": \"Penampilan\",
          \"skor4\": \"Ada kontak mata, lancar...\",
          \"skor3\": \"Memenuhi tiga kriteria\",
          \"skor2\": \"Memenuhi dua kriteria\",
          \"skor1\": \"Memenuhi satu kriteria\"
        }
      ]
    }
  ]
}";
    }

    protected function buildKisiPrompt(string $materi, string $kelas, string $mapel, string $semester, int $jumlah_soal): string
    {
        $jmlPg = (int)ceil($jumlah_soal * 0.6);
        $jmlIsian = (int)ceil(($jumlah_soal - $jmlPg) * 0.5);
        $jmlUraian = $jumlah_soal - $jmlPg - $jmlIsian;

        return "Buatkan kisi-kisi soal ASAT (ASESMEN SUMATIF AKHIR TAHUN) untuk:
- Mapel: {$mapel}
- Kelas: Kelas {$kelas}
- Semester: Semester {$semester}
- Materi: {$materi}
- Total Soal: {$jumlah_soal} ({$jmlPg} PG, {$jmlIsian} Isian Singkat, {$jmlUraian} Uraian)

Bagi soal ke dalam 3 bagian:
1. PILIHAN GANDA ({$jmlPg} soal) — nomor 1-{$jmlPg}
2. ISIAN SINGKAT ({$jmlIsian} soal) — nomor 1-{$jmlIsian}
3. URAIAN ({$jmlUraian} soal) — nomor 1-{$jmlUraian}

Setiap soal hanya memiliki:
- Indikator/Materi (gabungan indikator dan materi dalam satu kalimat)
- Bentuk Soal (PG / Isian Singkat / Uraian)

Keluarkan HANYA JSON valid tanpa markdown:
{
  \"judul\": \"KISI-KISI SOAL ASAT {$mapel} KELAS {$kelas} SD\",
  \"bagian\": [
    {
      \"label\": \"I\",
      \"nama\": \"PILIHAN GANDA\",
      \"soal\": [
        { \"nomor\": 1, \"indikator\": \"...\", \"bentuk_soal\": \"PG\" }
      ]
    },
    {
      \"label\": \"II\",
      \"nama\": \"ISIAN SINGKAT\",
      \"soal\": [
        { \"nomor\": 1, \"indikator\": \"...\", \"bentuk_soal\": \"Isian Singkat\" }
      ]
    },
    {
      \"label\": \"III\",
      \"nama\": \"URAIAN\",
      \"soal\": [
        { \"nomor\": 1, \"indikator\": \"...\", \"bentuk_soal\": \"Uraian\" }
      ]
    }
  ]
}";
    }

    protected function buildRppPrompt(string $materi, string $kelas, string $mapel, string $semester, string $alokasi_waktu): string
    {
        return "Anda adalah guru profesional Indonesia. Buatkan Rencana Pelaksanaan Pembelajaran (RPP) 1 Lembar Kurikulum Merdeka dengan format berikut untuk:
- Mapel: {$mapel}
- Kelas: {$kelas}
- Semester: {$semester}
- Materi: {$materi}
- Alokasi Waktu: {$alokasi_waktu}

Format:

RENCANA PELAKSANAAN PEMBELAJARAN
Satuan Pendidikan : SD ...
Kelas / Semester : ... / ...
Tema ... : ...
Sub Tema ... : ...
Muatan Terpadu : ...
Pembelajaran ke : ...
Alokasi waktu : ...

A. TUJUAN PEMBELAJARAN
(4-6 tujuan ABCD, dimulai dengan \"Setelah mengamati/membaca/menyimak ...\" dan diakhiri \"dengan benar\")

B. KEGIATAN PEMBELAJARAN
Kegiatan | Deskripsi | Alokasi Waktu
Pendahuluan | Orientasi, Apersepsi, Motivasi | ... menit
Kegiatan Inti | Ayo Mencoba, Ayo Berlatih, Ayo Membaca, Ayo Bercerita (disesuaikan) | ... menit
Penutup | Resume, refleksi, tindak lanjut | ... menit

C. PENILAIAN (ASESMEN)
Deskripsi penilaian sikap, pengetahuan, keterampilan.

Keluarkan HANYA JSON valid (tanpa markdown, tanpa teks lain):
{
  \"satuan_pendidikan\": \"SD ...\",
  \"kelas_semester\": \"... / ...\",
  \"tema\": \"...\",
  \"sub_tema\": \"...\",
  \"muatan_terpadu\": \"...\",
  \"pembelajaran_ke\": \"...\",
  \"alokasi_waktu\": \"{$alokasi_waktu}\",
  \"tujuan_pembelajaran\": [\"1. Setelah mengamati..., siswa dapat...\", \"2. ...\"],
  \"kegiatan_pembelajaran\": {
    \"pendahuluan\": { \"deskripsi\": \"1. Melakukan Pembukaan dengan Salam dan Dilanjutkan Dengan Membaca Doa (Orientasi)\\n2. Mengaitkan Materi Sebelumnya... (Apersepsi)\\n3. Memberikan gambaran tentang manfaat... (Motivasi)\", \"waktu\": \"15 menit\" },
    \"inti\": { \"deskripsi\": \"Ayo Mencoba\\n...\\n\\nAyo Berlatih\\n...\\n\\nAyo Membaca\\n...\\n\\nAyo Bercerita\\n...\", \"waktu\": \"140 menit\" },
    \"penutup\": { \"deskripsi\": \"Peserta Didik:\\n- Membuat resume (CREATIVITY) dengan bimbingan guru\\nGuru:\\n- Memeriksa pekerjaan siswa\\n- Memberi hadiah/pujian\", \"waktu\": \"15 menit\" }
  },
  \"penilaian\": \"Penilaian terhadap materi ini dapat dilakukan sesuai kebutuhan guru yaitu dari pengamatan sikap, tes pengetahuan dan presentasi unjuk kerja atau hasil karya/projek dengan rubrik penilaian.\"
}";
    }

    protected function buildLkpdPrompt(string $materi, string $kelas, string $mapel): string
    {
        return "Anda adalah guru profesional Indonesia. Buatkan Lembar Kerja Peserta Didik (LKPD) Kurikulum Merdeka untuk:
- Mapel: {$mapel}
- Kelas: {$kelas}
- Materi: {$materi}

Format LKPD harus seperti contoh berikut (disesuaikan dengan mapel/materi/kelas):

LEMBAR KERJA PESERTA DIDIK (LKPD)
Mapel: ... Kelas: ... Materi: ...

A. Petunjuk Pengerjaan:
1. Bacalah setiap soal dengan baik.
2. Jawablah sesuai dengan pemahamanmu tentang materi.

B. Kegiatan LKPD:
1. Mindfull Learning (Fokus dan Kesadaran Penuh)
Soal 1: ... Jawaban: ___________________
Soal 2: ... Jawaban: ___________________

2. Joyfull Learning (Pembelajaran Menyenangkan)
Soal 3: ... (gambar/cerita) Jawaban: ___________________
Soal 4: ... Jawaban: ___________________

C. Lingkungan ... (Ayo, Berlatih)
Kegiatan 1: Identifikasi ... (centang/isi)
Kegiatan 2: ...
Kegiatan 3: ...
Kegiatan 4: Jawablah pertanyaan-pertanyaan berikut!
Kegiatan 5: ...

D. Bahan Bacaan Guru dan Peserta Didik
Penjelasan materi sesuai topik.

E. Glosarium
Daftar istilah penting dan artinya.

Keluarkan HANYA JSON valid (tanpa markdown, tanpa teks lain):
{
  \"judul\": \"Lembar Kerja Peserta Didik (LKPD)\",
  \"mapel\": \"{$mapel}\",
  \"kelas\": \"{$kelas}\",
  \"materi\": \"{$materi}\",
  \"petunjuk_pengerjaan\": [\"...\", \"...\"],
  \"kegiatan_lkpd\": {
    \"mindfull_learning\": [
      { \"nomor\": 1, \"soal\": \"...\", \"jawaban\": \"\" }
    ],
    \"joyfull_learning\": [
      { \"nomor\": 3, \"soal\": \"... (gambar/cerita)\", \"jawaban\": \"\" }
    ]
  },
  \"lingkungan\": {
    \"sub_judul\": \"Lingkungan ... (disesuaikan materi)\",
    \"kegiatan\": [
      { \"judul\": \"Kegiatan 1\", \"instruksi\": \"...\", \"tipe\": \"centang|gambar|cerita|pertanyaan\", \"soal\": [] }
    ]
  },
  \"bahan_bacaan\": {
    \"judul\": \"Bahan Bacaan Guru dan Peserta Didik\",
    \"paragraf\": [\"...\", \"...\"]
  },
  \"glosarium\": [
    { \"kata\": \"...\", \"arti\": \"...\" }
  ]
}";
    }

    protected function extractJson(string $text): ?array
    {
        $start = strpos($text, '```json');
        if ($start !== false) {
            $start += 7;
            $end = strpos($text, '```', $start);
            if ($end !== false) {
                $json = trim(substr($text, $start, $end - $start));
                $decoded = json_decode($json, true);
                if ($decoded) return $decoded;
            }
        }

        $start = strpos($text, '[');
        if ($start !== false) {
            $depth = 0; $inStr = false; $esc = false;
            for ($i = $start; $i < strlen($text); $i++) {
                $c = $text[$i];
                if ($esc) { $esc = false; continue; }
                if ($c === '\\' && $inStr) { $esc = true; continue; }
                if ($c === '"' && !$esc) { $inStr = !$inStr; continue; }
                if ($inStr) continue;
                if ($c === '[') $depth++;
                if ($c === ']') { $depth--; if ($depth === 0) { $json = substr($text, $start, $i - $start + 1); break; } }
            }
            if (isset($json)) {
                $json = str_replace("'", '"', $json);
                $decoded = json_decode($json, true);
                if ($decoded) return $decoded;
            }
        }

        $start = strpos($text, '{');
        if ($start !== false) {
            $depth = 0; $inStr = false; $esc = false;
            for ($i = $start; $i < strlen($text); $i++) {
                $c = $text[$i];
                if ($esc) { $esc = false; continue; }
                if ($c === '\\' && $inStr) { $esc = true; continue; }
                if ($c === '"' && !$esc) { $inStr = !$inStr; continue; }
                if ($inStr) continue;
                if ($c === '{') $depth++;
                if ($c === '}') { $depth--; if ($depth === 0) { $json = substr($text, $start, $i - $start + 1); break; } }
            }
            if (isset($json)) {
                $json = str_replace("'", '"', $json);
                $decoded = json_decode($json, true);
                if ($decoded) return $decoded;
            }
        }

        return null;
    }
}
