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
        $section = $phpWord->addSection([
            'marginTop' => 1440,
            'marginBottom' => 1440,
            'marginLeft' => 1440,
            'marginRight' => 1440,
        ]);

        $content = $document->content;

        if ($document->type === 'soal' && is_array($content) && isset($content['bagian_1'])) {
            $this->buildSoalDocx($section, $content);
        } elseif ($document->type === 'kisi' && is_array($content) && isset($content['bagian'])) {
            $this->buildKisiDocx($section, $content);
        } elseif ($document->type === 'rubrik' && is_array($content) && isset($content['tables'])) {
            $this->buildRubrikDocx($section, $content);
        } elseif ($document->type === 'rpp' && is_array($content)) {
            $this->buildRppDocx($section, $content);
        } elseif ($document->type === 'lkpd' && is_array($content)) {
            $this->buildLkpdDocx($section, $content);
        } elseif (is_array($content)) {
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

    protected function buildRppDocx($section, array $c): void
    {
        $font = ['name' => 'Times New Roman', 'size' => 11];
        $bold = ['name' => 'Times New Roman', 'size' => 11, 'bold' => true];
        $boldCenter = ['name' => 'Times New Roman', 'size' => 13, 'bold' => true, 'align' => 'center'];
        $center = ['align' => 'center'];

        $section->addText('RENCANA PELAKSANAAN PEMBELAJARAN', $boldCenter);
        $section->addTextBreak();

        $section->addText("Satuan Pendidikan\t: " . ($c['satuan_pendidikan'] ?? '-'), $font);
        $section->addText("Kelas / Semester\t: " . ($c['kelas_semester'] ?? '-'), $font);
        $section->addText("Tema " . ($c['tema'] ?? '') . "\t\t\t: " . ($c['tema'] ?? ''), $font);
        $section->addText("Sub Tema " . ($c['sub_tema'] ?? '') . "\t\t: " . ($c['sub_tema'] ?? ''), $font);
        $section->addText("Muatan Terpadu\t\t: " . ($c['muatan_terpadu'] ?? '-'), $font);
        $section->addText("Pembelajaran ke\t\t: " . ($c['pembelajaran_ke'] ?? '-'), $font);
        $section->addText("Alokasi waktu\t\t: " . ($c['alokasi_waktu'] ?? '-'), $font);
        $section->addTextBreak();

        $section->addText('A. TUJUAN PEMBELAJARAN', $bold);
        if (isset($c['tujuan_pembelajaran']) && is_array($c['tujuan_pembelajaran'])) {
            foreach ($c['tujuan_pembelajaran'] as $t) {
                $section->addText($t, $font);
            }
        }
        $section->addTextBreak();

        $section->addText('B. KEGIATAN PEMBELAJARAN', $bold);
        $kp = $c['kegiatan_pembelajaran'] ?? [];
        if ($kp) {
            $table = $section->addTable(['borderSize' => 6, 'cellMargin' => 60]);
            $table->addRow();
            $table->addCell(2000)->addText('Kegiatan', $bold);
            $table->addCell(8000)->addText('Deskripsi Kegiatan', $bold);
            $table->addCell(2000)->addText('Alokasi Waktu', $bold);

            foreach (['pendahuluan' => 'Pendahuluan', 'inti' => 'Kegiatan Inti', 'penutup' => 'Penutup'] as $key => $label) {
                if (!isset($kp[$key])) continue;
                $item = $kp[$key];
                $deskripsi = is_array($item) ? ($item['deskripsi'] ?? '') : (string)$item;
                $waktu = is_array($item) ? ($item['waktu'] ?? '') : '';
                $table->addRow();
                $table->addCell(2000)->addText($label, $font);
                $table->addCell(8000)->addText($deskripsi, $font);
                $table->addCell(2000)->addText($waktu, $font);
            }
        }
        $section->addTextBreak();

        $section->addText('C. PENILAIAN (ASESMEN)', $bold);
        $section->addText(is_string($c['penilaian'] ?? '') ? $c['penilaian'] : '', $font);
        $section->addTextBreak();

        $section->addText('Mengetahui', $font, $center);
        $section->addText('Kepala Sekolah,', $font, $center);
        $section->addTextBreak();
        $section->addText('(..........................)', $font, $center);
        $section->addText('NIP........................', $font, $center);
        $section->addTextBreak();
        $section->addText('...................., ........................', $font, $center);
        $section->addText('Guru Kelas', $font, $center);
        $section->addTextBreak();
        $section->addText('(..........................)', $font, $center);
        $section->addText('NIP. ........................', $font, $center);
    }

    protected function buildRppHtml(array $c): string
    {
        $html = '<div class="rpp">';
        $html .= '<p class="bold center" style="font-size:14pt">RENCANA PELAKSANAAN PEMBELAJARAN</p>';

        $html .= '<table class="info" style="margin-bottom:15px">';
        $html .= '<tr><td style="width:200px">Satuan Pendidikan</td><td>: ' . e($c['satuan_pendidikan'] ?? '-') . '</td></tr>';
        $html .= '<tr><td>Kelas / Semester</td><td>: ' . e($c['kelas_semester'] ?? '-') . '</td></tr>';
        $html .= '<tr><td>Tema' . ($c['tema'] ?? '') . '</td><td>: ' . e($c['tema'] ?? '') . '</td></tr>';
        $html .= '<tr><td>Sub Tema' . ($c['sub_tema'] ?? '') . '</td><td>: ' . e($c['sub_tema'] ?? '') . '</td></tr>';
        $html .= '<tr><td>Muatan Terpadu</td><td>: ' . e($c['muatan_terpadu'] ?? '-') . '</td></tr>';
        $html .= '<tr><td>Pembelajaran ke</td><td>: ' . e($c['pembelajaran_ke'] ?? '-') . '</td></tr>';
        $html .= '<tr><td>Alokasi waktu</td><td>: ' . e($c['alokasi_waktu'] ?? '-') . '</td></tr>';
        $html .= '</table>';

        $html .= '<p class="bold" style="margin-top:15px">A. TUJUAN PEMBELAJARAN</p>';
        if (isset($c['tujuan_pembelajaran']) && is_array($c['tujuan_pembelajaran'])) {
            foreach ($c['tujuan_pembelajaran'] as $t) {
                $html .= '<p style="margin-left:15px">' . e($t) . '</p>';
            }
        }

        $kp = $c['kegiatan_pembelajaran'] ?? [];
        if ($kp) {
            $html .= '<p class="bold" style="margin-top:15px">B. KEGIATAN PEMBELAJARAN</p>';
            $html .= '<table class="kegiatan-table">';
            $html .= '<thead><tr><th>Kegiatan</th><th>Deskripsi Kegiatan</th><th>Alokasi Waktu</th></tr></thead><tbody>';
            foreach (['pendahuluan' => 'Pendahuluan', 'inti' => 'Kegiatan Inti', 'penutup' => 'Penutup'] as $key => $label) {
                if (!isset($kp[$key])) continue;
                $item = $kp[$key];
                $deskripsi = is_array($item) ? ($item['deskripsi'] ?? '') : (string)$item;
                $waktu = is_array($item) ? ($item['waktu'] ?? '') : '';
                $html .= '<tr><td>' . e($label) . '</td><td>' . nl2br(e($deskripsi)) . '</td><td style="text-align:center">' . e($waktu) . '</td></tr>';
            }
            $html .= '</tbody></table>';
        }

        $html .= '<p class="bold" style="margin-top:15px">C. PENILAIAN (ASESMEN)</p>';
        $html .= '<p>' . e(is_string($c['penilaian'] ?? '') ? $c['penilaian'] : '') . '</p>';

        $html .= '<div style="text-align:center; margin-top:30px">';
        $html .= '<p>Mengetahui</p><p>Kepala Sekolah,</p>';
        $html .= '<p style="margin-top:40px">(..........................)</p>';
        $html .= '<p>NIP........................</p>';
        $html .= '<p style="margin-top:15px">...................., ........................</p>';
        $html .= '<p>Guru Kelas</p>';
        $html .= '<p style="margin-top:40px">(..........................)</p>';
        $html .= '<p>NIP. ........................</p>';
        $html .= '</div>';

        $html .= '</div>';
        return $html;
    }

    protected function buildLkpdDocx($section, array $c): void
    {
        $font = ['name' => 'Times New Roman', 'size' => 11];
        $bold = ['name' => 'Times New Roman', 'size' => 11, 'bold' => true];
        $italic = ['name' => 'Times New Roman', 'size' => 11, 'italic' => true];

        $section->addText($c['judul'] ?? 'Lembar Kerja Peserta Didik (LKPD)', $bold, ['align' => 'center']);
        $section->addText("Mapel: " . ($c['mapel'] ?? '-') . " | Kelas: " . ($c['kelas'] ?? '-') . " | Materi: " . ($c['materi'] ?? '-'), $font, ['align' => 'center']);
        $section->addTextBreak();

        if (isset($c['petunjuk_pengerjaan'])) {
            $section->addText('A. Petunjuk Pengerjaan:', $bold);
            foreach ($c['petunjuk_pengerjaan'] as $p) {
                $section->addText('- ' . $p, $font);
            }
            $section->addTextBreak();
        }

        $section->addText('B. Kegiatan LKPD:', $bold);

        $kl = $c['kegiatan_lkpd'] ?? [];
        if (isset($kl['mindfull_learning'])) {
            $section->addText('1. Mindfull Learning (Fokus dan Kesadaran Penuh)', ['name' => 'Times New Roman', 'size' => 11, 'bold' => true, 'italic' => true]);
            foreach ($kl['mindfull_learning'] as $s) {
                $section->addText('Soal ' . ($s['nomor'] ?? '') . ': ' . ($s['soal'] ?? ''), $font);
                $section->addText('Jawaban: ___________________', $italic);
            }
        }

        if (isset($kl['joyfull_learning'])) {
            $section->addText('2. Joyfull Learning (Pembelajaran Menyenangkan)', ['name' => 'Times New Roman', 'size' => 11, 'bold' => true, 'italic' => true]);
            foreach ($kl['joyfull_learning'] as $s) {
                $section->addText('Soal ' . ($s['nomor'] ?? '') . ': ' . ($s['soal'] ?? ''), $font);
                $section->addText('Jawaban: ___________________', $italic);
            }
        }

        $ling = $c['lingkungan'] ?? null;
        if ($ling) {
            $section->addTextBreak();
            $section->addText(($ling['sub_judul'] ?? 'C. Lingkungan'), $bold);
            $section->addText('Ayo, Berlatih', ['name' => 'Times New Roman', 'size' => 11, 'bold' => true, 'italic' => true]);
            if (isset($ling['kegiatan'])) {
                foreach ($ling['kegiatan'] as $kg) {
                    $section->addText(($kg['judul'] ?? '') . ': ' . ($kg['instruksi'] ?? ''), $font);
                }
            }
        }

        $bb = $c['bahan_bacaan'] ?? null;
        if ($bb) {
            $section->addTextBreak();
            $section->addText('D. ' . ($bb['judul'] ?? 'Bahan Bacaan Guru dan Peserta Didik'), $bold);
            if (isset($bb['paragraf'])) {
                foreach ($bb['paragraf'] as $p) {
                    $section->addText($p, $font);
                }
            }
        }

        if (isset($c['glosarium']) && count($c['glosarium']) > 0) {
            $section->addTextBreak();
            $section->addText('E. Glosarium', $bold);
            foreach ($c['glosarium'] as $g) {
                $section->addText(($g['kata'] ?? '') . ': ' . ($g['arti'] ?? ''), $font);
            }
        }
    }

    protected function buildLkpdHtml(array $c): string
    {
        $html = '<div class="lkpd">';
        $html .= '<p class="bold center" style="font-size:14pt">' . e($c['judul'] ?? 'Lembar Kerja Peserta Didik (LKPD)') . '</p>';
        $html .= '<p class="center">Mapel: ' . e($c['mapel'] ?? '-') . ' | Kelas: ' . e($c['kelas'] ?? '-') . ' | Materi: ' . e($c['materi'] ?? '-') . '</p>';

        if (isset($c['petunjuk_pengerjaan'])) {
            $html .= '<p class="bold" style="margin-top:15px">A. Petunjuk Pengerjaan:</p>';
            $html .= '<ol style="margin-left:20px">';
            foreach ($c['petunjuk_pengerjaan'] as $p) {
                $html .= '<li>' . e($p) . '</li>';
            }
            $html .= '</ol>';
        }

        $html .= '<p class="bold" style="margin-top:15px">B. Kegiatan LKPD:</p>';

        $kl = $c['kegiatan_lkpd'] ?? [];
        if (isset($kl['mindfull_learning'])) {
            $html .= '<p class="bold" style="margin-top:10px; font-style:italic">1. Mindfull Learning (Fokus dan Kesadaran Penuh)</p>';
            foreach ($kl['mindfull_learning'] as $s) {
                $html .= '<p>Soal ' . e($s['nomor'] ?? '') . ': ' . e($s['soal'] ?? '') . '</p>';
                $html .= '<p style="font-style:italic">Jawaban: ___________________</p>';
            }
        }

        if (isset($kl['joyfull_learning'])) {
            $html .= '<p class="bold" style="margin-top:10px; font-style:italic">2. Joyfull Learning (Pembelajaran Menyenangkan)</p>';
            foreach ($kl['joyfull_learning'] as $s) {
                $html .= '<p>Soal ' . e($s['nomor'] ?? '') . ': ' . e($s['soal'] ?? '') . '</p>';
                $html .= '<p style="font-style:italic">Jawaban: ___________________</p>';
            }
        }

        $ling = $c['lingkungan'] ?? null;
        if ($ling) {
            $html .= '<p class="bold" style="margin-top:15px">' . e($ling['sub_judul'] ?? 'C. Lingkungan') . '</p>';
            $html .= '<p class="bold" style="font-style:italic">Ayo, Berlatih</p>';
            if (isset($ling['kegiatan'])) {
                foreach ($ling['kegiatan'] as $kg) {
                    $html .= '<p class="bold">' . e($kg['judul'] ?? '') . '</p>';
                    $html .= '<p>' . e($kg['instruksi'] ?? '') . '</p>';
                }
            }
        }

        $bb = $c['bahan_bacaan'] ?? null;
        if ($bb) {
            $html .= '<p class="bold" style="margin-top:15px">D. ' . e($bb['judul'] ?? 'Bahan Bacaan Guru dan Peserta Didik') . '</p>';
            if (isset($bb['paragraf'])) {
                foreach ($bb['paragraf'] as $p) {
                    $html .= '<p style="text-align:justify">' . e($p) . '</p>';
                }
            }
        }

        if (isset($c['glosarium']) && count($c['glosarium']) > 0) {
            $html .= '<p class="bold" style="margin-top:15px">E. Glosarium</p>';
            foreach ($c['glosarium'] as $g) {
                $html .= '<p><span class="bold">' . e($g['kata'] ?? '') . '</span>: ' . e($g['arti'] ?? '') . '</p>';
            }
        }

        $html .= '</div>';
        return $html;
    }

    protected function buildKisiDocx($section, array $c): void
    {
        $font = ['name' => 'Times New Roman', 'size' => 11];
        $bold = ['name' => 'Times New Roman', 'size' => 11, 'bold' => true];
        $boldCenter = ['name' => 'Times New Roman', 'size' => 12, 'bold' => true, 'align' => 'center'];

        $section->addText($c['judul'] ?? 'KISI-KISI SOAL ASAT', $bold, ['align' => 'center']);
        $section->addTextBreak();

        if (isset($c['bagian']) && is_array($c['bagian'])) {
            foreach ($c['bagian'] as $bag) {
                $section->addText(($bag['label'] ?? '') . '. ' . ($bag['nama'] ?? ''), $bold);
                $section->addTextBreak(0.5);

                $table = $section->addTable(['borderSize' => 0, 'cellMargin' => 60]);
                $table->addRow();
                $table->addCell(800)->addText('No', $bold);
                $table->addCell(10000)->addText('Indikator/ Materi', $bold);
                $table->addCell(2000)->addText('Bentuk Soal', $bold);

                if (isset($bag['soal']) && is_array($bag['soal'])) {
                    foreach ($bag['soal'] as $s) {
                        $table->addRow();
                        $table->addCell(800)->addText((string)($s['nomor'] ?? ''), $font);
                        $table->addCell(10000)->addText($s['indikator'] ?? '', $font);
                        $table->addCell(2000)->addText($s['bentuk_soal'] ?? '', $font);
                    }
                }

                $section->addTextBreak();
            }
        }
    }

    protected function buildRubrikDocx($section, array $c): void
    {
        $font = ['name' => 'Times New Roman', 'size' => 11];
        $bold = ['name' => 'Times New Roman', 'size' => 11, 'bold' => true];
        $boldSmall = ['name' => 'Times New Roman', 'size' => 10, 'bold' => true];

        $section->addText('Asesmen :', $bold);
        $section->addTextBreak();

        foreach ($c['tables'] as $tbl) {
            $section->addText('Tabel ' . ($tbl['nomor_tabel'] ?? '') . ' ' . ($tbl['judul'] ?? ''), $bold);
            $section->addTextBreak(0.5);

            $table = $section->addTable(['borderSize' => 6, 'cellMargin' => 40]);
            $table->addRow();
            $table->addCell(2500)->addText("Kriteria/\nSkor", $boldSmall);
            $table->addCell(2500)->addText("Skor 86-100\nBaik Sekali\n4", $boldSmall);
            $table->addCell(2500)->addText("Skor 71-85\nBaik\n3", $boldSmall);
            $table->addCell(2500)->addText("Skor 61-70\ncukup\n2", $boldSmall);
            $table->addCell(2500)->addText("Skor = 60\nKurang\n1", $boldSmall);

            if (isset($tbl['kriteria']) && is_array($tbl['kriteria'])) {
                foreach ($tbl['kriteria'] as $kr) {
                    $table->addRow();
                    $table->addCell(2500)->addText($kr['nama'] ?? '', $font);
                    $table->addCell(2500)->addText($kr['skor4'] ?? '', $font);
                    $table->addCell(2500)->addText($kr['skor3'] ?? '', $font);
                    $table->addCell(2500)->addText($kr['skor2'] ?? '', $font);
                    $table->addCell(2500)->addText($kr['skor1'] ?? '', $font);
                }
            }

            $section->addTextBreak();
        }
    }

    protected function buildRubrikHtml(array $c): string
    {
        $html = '<div class="rubrik">';
        $html .= '<p class="bold" style="font-size:12pt; margin-bottom:15px">Asesmen :</p>';

        foreach ($c['tables'] as $tbl) {
            $html .= '<p class="bold" style="margin-top:15px; margin-bottom:5px">Tabel ' . e($tbl['nomor_tabel'] ?? '') . ' ' . e($tbl['judul'] ?? '') . '</p>';
            $html .= '<table class="rubrik-table">';
            $html .= '<thead><tr>';
            $html .= '<th>Kriteria/<br/>Skor</th>';
            $html .= '<th>Skor 86-100<br/>Baik Sekali<br/>4</th>';
            $html .= '<th>Skor 71-85<br/>Baik<br/>3</th>';
            $html .= '<th>Skor 61-70<br/>cukup<br/>2</th>';
            $html .= '<th>Skor = 60<br/>Kurang<br/>1</th>';
            $html .= '</tr></thead><tbody>';

            if (isset($tbl['kriteria']) && is_array($tbl['kriteria'])) {
                foreach ($tbl['kriteria'] as $kr) {
                    $html .= '<tr>';
                    $html .= '<td>' . e($kr['nama'] ?? '') . '</td>';
                    $html .= '<td>' . e($kr['skor4'] ?? '') . '</td>';
                    $html .= '<td>' . e($kr['skor3'] ?? '') . '</td>';
                    $html .= '<td>' . e($kr['skor2'] ?? '') . '</td>';
                    $html .= '<td>' . e($kr['skor1'] ?? '') . '</td>';
                    $html .= '</tr>';
                }
            }

            $html .= '</tbody></table>';
        }

        $html .= '</div>';
        return $html;
    }

    protected function buildKisiHtml(array $c): string
    {
        $html = '<div class="kisi">';
        $html .= '<p class="bold center" style="font-size:14pt">' . e($c['judul'] ?? 'KISI-KISI SOAL ASAT') . '</p>';

        if (isset($c['bagian']) && is_array($c['bagian'])) {
            foreach ($c['bagian'] as $bag) {
                $html .= '<p class="bold" style="margin-top:15px">' . e($bag['label'] ?? '') . '. ' . e($bag['nama'] ?? '') . '</p>';
                $html .= '<table class="kisi-table">';
                $html .= '<thead><tr><th>No</th><th>Indikator/ Materi</th><th>Bentuk Soal</th></tr></thead><tbody>';
                if (isset($bag['soal']) && is_array($bag['soal'])) {
                    foreach ($bag['soal'] as $s) {
                        $html .= '<tr><td>' . ($s['nomor'] ?? '') . '</td><td>' . e($s['indikator'] ?? '') . '</td><td>' . e($s['bentuk_soal'] ?? '') . '</td></tr>';
                    }
                }
                $html .= '</tbody></table>';
            }
        }

        $html .= '</div>';
        return $html;
    }

    protected function buildSoalDocx($section, array $c): void
    {
        $font = ['name' => 'Times New Roman', 'size' => 11];
        $bold = ['name' => 'Times New Roman', 'size' => 11, 'bold' => true];
        $boldCenter = ['name' => 'Times New Roman', 'size' => 11, 'bold' => true, 'align' => 'center'];
        $center = ['align' => 'center'];

        // Kop
        $section->addText($c['pemerintah'] ?? 'PEMERINTAH KABUPATEN ...', $bold, $center);
        $section->addText($c['dinas'] ?? 'DINAS PENDIDIKAN', $bold, $center);
        $section->addText($c['sekolah'] ?? '', array_merge($bold, ['underline' => 'single']), $center);
        $section->addText(($c['alamat'] ?? ''), $font, $center);
        $section->addText('NPSN: ' . ($c['npsn'] ?? '') . ', Email: ' . ($c['email'] ?? ''), $font, $center);
        $section->addTextBreak();

        // Judul
        $section->addText($c['judul'] ?? 'ASESMEN SUMATIF AKHIR TAHUN (ASAT)', $bold, $center);
        $section->addText($c['tahun_pelajaran'] ?? '', $bold, $center);
        $section->addTextBreak();

        // Info
        if (isset($c['info'])) {
            $info = $c['info'];
            $section->addText("Muatan Pelajaran\t: " . ($info['muatan_pelajaran'] ?? '…') . "\t\tNama\t\t: …………………", $font);
            $section->addText("Kelas/ Semester\t: " . ($info['kelas_semester'] ?? '…') . "\t\tHari/tgl\t: …………………", $font);
            $section->addText("Waktu\t\t: " . ($info['waktu'] ?? '…'), $font);
            $section->addTextBreak();
        }

        // Bagian soal (bagian_1, bagian_2, bagian_3)
        foreach (['bagian_1', 'bagian_2', 'bagian_3'] as $key) {
            if (!isset($c[$key])) continue;
            $bag = $c[$key];
            if ($key !== 'bagian_1') $section->addTextBreak();
            $section->addText(($bag['label'] ?? '') . '. ' . ($bag['petunjuk'] ?? ''), $bold);
            $section->addTextBreak(0.5);

            if (isset($bag['soal']) && is_array($bag['soal'])) {
                foreach ($bag['soal'] as $s) {
                    $section->addText(($s['nomor'] ?? '') . '. ' . ($s['pertanyaan'] ?? ''), $font);
                    if (isset($s['opsi']) && is_array($s['opsi'])) {
                        foreach ($s['opsi'] as $k => $v) {
                            $section->addText("    {$k}. {$v}", $font);
                        }
                    } elseif (!isset($s['opsi'])) {
                        for ($i = 0; $i < 3; $i++) {
                            $section->addText('.........................................................................', $font);
                        }
                    }
                    $section->addTextBreak(0.3);
                }
            }
        }
    }

    protected function buildHtml(Document $document): string
    {
        $content = $document->content;
        $html = '';

        if ($document->type === 'soal' && is_array($content) && isset($content['bagian_1'])) {
            $c = $content;
            $html .= '<div class="exam">';

            // Kop
            $html .= '<div class="kop">';
            $html .= '<p class="bold center">' . e($c['pemerintah'] ?? 'PEMERINTAH KABUPATEN ...') . '</p>';
            $html .= '<p class="bold center">' . e($c['dinas'] ?? 'DINAS PENDIDIKAN') . '</p>';
            $html .= '<p class="bold center underline">' . e($c['sekolah'] ?? '') . '</p>';
            $html .= '<p class="center">' . e($c['alamat'] ?? '') . '</p>';
            $html .= '<p class="center">NPSN: ' . e($c['npsn'] ?? '') . ', Email: ' . e($c['email'] ?? '') . '</p>';
            $html .= '</div>';

            // Judul
            $html .= '<div class="judul">';
            $html .= '<p class="bold center">' . e($c['judul'] ?? 'ASESMEN SUMATIF AKHIR TAHUN (ASAT)') . '</p>';
            $html .= '<p class="bold center">' . e($c['tahun_pelajaran'] ?? '') . '</p>';
            $html .= '</div>';

            // Info
            if (isset($c['info'])) {
                $i = $c['info'];
                $html .= '<table class="info">';
                $html .= '<tr><td>Muatan Pelajaran</td><td>: ' . e($i['muatan_pelajaran'] ?? '…') . '</td><td>Nama</td><td>: …………………</td></tr>';
                $html .= '<tr><td>Kelas/ Semester</td><td>: ' . e($i['kelas_semester'] ?? '…') . '</td><td>Hari/tgl</td><td>: …………………</td></tr>';
                $html .= '<tr><td>Waktu</td><td>: ' . e($i['waktu'] ?? '…') . '</td><td></td><td></td></tr>';
                $html .= '</table>';
            }

            // Bagian soal (bagian_1, bagian_2, bagian_3)
            foreach (['bagian_1', 'bagian_2', 'bagian_3'] as $key) {
                if (!isset($c[$key])) continue;
                $bag = $c[$key];
                $margin = $key === 'bagian_1' ? '' : ' style="margin-top:20px"';
                $html .= '<p class="bold"' . $margin . '>' . e($bag['label'] ?? '') . '. ' . e($bag['petunjuk'] ?? '') . '</p>';
                if (isset($bag['soal'])) {
                    foreach ($bag['soal'] as $s) {
                        $html .= '<p>' . ($s['nomor'] ?? '') . '. ' . e($s['pertanyaan'] ?? '') . '</p>';
                        if (isset($s['opsi'])) {
                            foreach ($s['opsi'] as $k => $v) {
                                $html .= '<p style="padding-left:30px">' . e($k) . '. ' . e($v) . '</p>';
                            }
                        } else {
                            for ($i = 0; $i < 3; $i++) {
                                $html .= '<p style="border-bottom:1px dotted #000; height:20px"></p>';
                            }
                        }
                    }
                }
            }

            $html .= '</div>';
        } elseif ($document->type === 'kisi' && is_array($content) && isset($content['bagian'])) {
            $html .= $this->buildKisiHtml($content);
        } elseif ($document->type === 'rubrik' && is_array($content) && isset($content['tables'])) {
            $html .= $this->buildRubrikHtml($content);
        } elseif ($document->type === 'rpp' && is_array($content)) {
            $html .= $this->buildRppHtml($content);
        } elseif ($document->type === 'lkpd' && is_array($content)) {
            $html .= $this->buildLkpdHtml($content);
        } elseif (is_array($content)) {
            $html .= $this->arrayToHtml($content);
        } else {
            $html .= "<p>{$content}</p>";
        }

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 2.5cm; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .underline { text-decoration: underline; }
            .kop { margin-bottom: 20px; }
            .judul { margin-bottom: 15px; }
            table.info { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11pt; }
            table.info td { padding: 2px 5px; }
            table.kisi-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11pt; }
            table.kisi-table th, table.kisi-table td { border: 1px solid #000; padding: 4px 8px; text-align: left; }
            table.kisi-table th { font-weight: bold; background: #f0f0f0; }
            table.kegiatan-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11pt; }
            table.kegiatan-table th, table.kegiatan-table td { border: 1px solid #000; padding: 4px 8px; }
            table.kegiatan-table th { font-weight: bold; background: #f0f0f0; text-align: center; }
            table.rubrik-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
            table.rubrik-table th, table.rubrik-table td { border: 1px solid #000; padding: 4px 8px; text-align: left; vertical-align: top; font-size: 10pt; }
            table.rubrik-table th { font-weight: bold; background: #f0f0f0; text-align: center; font-size: 9pt; }
            p { margin: 3px 0; }
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
