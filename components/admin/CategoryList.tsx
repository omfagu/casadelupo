'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Plus, Pencil, Eye, EyeOff, Trash2, Loader2, FolderOpen, GripVertical } from 'lucide-react'
import type { Category, CategoryInsert, CategoryUpdate } from '@/types/database'
import CategoryModal from './CategoryModal'
import DeleteConfirmModal from './DeleteConfirmModal'

interface CategoryListProps {
  initialCategories: Category[]
}

export default function CategoryList({ initialCategories }: CategoryListProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggleActive = async (category: Category) => {
    setLoading(category.id)
    const supabase = createClient()

    const { error } = await supabase
      .from('categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id)

    if (!error) {
      setCategories(categories.map(c =>
        c.id === category.id ? { ...c, is_active: !c.is_active } : c
      ))
    }

    setLoading(null)
  }

  const handleCreate = async (data: CategoryInsert) => {
    const supabase = createClient()

    const maxSortOrder = Math.max(...categories.map(c => c.sort_order), 0)

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({ ...data, sort_order: maxSortOrder + 1 })
      .select()
      .single()

    if (!error && newCategory) {
      setCategories([...categories, newCategory as Category])
      router.refresh()
    }

    return !error
  }

  const handleUpdate = async (id: string, data: CategoryUpdate) => {
    const supabase = createClient()

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (!error && updatedCategory) {
      setCategories(categories.map(c =>
        c.id === id ? updatedCategory as Category : c
      ))
      router.refresh()
    }

    return !error
  }

  const handleDelete = async () => {
    if (!deletingCategory) return

    const supabase = createClient()

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', deletingCategory.id)

    if (!error) {
      setCategories(categories.filter(c => c.id !== deletingCategory.id))
      router.refresh()
    }

    setDeletingCategory(null)
    setIsDeleteModalOpen(false)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category)
    setIsDeleteModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  return (
    <div>
      {/* Add Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Yeni Kategori
        </button>
      </div>

      {/* Category List */}
      {categories.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Henüz kategori yok</h3>
          <p className="text-sm text-gray-500 mb-4">Menünüzü düzenlemek için kategori ekleyin</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Kategori Ekle
          </button>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {categories.map((category) => (
            <div
              key={category.id}
              className={cn(
                'flex items-center gap-4 p-4 transition-opacity',
                !category.is_active && 'opacity-60'
              )}
            >
              <div className="text-gray-400 cursor-grab">
                <GripVertical className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {!category.is_active && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                      Pasif
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Düzenle"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleToggleActive(category)}
                  disabled={loading === category.id}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title={category.is_active ? 'Gizle' : 'Göster'}
                >
                  {loading === category.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : category.is_active ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => openDeleteModal(category)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        category={editingCategory}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Kategoriyi Sil"
        message={`"${deletingCategory?.name}" kategorisini silmek istediğinizden emin misiniz? Bu kategorideki tüm ürünler de silinecektir!`}
      />
    </div>
  )
}
