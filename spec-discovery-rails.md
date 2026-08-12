# Spec: Market Discovery Rails (Featured Assets, Newly Added)

## LAYER 1 — Functional Specification

### Overview

Investor yang membuka halaman discovery saat ini harus menyisir seluruh katalog aset secara manual untuk menemukan mana yang sedang bergerak atau baru terdaftar. Spec ini mendefinisikan dua rail ringkasan yang dihitung otomatis dari data pasar internal: **Featured Assets** (berdasarkan volume transaksi 24 jam tertinggi) dan **Newly Added** (aset yang paling baru terdaftar). Keduanya tampil sebagai rail ringkas di halaman discovery, memberi investor sinyal cepat tanpa harus membuka setiap aset satu per satu.

> Revisi: rail toggle **Top Gainers/Top Losers** yang sebelumnya ada di spec ini sudah dihapus dari implementasi dan didescope — lihat Out of Scope.

### User Stories

1. As an investor, I want to see which assets have the highest recent trading activity, so that I can find markets with real momentum.
2. As an investor, I want to see the most recently listed assets, so that I can discover new opportunities as soon as they become available.

### Functional Requirements

1. Sistem harus menghitung ranking Featured Assets berdasarkan volume transaksi 24 jam terakhir tiap aset yang sudah tradable, diurutkan dari volume tertinggi.
2. Sistem harus mengecualikan aset yang belum tradable (belum punya harga) dari ranking Featured Assets.
3. Sistem harus menampilkan daftar Newly Added berdasarkan tanggal aset mulai terdaftar di platform, diurutkan dari yang paling baru, termasuk aset yang belum tradable.
4. Sistem harus membatasi setiap rail menampilkan sejumlah item tetap, bukan seluruh katalog aset.
5. Sistem harus memperbarui data ranking pada interval tertentu sehingga investor melihat data yang relatif terkini tanpa perlu me-refresh manual.
6. Sistem harus mengarahkan investor ke halaman detail aset ketika salah satu item pada rail manapun diklik.

### Acceptance Criteria

**Happy Path**
- [ ] GIVEN terdapat aset-aset tradable dengan volume transaksi 24 jam berbeda-beda, WHEN investor membuka rail "Featured Assets", THEN sistem menampilkan aset-aset tersebut diurutkan dari volume tertinggi ke terendah.
- [ ] GIVEN terdapat aset yang baru terdaftar di platform, WHEN investor membuka rail "Newly Added", THEN sistem menampilkan aset-aset tersebut diurutkan dari yang paling baru terdaftar.
- [ ] GIVEN investor melihat salah satu item pada rail Featured Assets atau Newly Added, WHEN investor menekan item tersebut, THEN sistem membuka halaman detail aset yang bersangkutan.

**Error Cases**
- [ ] GIVEN data pasar untuk menghitung ranking gagal diambil, WHEN investor membuka halaman yang menampilkan rail-rail ini, THEN sistem menampilkan status gagal memuat pada rail yang terdampak beserta opsi untuk mencoba lagi, tanpa menampilkan data ranking yang salah atau usang secara diam-diam.

**Edge Cases**
- [ ] GIVEN tidak ada aset tradable yang memenuhi syarat Featured Assets, WHEN investor membuka rail "Featured Assets", THEN sistem menampilkan status kosong yang menjelaskan belum ada aset yang memenuhi syarat, bukan daftar kosong tanpa penjelasan.
- [ ] GIVEN sebuah aset belum tradable, WHEN ranking Featured Assets dihitung, THEN aset tersebut tidak muncul pada ranking Featured Assets.
- [ ] GIVEN dua atau lebih aset memiliki volume yang identik, WHEN ranking dihitung, THEN sistem menghasilkan urutan yang konsisten pada setiap pemuatan data yang sama, bukan urutan acak.
- [ ] GIVEN jumlah aset yang memenuhi syarat suatu rail lebih sedikit dari batas tampilan rail tersebut, WHEN rail tersebut ditampilkan, THEN sistem menampilkan sejumlah aset yang tersedia tanpa mengisi slot kosong dengan data placeholder.

