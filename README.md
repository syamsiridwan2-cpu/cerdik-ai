# CerdikAI

Aplikasi AI untuk Guru Indonesia — Hasilkan Modul Ajar, LKPD, dan Soal otomatis. Kelola ujian online dengan fitur anti-curang.

## Fitur

- **AI Generator** — Generate Modul Ajar, LKPD, dan Soal dari PDF dengan Gemini AI
- **Ujian Online** — PIN, timer, random soal, fullscreen, deteksi pindah tab, auto-score
- **Export** — Download DOCX & PDF
- **Dashboard** — Statistik penggunaan, riwayat dokumen
- **Sistem Poin** — Kelola penggunaan AI dengan sistem poin
- **Panel Admin** — Manajemen user, paket poin, statistik

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js 15 + React 19 + Tailwind CSS 4 |
| Backend | Laravel 12 API + Sanctum |
| Database | SQLite |
| AI | Gemini API |
| PDF | Dompdf / PHPWord |
| Deploy | Vercel (FE) + Raspberry Pi 3 (BE) |

## Struktur

```
cerdik-ai/
├── backend/          # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # API Controllers
│   │   ├── Models/                  # Eloquent Models
│   │   └── Services/                # Business Logic
│   ├── database/migrations/         # Database Schema
│   └── routes/api.php               # API Routes
├── frontend/         # Next.js 15
│   └── src/
│       ├── app/                     # Pages (App Router)
│       ├── components/              # UI Components
│       └── lib/                     # Utilities
└── README.md
```

## Instalasi

### Backend

```bash
cd backend
composer install
cp .env.example .env
# Set GEMINI_API_KEY di .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL
npm run dev
```

## Deploy

- **Frontend**: Deploy ke Vercel (`vercel --prod`)
- **Backend**: Deploy ke Raspberry Pi 3 dengan Nginx + PHP-FPM + SQLite

## Lisensi

MIT License
