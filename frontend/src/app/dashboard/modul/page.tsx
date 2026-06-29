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
        {/* A. Informasi Umum */}
        {c.informasi_umum && (
          <div className="mb-6">
            <p className="font-bold text-base text-indigo-300 mb-3">A. INFORMASI UMUM MODUL</p>
            <div className="text-sm space-y-1 text-slate-200 ml-4">
              {Object.entries(c.informasi_umum).map(([k, v]: any) => (
                <p key={k}><span className="font-semibold text-slate-300">{k.replace(/_/g, ' ')}</span> : {v}</p>
              ))}
            </div>
          </div>
        )}

        {/* B. Komponen Inti */}
        <p className="font-bold text-base text-indigo-300 mb-3">B. KOMPONEN INTI</p>

        {c.capaian_pembelajaran && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Capaian Pembelajaran Fase {c.capaian_pembelajaran.fase || ''}</p>
            <p className="text-sm text-slate-300 whitespace-pre-line mt-1">{c.capaian_pembelajaran.deskripsi || ''}</p>
            {c.capaian_pembelajaran.elemen && (
              <div className="mt-2">
                <p className="font-semibold text-sm text-slate-200">Elemen</p>
                <p className="text-sm text-slate-300">{c.capaian_pembelajaran.elemen}</p>
              </div>
            )}
            {c.capaian_pembelajaran.cp_berdasar_elemen && (
              <div className="mt-2">
                <p className="font-semibold text-sm text-slate-200">Capaian Pembelajaran Berdasar Elemen</p>
                <p className="text-sm text-slate-300 whitespace-pre-line">{c.capaian_pembelajaran.cp_berdasar_elemen}</p>
              </div>
            )}
          </div>
        )}

        {/* Tujuan Pembelajaran */}
        {c.tujuan_pembelajaran && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Tujuan Pembelajaran</p>
            {Array.isArray(c.tujuan_pembelajaran) ? c.tujuan_pembelajaran.map((tp: any, i: number) => (
              <p key={i} className="text-sm text-slate-300 ml-2">● {tp}</p>
            )) : <p className="text-sm text-slate-300 whitespace-pre-line">{c.tujuan_pembelajaran}</p>}
          </div>
        )}

        {/* Profil Pelajar Pancasila */}
        {c.profil_pelajar_pancasila && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Profil Pelajar Pancasila</p>
            {Array.isArray(c.profil_pelajar_pancasila.elemen) && (
              <table className="w-full text-xs mt-2 border-collapse">
                <thead><tr className="border-b border-slate-600 text-slate-400"><th className="text-left py-1 pr-2">Elemen</th><th className="text-left py-1">Sub Elemen</th></tr></thead>
                <tbody>
                  {c.profil_pelajar_pancasila.elemen.map((e: any, i: number) => (
                    <tr key={i} className="border-b border-slate-700/50">
                      <td className="py-1 pr-2 text-slate-300">{e.elemen || ''}</td>
                      <td className="py-1 text-slate-400">{e.sub_elemen || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 8 Profil Lulusan */}
        {c.profil_lulusan && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">8 Profil Lulusan</p>
            {Array.isArray(c.profil_lulusan) && c.profil_lulusan.map((pl: any, i: number) => (
              <div key={i} className="mb-2">
                <p className="text-sm text-slate-200 font-medium">{i + 1}. {pl.nama || ''}</p>
                <p className="text-sm text-slate-300 ml-4 whitespace-pre-line">{pl.deskripsi || ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* Kata Kunci */}
        {c.kata_kunci && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Kata kunci</p>
            <p className="text-sm text-slate-300">{Array.isArray(c.kata_kunci) ? c.kata_kunci.join(', ') : c.kata_kunci}</p>
          </div>
        )}

        {/* Prasyarat */}
        {c.prasyarat && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Konsep dan Keterampilan Prasyarat</p>
            <p className="text-sm text-slate-300 whitespace-pre-line">{c.prasyarat}</p>
          </div>
        )}

        {/* Target & Assesmen */}
        <div className="ml-4 mb-4 grid grid-cols-2 gap-4 text-sm">
          <div><p className="font-semibold text-slate-200">Target Peserta Didik</p><p className="text-slate-300">{c.target_peserta_didik || ''}</p></div>
          <div><p className="font-semibold text-slate-200">Jumlah Siswa</p><p className="text-slate-300">{c.jumlah_siswa || ''}</p></div>
          {c.assesmen && (
            <>
              <div><p className="font-semibold text-slate-200">Asesmen</p><p className="text-slate-300">{Array.isArray(c.assesmen.jenis) ? c.assesmen.jenis.join(', ') : ''}</p></div>
              <div><p className="font-semibold text-slate-200">Teknik</p><p className="text-slate-300">{Array.isArray(c.assesmen.teknik) ? c.assesmen.teknik.join(', ') : ''}</p></div>
            </>
          )}
        </div>

        {/* Model, Media, Materi, Sumber */}
        {c.model_pembelajaran && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Model Pembelajaran</p>
            <p className="text-sm text-slate-300 whitespace-pre-line">
              {c.model_pembelajaran.kegiatan_utama ? `Kegiatan Utama: ${c.model_pembelajaran.kegiatan_utama}` : ''}
              {c.model_pembelajaran.pengaturan ? `\nPengaturan: ${Array.isArray(c.model_pembelajaran.pengaturan) ? c.model_pembelajaran.pengaturan.join(', ') : c.model_pembelajaran.pengaturan}` : ''}
              {c.model_pembelajaran.metode ? `\nMetode: ${Array.isArray(c.model_pembelajaran.metode) ? c.model_pembelajaran.metode.join(', ') : c.model_pembelajaran.metode}` : ''}
            </p>
          </div>
        )}

        {c.media_pembelajaran && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Media Pembelajaran</p>
            <ol className="text-sm text-slate-300 list-decimal ml-5">
              {Array.isArray(c.media_pembelajaran) ? c.media_pembelajaran.map((m: any, i: number) => <li key={i}>{m}</li>) : <li>{c.media_pembelajaran}</li>}
            </ol>
          </div>
        )}

        {c.materi_pembelajaran && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Materi Pembelajaran</p>
            <ul className="text-sm text-slate-300 list-disc ml-5">
              {Array.isArray(c.materi_pembelajaran) ? c.materi_pembelajaran.map((m: any, i: number) => <li key={i}>{m}</li>) : <li>{c.materi_pembelajaran}</li>}
            </ul>
          </div>
        )}

        {c.sumber_belajar && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Sumber Belajar</p>
            {c.sumber_belajar.utama && (
              <div className="mb-2">
                <p className="text-xs text-slate-400">Sumber Utama:</p>
                <ol className="text-sm text-slate-300 list-decimal ml-5">
                  {Array.isArray(c.sumber_belajar.utama) ? c.sumber_belajar.utama.map((s: any, i: number) => <li key={i}>{s}</li>) : <li>{c.sumber_belajar.utama}</li>}
                </ol>
              </div>
            )}
            {c.sumber_belajar.alternatif && (
              <div>
                <p className="text-xs text-slate-400">Sumber Alternatif:</p>
                <ol className="text-sm text-slate-300 list-decimal ml-5">
                  {Array.isArray(c.sumber_belajar.alternatif) ? c.sumber_belajar.alternatif.map((s: any, i: number) => <li key={i}>{s}</li>) : <li>{c.sumber_belajar.alternatif}</li>}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Persiapan */}
        {c.persiapan_pembelajaran && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Persiapan Pembelajaran</p>
            <ol className="text-sm text-slate-300 list-decimal ml-5">
              {Array.isArray(c.persiapan_pembelajaran) ? c.persiapan_pembelajaran.map((p: any, i: number) => <li key={i}>{p}</li>) : <li>{c.persiapan_pembelajaran}</li>}
            </ol>
          </div>
        )}

        {/* Langkah Kegiatan */}
        {c.langkah_kegiatan && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Langkah-langkah Kegiatan Pembelajaran</p>
            {Array.isArray(c.langkah_kegiatan) && c.langkah_kegiatan.map((pk: any, i: number) => (
              <div key={i} className="mt-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                <p className="font-medium text-sm text-indigo-300 mb-2">{pk.pertemuan || `Pertemuan ${i + 1}`}</p>
                {pk.pendahuluan && <div><p className="text-xs font-medium text-slate-400">A. Pendahuluan</p><p className="text-sm text-slate-300 whitespace-pre-line mb-2">{pk.pendahuluan}</p></div>}
                {pk.inti && <div><p className="text-xs font-medium text-slate-400">B. Kegiatan Inti</p><p className="text-sm text-slate-300 whitespace-pre-line mb-2">{pk.inti}</p></div>}
                {pk.penutup && <div><p className="text-xs font-medium text-slate-400">C. Penutup</p><p className="text-sm text-slate-300 whitespace-pre-line">{pk.penutup}</p></div>}
              </div>
            ))}
          </div>
        )}

        {/* Strategi Alternatif */}
        {c.strategi_alternatif && (
          <div className="ml-4 mb-4">
            <p className="font-semibold text-sm text-slate-200">Strategi Alternatif Pembelajaran</p>
            {Array.isArray(c.strategi_alternatif) && c.strategi_alternatif.map((sa: any, i: number) => (
              <div key={i} className="mt-2">
                <p className="font-medium text-sm text-slate-200">{sa.judul || `Strategi ${i + 1}`}</p>
                <p className="text-sm text-slate-300 whitespace-pre-line">{sa.isi || ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* C. Lampiran */}
        <p className="font-bold text-base text-indigo-300 mb-3 mt-6">C. LAMPIRAN</p>

        {c.lampiran && (
          <div className="ml-4 mb-4 space-y-4">
            {c.lampiran.lkpd && (
              <div>
                <p className="font-semibold text-sm text-slate-200">Lembar Kerja Peserta Didik</p>
                <p className="text-sm text-slate-300 whitespace-pre-line">{c.lampiran.lkpd}</p>
              </div>
            )}
            {c.lampiran.bahan_bacaan && (
              <div>
                <p className="font-semibold text-sm text-slate-200">Bahan Bacaan Guru dan Peserta Didik</p>
                <p className="text-sm text-slate-300 whitespace-pre-line">{c.lampiran.bahan_bacaan}</p>
              </div>
            )}
            {c.lampiran.glosarium && (
              <div>
                <p className="font-semibold text-sm text-slate-200">Glosarium</p>
                {Array.isArray(c.lampiran.glosarium) ? (
                  <div className="grid grid-cols-2 gap-x-4 text-sm text-slate-300">
                    {c.lampiran.glosarium.map((g: any, i: number) => (
                      <p key={i}><span className="font-medium">{g.istilah || ''}</span>: {g.arti || ''}</p>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-300 whitespace-pre-line">{c.lampiran.glosarium}</p>}
              </div>
            )}
            {c.lampiran.daftar_pustaka && (
              <div>
                <p className="font-semibold text-sm text-slate-200">Daftar Pustaka</p>
                <ol className="text-sm text-slate-300 list-decimal ml-5">
                  {Array.isArray(c.lampiran.daftar_pustaka) ? c.lampiran.daftar_pustaka.map((dp: any, i: number) => <li key={i}>{dp}</li>) : <li>{c.lampiran.daftar_pustaka}</li>}
                </ol>
              </div>
            )}
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
