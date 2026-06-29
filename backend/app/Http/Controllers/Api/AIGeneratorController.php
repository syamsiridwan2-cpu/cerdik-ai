<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\GeminiService;
use App\Services\PoinService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Smalot\PdfParser\Parser as PdfParser;
use Illuminate\Support\Facades\Log;

class AIGeneratorController extends Controller
{
    public function __construct(
        protected GeminiService $gemini,
        protected PoinService $poin
    ) {}

    public function generateModul(Request $request)
    {
        $validated = $request->validate([
            'materi' => 'required|string|max:1000',
            'kelas' => 'required|string|max:50',
            'mapel' => 'required|string|max:100',
            'semester' => 'required|in:1,2',
            'alokasi_waktu' => 'nullable|string|max:50',
            'nama_penyusun' => 'nullable|string|max:255',
            'instansi' => 'nullable|string|max:255',
            'tahun_pelajaran' => 'nullable|string|max:20',
            'fase' => 'nullable|string|max:10',
        ]);

        $user = $request->user();

        if (!$this->poin->hasEnoughPoin($user, 'generate_modul')) {
            return $this->error('Poin tidak mencukupi.', 402);
        }

        $result = $this->gemini->generateModul(
            $validated['materi'],
            $validated['kelas'],
            $validated['mapel'],
            $validated['semester'],
            $validated['alokasi_waktu'] ?? '36 JP',
            $validated['nama_penyusun'] ?? '',
            $validated['instansi'] ?? '',
            $validated['tahun_pelajaran'] ?? '',
            $validated['fase'] ?? ''
        );

        if (!$result) {
            return $this->error('Gagal generating modul. Coba lagi.', 500);
        }

        $document = DB::transaction(function () use ($user, $result, $validated) {
            $this->poin->deductPoin($user, 'generate_modul');

            return Document::create([
                'user_id' => $user->id,
                'type' => 'modul',
                'title' => "Modul Ajar - {$validated['materi']}",
                'content' => $result,
                'ai_model' => 'gemini-2.5-flash',
                'poin_cost' => $this->poin->getCost('generate_modul'),
                'metadata' => [
                    'materi' => $validated['materi'],
                    'kelas' => $validated['kelas'],
                    'mapel' => $validated['mapel'],
                    'semester' => $validated['semester'],
                ],
            ]);
        });

        return $this->success($document, 'Modul ajar berhasil dibuat', 201);
    }

    public function generateLkpd(Request $request)
    {
        $validated = $request->validate([
            'materi' => 'required|string|max:1000',
            'kelas' => 'required|string|max:50',
            'mapel' => 'required|string|max:100',
        ]);

        $user = $request->user();

        if (!$this->poin->hasEnoughPoin($user, 'generate_lkpd')) {
            return $this->error('Poin tidak mencukupi.', 402);
        }

        $result = $this->gemini->generateLkpd(
            $validated['materi'],
            $validated['kelas'],
            $validated['mapel']
        );

        if (!$result) {
            return $this->error('Gagal generating LKPD. Coba lagi.', 500);
        }

        $document = DB::transaction(function () use ($user, $result, $validated) {
            $this->poin->deductPoin($user, 'generate_lkpd');

            return Document::create([
                'user_id' => $user->id,
                'type' => 'lkpd',
                'title' => "LKPD - {$validated['materi']}",
                'content' => $result,
                'ai_model' => 'gemini-2.5-flash',
                'poin_cost' => $this->poin->getCost('generate_lkpd'),
                'metadata' => [
                    'materi' => $validated['materi'],
                    'kelas' => $validated['kelas'],
                    'mapel' => $validated['mapel'],
                ],
            ]);
        });

        return $this->success($document, 'LKPD berhasil dibuat', 201);
    }


