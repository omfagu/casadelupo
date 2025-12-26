'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2, Trash2, ImageIcon, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (data) {
      setLogoUrl(data.logo_url)
    }
    setInitialLoading(false)
  }

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Sadece görsel dosyaları yükleyebilirsiniz' })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Logo 2MB\'dan küçük olmalıdır' })
      return
    }

    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `logo-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (uploadError) {
      setMessage({ type: 'error', text: 'Logo yüklenirken hata oluştu' })
      setLoading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    const newLogoUrl = urlData.publicUrl

    const { error: settingsError } = await supabase
      .from('settings')
      .upsert({ id: 1, logo_url: newLogoUrl })

    if (settingsError) {
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken hata oluştu' })
    } else {
      setLogoUrl(newLogoUrl)
      setMessage({ type: 'success', text: 'Logo başarıyla güncellendi' })
    }

    setLoading(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const handleRemoveLogo = async () => {
    setLoading(true)
    setMessage(null)

    const supabase = createClient()

    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, logo_url: null })

    if (error) {
      setMessage({ type: 'error', text: 'Logo kaldırılırken hata oluştu' })
    } else {
      setLogoUrl(null)
      setMessage({ type: 'success', text: 'Logo kaldırıldı' })
    }

    setLoading(false)
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-sm text-gray-500 mt-1">Restoran ayarlarını yönetin</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Restoran Logosu</h2>
        <p className="text-sm text-gray-500 mb-6">
          Bu logo menü sayfasının üst kısmında görüntülenecektir. Kare formatında bir görsel yüklemeniz önerilir.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Logo Preview with Drag & Drop */}
          <div
            onClick={() => !loading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'w-48 h-48 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200',
              isDragging
                ? 'border-[#D4A853] bg-[#D4A853]/10 scale-105'
                : logoUrl
                  ? 'border-gray-200 hover:border-[#D4A853]'
                  : 'border-gray-300 bg-gray-50 hover:border-[#D4A853]',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading ? (
              <div className="text-center text-gray-400">
                <Loader2 className="w-10 h-10 mx-auto mb-2 animate-spin" />
                <span className="text-sm">Yükleniyor...</span>
              </div>
            ) : logoUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  fill
                  className="object-contain p-2"
                />
                {isDragging && (
                  <div className="absolute inset-0 bg-[#D4A853]/80 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 animate-bounce" />
                      <span className="font-medium text-sm">Değiştir</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 p-4">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-all',
                  isDragging ? 'bg-[#D4A853]/20 text-[#D4A853]' : 'bg-gray-100'
                )}>
                  {isDragging ? (
                    <Upload className="w-7 h-7 animate-bounce" />
                  ) : (
                    <ImageIcon className="w-7 h-7" />
                  )}
                </div>
                <span className="text-sm font-medium block">
                  {isDragging ? 'Bırakın!' : 'Sürükleyin veya tıklayın'}
                </span>
                <span className="text-xs text-gray-400 mt-1 block">PNG, JPG, SVG</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {logoUrl ? 'Logo Değiştir' : 'Logo Yükle'}
                </>
              )}
            </button>

            {logoUrl && (
              <button
                onClick={handleRemoveLogo}
                disabled={loading}
                className="btn-secondary text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Logoyu Kaldır
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            <p className="text-xs text-gray-400 mt-2">
              PNG, JPG veya SVG. Maksimum 2MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
