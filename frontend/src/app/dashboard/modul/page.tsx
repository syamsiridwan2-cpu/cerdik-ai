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
        {/* I. Informasi Umum */}
        {c.informasi_umum && (
          <div className="mb-6">
            <p className="font-bold text-base text-indigo-300 mb-2">I. INFORMASI UMUM</p>
            <table className="w-full text-sm border-collapse border border-slate-600">
              <tbody>
                {[
                  ['Nama Penyusun', c.informasi_umum.nama_penyusun],
                  ['Nama Instansi', c.informasi_umum.instansi],
                  ['Tahun Penyusunan', c.informasi_umum.tahun_penyusunan],
                  ['Jenjang Sekolah', c.informasi_umum.jenjang_sekolah],
                  ['Mata Pelajaran', c.informasi_umum.mata_pelajaran],
                  ['Fase / Kelas', c.informasi_umum.fase_kelas],
                  ['Bab / Tema', c.informasi_umum.bab_tema],
                  ['Alokasi Waktu', c.informasi_umum.alokasi_waktu],
                ].map(([label, val], i) => (
                  <tr key={i} className="border-b border-slate-700">
                    <td className="py-1.5 pr-3 font-semibold text-slate-300 align-top w-1/3">{label}</td>
                    <td className="py-1.5 text-slate-200">{val || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* A. Profil Pelajar Pancasila */}
        {c.profil_pelajar_pancasila && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">A. Profil Pelajar Pancasila</p>
            <p className="text-xs text-slate-400 mb-1">pilih 2-3 dimensi yang paling relevan:</p>
            <div className="space-y-1 text-sm">
              {Array.isArray(c.profil_pelajar_pancasila.pilihan) && c.profil_pelajar_pancasila.pilihan.map((p: any, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">{p.terpilih ? '[x]' : '[ ]'}</span>
                  <div>
                    <span className="text-slate-200">{p.label}</span>
                    {p.terpilih && p.sub_elemen && <span className="text-slate-400 text-xs ml-1">— {p.sub_elemen}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* B. Sarana dan Prasarana */}
        {c.sarana_prasarana && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">B. Sarana dan Prasarana</p>
            <div className="text-sm text-slate-200 space-y-1">
              <p><span className="font-semibold text-slate-300">Media Pembelajaran:</span> {Array.isArray(c.sarana_prasarana.media_pembelajaran) ? c.sarana_prasarana.media_pembelajaran.join(', ') : c.sarana_prasarana.media_pembelajaran}</p>
              <p><span className="font-semibold text-slate-300">Sumber Belajar:</span> {Array.isArray(c.sarana_prasarana.sumber_belajar) ? c.sarana_prasarana.sumber_belajar.join(', ') : c.sarana_prasarana.sumber_belajar}</p>
            </div>
          </div>
        )}

        {/* C. Target Peserta Didik */}
        {c.target_peserta_didik && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">C. Target Peserta Didik</p>
            <div className="space-y-1 text-sm">
              <p className="text-slate-200"><span className="text-indigo-400">{c.target_peserta_didik.reguler ? '[x]' : '[ ]'}</span> Peserta didik reguler/tipikal (umum)</p>
              <p className="text-slate-200"><span className="text-indigo-400">{c.target_peserta_didik.pencapaian_tinggi ? '[x]' : '[ ]'}</span> Peserta didik dengan pencapaian tinggi</p>
              <p className="text-slate-200"><span className="text-indigo-400">{c.target_peserta_didik.kesulitan_belajar ? '[x]' : '[ ]'}</span> Peserta didik dengan kesulitan belajar</p>
            </div>
          </div>
        )}

        {/* D. Model & Metode Pembelajaran */}
        {c.model_metode && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">D. Model &amp; Metode Pembelajaran</p>
            <div className="text-sm text-slate-200 space-y-1">
              <p><span className="font-semibold text-slate-300">Model Pembelajaran:</span> {c.model_metode.model_pembelajaran || '-'}</p>
              <p><span className="font-semibold text-slate-300">Metode:</span> {Array.isArray(c.model_metode.metode) ? c.model_metode.metode.join(', ') : c.model_metode.metode}</p>
            </div>
          </div>
        )}

        {/* II. Komponen Inti */}
        <p className="font-bold text-base text-indigo-300 mb-3 mt-6">II. KOMPONEN INTI</p>

        {/* A. Capaian Pembelajaran */}
        {c.capaian_pembelajaran && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">A. Capaian Pembelajaran (CP)</p>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-serif bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">{c.capaian_pembelajaran.cp_text || ''}</pre>
          </div>
        )}

        {/* Tujuan Pembelajaran */}
        {c.tujuan_pembelajaran && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">B. Tujuan Pembelajaran</p>
            <ol className="text-sm text-slate-200 list-decimal ml-5 space-y-0.5">
              {Array.isArray(c.tujuan_pembelajaran) ? c.tujuan_pembelajaran.map((tp: any, i: number) => <li key={i}>{tp}</li>) : <li>{c.tujuan_pembelajaran}</li>}
            </ol>
          </div>
        )}

        {/* Pemahaman Bermakna */}
        {c.pemahaman_bermakna && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">C. Pemahaman Bermakna</p>
            <ul className="text-sm text-slate-200 list-disc ml-5 space-y-0.5">
              {Array.isArray(c.pemahaman_bermakna) ? c.pemahaman_bermakna.map((pb: any, i: number) => <li key={i}>{pb}</li>) : <li>{c.pemahaman_bermakna}</li>}
            </ul>
          </div>
        )}

        {/* Pertanyaan Pemantik */}
        {c.pertanyaan_pemantik && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">D. Pertanyaan Pemantik</p>
            <ul className="text-sm text-slate-200 list-disc ml-5 space-y-0.5">
              {Array.isArray(c.pertanyaan_pemantik) ? c.pertanyaan_pemantik.map((pp: any, i: number) => <li key={i}>{pp}</li>) : <li>{c.pertanyaan_pemantik}</li>}
            </ul>
          </div>
        )}

        {/* Kegiatan Pembelajaran */}
        {c.kegiatan_pembelajaran && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">E. Kegiatan Pembelajaran</p>
            {Array.isArray(c.kegiatan_pembelajaran) && c.kegiatan_pembelajaran.map((k: any, i: number) => (
              <div key={i} className="mt-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                <p className="font-medium text-sm text-indigo-300 mb-2">{k.pertemuan || `Pertemuan ${i + 1}`}</p>
                {k.pendahuluan && <div><p className="text-xs font-medium text-slate-400">Pendahuluan</p><p className="text-sm text-slate-300 whitespace-pre-line mb-2">{k.pendahuluan}</p></div>}
                {k.inti && <div><p className="text-xs font-medium text-slate-400">Kegiatan Inti</p><p className="text-sm text-slate-300 whitespace-pre-line mb-2">{k.inti}</p></div>}
                {k.penutup && <div><p className="text-xs font-medium text-slate-400">Penutup</p><p className="text-sm text-slate-300 whitespace-pre-line">{k.penutup}</p></div>}
              </div>
            ))}
          </div>
        )}

        {/* Asesmen */}
        {c.asesmen && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">F. Asesmen</p>
            <div className="text-sm text-slate-200 space-y-1">
              <p><span className="font-semibold text-slate-300">Jenis:</span> {Array.isArray(c.asesmen.jenis) ? c.asesmen.jenis.join(', ') : c.asesmen.jenis}</p>
              <p><span className="font-semibold text-slate-300">Teknik:</span> {Array.isArray(c.asesmen.teknik) ? c.asesmen.teknik.join(', ') : c.asesmen.teknik}</p>
            </div>
          </div>
        )}

        {/* Pengayaan & Remedial */}
        {c.pengayaan_remedial && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">G. Pengayaan dan Remedial</p>
            <div className="text-sm text-slate-200 space-y-1">
              {c.pengayaan_remedial.pengayaan && <p><span className="font-semibold text-slate-300">Pengayaan:</span> {c.pengayaan_remedial.pengayaan}</p>}
              {c.pengayaan_remedial.remedial && <p><span className="font-semibold text-slate-300">Remedial:</span> {c.pengayaan_remedial.remedial}</p>}
            </div>
          </div>
        )}

        {/* Refleksi */}
        {c.refleksi && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">H. Refleksi</p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {c.refleksi.guru && (
                <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
                  <p className="font-medium text-slate-300 mb-1">Refleksi Guru</p>
                  <ul className="list-disc ml-4 text-slate-300 space-y-0.5">
                    {Array.isArray(c.refleksi.guru) ? c.refleksi.guru.map((r: any, i: number) => <li key={i}>{r}</li>) : <li>{c.refleksi.guru}</li>}
                  </ul>
                </div>
              )}
              {c.refleksi.peserta_didik && (
                <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
                  <p className="font-medium text-slate-300 mb-1">Refleksi Peserta Didik</p>
                  <ul className="list-disc ml-4 text-slate-300 space-y-0.5">
                    {Array.isArray(c.refleksi.peserta_didik) ? c.refleksi.peserta_didik.map((r: any, i: number) => <li key={i}>{r}</li>) : <li>{c.refleksi.peserta_didik}</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lampiran */}
        {c.lampiran && (
          <div className="mb-4 ml-4">
            <p className="font-semibold text-sm text-indigo-300 mb-1">I. Lampiran</p>
            <div className="space-y-3 text-sm">
              {c.lampiran.lkpd && <div><p className="font-medium text-slate-300">LKPD</p><p className="text-slate-300 whitespace-pre-line">{c.lampiran.lkpd}</p></div>}
              {c.lampiran.bahan_bacaan && <div><p className="font-medium text-slate-300">Bahan Bacaan</p><p className="text-slate-300 whitespace-pre-line">{c.lampiran.bahan_bacaan}</p></div>}
              {c.lampiran.glosarium && Array.isArray(c.lampiran.glosarium) && (
                <div><p className="font-medium text-slate-300">Glosarium</p>
                  <div className="grid grid-cols-2 gap-x-4 text-slate-300">
                    {c.lampiran.glosarium.map((g: any, i: number) => <p key={i}><span className="font-medium">{g.istilah}</span>: {g.definisi || g.arti}</p>)}
                  </div>
                </div>
              )}
              {c.lampiran.daftar_pustaka && Array.isArray(c.lampiran.daftar_pustaka) && (
                <div><p className="font-medium text-slate-300">Daftar Pustaka</p>
                  <ol className="list-decimal ml-5 text-slate-300">{c.lampiran.daftar_pustaka.map((dp: any, i: number) => <li key={i}>{dp}</li>)}</ol>
                </div>
              )}
            </div>
          </div>
        )}

        <DownloadButtons id={result.id} />
      </div>
    );
  };

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
