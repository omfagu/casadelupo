export default function MenuFooter() {
  return (
    <footer className="relative mt-12 overflow-hidden">
      {/* Top curve */}
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 0V30C240 10 480 0 720 0C960 0 1200 10 1440 30V0H0Z" fill="#FDF8F3" />
        </svg>
      </div>

      {/* Background */}
      <div className="bg-gradient-to-b from-[#8B4513] via-[#5D2E0C] to-[#3D1F08] pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Decorative element */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#D4A853]" />
            <svg className="w-8 h-8 text-[#D4A853]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
            </svg>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#D4A853]" />
          </div>

          {/* Thank you message */}
          <p className="font-display text-2xl text-white mb-2">
            Teşekkür Ederiz
          </p>
          <p className="text-[#D4A853]/80 text-sm">
            Bizi tercih ettiğiniz için
          </p>

          {/* Restaurant name */}
          <div className="mt-8 pt-8 border-t border-[#D4A853]/20">
            <p className="font-display text-xl text-[#D4A853]">
              Casa Del Lupo
            </p>
            <p className="text-white/60 text-xs mt-2 tracking-widest uppercase">
              Fine Dining Experience
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
