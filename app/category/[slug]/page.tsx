import { getProductsByCategory, getCategories } from "@/lib/dummyjson";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProductsByCategory(slug);

  return (
    <>
      <h1>{slug.replace(/-/g, " ")}</h1>
      <div className="product-grid">
        {products.map((p) => (
          <a key={p.product_id} href={`/product/${p.product_id}`} className="product-card">
            <img src={p.image_url} alt={p.product_name} />
            <div className="body">
              <div className="title">{p.product_name}</div>
              <div className="price">${p.price}</div>
              <div className="score-row">
                <span className="badge score">Score {p.product_score}</span>
                <span className={`badge risk-${p.risk_level}`}>Risk {p.risk_level}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
