<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;
    protected string $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
        return <<<PROMPT
Buatkan Modul Ajar Kurikulum Merdeka lengkap dengan format berikut:

**Informasi Umum**
- Mata Pelajaran: {$mapel}
- Kelas/Semester: {$kelas}/{$semester}
- Materi: {$materi}
- Alokasi Waktu: 2 JP x 45 Menit

**Tujuan Pembelajaran**
- [tulis 3-4 tujuan]

**Kegiatan Pembelajaran**
1. Pendahuluan (10 menit)
2. Kegiatan Inti (60 menit)
   - Eksplorasi
   - Elaborasi
   - Konfirmasi
3. Penutup (20 menit)

**Asesmen**
- Sikap: observasi
- Pengetahuan: tes tulis
- Keterampilan: unjuk kerja

**Media/Alat/Bahan**
- [sebutkan media yang relevan]

**Sumber Belajar**
- [sebutkan sumber]

Gunakan bahasa Indonesia yang baik dan benar. Format output dalam JSON dengan struktur: { "informasi_umum": {...}, "tujuan_pembelajaran": [...], "kegiatan": { "pendahuluan": "...", "inti": "...", "penutup": "..." }, "asesmen": {...}, "media": [...], "sumber": [...] }
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
