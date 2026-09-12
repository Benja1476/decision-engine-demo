import { RawDummyProduct, Product } from "./types";

// ============================================================
// WEIGHT TABLE — v1.0 (Explicit / Versioned / Auditable — §14)
// ทุกครั้งที่แก้ตัวเลขด้านล่าง ต้อง bump SCORE_FORMULA_VERSION
// ============================================================
export const SCORE_FORMULA_VERSION = "1.0.0";

const WEIGHTS = {
  quality: 0.4,   // มาจาก rating
  value: 0.35,    // มาจาก discountPercentage
  availability: 0.25, // มาจาก stock
};

// --- Normalization Engine (§13) ---------------------------------

/** Min-Max normalize ให้อยู่ในช่วง 0-100 */
function minMaxNormalize(value: number, min: number, max: number): number {
  if (max === min) return 50; // ข้อมูลไม่พอแยกแยะ -> กลาง ๆ ไปก่อน ไม่เดาว่าดีหรือแย่
  const clamped = Math.min(Math.max(value, min), max);
  return ((clamped - min) / (max - min)) * 100;
}

// --- Data Validation (§10) --------------------------------------

function isValidRaw(p: RawDummyProduct): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (p.price <= 0) reasons.push("invalid_price");
  if (p.rating < 0 || p.rating > 5) reasons.push("invalid_rating");
  if (p.stock < 0) reasons.push("negative_stock");
  if (!p.title || p.title.trim().length === 0) reasons.push("missing_name");
  return { valid: reasons.length === 0, reasons };
}

// --- Data Quality Score (§11) ------------------------------------

function computeDataQuality(p: RawDummyProduct): number {
  let score = 0;
  const checks = [
    !!p.title,
    !!p.description && p.description.length > 10,
    !!p.brand,
    !!p.thumbnail,
    p.images && p.images.length > 0,
    p.rating > 0,
    p.stock >= 0,
  ];
  score = (checks.filter(Boolean).length / checks.length) * 100;
  return Math.round(score);
}

// --- Confidence Engine (§16) --------------------------------------
// พิจารณา completeness + sample size (ที่นี่ dummy ไม่มี review count จริง
// เลยใช้ data_quality + ว่ามี description/brand ยาวพอไหมแทน sample size proxy)

function computeConfidence(dataQuality: number, p: RawDummyProduct): number {
  const descLengthScore = Math.min(p.description.length / 200, 1) * 100;
  const confidence = dataQuality * 0.7 + descLengthScore * 0.3;
  return Math.round(confidence);
}

// --- Risk Engine (§17) ---------------------------------------------

function computeRisk(p: RawDummyProduct, dataQuality: number): { level: "LOW" | "MEDIUM" | "HIGH"; reasons: string[] } {
  const reasons: string[] = [];

  if (p.stock === 0) reasons.push("out_of_stock");
  if (p.stock > 0 && p.stock < 5) reasons.push("low_stock");
  if (p.rating < 2.5) reasons.push("low_rating");
  if (dataQuality < 50) reasons.push("low_data_quality");
  if (p.discountPercentage > 60) reasons.push("unusual_discount");

  let level: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (reasons.length >= 2) level = "HIGH";
  else if (reasons.length === 1) level = "MEDIUM";

  return { level, reasons };
}

// --- Product Score (§14) ---------------------------------------------

function computeProductScore(p: RawDummyProduct, categoryPrices: number[]): number {
  const qualityScore = minMaxNormalize(p.rating, 0, 5);
  const valueScore = minMaxNormalize(p.discountPercentage, 0, 50);

  const minPrice = Math.min(...categoryPrices);
  const maxPrice = Math.max(...categoryPrices);
  // ยิ่งถูกกว่าตลาดในหมวดเดียวกัน ยิ่งได้ availability/value สูง (ราคาสวนทาง normalize)
  const priceScoreInverse = 100 - minMaxNormalize(p.price, minPrice, maxPrice);
  const availabilityScore = p.stock > 0 ? Math.min((p.stock / 50) * 100, 100) : 0;

  const combinedAvailability = (availabilityScore + priceScoreInverse) / 2;

  const score =
    qualityScore * WEIGHTS.quality +
    valueScore * WEIGHTS.value +
    combinedAvailability * WEIGHTS.availability;

  return Math.round(score);
}

function stockStatus(stock: number): Product["stock_status"] {
  if (stock === 0) return "out_of_stock";
  if (stock < 5) return "low_stock";
  return "in_stock";
}

// --- Public: full pipeline for one product (IMPORT→...→SCORE, §10) ---

export function processProduct(raw: RawDummyProduct, categoryPrices: number[]): Product | null {
  const { valid } = isValidRaw(raw);
  if (!valid) return null; // ไม่ผ่าน validate -> ไม่ publish (§10, §12)

  const dataQuality = computeDataQuality(raw);
  const confidence = computeConfidence(dataQuality, raw);
  const risk = computeRisk(raw, dataQuality);
  const productScore = computeProductScore(raw, categoryPrices);

  return {
    product_id: String(raw.id),
    product_name: raw.title,
    slug: raw.title.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-"),
    brand: raw.brand ?? "ไม่ระบุแบรนด์",
    category: raw.category,
    description: raw.description,
    image_url: raw.thumbnail,

    price: raw.price,
    original_price: Math.round(raw.price / (1 - raw.discountPercentage / 100)),
    discount: raw.discountPercentage,
    currency: "USD", // DummyJSON เป็น USD demo — ของจริงต้องแปลงตาม source

    rating: raw.rating,
    stock_status: stockStatus(raw.stock),

    source_id: "dummyjson-demo",
    source_name: "DummyJSON (DEMO ONLY — §155)",
    retrieved_at: new Date().toISOString(),

    data_quality_score: dataQuality,
    product_score: productScore,
    confidence_score: confidence,
    risk_level: risk.level,
    risk_reasons: risk.reasons,
  };
}
