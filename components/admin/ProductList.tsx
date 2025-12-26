'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, cn } from '@/lib/utils'
import { Plus, Pencil, Eye, EyeOff, Trash2, Loader2, ImageIcon } from 'lucide-react'
import type { Category, Product, ProductInsert, ProductUpdate } from '@/types/database'
import ProductModal from './ProductModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import Image from 'next/image'

interface ProductListProps {
  initialProducts: (Product & { category: Category })[]
  categories: Category[]
}

export default function ProductList({ initialProducts, categories }: ProductListProps) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory)

  const handleToggleActive = async (product: Product) => {
    setLoading(product.id)
    const supabase = createClient()

    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    if (!error) {
      setProducts(products.map(p =>
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      ))
    }

    setLoading(null)
  }

  const handleCreate = async (data: ProductInsert, imageFile?: File) => {
    const supabase = createClient()
    let image_url = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile)

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        image_url = urlData.publicUrl
      }
    }

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({ ...data, image_url })
      .select('*, category:categories(*)')
      .single()

    if (!error && newProduct) {
      setProducts([...products, newProduct as Product & { category: Category }])
      router.refresh()
    }

    return !error
  }

  const handleUpdate = async (id: string, data: ProductUpdate, imageFile?: File) => {
    const supabase = createClient()
    let image_url = data.image_url

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile)

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        image_url = urlData.publicUrl
      }
    }

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({ ...data, image_url })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()

    if (!error && updatedProduct) {
      setProducts(products.map(p =>
        p.id === id ? updatedProduct as Product & { category: Category } : p
      ))
      router.refresh()
    }

    return !error
  }

  const handleDelete = async () => {
    if (!deletingProduct) return

    const supabase = createClient()

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', deletingProduct.id)

    if (!error) {
      setProducts(products.filter(p => p.id !== deletingProduct.id))
      router.refresh()
    }

    setDeletingProduct(null)
    setIsDeleteModalOpen(false)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product)
    setIsDeleteModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  return (
    <div>
      {/* Filters and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input max-w-xs"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Yeni Ürün
        </button>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Henüz ürün yok</h3>
          <p className="text-sm text-gray-500 mb-4">İlk ürününüzü ekleyerek başlayın</p>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Ürün Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className={cn(
                'card overflow-hidden transition-opacity',
                !product.is_active && 'opacity-60'
              )}
            >
              {/* Product Image */}
              <div className="aspect-video bg-gray-100 relative">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {!product.is_active && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                    Pasif
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="text-xs text-primary-600 font-medium mb-1">
                  {product.category?.name || 'Kategorisiz'}
                </div>
                <h3 className="font-medium text-gray-900 mb-1 truncate">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {product.description}
                  </p>
                )}
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => openEditModal(product)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Düzenle
                </button>
                <button
                  onClick={() => handleToggleActive(product)}
                  disabled={loading === product.id}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors border-l border-gray-100"
                >
                  {loading === product.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : product.is_active ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Gizle
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Göster
                    </>
                  )}
                </button>
                <button
                  onClick={() => openDeleteModal(product)}
                  className="flex items-center justify-center px-3 py-2.5 text-red-600 hover:bg-red-50 transition-colors border-l border-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={editingProduct}
        categories={categories}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Ürünü Sil"
        message={`"${deletingProduct?.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
      />
    </div>
  )
}
