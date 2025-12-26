export default function MenuHeader() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-bold text-2xl">CL</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Casa de Lupo</h1>
        <p className="text-sm text-gray-500 mt-1">Lezzetin Adresi</p>
      </div>
    </header>
  )
}
