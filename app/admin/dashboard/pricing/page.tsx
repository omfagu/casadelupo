'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Percent, Search, CheckCircle, TrendingUp, TrendingDown, Package, FolderOpen, Banknote } from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'
import type { Category, Product } from '@/types/database'

type UpdateMode = 'all' | 'category' | 'search'
type UpdateType = 'increase' | 'decrease'
type ValueType = 'percentage' | 'fixed'

export default function PricingPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [mode, setMode] = useState<UpdateMode>('all')
  const [updateType, setUpdateType] = useState<UpdateType>('increase')
  const [valueType, setValueType] = useState<ValueType>('percentage')
  const [value, setValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Preview
  const [preview, setPreview] = useState<{ product: Product; newPrice: number }[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    calculatePreview()
  }, [mode, updateType, valueType, value, selectedCategory, searchQuery, products])

  const loadData = async () => {
    const supabase = createClient()

    const [categoriesRes, productsRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*').order('name'),
    ])

    setCategories(categoriesRes.data || [])
    setProducts(productsRes.data || [])
    setLoading(false)
  }

  const getAffectedProducts = (): Product[] => {
    if (mode === 'all') {
      return products
    } else if (mode === 'category' && selectedCategory) {
      return products.filter(p => p.category_id === selectedCategory)
    } else if (mode === 'search' && searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      return products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }
    return []
  }

  const calculatePreview = () => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      setPreview([])
      return
    }

    const affected = getAffectedProducts()

    const newPreview = affected.map(product => {
      let newPrice: number

      if (valueType === 'percentage') {
        const multiplier = updateType === 'increase' ? 1 + numValue / 100 : 1 - numValue / 100
        newPrice = product.price * multiplier
      } else {
        newPrice = updateType === 'increase'
          ? product.price + numValue
          : product.price - numValue
      }

      // Ensure price doesn't go below 0
      newPrice = Math.max(0, Math.round(newPrice * 100) / 100)

      return { product, newPrice }
    })

    setPreview(newPreview)
  }

  const handleUpdate = async () => {
    if (preview.length === 0) return

    setUpdating(true)
    setMessage(null)

    const supabase = createClient()

    const updates = preview.map(({ product, newPrice }) =>
      supabase
        .from('products')
        .update({ price: newPrice })
        .eq('id', product.id)
    )

    try {
      await Promise.all(updates)

      const { data } = await supabase.from('products').select('*').order('name')
      setProducts(data || [])

      setMessage({
        type: 'success',
        text: `${preview.length} ürünün fiyatı başarıyla güncellendi!`
      })

      setValue('')
      setSearchQuery('')
      setPreview([])

      router.refresh()
    } catch {
      setMessage({
        type: 'error',
        text: 'Fiyatlar güncellenirken bir hata oluştu'
      })
    }

    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Toplu Fiyat Güncelleme</h1>
        <p className="text-sm text-gray-500 mt-1">Ürün fiyatlarına toplu indirim veya zam uygulayın</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings Card */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Güncelleme Ayarları</h2>

          {/* Update Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              İşlem Türü
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUpdateType('increase')}
                className={cn(
                  'flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
                  updateType === 'increase'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Zam</span>
              </button>
              <button
                onClick={() => setUpdateType('decrease')}
                className={cn(
                  'flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
                  updateType === 'decrease'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <TrendingDown className="w-5 h-5" />
                <span className="font-medium">İndirim</span>
              </button>
            </div>
          </div>

          {/* Value Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Değer Türü
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setValueType('percentage')}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                  valueType === 'percentage'
                    ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#8B4513]'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Percent className="w-5 h-5" />
                <span className="font-medium">Yüzde (%)</span>
              </button>
              <button
                onClick={() => setValueType('fixed')}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                  valueType === 'fixed'
                    ? 'border-[#D4A853] bg-[#D4A853]/10 text-[#8B4513]'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Banknote className="w-5 h-5" />
                <span className="font-medium">Sabit (₺)</span>
              </button>
            </div>
          </div>

          {/* Value Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {valueType === 'percentage' ? 'Oran (%)' : 'Tutar (₺)'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={valueType === 'percentage' ? '100' : undefined}
                step={valueType === 'percentage' ? '0.1' : '0.01'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input pr-12"
                placeholder={valueType === 'percentage' ? '10' : '5.00'}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {valueType === 'percentage' ? (
                  <Percent className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">₺</span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {valueType === 'percentage'
                ? `Tüm seçili ürünlere %${value || '0'} ${updateType === 'increase' ? 'zam' : 'indirim'} uygulanacak`
                : `Tüm seçili ürünlere ${value || '0'} ₺ ${updateType === 'increase' ? 'eklenecek' : 'düşülecek'}`
              }
            </p>
          </div>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Uygulama Kapsamı
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setMode('all')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                  mode === 'all'
                    ? 'border-[#8B4513] bg-[#8B4513]/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Package className="w-5 h-5 text-[#8B4513]" />
                <div>
                  <div className="font-medium">Tüm Ürünler</div>
                  <div className="text-xs text-gray-500">{products.length} ürün</div>
                </div>
              </button>

              <button
                onClick={() => setMode('category')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                  mode === 'category'
                    ? 'border-[#8B4513] bg-[#8B4513]/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <FolderOpen className="w-5 h-5 text-[#8B4513]" />
                <div>
                  <div className="font-medium">Kategoriye Göre</div>
                  <div className="text-xs text-gray-500">Belirli bir kategori seçin</div>
                </div>
              </button>

              <button
                onClick={() => setMode('search')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                  mode === 'search'
                    ? 'border-[#8B4513] bg-[#8B4513]/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Search className="w-5 h-5 text-[#8B4513]" />
                <div>
                  <div className="font-medium">Arama ile Bul</div>
                  <div className="text-xs text-gray-500">Ürün adına göre ara</div>
                </div>
              </button>
            </div>
          </div>

          {/* Category Select */}
          {mode === 'category' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Seçin
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="">Kategori seçin...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({products.filter(p => p.category_id === cat.id).length} ürün)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Input */}
          {mode === 'search' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Ara
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                  placeholder="Ürün adı veya açıklama..."
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={handleUpdate}
            disabled={updating || preview.length === 0}
            className="btn-primary w-full"
          >
            {updating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Güncelleniyor...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {preview.length} Ürünü Güncelle
              </>
            )}
          </button>
        </div>

        {/* Preview Card */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Önizleme
            {preview.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({preview.length} ürün etkilenecek)
              </span>
            )}
          </h2>

          {preview.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Percent className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Önizleme için değer ve kapsam seçin</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-2">
              {preview.map(({ product, newPrice }) => {
                const diff = newPrice - product.price
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-gray-400 line-through text-sm">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-gray-400">→</span>
                      <div className="text-right">
                        <span className={cn(
                          'font-semibold block',
                          updateType === 'increase' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {formatPrice(newPrice)}
                        </span>
                        <span className={cn(
                          'text-xs',
                          updateType === 'increase' ? 'text-green-500' : 'text-red-500'
                        )}>
                          {updateType === 'increase' ? '+' : ''}{formatPrice(diff)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
