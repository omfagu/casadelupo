import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { Category, Product } from '@/types/database'

interface ProductSectionProps {
  category: Category
  products: Product[]
  isFirst?: boolean
}

export default function ProductSection({ category, products, isFirst }: ProductSectionProps) {
  return (
    <section id={`category-${category.id}`} className={isFirst ? 'pt-8' : 'pt-12'}>
      {/* Category Header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl text-[#8B4513] mb-2">
          {category.name}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#D4A853]" />
          <div className="w-2 h-2 rounded-full bg-[#D4A853]" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#D4A853]" />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="menu-card bg-white rounded-2xl border border-[#D4A853]/10 overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex">
              {/* Product Image */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 relative bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4]">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 112px, 144px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#D4A853]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                <div>
                  {/* Product Name */}
                  <h3 className="font-display text-lg sm:text-xl text-[#3D1F08] mb-1 line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="price-tag">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