    public function generateRpp(Request $request)
    {
        $validated = $request->validate([
            'materi' => 'required|string|max:1000',
            'kelas' => 'required|string|max:50',
            'mapel' => 'required|string|max:100',
            'semester' => 'required|in:1,2',
            'alokasi_waktu' => 'nullable|string|max:100',
        ]);

        $user = $request->user();

        if (!$this->poin->hasEnoughPoin($user, 'generate_rpp')) {
            return $this->error('Poin tidak mencukupi.', 402);
        }

        $result = $this->gemini->generateRpp(
            $validated['materi'],
            $validated['kelas'],
            $validated['mapel'],
            $validated['semester'],
            $validated['alokasi_waktu'] ?? '2 x 35 menit'
        );

        if (!$result) {
            return $this->error('Gagal generating RPP. Coba lagi.', 500);
        }

        $document = DB::transaction(function () use ($user, $result, $validated) {
            $this->poin->deductPoin($user, 'generate_rpp');

            return Document::create([
                'user_id' => $user->id,
                'type' => 'rpp',
                'title' => "RPP 1 Lembar - {$validated['materi']}",
                'content' => $result,
                'ai_model' => 'gemini-2.5-flash',
                'poin_cost' => $this->poin->getCost('generate_rpp'),
                'metadata' => [
                    'materi' => $validated['materi'],
                    'kelas' => $validated['kelas'],
                    'mapel' => $validated['mapel'],
                    'semester' => $validated['semester'],
                    'alokasi_waktu' => $validated['alokasi_waktu'] ?? '2 x 35 menit',
                ],
            ]);
        });

        return $this->success($document, 'RPP 1 Lembar berhasil dibuat', 201);
    }


    public function generateKisi(Request $request)
    {
        $validated = $request->validate([
            'materi' => 'required|string|max:1000',
            'kelas' => 'required|string|max:50',
            'mapel' => 'required|string|max:100',
            'semester' => 'required|in:1,2',
            'jumlah_soal' => 'nullable|integer|min:1|max:50',
        ]);

        $user = $request->user();

        if (!$this->poin->hasEnoughPoin($user, 'generate_kisi')) {
            return $this->error('Poin tidak mencukupi.', 402);
        }

        $result = $this->gemini->generateKisi(
            $validated['materi'],
            $validated['kelas'],
            $validated['mapel'],
            $validated['semester'],
            $validated['jumlah_soal'] ?? 10
        );

        if (!$result) {
            return $this->error('Gagal generating kisi-kisi. Coba lagi.', 500);
        }

        $document = DB::transaction(function () use ($user, $result, $validated) {
            $this->poin->deductPoin($user, 'generate_kisi');

            return Document::create([
                'user_id' => $user->id,
                'type' => 'kisi',
                'title' => "Kisi-kisi Soal - {$validated['materi']}",
                'content' => $result,
                'ai_model' => 'gemini-2.5-flash',
                'poin_cost' => $this->poin->getCost('generate_kisi'),
                'metadata' => [
                    'materi' => $validated['materi'],
                    'kelas' => $validated['kelas'],
                    'mapel' => $validated['mapel'],
                    'semester' => $validated['semester'],
                    'jumlah_soal' => $validated['jumlah_soal'] ?? 10,
                ],
            ]);
        });

        return $this->success($document, 'Kisi-kisi soal berhasil dibuat', 201);
    }


    public function generateRubrik(Request $request)
    {
        $validated = $request->validate([
            'materi' => 'required|string|max:1000',
            'kelas' => 'required|string|max:50',
            'mapel' => 'required|string|max:100',
            'tipe' => 'nullable|string|in:presentasi,diskusi,proyek,portofolio,praktikum',
        ]);

        $user = $request->user();

        if (!$this->poin->hasEnoughPoin($user, 'generate_rubrik')) {
            return $this->error('Poin tidak mencukupi.', 402);
        }

        $result = $this->gemini->generateRubrik(
            $validated['materi'],
            $validated['kelas'],
            $validated['mapel'],
            $validated['tipe'] ?? 'presentasi'
        );

        if (!$result) {
            return $this->error('Gagal generating rubrik. Coba lagi.', 500);
        }

        $document = DB::transaction(function () use ($user, $result, $validated) {
            $this->poin->deductPoin($user, 'generate_rubrik');

            return Document::create([
                'user_id' => $user->id,
                'type' => 'rubrik',
                'title' => "Rubrik Penilaian - {$validated['materi']} ({$validated['tipe']})",
                'content' => $result,
                'ai_model' => 'gemini-2.5-flash',
                'poin_cost' => $this->poin->getCost('generate_rubrik'),
                'metadata' => [
                    'materi' => $validated['materi'],
                    'kelas' => $validated['kelas'],
                    'mapel' => $validated['mapel'],
                    'tipe' => $validated['tipe'] ?? 'presentasi',
                ],
            ]);
        });

        return $this->success($document, 'Rubrik penilaian berhasil dibuat', 201);
    }