**Infra/Config**
- [ ] GIVEN interval pembaruan data ranking telah terlewati, WHEN investor tetap berada di halaman yang menampilkan rail-rail ini, THEN sistem memperbarui data ranking tanpa mengharuskan investor memuat ulang halaman secara manual.

### Out of Scope

- Rail Top Gainers/Top Losers (toggle berdasarkan persentase perubahan harga 24 jam) — didescope dari implementasi; bisa dikembalikan sebagai rail terpisah bila ada kebutuhan bisnis kuat lagi.
- Personalisasi rail berdasarkan preferensi/riwayat investor individu (misal "Recommended for you") — follow-up spec terpisah.
- Filter kategori aset pada masing-masing rail (misal Featured Assets khusus RWA saja) — follow-up bila dibutuhkan.
- Rail atau ranking berbasis timeframe selain 24 jam (misal 7 hari, 30 hari) — follow-up spec terpisah.
- Definisi/perhitungan detail metrik volume transaksi itu sendiri (sumber data on-chain vs off-chain) — didefinisikan oleh spec data pasar yang mendasarinya, bukan spec ini.
- Push notification atau alert ketika ranking suatu aset berubah signifikan — follow-up bila dibutuhkan.

---

## LAYER 2 — Technical Design

### Flow Diagram

```mermaid
sequenceDiagram
    participant Investor
    participant Discovery as Discovery Page
    participant Rails as Discovery Rails Service
    participant MarketData as Internal Market Data

    Investor->>Discovery: Buka halaman discovery
    Discovery->>Rails: Minta data Featured Assets, Newly Added
    Rails->>MarketData: Ambil volume 24h, tanggal listing per aset

    alt Data pasar berhasil diambil
        Rails->>Rails: Kecualikan aset belum tradable dari Featured Assets
        Rails->>Rails: Urutkan & batasi setiap rail ke jumlah item tetap
        Rails-->>Discovery: Kirim dua rail hasil ranking
        Discovery-->>Investor: Tampilkan Featured Assets, Newly Added

        alt Rail tidak punya aset yang memenuhi syarat
            Discovery-->>Investor: Tampilkan status kosong pada rail tersebut
        end
    else Data pasar gagal diambil
        Rails-->>Discovery: Error data pasar tidak tersedia
        Discovery-->>Investor: Tampilkan status gagal memuat + opsi coba lagi pada rail terdampak
    end

    Investor->>Discovery: Tekan salah satu item rail
    Discovery-->>Investor: Buka halaman detail aset terkait

    loop Setiap interval pembaruan
        Discovery->>Rails: Minta ulang data ranking
        Rails->>MarketData: Ambil data terbaru
        Rails-->>Discovery: Kirim data ranking terbaru
        Discovery-->>Investor: Perbarui tampilan rail tanpa reload manual
    end
```

### Data Model Changes

- **Asset** (entitas yang sudah ada): memerlukan atribut berikut agar ranking dapat dihitung.
  - `tradable` (boolean) — menandai apakah aset sudah memiliki harga aktif; menjadi syarat eligibilitas untuk Featured Assets.
  - `volume24h` (nullable bila belum tradable) — dasar perhitungan ranking Featured Assets.
  - `listedAt` (timestamp) — dasar pengurutan Newly Added.
- Tidak ada entitas persistensi baru — ranking dihitung (derived), bukan disimpan sebagai record tersendiri.

### Error Handling

| Scenario | HTTP Status | Error Code | Retry-safe? |
|---|---|---|---|
| Data pasar untuk menghitung ranking gagal diambil | 503 | `MARKET_DATA_UNAVAILABLE` | Yes |
| Permintaan data rail melebihi batas waktu | 504 | `RAIL_DATA_TIMEOUT` | Yes |
