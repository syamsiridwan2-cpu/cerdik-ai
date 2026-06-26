<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\GeminiService;
use App\Services\PoinService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Smalot\PdfParser\Parser as PdfParser;

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
        ]);

        $user = $request->user();

        if (!$this->poin->hasEnoughPoin($user, 'generate_modul')) {
            return $this->error('Poin tidak mencukupi.', 402);
        }

        $result = $this->gemini->generateModul(
            $validated['materi'],
            $validated['kelas'],
            $validated['mapel'],
            $validated['semester']
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

    public function generateFromPdf(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimetypes:application/pdf,text/plain|max:20480',
            'jumlah_soal' => 'required|integer|min:1|max:20',
            'jenis' => 'required|in:pilihan ganda',
        ]);

        $user = $request->user();

        if (!$this->poin->hasEnoughPoin($user, 'generate_soal')) {
            return $this->error('Poin tidak mencukupi.', 402);
        }

        // Extract text from PDF
        $parser = new PdfParser();
        $pdf = $parser->parseFile($request->file('file')->path());
        $text = $pdf->getText();

        if (strlen($text) < 50) {
            return $this->error('Teks tidak ditemukan di PDF. Pastikan PDF bukan hasil scan.', 400);
        }

        $result = $this->gemini->generateSoalDariTeks(
            $text,
            $validated['jumlah_soal'],
            $validated['jenis']
        );

        if (!$result) {
            return $this->error('Gagal generating soal. Coba lagi.', 500);
        }

        $document = DB::transaction(function () use ($user, $result, $validated, $text) {
            $this->poin->deductPoin($user, 'generate_soal');

            $filename = $request->file('file')->store('pdf-uploads');

            return Document::create([
                'user_id' => $user->id,
                'type' => 'soal',
                'title' => "Soal dari PDF - " . $request->file('file')->getClientOriginalName(),
                'content' => $result,
                'ai_model' => 'gemini-2.5-flash',
                'poin_cost' => $this->poin->getCost('generate_soal'),
                'metadata' => [
                    'jumlah_soal' => $validated['jumlah_soal'],
                    'jenis' => $validated['jenis'],
                    'source_pdf' => $filename,
                    'text_length' => strlen($text),
                ],
            ]);
        });

        return $this->success($document, 'Soal berhasil dibuat dari PDF', 201);
    }
}
