'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Category, CategoryInsert, CategoryUpdate } from '@/types/database'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  onCreate: (data: CategoryInsert) => Promise<boolean>
  onUpdate: (id: string, data: CategoryUpdate) => Promise<boolean>
}

export default function CategoryModal({
  isOpen,
  onClose,
  category,
  onCreate,
  onUpdate,
}: CategoryModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!category

  useEffect(() => {
    if (category) {
      setName(category.name)
    } else {
      setName('')
    }
    setError('')
  }, [category, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = {
      name: name.trim(),
      is_active: true,
      sort_order: 0,
    }

    let success = false

    if (isEditing) {
      success = await onUpdate(category.id, { name: data.name })
    } else {
      success = await onCreate(data)
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

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori Adı
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Örn: Kebaplar"
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
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
              disabled={loading}
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
