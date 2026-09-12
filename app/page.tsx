import { getCategories } from "@/lib/dummyjson";

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <>
      <h1>เลือกหมวดสินค้า</h1>
      <div className="category-grid">
        {categories.map((c) => (
          <a key={c.slug} href={`/category/${c.slug}`} className="category-card">
            <div className="name">{c.name}</div>
            <div className="count">{c.product_count} สินค้า</div>
          </a>
        ))}
      </div>
    </>
  );
}
