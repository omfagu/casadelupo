import { createClient } from '@/lib/supabase/server'
import MenuHeader from '@/components/menu/MenuHeader'
import CategoryTabs from '@/components/menu/CategoryTabs'
import ProductSection from '@/components/menu/ProductSection'
import MenuFooter from '@/components/menu/MenuFooter'
import type { Category, Product } from '@/types/database'

export const revalidate = 60

export default async function MenuPage() {
  const supabase = await createClient()

  const [categoriesRes, productsRes, settingsRes] = await Promise.all([
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
    supabase
      .from('settings')
      .select('*')
      .single(),
  ])

  const categories = (categoriesRes.data || []) as Category[]
  const products = (productsRes.data || []) as Product[]
  const settings = settingsRes.data

  const productsByCategory = categories.map(category => ({
    category,
    products: products.filter(p => p.category_id === category.id),
  })).filter(group => group.products.length > 0)

  return (
    <div className="min-h-screen bg-[#FDF8F3] bg-pattern">
      <MenuHeader logoUrl={settings?.logo_url} />

      {productsByCategory.length > 0 && (
        <CategoryTabs categories={productsByCategory.map(g => g.category)} />
      )}

      <main className="max-w-4xl mx-auto px-4 pb-12">
        {productsByCategory.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#D4A853] to-[#8B4513] flex items-center justify-center animate-float">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-gray-800 mb-2">Menü Hazırlanıyor</h2>
            <p className="text-gray-500">Lezzetli yemeklerimiz çok yakında burada!</p>
          </div>
        ) : (
          <>
            {productsByCategory.map(({ category, products }, index) => (
              <ProductSection
                key={category.id}
                category={category}
                products={products}
                isFirst={index === 0}
              />
            ))}
          </>
        )}
      </main>

      <MenuFooter />
    </div>
  )
}
