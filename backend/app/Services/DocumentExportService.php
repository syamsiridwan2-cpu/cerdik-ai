<?php

namespace App\Services;

use App\Models\Document;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use Dompdf\Dompdf;

class DocumentExportService
{
    public function exportToDocx(Document $document): string
    {
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();

        $section->addTitle($document->title, 1);
        $content = $document->content;

        if (is_array($content)) {
            $this->addArrayContentToSection($section, $content);
        } else {
            $section->addText($content);
        }

        $filename = storage_path("app/public/documents/{$document->id}.docx");
        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save($filename);

        return $filename;
    }

    public function exportToPdf(Document $document): string
    {
        $dompdf = new Dompdf();
        $html = $this->buildHtml($document);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();

        $filename = storage_path("app/public/documents/{$document->id}.pdf");
        file_put_contents($filename, $dompdf->output());

        return $filename;
    }

    protected function buildHtml(Document $document): string
    {
        $content = $document->content;
        $html = "<h1>{$document->title}</h1>";

        if (is_array($content)) {
            $html .= $this->arrayToHtml($content);
        } else {
            $html .= "<p>{$content}</p>";
        }

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 2.5cm; }
            h1 { text-align: center; font-size: 16pt; }
            h2 { font-size: 14pt; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            td, th { border: 1px solid #000; padding: 8px; }
        </style></head><body>{$html}</body></html>";
    }

    protected function addArrayContentToSection($section, array $content, int $depth = 0): void
    {
        foreach ($content as $key => $value) {
            if (is_string($key) && !is_numeric($key)) {
                $label = str_replace('_', ' ', ucfirst($key));
                $section->addText(ucfirst($label), ['bold' => true, 'size' => 12 + (2 * $depth)]);
            }

            if (is_array($value)) {
                $section->addTextBreak();
                $this->addArrayContentToSection($section, $value, $depth + 1);
            } elseif (is_string($value)) {
                $section->addText($value);
            }
        }
    }

    protected function arrayToHtml(array $data, int $depth = 0): string
    {
        $html = '';
        foreach ($data as $key => $value) {
            if (is_string($key) && !is_numeric($key)) {
                $tag = $depth === 0 ? 'h2' : 'h3';
                $label = str_replace('_', ' ', ucfirst($key));
                $html .= "<{$tag}>{$label}</{$tag}>";
            }

            if (is_array($value)) {
                if (isset($value[0]) && !is_array($value[0])) {
                    $html .= '<ul>';
                    foreach ($value as $item) {
                        $html .= "<li>{$item}</li>";
                    }
                    $html .= '</ul>';
                } else {
                    $html .= $this->arrayToHtml($value, $depth + 1);
                }
            } else {
                $html .= "<p>{$value}</p>";
            }
        }
        return $html;
    }
}
