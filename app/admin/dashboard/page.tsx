import { createClient } from '@/lib/supabase/server'
import ProductList from '@/components/admin/ProductList'
import type { Category, Product } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('sort_order', { ascending: true }),
    supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true }),
  ])

  const products = (productsRes.data || []) as (Product & { category: Category })[]
  const categories = (categoriesRes.data || []) as Category[]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
        <p className="text-sm text-gray-500 mt-1">Menüdeki ürünleri yönetin</p>
      </div>

      <ProductList initialProducts={products} categories={categories} />
    </div>
  )
}
