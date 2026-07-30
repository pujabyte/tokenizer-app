# Deep-Dive: Risk & Compliance Feasibility — Frakta sebagai Liquidity Provider

Dokumen ini bukan spec fitur, tapi analisis risiko/feasibility untuk satu pola yang muncul di dua spec: execution mode `manual-lp` pada Dashboard & Trading (investor) dan model settlement Partner LP API. Di kedua kasus, **Frakta bertindak sebagai counterparty** — bukan sekadar meneruskan order ke bursa/DEX eksternal seperti mode `pancake-api` atau `direct-swap`.

Catatan: bagian compliance di bawah ini **bukan nasihat hukum**. Ini daftar area risiko yang perlu direview oleh legal counsel — sejalan dengan langkah yang sudah kamu rencanakan untuk ToS/Privacy Policy.

## 1. Kenapa `manual-lp` Berbeda Secara Fundamental

Pada mode `pancake-api` dan `direct-swap`, harga dan likuiditas berasal dari pasar eksternal (PancakeSwap) — Frakta hanya jadi perantara teknis. Risiko harga sepenuhnya ada di market eksternal.

Pada mode `manual-lp`, Frakta:
- Menentukan harga secara manual (bukan dari price discovery pasar).
- Menjadi pihak yang "membeli" saat investor sell, dan "menjual" saat investor buy dari inventory Frakta sendiri.
- Menanggung selisih antara harga yang di-quote ke investor/partner dan nilai riil underlying asset.

Ini secara operasional lebih mirip **market making / dealing** daripada sekadar platform pencatat transaksi.

## 2. Risiko Finansial

| Risiko                                   | Deskripsi                                                                 |
|---------------------------------------------|-------------------------------------------------------------------------------|
| **Inventory risk**                         | Frakta perlu memegang token/underlying asset sebagai cadangan untuk settle order buy dari investor/partner. |
| **Price staleness risk**                    | Jika admin lambat update harga, investor/partner bisa exploit selisih harga manual vs harga pasar riil (arbitrage terhadap Frakta). |
| **Fat-finger risk**                         | Kesalahan input harga oleh admin/ops bisa menyebabkan kerugian besar dalam waktu singkat. |
| **Concentration risk**                      | Jika satu partner/investor melakukan order besar mendadak, eksposur Frakta terhadap satu pihak/token bisa melonjak. |
| **Aggregate exposure risk**                 | Eksposur `manual-lp` dari investor dashboard dan dari Partner LP API **berbagi risk pool yang sama** kalau underlying token sama — perlu dilihat gabungan, bukan silo per fitur (sudah dicatat di kedua spec sebelumnya). |

## 3. Area yang Perlu Direview Legal/Compliance

Ini murni daftar pertanyaan yang biasanya relevan untuk model seperti ini — jawabannya tergantung yurisdiksi dan struktur entitas Frakta, jadi perlu masuk ke proses legal review yang sama seperti ToS/Privacy Policy:

- Apakah aktivitas "menjadi counterparty untuk jual-beli token yang merepresentasikan RWA/stock" masuk kategori aktivitas yang diregulasi (mis. dealer, market maker, atau entitas yang butuh izin khusus) di yurisdiksi tempat Frakta beroperasi dan yurisdiksi tempat investor/partner berada.
- Apakah ada persyaratan modal minimum (capital adequacy) untuk entitas yang bertindak sebagai counterparty trading.
- Bagaimana representasi ke investor soal siapa yang jadi counterparty mereka saat mode `manual-lp` — apakah perlu disclosure eksplisit di ToS/order confirmation bahwa "Frakta adalah counterparty, bukan sekadar perantara"?
- Untuk Partner LP API — apakah ada kewajiban tambahan karena Frakta menanggung risiko atas nama pihak ketiga (partner) yang usernya bahkan bukan user langsung Frakta?

## 4. Guardrail Teknis yang Disarankan (untuk mitigasi, bukan pengganti legal review)

Ini murni dari sisi teknis/produk, melengkapi apa yang sudah ada di spec Dashboard & Trading dan Partner LP API:

- **Batas persentase perubahan harga per update** — mencegah fat-finger admin mengubah harga secara ekstrem dalam satu kali update (sudah disebut sebagai edge case di spec Dashboard & Trading, di sini ditegaskan sebagai guardrail wajib, bukan opsional).
- **Circuit breaker berbasis eksposur agregat** — bukan cuma threshold per-order (seperti di spec Partner LP API), tapi juga threshold total eksposur per token lintas investor + partner.
- **Reconciliation berkala antara inventory tercatat vs kebutuhan settlement** — memastikan Frakta selalu tahu berapa banyak "utang" ke investor/partner pada suatu waktu.
- **Price staleness alert** — notifikasi ke ops jika harga `manual-lp` suatu token belum diupdate melewati durasi tertentu, terutama saat volatilitas underlying asset (mis. stock) tinggi.
- **Segregasi limit per investor dan per partner**, tapi tetap teragregasi ke satu dashboard eksposur total (bukan dua sistem monitoring terpisah).

## 5. Rekomendasi

1. **Sebelum implementasi `manual-lp` di Dashboard & Trading maupun Partner LP API berjalan production**, area di Bagian 3 perlu masuk proses legal review — idealnya bareng dengan review ToS/Privacy Policy yang sudah direncanakan, karena keduanya sama-sama menunggu keputusan soal entitas hukum & yurisdiksi.
2. Guardrail teknis di Bagian 4 sebaiknya jadi **bagian wajib** dari spec `manual-lp`, bukan "nice to have" — beberapa sudah tercatat sebagai edge case di spec sebelumnya, tapi ada baiknya dinaikkan jadi functional requirement eksplisit saat spec-spec tersebut masuk fase implementasi.
3. Exposure monitoring (investor `manual-lp` + partner LP) sebaiknya dibangun sebagai **satu sistem terpusat** sejak awal, bukan ditambal belakangan — karena keduanya berbagi risk pool yang sama di level underlying token.

---

*Dokumen ini melengkapi spec Dashboard & Trading (`spec-investor-dashboard-trading.md`) dan Partner LP API (`spec-partner-lp-api.md`). Bukan pengganti legal opinion — gunakan sebagai bahan diskusi dengan legal counsel dan tim finance/risk.*
