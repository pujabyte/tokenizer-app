---
name: sdd-spec
description: Menulis spec Spec-Driven Development (SDD) yang mendeskripsikan intent/perilaku sistem, terpisah dari implementasi teknis. Gunakan skill ini saat user minta dibuatkan spec, functional requirements, acceptance criteria, atau dokumen SDD untuk sebuah task/fitur. Trigger pada permintaan seperti "buatkan spec", "tulis SDD spec", "spec-driven development", atau "/sdd-spec".
---

# SDD Spec Writer

Skill ini menulis spec Spec-Driven Development (SDD) mengikuti model Martin Fowler: spec mendeskripsikan intent (perilaku), bukan implementasi. Functional requirements terpisah dari technical design. Spec ini project-agnostic dan tetap di level perilaku/kontrak — jangan pernah menyebut nama file, fungsi, atau framework. Grounding ke codebase dan pointer file konkret bukan tugas skill ini.

## Prinsip inti

- Acceptance criteria pakai GIVEN/WHEN/THEN — skenario yang dibingkai perilaku dan bisa diverifikasi.
- User stories membumikan spec — siapa butuh apa dan kenapa.
- Scope kecil & iteratif — satu task tercakup baik per spec.
- Living document — terstruktur untuk berkembang seiring implementasi.
- Struktur output hanya dua layer (lihat catatan "Scope yang sengaja dihilangkan" di bawah) — jangan tambahkan Endpoints, Headers, Request/Response Contracts, Config/Env, atau bagian Testing Strategy apa pun, kecuali user secara eksplisit minta ditambahkan kembali.

## Input

User memberi deskripsi task/fitur yang ingin dibuatkan spec. Boleh sertakan:

- Context (opsional): keputusan/constraint yang sudah ada, task terkait
- Focus (opsional): bagian yang diprioritaskan, misal "error handling", "flow diagram"

## Fase 1 — Pahami & Klarifikasi

1. Baca deskripsi task. Identifikasi: masalah, siapa yang terdampak, kondisi sekarang vs target.
2. Lipat masuk context dan focus jika ada.
3. Identifikasi decision fork yang benar-benar ambigu. Ajukan maksimal 2–4 pertanyaan sebelum menulis. Lewati apa pun yang sudah terjawab oleh context/focus. Fork umum yang perlu dicek: sumber data (scrape/API upstream/internal); metode auth (anonim/credentialed); strategi rate-limiting; async vs sync; perilaku gagal (silent/error webhook/4xx); batas scope (task ini vs follow-up).

Tunggu jawaban user sebelum lanjut ke Fase 2. Jangan menulis spec langsung kalau ada fork yang belum terjawab.

## Fase 2 — Tulis Spec SDD

Susun dalam dua layer yang jelas terpisah. Ikuti urutan dan nama bagian di bawah persis seperti ini.

### LAYER 1 — Functional Specification

(APA yang sistem lakukan dan untuk SIAPA — tanpa file path / nama fungsi)

- **Overview** — 2–4 kalimat: masalah, siapa terdampak, kondisi rusak/mock sekarang → target.
- **User Stories** — As a [role], I want to [action] so that [outcome]. (1–3 stories, tiap satu terlacak ke kriteria)
- **Functional Requirements** — daftar bernomor mandat perilaku; outcome yang teramati; bahasa biasa; tanpa kode. Maksimal 8 item. Contoh:
  1. Sistem harus mengembalikan respons dalam 500ms untuk request valid.
  2. Nol match dikirim sebagai empty result set, bukan error.
- **Acceptance Criteria** — GIVEN/WHEN/THEN; satu skenario terverifikasi per kriteria. Maksimal 12 skenario. Kelompokkan: Happy Path → Error Cases → Edge Cases → Infra/Config. Tiap skenario ditulis sebagai **checklist item** (`- [ ]`) agar bisa dicentang satu per satu saat verifikasi/QA — checklist ini adalah definition of done, jangan pakai heading atau paragraf bebas. Contoh:
  ```
  - [ ] GIVEN access token dan api key valid, WHEN endpoint create-token dipanggil dengan kredensial benar, THEN respons 200 dengan token, refreshToken, tokenType, expiresIn
  - [ ] GIVEN api key tidak valid, WHEN endpoint create-token dipanggil, THEN respons 401 dengan error code INVALID_API_KEY
  ```
  Larang bahasa kabur: "dengan benar", "secara tepat", "menangani error".
