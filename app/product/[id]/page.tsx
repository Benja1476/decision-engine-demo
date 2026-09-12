
import { getAllProductsProcessed, getProductById } from "@/lib/dummyjson";
import { SCORE_FORMULA_VERSION } from "@/lib/scoring";

export async function generateStaticParams() {
  const products = await getAllProductsProcessed();
  return products.map((p) => ({ id: p.product_id }));
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    return <p>ไม่พบสินค้านี้ หรือข้อมูลไม่ผ่าน Validation (§10/§12)</p>;
  }

  return (
    <div className="detail-grid">
      <div>
        <img src={product.image_url} alt={product.product_name} />
      </div>

      <div>
        <h1>{product.product_name}</h1>
        <p>{product.brand} · {product.category}</p>
        <p className="price" style={{ fontSize: 22 }}>${product.price}</p>

        <div className="metric-row">
          <div className="metric">
            <div className="label">Product Score</div>
            <div className="value">{product.product_score}</div>
          </div>
          <div className="metric">
            <div className="label">Confidence</div>
            <div className="value">{product.confidence_score}</div>
          </div>
          <div className="metric">
            <div className="label">Risk</div>
            <div className="value">{product.risk_level}</div>
          </div>
          <div className="metric">
            <div className="label">Data Quality</div>
            <div className="value">{product.data_quality_score}</div>
          </div>
        </div>

        <div className="explanation">
          <strong>ทำไมได้คะแนนนี้</strong>
          <ul>
            <li>Rating จริง {product.rating}/5 (มีผลต่อ Quality Score 40%)</li>
            <li>ส่วนลด {product.discount}% (มีผลต่อ Value Score 35%)</li>
            <li>สถานะสต็อก: {product.stock_status} (มีผลต่อ Availability 25%)</li>
            {product.risk_reasons.length > 0 && (
              <li>เหตุผลความเสี่ยง: {product.risk_reasons.join(", ")}</li>
            )}
          </ul>
          <p style={{ fontSize: 12, color: "#5B6470", marginTop: 12 }}>
            Score Formula v{SCORE_FORMULA_VERSION} · Source: {product.source_name} ·
            ดึงข้อมูลเมื่อ {new Date(product.retrieved_at).toLocaleString("th-TH")}
          </p>
        </div>
      </div>
    </div>
  );
}
