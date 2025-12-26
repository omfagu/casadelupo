'use client'

import Image from 'next/image'

interface MenuHeaderProps {
  logoUrl?: string | null
}

export default function MenuHeader({ logoUrl }: MenuHeaderProps) {
  return (
    <header className="relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#8B4513] via-[#5D2E0C] to-[#3D1F08]" />

      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#D4A853] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A853] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-12 text-center">
        {/* Logo */}
        {logoUrl ? (
          <div className="w-28 h-28 mx-auto mb-6 relative">
            <Image
              src={logoUrl}
              alt="Casa Del Lupo"
              fill
              className="object-contain rounded-2xl"
              priority
            />
          </div>
        ) : (
          <div className="w-28 h-28 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#D4A853] to-[#B8902F] flex items-center justify-center shadow-2xl animate-float">
            <span className="text-white font-display text-4xl font-bold">CL</span>
          </div>
        )}

        {/* Restaurant Name */}
        <h1 className="font-display text-4xl md:text-5xl text-white mb-3 tracking-wide">
          Casa Del Lupo
        </h1>

        {/* Tagline */}
        <p className="text-[#D4A853] text-lg tracking-widest uppercase font-light">
          Fine Dining Experience
        </p>

        {/* Elegant divider */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#D4A853]" />
          <svg className="w-6 h-6 text-[#D4A853]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
          </svg>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#D4A853]" />
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 60V30C240 50 480 60 720 60C960 60 1200 50 1440 30V60H0Z" fill="#FDF8F3" />
        </svg>
      </div>
    </header>
  )
}
