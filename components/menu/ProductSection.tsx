import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { Category, Product } from '@/types/database'
import { ImageIcon } from 'lucide-react'

interface ProductSectionProps {
  category: Category
  products: Product[]
}

export default function ProductSection({ category, products }: ProductSectionProps) {
  return (
    <section id={`category-${category.id}`} className="pt-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 sticky top-[60px] bg-gray-50 py-2 z-10">
        {category.name}
      </h2>

      <div className="space-y-3">
        {products.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex"
          >
            {/* Product Image */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 relative bg-gray-100">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, 128px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
              <div>
                <h3 className="font-medium text-gray-900 truncate">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