    public function generateFromPdf(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,txt|max:20480',
            'jumlah_soal' => 'required|integer|min:1|max:20',
            'jenis' => 'required|in:pilihan ganda,isian singkat,uraian,campuran',
            'mapel' => 'nullable|string|max:255',
            'kelas' => 'nullable|string|max:50',
            'semester' => 'nullable|string|max:50',
            'waktu' => 'nullable|string|max:50',
            'sekolah' => 'nullable|string|max:255',
            'alamat' => 'nullable|string|max:500',
            'npsn' => 'nullable|string|max:20',
            'email_sekolah' => 'nullable|email|max:255',
            'tahun_pelajaran' => 'nullable|string|max:20',
        ]);

        $user = $request->user();

        if (!$this->poin->hasEnoughPoin($user, 'generate_soal')) {
            return $this->error('Poin tidak mencukupi.', 402);
        }

        // Extract text from PDF
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($request->file('file')->path());
            $text = $pdf->getText();
        } catch (\Exception $e) {
            Log::error('PDF parse error', ['error' => $e->getMessage()]);
            return $this->error('Gagal membaca PDF. Pastikan file PDF tidak rusak, tidak dipassword, dan bukan hasil scan.', 400);
        }

        if (strlen($text) < 50) {
            return $this->error('Teks tidak ditemukan di PDF. Pastikan PDF bukan hasil scan.', 400);
        }

        try {
            $result = $this->gemini->generateSoalDariTeks(
                $text,
                $validated['jumlah_soal'],
                $validated['jenis'],
                $validated['mapel'] ?? '',
                $validated['kelas'] ?? '',
                $validated['semester'] ?? '',
                $validated['waktu'] ?? '90 Menit',
                $validated['sekolah'] ?? '',
                $validated['alamat'] ?? '',
                $validated['npsn'] ?? '',
                $validated['email_sekolah'] ?? '',
                $validated['tahun_pelajaran'] ?? ''
            );
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 429);
        }

        if (!$result) {
            return $this->error('Gagal generating soal. Coba lagi.', 500);
        }

        $file = $request->file('file');
        $filename = $file->store('pdf-uploads');
        $originalName = $file->getClientOriginalName();

        $document = DB::transaction(function () use ($user, $result, $validated, $text, $filename, $originalName) {
            $this->poin->deductPoin($user, 'generate_soal');

            return Document::create([
                'user_id' => $user->id,
                'type' => 'soal',
                'title' => "Soal dari PDF - " . $originalName,
                'content' => $result,
                'ai_model' => 'gemini-2.5-flash',
                'poin_cost' => $this->poin->getCost('generate_soal'),
                'metadata' => [
                    'jumlah_soal' => $validated['jumlah_soal'],
                    'jenis' => $validated['jenis'],
                    'source_pdf' => $filename,
                    'text_length' => strlen($text),
                    'mapel' => $validated['mapel'] ?? '',
                    'kelas' => $validated['kelas'] ?? '',
                    'semester' => $validated['semester'] ?? '',
                    'waktu' => $validated['waktu'] ?? '90 Menit',
                    'sekolah' => $validated['sekolah'] ?? '',
                    'alamat' => $validated['alamat'] ?? '',
                    'npsn' => $validated['npsn'] ?? '',
                    'tahun_pelajaran' => $validated['tahun_pelajaran'] ?? '',
                ],
            ]);
        });

        return $this->success($document, 'Soal berhasil dibuat dari PDF', 201);
    }
}