- **Out of Scope** — daftar eksplisit; namai tiap item yang ditunda dan follow-up mana yang menanganinya.

### LAYER 2 — Technical Design

(BAGAIMANA — arsitektur & kontrak. Level kontrak saja — tanpa file path / nama fungsi)

Lima sub-bagian berikut, tapi **Permission Model** dan **Integration Mapping** hanya ditulis jika applicable (lihat syarat masing-masing) — jangan sertakan section kosong atau dipaksakan:

- **Flow Diagram** — Mermaid `sequenceDiagram`, semua actor & hop, blok `alt` untuk tiap jalur error
- **Data Model Changes** — perubahan persistensi level konseptual (entity, fields, constraints). Tulis "No schema changes" jika tidak ada
- **Permission Model** *(applicable jika fitur punya lebih dari satu role/level akses yang perilakunya berbeda)* — tabel: Role / Aksi yang Diizinkan / Aksi yang Ditolak. Kalau fitur hanya berlaku untuk satu jenis user tanpa pembedaan akses, lewati section ini sepenuhnya (jangan tulis "N/A").
- **Integration Mapping** *(applicable jika fitur bergantung pada sistem/pihak eksternal — payment gateway, layanan pihak ketiga, dsb.)* — tabel: Sistem Eksternal / Arah Data (masuk/keluar/dua arah) / Data yang Dipertukarkan / Trigger. Tetap generik di level kontrak (mis. "Payment Gateway", bukan nama vendor final jika belum diputuskan). Kalau fitur murni internal tanpa dependensi eksternal, lewati section ini sepenuhnya.
- **Error Handling** — tabel: Scenario / HTTP Status / Error Code / Retry-safe?

### Scope yang sengaja dihilangkan

Jangan menulis bagian-bagian ini kecuali user memintanya secara eksplisit di pesan saat itu:

- Endpoint(s) / HTTP method+path
- Headers
- Request Contract
- Response Contracts
- Config / Env
- Testing Strategy (Unit / Integration / E2E / Contract — seluruh layer ini dihilangkan, bukan cuma sebagian)

Kalau user minta salah satu di atas ditambahkan untuk spec tertentu, tambahkan sebagai sub-bagian di Layer 2 dengan format tabel yang sama gaya (Field/Type/Required/dst) — tapi jangan otomatis menambahkannya tanpa diminta.

## Fase 3 — Self-Review

Verifikasi semua lolos sebelum menyajikan ke user:

- [ ] Tiap user story punya ≥1 kriteria GIVEN/WHEN/THEN
- [ ] Tiap kriteria bisa diverifikasi mandiri
- [ ] Semua Acceptance Criteria ditulis sebagai checklist item (`- [ ]`), satu GIVEN/WHEN/THEN per item, dikelompokkan per kategori (Happy Path/Error Cases/Edge Cases/Infra-Config)
- [ ] Tidak ada bahasa kabur ("dengan benar", "secara tepat")
- [ ] Layer fungsional & teknis nol file path / nama fungsi / nama framework
- [ ] Layer teknis pakai "harus"/"mengembalikan"/"menyimpan" — bukan "sebaiknya"/"mungkin"
- [ ] Out of scope menamai item yang ditunda secara eksplisit
- [ ] Tidak ada bagian Endpoints/Headers/Request-Response Contract/Config-Env/Testing Strategy kecuali diminta
- [ ] Permission Model ditulis jika dan hanya jika fitur punya ≥2 role/level akses dengan perilaku berbeda; tidak dipaksakan jika fitur single-role
- [ ] Integration Mapping ditulis jika dan hanya jika fitur bergantung pada sistem eksternal; tidak dipaksakan jika murni internal

Batas ukuran (spec verbose = mode gagal): Functional Requirements ≤8; Acceptance Criteria ≤12 skenario; total target baca 5 menit.

## Fase 4 — Output

1. Tulis spec lengkap sebagai file Markdown (gunakan nama file deskriptif, misal `spec-register-login.md`), bukan hanya ditampilkan di chat — kecuali user secara eksplisit minta ditampilkan inline saja.
2. Setelah file dibuat, tambahkan di chat:
   - Ringkasan singkat (≤8 bullet): bagian yang ditambah, keputusan kunci, pertanyaan terbuka yang ditunda ke out-of-scope
   - Pengingat: spec ini living document — perbarui saat implementasi mengungkap constraint baru; acceptance criteria adalah definition of done.
