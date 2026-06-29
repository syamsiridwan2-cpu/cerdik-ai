'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import DownloadButtons from '@/components/shared/DownloadButtons';

export default function GenerateModulPage() {
  const [form, setForm] = useState({ mapel: '', materi: '', kelas: '3', semester: '2', alokasi_waktu: '36 JP', nama_penyusun: '', instansi: '', tahun_pelajaran: '', fase: '' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/ai/generate-modul', form);
      setResult(res.data.data);
      toast.success('Modul ajar berhasil dibuat!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal generating modul');
    } finally { setLoading(false); }
  };

  const renderSection = (label: string, content: any) => {
    if (!content) return null;
    if (typeof content === 'string') return <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{content}</p>;
    if (Array.isArray(content)) {
      if (content.length > 0 && typeof content[0] === 'object') {
        return content.map((item: any, i: number) => (
          <div key={i} className="mb-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
            {item.nama && <p className="text-sm font-medium text-indigo-300 mb-1">{item.nama}</p>}
            {item.deskripsi && <p className="text-xs text-slate-400 whitespace-pre-line">{item.deskripsi}</p>}
            {item.elemen && <p className="text-xs text-slate-400 whitespace-pre-line">{item.elemen}: {item.sub_elemen || ''}</p>}
            {item.pertanyaan && <p className="text-xs text-slate-300">{item.nomor || ''}. {item.pertanyaan}</p>}
          </div>
        ));
      }
      return (
        <ul className="list-disc list-inside text-sm text-slate-300 space-y-0.5">
          {content.map((item: any, i: number) => <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}
        </ul>
      );
    }
    if (typeof content === 'object' && content !== null) {
      return Object.entries(content).map(([k, v]: any) => (
        <div key={k} className="mb-2">
          <p className="text-xs font-medium text-slate-400 capitalize">{k.replace(/_/g, ' ')}</p>
          {renderSection(k, v)}
        </div>
      ));
    }
    return <p className="text-sm text-slate-300">{String(content)}</p>;
  };

  const renderModul = () => {
    const c = result?.content;
    if (!c) return null;
    return (
      <div className="text-white" style={{ fontFamily: "'Times New Roman', serif", fontSize: '12pt', lineHeight: '1.6' }}>
        {/* IDENTITAS MODUL */}
        <p className="font-bold text-lg text-indigo-300 mb-3">IDENTITAS MODUL</p>
        <table className="w-full text-sm border-collapse border border-slate-600 mb-6">
          <tbody>
            {[
              ['Nama Sekolah', c.identitas?.nama_sekolah],
              ['Tahun Pelajaran', c.identitas?.tahun_pelajaran],
              ['Semester', c.identitas?.semester],
              ['Fase', c.identitas?.fase],
              ['Kelas', c.identitas?.kelas],
              ['Mata Pelajaran', c.identitas?.mata_pelajaran],
              ['Bab/Topik', c.identitas?.bab_topik],
              ['Alokasi Waktu', c.identitas?.alokasi_waktu],
              ['Penyusun', c.identitas?.penyusun],
            ].map(([label, val], i) => (
              <tr key={i} className="border-b border-slate-700">
                <td className="py-1 pr-3 font-semibold text-slate-300 w-1/3">{label}</td>
                <td className="py-1 text-slate-200">{val || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* INFORMASI UMUM */}
        <p className="font-bold text-lg text-indigo-300 mb-3">INFORMASI UMUM</p>

        {renderSub('Capaian Pembelajaran (CP)', c.cp, 'pre')}
        {renderSub('Tujuan Pembelajaran (TP)', c.tp, 'list')}
        {renderSub('Indikator Ketercapaian', c.indikator_ketercapaian, 'list')}
        {renderSub('Profil Lulusan', c.profil_lulusan, 'list')}
        {renderSub('Dimensi Profil Pelajar Pancasila', c.dimensi_ppp, 'list')}
        {renderSub('Kompetensi Awal', c.kompetensi_awal, 'text')}
        {renderSub('Sarana dan Prasarana', c.sarana_prasarana, 'list')}
        {renderSub('Target Peserta Didik', c.target_peserta_didik, 'text')}
        {renderSub('Model Pembelajaran', c.model_pembelajaran, 'text')}
        {renderSub('Pendekatan', c.pendekatan, 'text')}
        {renderSub('Metode', c.metode, 'list')}

        {/* MATERI PEMBELAJARAN */}
        <p className="font-bold text-lg text-indigo-300 mb-3 mt-6">MATERI PEMBELAJARAN</p>
        {renderSub('Materi Inti', c.materi_inti, 'text')}
        {renderSub('Materi Pendukung', c.materi_pendukung, 'text')}
        {c.istilah_penting && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">Istilah Penting</p>
            <table className="w-full text-sm border-collapse border border-slate-600">
              <thead><tr className="bg-slate-700/50 text-slate-300"><th className="border border-slate-600 px-2 py-1 text-left">Istilah</th><th className="border border-slate-600 px-2 py-1 text-left">Penjelasan</th></tr></thead>
              <tbody>{(Array.isArray(c.istilah_penting) ? c.istilah_penting : []).map((i: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-700"><td className="border border-slate-700 px-2 py-1 text-slate-300">{i.istilah}</td><td className="border border-slate-700 px-2 py-1 text-slate-300">{i.penjelasan}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* PEMAHAMAN BERMAKNA */}
        <p className="font-bold text-lg text-indigo-300 mb-3 mt-6">PEMAHAMAN BERMAKNA</p>
        {renderSub(null, c.pemahaman_bermakna, 'list')}

        {/* PERTANYAAN PEMANTIK */}
        <p className="font-bold text-lg text-indigo-300 mb-3 mt-6">PERTANYAAN PEMANTIK</p>
        {renderSub(null, c.pertanyaan_pemantik, 'list')}

        {/* KEGIATAN PEMBELAJARAN */}
        <p className="font-bold text-lg text-indigo-300 mb-3 mt-6">KEGIATAN PEMBELAJARAN</p>
        {Array.isArray(c.kegiatan_pembelajaran) && c.kegiatan_pembelajaran.map((k: any, i: number) => (
          <div key={i} className="mb-6 ml-4">
            <p className="font-semibold text-base text-indigo-300 mb-2">{k.pertemuan || `Pertemuan ${i + 1}`}</p>
            {k.pendahuluan && <div className="mb-3"><p className="font-semibold text-sm text-slate-300">Pendahuluan</p><p className="text-sm text-slate-300 whitespace-pre-line">{k.pendahuluan}</p></div>}
            {k.inti && <div className="mb-3"><p className="font-semibold text-sm text-slate-300">Kegiatan Inti</p><p className="text-sm text-slate-300 whitespace-pre-line">{k.inti}</p></div>}
            {k.penutup && <div><p className="font-semibold text-sm text-slate-300">Penutup</p><p className="text-sm text-slate-300 whitespace-pre-line">{k.penutup}</p></div>}
          </div>
        ))}

        {/* ASESMEN */}
        <p className="font-bold text-lg text-indigo-300 mb-3 mt-6">ASESMEN</p>
        <div className="ml-4 space-y-3">
          {c.asesmen_diagnostik && <div><p className="font-semibold text-sm text-indigo-300">Asesmen Diagnostik</p><p className="text-sm text-slate-400 ml-2">Kognitif: {c.asesmen_diagnostik.kognitif || '-'}</p><p className="text-sm text-slate-400 ml-2">Non-Kognitif: {c.asesmen_diagnostik.non_kognitif || '-'}</p></div>}
          {c.asesmen_formatif && <div><p className="font-semibold text-sm text-indigo-300">Asesmen Formatif</p><p className="text-sm text-slate-400 ml-2">Teknik: {c.asesmen_formatif.teknik || '-'}</p><p className="text-sm text-slate-400 ml-2">Instrumen: {c.asesmen_formatif.instrumen || '-'}</p><p className="text-sm text-slate-400 ml-2">Rubrik: {c.asesmen_formatif.rubrik || '-'}</p></div>}
          {c.asesmen_sumatif && <div><p className="font-semibold text-sm text-indigo-300">Asesmen Sumatif</p><p className="text-sm text-slate-400 ml-2">Bentuk: {c.asesmen_sumatif.bentuk || '-'}</p><p className="text-sm text-slate-400 ml-2">Instrumen: {c.asesmen_sumatif.instrumen || '-'}</p><p className="text-sm text-slate-400 ml-2">Rubrik: {c.asesmen_sumatif.rubrik || '-'}</p></div>}
        </div>

        {/* RUBRIK PENILAIAN */}
        {c.rubrik_penilaian && (
          <div className="mb-4 mt-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">Rubrik Penilaian</p>
            <table className="w-full text-xs border-collapse border border-slate-600">
              <thead><tr className="bg-slate-700/50 text-slate-300"><th className="border border-slate-600 px-2 py-1">Aspek</th><th className="border border-slate-600 px-2 py-1">Sangat Baik</th><th className="border border-slate-600 px-2 py-1">Baik</th><th className="border border-slate-600 px-2 py-1">Cukup</th><th className="border border-slate-600 px-2 py-1">Perlu Bimbingan</th></tr></thead>
              <tbody>{(Array.isArray(c.rubrik_penilaian) ? c.rubrik_penilaian : []).map((r: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-700"><td className="border border-slate-700 px-2 py-1 text-slate-300">{r.aspek}</td><td className="border border-slate-700 px-2 py-1 text-slate-400">{r.sangat_baik}</td><td className="border border-slate-700 px-2 py-1 text-slate-400">{r.baik}</td><td className="border border-slate-700 px-2 py-1 text-slate-400">{r.cukup}</td><td className="border border-slate-700 px-2 py-1 text-slate-400">{r.perlu_bimbingan}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* PENILAIAN SIKAP / PENGETAHUAN / KETERAMPILAN */}
        {renderTable('Penilaian Sikap', ['Aspek', 'Kriteria', 'Catatan'], c.penilaian_sikap, ['aspek', 'kriteria', 'catatan'])}
        {renderTable('Penilaian Pengetahuan', ['No', 'Indikator', 'Bentuk Soal', 'Skor'], c.penilaian_pengetahuan, ['no', 'indikator', 'bentuk_soal', 'skor'])}
        {renderTable('Penilaian Keterampilan', ['Aspek', 'Indikator', 'Skor Maksimal'], c.penilaian_keterampilan, ['aspek', 'indikator', 'skor_maksimal'])}

        {/* PENGAYAAN & REMEDIAL */}
        {renderSub('Pengayaan', c.pengayaan, 'text')}
        {renderSub('Remedial', c.remedial, 'text')}

        {/* REFLEKSI */}
        <p className="font-bold text-lg text-indigo-300 mb-3 mt-6">REFLEKSI</p>
        {c.refleksi_guru && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-indigo-300">Refleksi Guru</p>
            <p className="text-sm text-slate-400 ml-2"><span className="text-slate-300">Apa yang berjalan baik?</span> {c.refleksi_guru.berjalan_baik}</p>
            <p className="text-sm text-slate-400 ml-2"><span className="text-slate-300">Apa yang perlu diperbaiki?</span> {c.refleksi_guru.perlu_diperbaiki}</p>
            <p className="text-sm text-slate-400 ml-2"><span className="text-slate-300">Tindak lanjut:</span> {c.refleksi_guru.tindak_lanjut}</p>
          </div>
        )}
        {c.refleksi_peserta_didik && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-indigo-300">Refleksi Peserta Didik</p>
            <p className="text-sm text-slate-400 ml-2"><span className="text-slate-300">Apa yang saya pelajari hari ini?</span> {c.refleksi_peserta_didik.dipelajari}</p>
            <p className="text-sm text-slate-400 ml-2"><span className="text-slate-300">Bagian yang paling saya sukai:</span> {c.refleksi_peserta_didik.disukai}</p>
            <p className="text-sm text-slate-400 ml-2"><span className="text-slate-300">Bagian yang masih sulit:</span> {c.refleksi_peserta_didik.sulit}</p>
            <p className="text-sm text-slate-400 ml-2"><span className="text-slate-300">Yang akan saya lakukan selanjutnya:</span> {c.refleksi_peserta_didik.selanjutnya}</p>
          </div>
        )}

        {/* LAMPIRAN */}
        <p className="font-bold text-lg text-indigo-300 mb-3 mt-6">LAMPIRAN</p>
        {c.lampiran?.lkpd && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">LKPD</p>
            {c.lampiran.lkpd.identitas && (
              <div className="text-sm text-slate-400 ml-2 mb-2">
                <p>Nama: {c.lampiran.lkpd.identitas.nama || ''}</p>
                <p>Kelas: {c.lampiran.lkpd.identitas.kelas || ''}</p>
                <p>Tanggal: {c.lampiran.lkpd.identitas.tanggal || ''}</p>
              </div>
            )}
            {renderSub('Petunjuk', c.lampiran.lkpd.petunjuk, 'text')}
            {renderSub('Tujuan', c.lampiran.lkpd.tujuan, 'text')}
            {renderSub('Langkah Kerja', c.lampiran.lkpd.langkah_kerja, 'list')}
            {renderSub('Hasil', c.lampiran.lkpd.hasil, 'text')}
          </div>
        )}
        {renderSub('Bahan Bacaan Guru', c.lampiran?.bahan_bacaan_guru, 'text')}
        {renderSub('Bahan Bacaan Peserta Didik', c.lampiran?.bahan_bacaan_peserta, 'text')}
        {c.lampiran?.glosarium && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">Glosarium</p>
            <table className="w-full text-sm border-collapse border border-slate-600">
              <thead><tr className="bg-slate-700/50 text-slate-300"><th className="border border-slate-600 px-2 py-1 text-left">Istilah</th><th className="border border-slate-600 px-2 py-1 text-left">Arti</th></tr></thead>
              <tbody>{(Array.isArray(c.lampiran.glosarium) ? c.lampiran.glosarium : []).map((g: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-700"><td className="border border-slate-700 px-2 py-1 text-slate-300">{g.istilah}</td><td className="border border-slate-700 px-2 py-1 text-slate-400">{g.arti}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {renderSub('Daftar Pustaka', c.lampiran?.daftar_pustaka, 'list')}

        {/* METADATA */}
        {c.metadata && (
          <>
            <p className="font-bold text-lg text-indigo-300 mb-3 mt-6">METADATA</p>
            <table className="w-full text-sm border-collapse border border-slate-600 mb-4 ml-4" style={{width: 'calc(100% - 1rem)'}}>
              <tbody>
                {[['Kode Modul', c.metadata.kode_modul], ['Versi', c.metadata.versi], ['Tanggal Dibuat', c.metadata.tanggal_dibuat], ['Tanggal Revisi', c.metadata.tanggal_revisi], ['Status', c.metadata.status], ['Penulis', c.metadata.penulis], ['Validator', c.metadata.validator]].map(([label, val], i) => (
                  <tr key={i} className="border-b border-slate-700"><td className="py-1 pr-3 font-semibold text-slate-300 w-1/3">{label}</td><td className="py-1 text-slate-200">{val || '-'}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* CHECKLIST */}
        {c.checklist && (
          <>
            <p className="font-bold text-lg text-indigo-300 mb-3 mt-6">OUTPUT CHECKLIST</p>
            <div className="ml-4 space-y-1 text-sm">
              {Object.entries(c.checklist).map(([k, v]: any) => (
                <p key={k} className="text-slate-300"><span className="text-indigo-400">{v ? '[x]' : '[ ]'}</span> {k.replace(/_/g, ' ')}</p>
              ))}
            </div>
          </>
        )}

        <DownloadButtons id={result.id} />
      </div>
    );
  };

  function renderSub(label: string | null, val: any, type: 'text' | 'list' | 'pre') {
    if (!val) return null;
    if (type === 'text') return <div className="mb-3 ml-4">{label && <p className="font-semibold text-sm text-indigo-300 mb-1">{label}</p>}<p className="text-sm text-slate-300 whitespace-pre-line ml-2">{val}</p></div>;
    if (type === 'pre') return <div className="mb-3 ml-4">{label && <p className="font-semibold text-sm text-indigo-300 mb-1">{label}</p>}<pre className="text-sm text-slate-300 whitespace-pre-wrap font-serif bg-slate-900/30 p-3 rounded-lg border border-slate-700/30 ml-2">{val}</pre></div>;
    if (type === 'list') {
      const items = Array.isArray(val) ? val : [val];
      return <div className="mb-3 ml-4">{label && <p className="font-semibold text-sm text-indigo-300 mb-1">{label}</p>}<ul className="text-sm text-slate-300 list-disc ml-6 space-y-0.5">{items.map((item: any, i: number) => <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}</ul></div>;
    }
    return null;
  }

  function renderTable(label: string, headers: string[], data: any, fields: string[]) {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    return (
      <div className="mb-4 mt-4 ml-4">
        <p className="font-semibold text-sm text-indigo-300 mb-1">{label}</p>
        <table className="w-full text-xs border-collapse border border-slate-600">
          <thead><tr className="bg-slate-700/50 text-slate-300">{headers.map((h, i) => <th key={i} className="border border-slate-600 px-2 py-1">{h}</th>)}</tr></thead>
          <tbody>{data.map((row: any, idx: number) => <tr key={idx} className="border-b border-slate-700">{fields.map((f, j) => <td key={j} className="border border-slate-700 px-2 py-1 text-slate-300">{row[f] ?? '-'}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Generate Modul Ajar</h1>
        <p className="text-slate-400 text-sm mt-1">Buat modul ajar Kurikulum Merdeka format lengkap</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 space-y-4 h-fit">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Mata Pelajaran</label>
            <input type="text" value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} required placeholder="Matematika"
              className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Materi</label>
            <textarea value={form.materi} onChange={(e) => setForm({ ...form, materi: e.target.value })} required rows={3} placeholder="Sistem Persamaan Linear Dua Variabel"
              className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Kelas</label>
              <select value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((k) => <option key={k} value={k}>Kelas {k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Semester</label>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>

          <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors">
            <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span> Info Tambahan (opsional)
          </button>

          {showAdvanced && (
            <div className="space-y-3 animate-fade-in border-t border-slate-700 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Alokasi Waktu</label>
                  <input type="text" value={form.alokasi_waktu} onChange={(e) => setForm({ ...form, alokasi_waktu: e.target.value })} placeholder="36 JP"
                    className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Fase</label>
                  <input type="text" value={form.fase} onChange={(e) => setForm({ ...form, fase: e.target.value })} placeholder="B"
                    className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nama Penyusun</label>
                  <input type="text" value={form.nama_penyusun} onChange={(e) => setForm({ ...form, nama_penyusun: e.target.value })} placeholder="Nama Guru"
                    className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Instansi</label>
                  <input type="text" value={form.instansi} onChange={(e) => setForm({ ...form, instansi: e.target.value })} placeholder="SDN ..."
                    className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tahun Pelajaran</label>
                <input type="text" value={form.tahun_pelajaran} onChange={(e) => setForm({ ...form, tahun_pelajaran: e.target.value })} placeholder="2025/2026"
                  className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg shadow-indigo-600/10">
            {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Memproses...</span> : 'Generate Modul Ajar'}
          </button>
        </form>

        <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Hasil</h2>
          {loading && <LoadingState />}
          {!loading && !result && <EmptyState />}
          {result && (
            <div className="max-h-[600px] overflow-y-auto custom-scroll">
              {renderModul()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <p className="text-sm">AI sedang menulis modul ajar...</p>
      <p className="text-xs text-slate-600 mt-1">Biasanya memakan waktu 60-120 detik</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-600">
      <div className="text-4xl mb-3">📖</div>
      <p className="text-sm text-slate-500">Isi form dan klik Generate</p>
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}
