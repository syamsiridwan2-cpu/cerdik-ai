<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;
    protected string $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
    }

    public function generate(string $prompt): ?string
    {
        $response = Http::post("{$this->endpoint}?key={$this->apiKey}", [
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
            return null;
        }

        $data = $response->json();

        return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }

    public function generateStream(string $prompt, callable $onChunk): void
    {
        $response = Http::withOptions(['stream' => true])
            ->post("{$this->endpoint}?key={$this->apiKey}&alt=sse", [
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

        $body = $response->getBody();
        while (!$body->eof()) {
            $line = $body->read(4096);
            $onChunk($line);
        }
    }

    protected function buildModulPrompt(string $materi, string $kelas, string $mapel, string $semester): string
    {
        $jenjang = $kelas <= 6 ? 'SD' : ($kelas <= 9 ? 'SMP' : 'SMA/SMK');
        $alokasi = $jenjang === 'SD' ? '2 JP x 35 Menit' : ($jenjang === 'SMP' ? '2 JP x 40 Menit' : '2 JP x 45 Menit');
        return <<<PROMPT
Buatkan Modul Ajar Kurikulum Merdeka dengan pendekatan Deep Learning (Pembelajaran Mendalam) untuk:
- Mata Pelajaran: {$mapel}
- Kelas/Semester: {$kelas}/{$semester}
- Jenjang: {$jenjang}
- Materi: {$materi}
- Alokasi Waktu: {$alokasi}

Gunakan format template berikut dan output dalam JSON:

{
  "identifikasi": {
    "peserta_didik": "Identifikasi kesiapan peserta didik (pengetahuan awal, minat, latar belakang, kebutuhan belajar)",
    "materi_pelajaran": "Analisis materi: jenis pengetahuan, relevansi dg kehidupan nyata, tingkat kesulitan, integrasi nilai karakter",
    "dimensi_profil_lulusan": "Dimensi Profil Pelajar Pancasila yang dicapai (contoh: Beriman, Berkebinekaan Global, Gotong Royong, Mandiri, Bernalar Kritis, Kreatif)"
  },
  "desain_pembelajaran": {
    "capaian_pembelajaran": "CP sesuai fase {$jenjang}",
    "lintas_displin_ilmu": "Disiplin ilmu/mata pelajaran relevan",
    "tujuan_pembelajaran": ["Tujuan 1: ...", "Tujuan 2: ...", "Tujuan 3: ...", "Tujuan 4: ..."],
    "topik_pembelajaran": "Topik: {$materi}",
    "praktik_pedagogis": "Model/Strategi/Metode (contoh: PBL, Inkuiri, Kontekstual, dll)",
    "kemitraan_pembelajaran": "Mitra kolaborasi (guru lain, orang tua, komunitas, dll)",
    "lingkungan_pembelajaran": "Lingkungan fisik, virtual, dan budaya belajar",
    "pemanfaatan_digital": "Teknologi digital yang digunakan (LMS, perpus digital, dll)"
  },
  "pengalaman_belajar": {
    "awal": {
      "prinsip": "tulis prinsip: berkesadaran/bermakna/menggembirakan",
      "kegiatan": "Orientasi bermakna, apersepsi kontekstual, motivasi menggembirakan",
      "durasi": "10 menit"
    },
    "inti": {
      "memahami": {
        "prinsip": "tulis prinsip: berkesadaran/bermakna/menggembirakan",
        "kegiatan": ["Kegiatan 1", "Kegiatan 2"]
      },
      "mengaplikasi": {
        "prinsip": "tulis prinsip: berkesadaran/bermakna/menggembirakan",
        "kegiatan": ["Kegiatan 1", "Kegiatan 2"]
      },
      "merefleksi": {
        "prinsip": "tulis prinsip: berkesadaran/bermakna/menggembirakan",
        "kegiatan": ["Kegiatan 1", "Kegiatan 2"]
      },
      "durasi": "60 menit"
    },
    "penutup": {
      "prinsip": "tulis prinsip: berkesadaran/bermakna/menggembirakan",
      "kegiatan": "Umpan balik konstruktif, menyimpulkan, rencana pembelajaran selanjutnya",
      "durasi": "15 menit"
    }
  },
  "asesmen": {
    "awal": "Asesmen diagnostik/awal pembelajaran",
    "proses": "Asesmen formatif selama proses (observasi, kinerja, proyek, dll)",
    "akhir": "Asesmen sumatif akhir pembelajaran"
  },
  "media_alat_bahan": ["Media 1", "Alat 1", "Bahan 1"],
  "sumber_belajar": ["Sumber 1", "Sumber 2"]
}

Isi setiap field dengan konten yang spesifik, relevan, dan sesuai dengan materi {$materi}, kelas {$kelas}, mapel {$mapel}. Gunakan bahasa Indonesia. Output hanya JSON tanpa markdown.
PROMPT;
    }

    protected function buildLkpdPrompt(string $materi, string $kelas, string $mapel): string
    {
        return <<<PROMPT
Buatkan Lembar Kerja Peserta Didik (LKPD) untuk materi {$materi}, kelas {$kelas}, mapel {$mapel} dengan format:

1. Identitas (nama, kelas, tanggal)
2. Petunjuk pengerjaan
3. Judul Kegiatan
4. Tujuan
5. Alat dan Bahan
6. Langkah-langkah (prosedur)
7. Tabel/data pengamatan
8. Pertanyaan analisis (3-5 soal)
9. Kesimpulan

Gunakan bahasa Indonesia. Output dalam JSON: { "identitas": {...}, "petunjuk": "...", "judul": "...", "tujuan": "...", "alat_bahan": [...], "langkah": [...], "tabel": {...}, "pertanyaan": [...], "kesimpulan": "" }
PROMPT;
    }

    protected function buildSoalPrompt(string $teks, int $jumlah, string $jenis): string
    {
        return <<<PROMPT
Buatkan {$jumlah} soal {$jenis} (pilihan ganda dengan 4 opsi) berdasarkan teks berikut:

{$teks}

Setiap soal harus memiliki:
- Pertanyaan
- 4 opsi jawaban (A, B, C, D)
- Jawaban benar
- Pembahasan singkat

Output dalam JSON array: [{ "pertanyaan": "...", "opsi": { "A": "...", "B": "...", "C": "...", "D": "..." }, "jawaban": "A", "pembahasan": "..." }]
PROMPT;
    }

    public function generateModul(string $materi, string $kelas, string $mapel, string $semester): ?array
    {
        $prompt = $this->buildModulPrompt($materi, $kelas, $mapel, $semester);
        $result = $this->generate($prompt);

        if (!$result) return null;

        $json = $this->extractJson($result);
        return $json ?: ['raw' => $result];
    }

    public function generateLkpd(string $materi, string $kelas, string $mapel): ?array
    {
        $prompt = $this->buildLkpdPrompt($materi, $kelas, $mapel);
        $result = $this->generate($prompt);

        if (!$result) return null;

        $json = $this->extractJson($result);
        return $json ?: ['raw' => $result];
    }

    public function generateSoalDariTeks(string $teks, int $jumlah = 5, string $jenis = 'pilihan ganda'): ?array
    {
        $prompt = $this->buildSoalPrompt($teks, $jumlah, $jenis);
        $result = $this->generate($prompt);

        if (!$result) return null;

        $json = $this->extractJson($result);
        return $json ?: ['raw' => $result];
    }

    protected function extractJson(string $text): ?array
    {
        preg_match('/```json\s*([\s\S]*?)\s*```/', $text, $matches);

        if (isset($matches[1])) {
            return json_decode($matches[1], true);
        }

        preg_match('/\[[\s\S]*\]/', $text, $matches);
        if (isset($matches[0])) {
            $decoded = json_decode($matches[0], true);
            if ($decoded) return $decoded;
        }

        preg_match('/\{[\s\S]*\}/', $text, $matches);
        if (isset($matches[0])) {
            $decoded = json_decode($matches[0], true);
            if ($decoded) return $decoded;
        }

        return null;
    }
}
