<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\DocumentExportService;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function __construct(
        protected DocumentExportService $exportService
    ) {}

    public function index(Request $request)
    {
        $query = Document::where('user_id', $request->user()->id);

        if ($request->type) {
            $query->where('type', $request->type);
        }

        $documents = $query->latest()->paginate($request->per_page ?? 20);

        return $this->success($documents);
    }

    public function show(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->error('Forbidden', 403);
        }

        return $this->success($document);
    }


    public function update(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->error('Forbidden', 403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable',
        ]);

        if (isset($validated['title'])) {
            $document->title = $validated['title'];
        }

        if (isset($validated['content'])) {
            $document->content = $validated['content'];
        }

        $document->save();

        return $this->success($document->fresh(), 'Dokumen berhasil diperbarui');
    }

    public function destroy(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return $this->error('Forbidden', 403);
        }

        $document->delete();

        return $this->success(null, 'Dokumen berhasil dihapus');
    }

    public function exportDocx(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            return $this->error('Forbidden', 403);
        }

        $filepath = $this->exportService->exportToDocx($document);

        return response()->download($filepath, "{$document->title}.docx");
    }

    public function exportPdf(Request $request, Document $document)
    {
        if ($document->user_id !== $request->user()->id) {
            return $this->error('Forbidden', 403);
        }

        $filepath = $this->exportService->exportToPdf($document);

        return response()->download($filepath, "{$document->title}.pdf");
    }
}
