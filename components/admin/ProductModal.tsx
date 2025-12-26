'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import type { Category, Product, ProductInsert, ProductUpdate } from '@/types/database'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  categories: Category[]
  onCreate: (data: ProductInsert, imageFile?: File) => Promise<boolean>
  onUpdate: (id: string, data: ProductUpdate, imageFile?: File) => Promise<boolean>
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  categories,
  onCreate,
  onUpdate,
}: ProductModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!product

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description || '')
      setPrice(product.price.toString())
      setCategoryId(product.category_id)
      setImagePreview(product.image_url)
    } else {
      setName('')
      setDescription('')
      setPrice('')
      setCategoryId(categories[0]?.id || '')
      setImagePreview(null)
    }
    setImageFile(null)
    setError('')
  }, [product, categories, isOpen])

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Sadece görsel dosyaları yükleyebilirsiniz')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5MB\'dan küçük olmalıdır')
      return
    }
    setError('')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Geçerli bir fiyat girin')
      setLoading(false)
      return
    }

    const data = {
      name,
      description: description || null,
      price: priceNum,
      category_id: categoryId,
      is_active: true,
      sort_order: 0,
      image_url: imagePreview,
    }

    let success = false

    if (isEditing) {
      success = await onUpdate(product.id, data, imageFile || undefined)
    } else {
      success = await onCreate(data as ProductInsert, imageFile || undefined)
    }

    setLoading(false)

    if (success) {
      onClose()
    } else {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Image Upload with Drag & Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Görsel
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'relative aspect-video rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden',
                isDragging
                  ? 'border-[#D4A853] bg-[#D4A853]/10 scale-[1.02]'
                  : imagePreview
                    ? 'border-gray-200 hover:border-[#D4A853]'
                    : 'border-gray-300 hover:border-[#D4A853] bg-gray-50'
              )}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <div className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all',
                    isDragging ? 'bg-[#D4A853]/20 text-[#D4A853]' : 'bg-gray-100'
                  )}>
                    <Upload className={cn('w-7 h-7', isDragging && 'animate-bounce')} />
                  </div>
                  <span className="text-sm font-medium">
                    {isDragging ? 'Bırakın!' : 'Sürükleyin veya tıklayın'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG (max 5MB)</span>
                </div>
              )}

              {/* Drag overlay */}
              {isDragging && imagePreview && (
                <div className="absolute inset-0 bg-[#D4A853]/80 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Upload className="w-10 h-10 mx-auto mb-2 animate-bounce" />
                    <span className="font-medium">Değiştirmek için bırakın</span>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input"
              required
            >
              {categories.length === 0 ? (
                <option value="">Önce kategori ekleyin</option>
              ) : (
                categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Adı
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Örn: Adana Kebap"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama <span className="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="Ürün hakkında kısa açıklama"
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Fiyat (₺)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="0.00"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading || categories.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : isEditing ? (
                'Güncelle'
              ) : (
                'Ekle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
