import { createClient } from '@/lib/supabase/server'
import MenuHeader from '@/components/menu/MenuHeader'
import CategoryTabs from '@/components/menu/CategoryTabs'
import ProductSection from '@/components/menu/ProductSection'
import type { Category, Product } from '@/types/database'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function MenuPage() {
  const supabase = await createClient()

  const [categoriesRes, productsRes] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  const categories = (categoriesRes.data || []) as Category[]
  const products = (productsRes.data || []) as Product[]

  // Group products by category
  const productsByCategory = categories.map(category => ({
    category,
    products: products.filter(p => p.category_id === category.id),
  })).filter(group => group.products.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader />
      <CategoryTabs categories={productsByCategory.map(g => g.category)} />

      <main className="max-w-3xl mx-auto px-4 pb-8">
        {productsByCategory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz menüde ürün bulunmuyor.</p>
          </div>
        ) : (
          productsByCategory.map(({ category, products }) => (
            <ProductSection
              key={category.id}
              category={category}
              products={products}
            />
          ))
        )}
      </main>
    </div>
  )
}
