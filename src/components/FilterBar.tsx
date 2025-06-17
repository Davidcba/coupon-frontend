import React from 'react'

type FilterBarProps = {
  categories: string[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

const FilterBar: React.FC<FilterBarProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat === selectedCategory ? null : cat)}
          className={`px-5 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
            selectedCategory === cat
              ? 'bg-[#3B3B98] text-white shadow-md'
              : 'border border-[#3B3B98] text-[#3B3B98] hover:bg-[#3B3B98]/10'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

export default FilterBar
