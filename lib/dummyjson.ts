import { RawDummyProduct, Product, CategorySummary } from "./types";
import { processProduct } from "./scoring";

const BASE_URL = "https://dummyjson.com";

export async function fetchAllRawProducts(): Promise<RawDummyProduct[]> {
  // DummyJSON: 100 limit ต่อ request ตามค่า default ปัจจุบัน — ปรับ limit/skip ถ้าจำนวนสินค้าเปลี่ยน
  const res = await fetch(`${BASE_URL}/products?limit=194`, {
    next: { revalidate: 3600 }, // ISR: rebuild ทุก 1 ชม. — แทนที่ Delta Feed cron ตอนต่อ real feed
  });
  if (!res.ok) throw new Error(`DummyJSON fetch failed: ${res.status}`);
  const data = await res.json();
  return data.products as RawDummyProduct[];
}

export async function getAllProductsProcessed(): Promise<Product[]> {
  const raw = await fetchAllRawProducts();

  // group ราคาตามหมวด เพื่อ normalize price แบบ category-relative (§13)
  const pricesByCategory: Record<string, number[]> = {};
  for (const p of raw) {
    if (!pricesByCategory[p.category]) pricesByCategory[p.category] = [];
    pricesByCategory[p.category].push(p.price);
  }

  const processed = raw
    .map((r) => processProduct(r, pricesByCategory[r.category]))
    .filter((p): p is Product => p !== null); // ตัดตัวที่ validate ไม่ผ่าน (§10/§12)

  return processed;
}

export async function getCategories(): Promise<CategorySummary[]> {
  const products = await getAllProductsProcessed();
  const counts: Record<string, number> = {};
  for (const p of products) {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([slug, product_count]) => ({
      slug,
      name: slug.replace(/-/g, " "),
      product_count,
    }))
    .sort((a, b) => b.product_count - a.product_count);
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const products = await getAllProductsProcessed();
  return products
    .filter((p) => p.category === categorySlug)
    .sort((a, b) => b.product_score - a.product_score); // RANK (§10)
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getAllProductsProcessed();
  return products.find((p) => p.product_id === id);
}
