'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

interface CategoryTabsProps {
  categories: Category[]
}

export default function CategoryTabs({ categories }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories[0]?.id || null
  )
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map(cat => ({
        id: cat.id,
        element: document.getElementById(`category-${cat.id}`),
      }))

      const scrollPosition = window.scrollY + 180

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.element) {
          const offsetTop = section.element.offsetTop
          if (scrollPosition >= offsetTop) {
            setActiveCategory(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [categories])

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tabsContainer = tabsRef.current
      const activeTab = activeTabRef.current
      const containerWidth = tabsContainer.offsetWidth
      const tabLeft = activeTab.offsetLeft
      const tabWidth = activeTab.offsetWidth
      const scrollPosition = tabLeft - containerWidth / 2 + tabWidth / 2

      tabsContainer.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }, [activeCategory])

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      const yOffset = -160
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  if (categories.length === 0) return null

  return (
    <div className="sticky top-0 z-30 bg-[#FDF8F3]/95 backdrop-blur-md border-b border-[#D4A853]/20 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <div
          ref={tabsRef}
          className="flex overflow-x-auto scrollbar-hide py-4 px-4 gap-3"
        >
          {categories.map(category => {
            const isActive = activeCategory === category.id
            return (
              <button
                key={category.id}
                ref={isActive ? activeTabRef : null}
                onClick={() => scrollToCategory(category.id)}
                className={cn(
                  'flex-shrink-0 px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 border',
                  isActive
                    ? 'bg-gradient-to-r from-[#8B4513] to-[#5D2E0C] text-white border-transparent shadow-lg scale-105'
                    : 'bg-white text-[#8B4513] border-[#D4A853]/30 hover:border-[#D4A853] hover:shadow-md'
                )}
              >
                {category.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
