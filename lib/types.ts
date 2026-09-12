// ตาม Product Data Model §08 ของ MASTER PROMPT v2 (เฉพาะฟิลด์ที่ demo ใช้จริง)

export interface RawDummyProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
}

export interface Product {
  product_id: string;
  product_name: string;
  slug: string;
  brand: string;
  category: string;
  description: string;
  image_url: string;

  price: number;
  original_price: number;
  discount: number;
  currency: string;

  rating: number;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";

  source_id: string;
  source_name: string;
  retrieved_at: string;

  // Engine outputs — §11, §14, §16, §17
  data_quality_score: number;
  product_score: number;
  confidence_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_reasons: string[];
}

export interface CategorySummary {
  slug: string;
  name: string;
  product_count: number;
}
