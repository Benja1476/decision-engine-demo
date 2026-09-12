# Product Decision Intelligence — Demo (Phase 2-3)

สโครงตาม MASTER PROMPT v2 §164 (Cloudflare-First / Serverless / No AI Core Decision Engine)
ตอนนี้ใช้ **DummyJSON** เป็นแหล่งข้อมูล (DEMO ONLY — §155) รอสลับเป็น product feed จริงจาก ACCESSTRADE

## โครงสร้าง

```
app/
  page.tsx                 → Category listing (Funnel §02)
  category/[slug]/page.tsx → Ranked products ในหมวด
  product/[id]/page.tsx    → Score/Confidence/Risk/Explanation
lib/
  types.ts     → Product Data Model (§08)
  scoring.ts   → Validation → Normalize → Score → Confidence → Risk (§10-§17, ไม่มี AI)
  dummyjson.ts → Data layer (สลับเป็น real feed ที่นี่จุดเดียว)
```

## รันในเครื่อง

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

## Deploy ขึ้น Cloudflare Pages

```bash
npm run pages:build
npm run pages:deploy
```

ครั้งแรกต้อง `npx wrangler login` ก่อน 1 ครั้ง

## สลับจาก DummyJSON → Product Feed จริง (ACCESSTRADE/Shopee)

แก้ที่ `lib/dummyjson.ts` (หรือสร้างไฟล์ใหม่ `lib/feed.ts` แล้วแก้ import ใน `app/*` ให้ชี้มาไฟล์ใหม่):

1. เปลี่ยน `fetchAllRawProducts()` จาก `fetch(dummyjson.com/...)` เป็น parse CSV/XML จาก feed URL ของ ACCESSTRADE
2. เปลี่ยน type `RawDummyProduct` ใน `lib/types.ts` ให้ตรงกับ column จริงในไฟล์ feed
3. `lib/scoring.ts` ไม่ต้องแก้ — รับ input ตาม field ที่ map มาแล้วเท่านั้น (แยก concern ตาม §13/§14)
4. อัปเดต `source_id` / `source_name` ใน `processProduct()` ให้ตรง Source Metadata จริง (§09)

## หมายเหตุสำคัญ

- **ห้าม** เอาโค้ดนี้ไป publish จริงโดยไม่เปลี่ยน source — ข้อมูล DummyJSON เป็น demo เท่านั้น (§155)
- Weight ใน `lib/scoring.ts` เป็นค่าตั้งต้น v1.0.0 — ต้องทบทวนตาม §14 (Explicit/Versioned/Configurable/Auditable) ก่อนใช้จริง ไม่ใช่ปล่อยไว้แบบนี้ถาวร
- `runtime = "edge"` ใน category/product page จำเป็นสำหรับ Cloudflare Pages — อย่าลบ
