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
        } elseif ($document->type === 'modul' && is_array($content)) {
            $this->buildModulDocx($section, $content);
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
        } elseif ($document->type === 'modul' && is_array($content)) {
            $html .= $this->buildModulHtml($content);
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
            table.info-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11pt; }
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

    protected function buildModulDocx($section, array $c): void
    {
        $font = ['name' => 'Times New Roman', 'size' => 11];
        $bold = ['name' => 'Times New Roman', 'size' => 11, 'bold' => true];
        $boldCenter = ['name' => 'Times New Roman', 'size' => 13, 'bold' => true, 'align' => 'center'];

        $section->addText('MODUL AJAR SD', $boldCenter);
        $section->addTextBreak();

        // IDENTITAS MODUL
        $section->addText('IDENTITAS MODUL', $bold);
        $id = $c['identitas'] ?? [];
        $fields = [
            'Nama Sekolah' => $id['nama_sekolah'] ?? '',
            'Tahun Pelajaran' => $id['tahun_pelajaran'] ?? '',
            'Semester' => $id['semester'] ?? '',
            'Fase' => $id['fase'] ?? '',
            'Kelas' => $id['kelas'] ?? '',
            'Mata Pelajaran' => $id['mata_pelajaran'] ?? '',
            'Bab/Topik' => $id['bab_topik'] ?? '',
            'Alokasi Waktu' => $id['alokasi_waktu'] ?? '',
            'Penyusun' => $id['penyusun'] ?? '',
        ];
        $table = $section->addTable(['borderSize' => 6, 'cellMargin' => 40]);
        foreach ($fields as $label => $val) {
            $table->addRow();
            $table->addCell(3000)->addText($label, $bold);
            $table->addCell(9000)->addText((string)$val, $font);
        }
        $section->addTextBreak();

        // INFORMASI UMUM
        $section->addText('INFORMASI UMUM', $bold);
        $section->addText('Capaian Pembelajaran (CP)', $bold);
        $section->addText($c['cp'] ?? '-', $font);
        $section->addTextBreak(0.5);
        $section->addText('Tujuan Pembelajaran (TP)', $bold);
        $this->addList($section, $c['tp'] ?? [], $font);
        $section->addText('Indikator Ketercapaian', $bold);
        $this->addList($section, $c['indikator_ketercapaian'] ?? [], $font);
        $section->addText('Profil Lulusan', $bold);
        $this->addList($section, $c['profil_lulusan'] ?? [], $font);
        $section->addText('Dimensi Profil Pelajar Pancasila', $bold);
        $this->addList($section, $c['dimensi_ppp'] ?? [], $font);
        $section->addText('Kompetensi Awal: ' . ($c['kompetensi_awal'] ?? '-'), $font);
        $section->addText('Sarana dan Prasarana: ' . (is_array($c['sarana_prasarana'] ?? '') ? implode(', ', $c['sarana_prasarana']) : ($c['sarana_prasarana'] ?? '-')), $font);
        $section->addText('Target Peserta Didik: ' . ($c['target_peserta_didik'] ?? '-'), $font);
        $section->addText('Model Pembelajaran: ' . ($c['model_pembelajaran'] ?? '-'), $font);
        $section->addText('Pendekatan: ' . ($c['pendekatan'] ?? '-'), $font);
        $section->addText('Metode: ' . (is_array($c['metode'] ?? '') ? implode(', ', $c['metode']) : ($c['metode'] ?? '-')), $font);
        $section->addTextBreak();

        // MATERI PEMBELAJARAN
        $section->addText('MATERI PEMBELAJARAN', $bold);
        $section->addText('Materi Inti: ' . ($c['materi_inti'] ?? '-'), $font);
        $section->addText('Materi Pendukung: ' . ($c['materi_pendukung'] ?? '-'), $font);
        if (!empty($c['istilah_penting'])) {
            $section->addText('Istilah Penting', $bold);
            $tbl = $section->addTable(['borderSize' => 6, 'cellMargin' => 40]);
            $tbl->addRow(); $tbl->addCell(4000)->addText('Istilah', $bold); $tbl->addCell(8000)->addText('Penjelasan', $bold);
            foreach ($c['istilah_penting'] as $ip) {
                $tbl->addRow(); $tbl->addCell(4000)->addText($ip['istilah'] ?? '', $font); $tbl->addCell(8000)->addText($ip['penjelasan'] ?? '', $font);
            }
        }
        $section->addTextBreak();

        // PEMAHAMAN BERMAKNA
        $section->addText('PEMAHAMAN BERMAKNA', $bold);
        $this->addList($section, $c['pemahaman_bermakna'] ?? [], $font);
        $section->addTextBreak();

        // PERTANYAAN PEMANTIK
        $section->addText('PERTANYAAN PEMANTIK', $bold);
        $this->addList($section, $c['pertanyaan_pemantik'] ?? [], $font);
        $section->addTextBreak();

        // KEGIATAN PEMBELAJARAN
        $section->addText('KEGIATAN PEMBELAJARAN', $bold);
        if (!empty($c['kegiatan_pembelajaran'])) {
            foreach ($c['kegiatan_pembelajaran'] as $kp) {
                $section->addText($kp['pertemuan'] ?? 'Pertemuan', $bold);
                $section->addText('Pendahuluan:', $bold);
                $section->addText($kp['pendahuluan'] ?? '-', $font);
                $section->addText('Kegiatan Inti:', $bold);
                $section->addText($kp['inti'] ?? '-', $font);
                $section->addText('Penutup:', $bold);
                $section->addText($kp['penutup'] ?? '-', $font);
            }
        }
        $section->addTextBreak();

        // ASESMEN
        $section->addText('ASESMEN', $bold);
        if (!empty($c['asesmen_diagnostik'])) {
            $section->addText('Asesmen Diagnostik', $bold);
            $section->addText('Kognitif: ' . ($c['asesmen_diagnostik']['kognitif'] ?? '-'), $font);
            $section->addText('Non-Kognitif: ' . ($c['asesmen_diagnostik']['non_kognitif'] ?? '-'), $font);
        }
        if (!empty($c['asesmen_formatif'])) {
            $section->addText('Asesmen Formatif', $bold);
            $section->addText('Teknik: ' . ($c['asesmen_formatif']['teknik'] ?? '-'), $font);
            $section->addText('Instrumen: ' . ($c['asesmen_formatif']['instrumen'] ?? '-'), $font);
            $section->addText('Rubrik: ' . ($c['asesmen_formatif']['rubrik'] ?? '-'), $font);
        }
        if (!empty($c['asesmen_sumatif'])) {
            $section->addText('Asesmen Sumatif', $bold);
            $section->addText('Bentuk: ' . ($c['asesmen_sumatif']['bentuk'] ?? '-'), $font);
            $section->addText('Instrumen: ' . ($c['asesmen_sumatif']['instrumen'] ?? '-'), $font);
            $section->addText('Rubrik: ' . ($c['asesmen_sumatif']['rubrik'] ?? '-'), $font);
        }
        $section->addTextBreak();

        // Rubrik Penilaian
        if (!empty($c['rubrik_penilaian'])) {
            $section->addText('RUBRIK PENILAIAN', $bold);
            $tbl = $section->addTable(['borderSize' => 6, 'cellMargin' => 40]);
            $tbl->addRow();
            foreach (['Aspek', 'Sangat Baik', 'Baik', 'Cukup', 'Perlu Bimbingan'] as $h) { $tbl->addCell(2500)->addText($h, $bold); }
            foreach ($c['rubrik_penilaian'] as $rp) {
                $tbl->addRow();
                $tbl->addCell(2500)->addText($rp['aspek'] ?? '', $font);
                $tbl->addCell(2500)->addText($rp['sangat_baik'] ?? '', $font);
                $tbl->addCell(2500)->addText($rp['baik'] ?? '', $font);
                $tbl->addCell(2500)->addText($rp['cukup'] ?? '', $font);
                $tbl->addCell(2500)->addText($rp['perlu_bimbingan'] ?? '', $font);
            }
            $section->addTextBreak();
        }

        // Penilaian tables
        $this->addTableDocx($section, 'PENILAIAN SIKAP', ['Aspek', 'Kriteria', 'Catatan'], $c['penilaian_sikap'] ?? [], ['aspek', 'kriteria', 'catatan'], $font, $bold);
        $this->addTableDocx($section, 'PENILAIAN PENGETAHUAN', ['No', 'Indikator', 'Bentuk Soal', 'Skor'], $c['penilaian_pengetahuan'] ?? [], ['no', 'indikator', 'bentuk_soal', 'skor'], $font, $bold);
        $this->addTableDocx($section, 'PENILAIAN KETERAMPILAN', ['Aspek', 'Indikator', 'Skor Maksimal'], $c['penilaian_keterampilan'] ?? [], ['aspek', 'indikator', 'skor_maksimal'], $font, $bold);

        // Pengayaan & Remedial
        $section->addText('PENGAYAAN: ' . ($c['pengayaan'] ?? '-'), $font);
        $section->addText('REMEDIAL: ' . ($c['remedial'] ?? '-'), $font);
        $section->addTextBreak();

        // Refleksi
        $section->addText('REFLEKSI GURU', $bold);
        $rg = $c['refleksi_guru'] ?? [];
        $section->addText('Apa yang berjalan baik? ' . ($rg['berjalan_baik'] ?? '-'), $font);
        $section->addText('Apa yang perlu diperbaiki? ' . ($rg['perlu_diperbaiki'] ?? '-'), $font);
        $section->addText('Tindak lanjut: ' . ($rg['tindak_lanjut'] ?? '-'), $font);
        $section->addText('REFLEKSI PESERTA DIDIK', $bold);
        $rp = $c['refleksi_peserta_didik'] ?? [];
        $section->addText('Apa yang saya pelajari hari ini? ' . ($rp['dipelajari'] ?? '-'), $font);
        $section->addText('Bagian yang paling saya sukai: ' . ($rp['disukai'] ?? '-'), $font);
        $section->addText('Bagian yang masih sulit: ' . ($rp['sulit'] ?? '-'), $font);
        $section->addText('Yang akan saya lakukan selanjutnya: ' . ($rp['selanjutnya'] ?? '-'), $font);
        $section->addTextBreak();

        // Lampiran
        $lamp = $c['lampiran'] ?? [];
        if ($lamp) {
            $section->addText('LAMPIRAN', $bold);
            if (!empty($lamp['lkpd'])) {
                $section->addText('LKPD', $bold);
                $lkpd = $lamp['lkpd'];
                if (!empty($lkpd['identitas'])) {
                    $id_lkpd = $lkpd['identitas'];
                    $section->addText('Nama: ' . ($id_lkpd['nama'] ?? ''), $font);
                    $section->addText('Kelas: ' . ($id_lkpd['kelas'] ?? ''), $font);
                    $section->addText('Tanggal: ' . ($id_lkpd['tanggal'] ?? ''), $font);
                }
                $section->addText('Petunjuk: ' . ($lkpd['petunjuk'] ?? ''), $font);
                $section->addText('Tujuan: ' . ($lkpd['tujuan'] ?? ''), $font);
                $this->addList($section, $lkpd['langkah_kerja'] ?? [], $font);
                $section->addText('Hasil: ' . ($lkpd['hasil'] ?? ''), $font);
            }
            $section->addText('Bahan Bacaan Guru: ' . ($lamp['bahan_bacaan_guru'] ?? '-'), $font);
            $section->addText('Bahan Bacaan Peserta Didik: ' . ($lamp['bahan_bacaan_peserta'] ?? '-'), $font);
            if (!empty($lamp['glosarium'])) {
                $section->addText('Glosarium', $bold);
                $tbl = $section->addTable(['borderSize' => 6, 'cellMargin' => 40]);
                $tbl->addRow(); $tbl->addCell(4000)->addText('Istilah', $bold); $tbl->addCell(8000)->addText('Arti', $bold);
                foreach ($lamp['glosarium'] as $g) { $tbl->addRow(); $tbl->addCell(4000)->addText($g['istilah'] ?? '', $font); $tbl->addCell(8000)->addText($g['arti'] ?? '', $font); }
            }
            $section->addText('Daftar Pustaka:', $bold);
            $this->addList($section, $lamp['daftar_pustaka'] ?? [], $font);
        }

        // METADATA
        $md = $c['metadata'] ?? [];
        if ($md) {
            $section->addText('METADATA', $bold);
            foreach (['Kode Modul', 'Versi', 'Tanggal Dibuat', 'Tanggal Revisi', 'Status', 'Penulis', 'Validator'] as $f) {
                $key = str_replace(' ', '_', strtolower(preg_replace('/[A-Z]/', '_$0', lcfirst(str_replace(' ', '', $f)))));
                $section->addText("{$f}: " . ($md[$key] ?? $md[str_replace(' ', '_', strtolower($f))] ?? '-'), $font);
            }
        }
    }

    protected function addList($section, array $items, array $font): void
    {
        foreach ($items as $item) {
            $section->addText('- ' . (is_string($item) ? $item : (is_array($item) && isset($item[0]) ? $item[0] : json_encode($item))), $font);
        }
    }

    protected function addTableDocx($section, string $title, array $headers, array $rows, array $fields, array $font, array $bold): void
    {
        if (empty($rows)) return;
        $section->addText($title, $bold);
        $tbl = $section->addTable(['borderSize' => 6, 'cellMargin' => 40]);
        $tbl->addRow();
        $cw = round(12000 / count($headers));
        foreach ($headers as $h) { $tbl->addCell($cw)->addText($h, $bold); }
        foreach ($rows as $row) {
            $tbl->addRow();
            foreach ($fields as $f) { $tbl->addCell($cw)->addText((string)($row[$f] ?? '-'), $font); }
        }
        $section->addTextBreak();
    }

    protected function buildModulHtml(array $c): string
    {
        $html = '<div class="modul">';
        $html .= '<p class="bold center" style="font-size:14pt">MODUL AJAR SD</p>';

        // IDENTITAS MODUL
        $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">IDENTITAS MODUL</p>';
        $id = $c['identitas'] ?? [];
        $html .= '<table class="info-table">';
        foreach (['Nama Sekolah', 'Tahun Pelajaran', 'Semester', 'Fase', 'Kelas', 'Mata Pelajaran', 'Bab/Topik', 'Alokasi Waktu', 'Penyusun'] as $f) {
            $key = str_replace(' ', '_', strtolower(str_replace('/', '_', str_replace('-', '_', $f))));
            $vk = ['nama_sekolah' => 'nama_sekolah', 'tahun_pelajaran' => 'tahun_pelajaran', 'semester' => 'semester', 'fase' => 'fase', 'kelas' => 'kelas', 'mata_pelajaran' => 'mata_pelajaran', 'bab_topik' => 'bab_topik', 'alokasi_waktu' => 'alokasi_waktu', 'penyusun' => 'penyusun'];
            $html .= '<tr><td style="width:200px; font-weight:bold">' . e($f) . '</td><td>: ' . e((string)($id[$vk[$f]] ?? '-')) . '</td></tr>';
        }
        $html .= '</table>';

        // INFORMASI UMUM
        $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">INFORMASI UMUM</p>';
        $html .= $this->h2('Capaian Pembelajaran (CP)') . '<pre style="font-family:inherit">' . e($c['cp'] ?? '-') . '</pre>';
        $html .= $this->h2('Tujuan Pembelajaran (TP)') . $this->ul($c['tp'] ?? []);
        $html .= $this->h2('Indikator Ketercapaian') . $this->ul($c['indikator_ketercapaian'] ?? []);
        $html .= $this->h2('Profil Lulusan') . $this->ul($c['profil_lulusan'] ?? []);
        $html .= $this->h2('Dimensi Profil Pelajar Pancasila') . $this->ul($c['dimensi_ppp'] ?? []);
        $html .= '<p><strong>Kompetensi Awal:</strong> ' . e($c['kompetensi_awal'] ?? '-') . '</p>';
        $html .= '<p><strong>Sarana dan Prasarana:</strong> ' . e(is_array($c['sarana_prasarana'] ?? '') ? implode(', ', $c['sarana_prasarana']) : ($c['sarana_prasarana'] ?? '-')) . '</p>';
        $html .= '<p><strong>Target Peserta Didik:</strong> ' . e($c['target_peserta_didik'] ?? '-') . '</p>';
        $html .= '<p><strong>Model Pembelajaran:</strong> ' . e($c['model_pembelajaran'] ?? '-') . '</p>';
        $html .= '<p><strong>Pendekatan:</strong> ' . e($c['pendekatan'] ?? '-') . '</p>';
        $html .= '<p><strong>Metode:</strong> ' . e(is_array($c['metode'] ?? '') ? implode(', ', $c['metode']) : ($c['metode'] ?? '-')) . '</p>';

        // MATERI
        $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">MATERI PEMBELAJARAN</p>';
        $html .= '<p><strong>Materi Inti:</strong> ' . e($c['materi_inti'] ?? '-') . '</p>';
        $html .= '<p><strong>Materi Pendukung:</strong> ' . e($c['materi_pendukung'] ?? '-') . '</p>';
        if (!empty($c['istilah_penting'])) {
            $html .= $this->h2('Istilah Penting') . $this->table(['Istilah', 'Penjelasan'], $c['istilah_penting'], ['istilah', 'penjelasan']);
        }

        $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">PEMAHAMAN BERMAKNA</p>' . $this->ul($c['pemahaman_bermakna'] ?? []);
        $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">PERTANYAAN PEMANTIK</p>' . $this->ol($c['pertanyaan_pemantik'] ?? []);

        // KEGIATAN PEMBELAJARAN
        $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">KEGIATAN PEMBELAJARAN</p>';
        if (!empty($c['kegiatan_pembelajaran'])) {
            foreach ($c['kegiatan_pembelajaran'] as $kp) {
                $html .= '<p class="bold" style="margin-top:10px">' . e($kp['pertemuan'] ?? 'Pertemuan') . '</p>';
                $html .= '<p class="bold">Pendahuluan</p><p style="margin-left:15px">' . nl2br(e($kp['pendahuluan'] ?? '-')) . '</p>';
                $html .= '<p class="bold">Kegiatan Inti</p><p style="margin-left:15px">' . nl2br(e($kp['inti'] ?? '-')) . '</p>';
                $html .= '<p class="bold">Penutup</p><p style="margin-left:15px">' . nl2br(e($kp['penutup'] ?? '-')) . '</p>';
            }
        }

        // ASESMEN
        $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">ASESMEN</p>';
        if (!empty($c['asesmen_diagnostik'])) {
            $ad = $c['asesmen_diagnostik'];
            $html .= $this->h2('Asesmen Diagnostik') . '<p style="margin-left:15px"><strong>Kognitif:</strong> ' . e($ad['kognitif'] ?? '-') . '</p><p style="margin-left:15px"><strong>Non-Kognitif:</strong> ' . e($ad['non_kognitif'] ?? '-') . '</p>';
        }
        if (!empty($c['asesmen_formatif'])) {
            $af = $c['asesmen_formatif'];
            $html .= $this->h2('Asesmen Formatif') . '<p style="margin-left:15px"><strong>Teknik:</strong> ' . e($af['teknik'] ?? '-') . '</p><p style="margin-left:15px"><strong>Instrumen:</strong> ' . e($af['instrumen'] ?? '-') . '</p><p style="margin-left:15px"><strong>Rubrik:</strong> ' . e($af['rubrik'] ?? '-') . '</p>';
        }
        if (!empty($c['asesmen_sumatif'])) {
            $as = $c['asesmen_sumatif'];
            $html .= $this->h2('Asesmen Sumatif') . '<p style="margin-left:15px"><strong>Bentuk:</strong> ' . e($as['bentuk'] ?? '-') . '</p><p style="margin-left:15px"><strong>Instrumen:</strong> ' . e($as['instrumen'] ?? '-') . '</p><p style="margin-left:15px"><strong>Rubrik:</strong> ' . e($as['rubrik'] ?? '-') . '</p>';
        }

        // Tables
        $html .= $this->tableSection('RUBRIK PENILAIAN', ['Aspek', 'Sangat Baik', 'Baik', 'Cukup', 'Perlu Bimbingan'], $c['rubrik_penilaian'] ?? [], ['aspek', 'sangat_baik', 'baik', 'cukup', 'perlu_bimbingan']);
        $html .= $this->tableSection('PENILAIAN SIKAP', ['Aspek', 'Kriteria', 'Catatan'], $c['penilaian_sikap'] ?? [], ['aspek', 'kriteria', 'catatan']);
        $html .= $this->tableSection('PENILAIAN PENGETAHUAN', ['No', 'Indikator', 'Bentuk Soal', 'Skor'], $c['penilaian_pengetahuan'] ?? [], ['no', 'indikator', 'bentuk_soal', 'skor']);
        $html .= $this->tableSection('PENILAIAN KETERAMPILAN', ['Aspek', 'Indikator', 'Skor Maksimal'], $c['penilaian_keterampilan'] ?? [], ['aspek', 'indikator', 'skor_maksimal']);

        $html .= '<p><strong>Pengayaan:</strong> ' . e($c['pengayaan'] ?? '-') . '</p>';
        $html .= '<p><strong>Remedial:</strong> ' . e($c['remedial'] ?? '-') . '</p>';

        // REFLEKSI
        $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">REFLEKSI</p>';
        $rg = $c['refleksi_guru'] ?? [];
        $html .= $this->h2('Refleksi Guru');
        $html .= '<p style="margin-left:15px"><strong>Apa yang berjalan baik?</strong> ' . e($rg['berjalan_baik'] ?? '-') . '</p>';
        $html .= '<p style="margin-left:15px"><strong>Apa yang perlu diperbaiki?</strong> ' . e($rg['perlu_diperbaiki'] ?? '-') . '</p>';
        $html .= '<p style="margin-left:15px"><strong>Tindak lanjut:</strong> ' . e($rg['tindak_lanjut'] ?? '-') . '</p>';
        $rp = $c['refleksi_peserta_didik'] ?? [];
        $html .= $this->h2('Refleksi Peserta Didik');
        $html .= '<p style="margin-left:15px"><strong>Apa yang saya pelajari hari ini?</strong> ' . e($rp['dipelajari'] ?? '-') . '</p>';
        $html .= '<p style="margin-left:15px"><strong>Bagian yang paling saya sukai:</strong> ' . e($rp['disukai'] ?? '-') . '</p>';
        $html .= '<p style="margin-left:15px"><strong>Bagian yang masih sulit:</strong> ' . e($rp['sulit'] ?? '-') . '</p>';
        $html .= '<p style="margin-left:15px"><strong>Yang akan saya lakukan selanjutnya:</strong> ' . e($rp['selanjutnya'] ?? '-') . '</p>';

        // LAMPIRAN
        $lamp = $c['lampiran'] ?? [];
        if ($lamp) {
            $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">LAMPIRAN</p>';
            if (!empty($lamp['lkpd'])) {
                $lkpd = $lamp['lkpd'];
                $html .= $this->h2('LKPD');
                if (!empty($lkpd['identitas'])) {
                    $idlk = $lkpd['identitas'];
                    $html .= '<p>Nama: ' . e($idlk['nama'] ?? '') . '</p><p>Kelas: ' . e($idlk['kelas'] ?? '') . '</p><p>Tanggal: ' . e($idlk['tanggal'] ?? '') . '</p>';
                }
                $html .= '<p><strong>Petunjuk:</strong> ' . e($lkpd['petunjuk'] ?? '') . '</p>';
                $html .= '<p><strong>Tujuan:</strong> ' . e($lkpd['tujuan'] ?? '') . '</p>';
                $html .= $this->h2('Langkah Kerja') . $this->ol($lkpd['langkah_kerja'] ?? []);
                $html .= '<p><strong>Hasil:</strong> ' . e($lkpd['hasil'] ?? '') . '</p>';
            }
            $html .= '<p><strong>Bahan Bacaan Guru:</strong> ' . e($lamp['bahan_bacaan_guru'] ?? '-') . '</p>';
            $html .= '<p><strong>Bahan Bacaan Peserta Didik:</strong> ' . e($lamp['bahan_bacaan_peserta'] ?? '-') . '</p>';
            $html .= $this->tableSection('Glosarium', ['Istilah', 'Arti'], $lamp['glosarium'] ?? [], ['istilah', 'arti']);
            $html .= $this->h2('Daftar Pustaka') . $this->ol($lamp['daftar_pustaka'] ?? []);
        }

        // METADATA
        $md = $c['metadata'] ?? [];
        if ($md) {
            $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">METADATA</p><table class="info-table">';
            $map = ['Kode Modul' => 'kode_modul', 'Versi' => 'versi', 'Tanggal Dibuat' => 'tanggal_dibuat', 'Tanggal Revisi' => 'tanggal_revisi', 'Status' => 'status', 'Penulis' => 'penulis', 'Validator' => 'validator'];
            foreach ($map as $label => $key) { $html .= '<tr><td style="width:200px; font-weight:bold">' . e($label) . '</td><td>: ' . e((string)($md[$key] ?? '-')) . '</td></tr>'; }
            $html .= '</table>';
        }

        // CHECKLIST
        $cl = $c['checklist'] ?? [];
        if ($cl) {
            $html .= '<p class="bold" style="font-size:12pt; margin-top:15px">OUTPUT CHECKLIST</p>';
            foreach ($cl as $k => $v) { $html .= '<p>' . ($v ? '[x]' : '[ ]') . ' ' . e(str_replace('_', ' ', $k)) . '</p>'; }
        }

        $html .= '</div>';
        return $html;
    }

    private function h2(string $s): string { return '<p class="bold" style="margin-top:10px">' . e($s) . '</p>'; }
    private function ul(array $items): string { if (empty($items)) return ''; $h = '<ul>'; foreach ($items as $i) { $h .= '<li>' . e(is_string($i) ? $i : '') . '</li>'; } return $h . '</ul>'; }
    private function ol(array $items): string { if (empty($items)) return ''; $h = '<ol>'; foreach ($items as $i) { $h .= '<li>' . e(is_string($i) ? $i : '') . '</li>'; } return $h . '</ol>'; }
    private function table(array $headers, array $rows, array $fields): string {
        if (empty($rows)) return '';
        $h = '<table class="kisi-table"><thead><tr>';
        foreach ($headers as $th) { $h .= '<th>' . e($th) . '</th>'; }
        $h .= '</tr></thead><tbody>';
        foreach ($rows as $row) { $h .= '<tr>'; foreach ($fields as $f) { $h .= '<td>' . e((string)($row[$f] ?? '-')) . '</td>'; } $h .= '</tr>'; }
        return $h . '</tbody></table>';
    }
    private function tableSection(string $title, array $headers, array $rows, array $fields): string {
        if (empty($rows)) return '';
        return $this->h2($title) . $this->table($headers, $rows, $fields);
    }
}
