import { createClient } from '@/lib/supabase/server'
import CategoryList from '@/components/admin/CategoryList'
import type { Category } from '@/types/database'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
        <p className="text-sm text-gray-500 mt-1">Menü kategorilerini yönetin</p>
      </div>

      <CategoryList initialCategories={(categories || []) as Category[]} />
    </div>
  )
}
