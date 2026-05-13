import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import './search.css'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const searchRef = useRef(null)
  const navigate = useNavigate()

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleItemClick = (item) => {
    let url

    if (item.type === 'category') {
      url = `/${item.sectionName}/${item.name}`
    }

    if (item.type === 'product') {
      url = `/${item.sectionName}/${item.categoryName}/${item.id}`
    }

    if (url) {
      navigate(url)
      setSearchQuery('')
      setSuggestions([])
    }
  }

  useEffect(() => {
    const fetchSuggestions = async () => {
      const normalizedQuery = searchQuery.trim().toLowerCase()

      if (normalizedQuery.length === 0) {
        setSuggestions([])
        return
      }

      try {
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('*')

        if (sectionsError) {
          throw sectionsError
        }

        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')

        if (categoriesError) {
          throw categoriesError
        }

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')

        if (productsError) {
          throw productsError
        }

        const sectionNameById = {}

        sectionsData.forEach((section) => {
          sectionNameById[section.id] = section.name
        })

        const categoriesWithSectionNames = categoriesData.map((category) => ({
          ...category,
          sectionName: sectionNameById[category.section_id] || 'Без раздела',
          type: 'category',
        }))

        const categoryById = {}

        categoriesWithSectionNames.forEach((category) => {
          categoryById[category.id] = category
        })

        const filteredCategories = categoriesWithSectionNames.filter(
          (category) => category.name.toLowerCase().includes(normalizedQuery)
        )

        const productItems = productsData
          .filter((product) => {
            const productName = product.name || ''
            const companyName = product.company_name || ''

            return (
              productName.toLowerCase().includes(normalizedQuery) ||
              companyName.toLowerCase().includes(normalizedQuery)
            )
          })
          .map((product) => {
            const productCategory = categoryById[product.category_id]

            return {
              ...product,
              type: 'product',
              sectionName: productCategory?.sectionName || 'Без раздела',
              categoryName:
                productCategory?.name ||
                product.category_name ||
                'Без категории',
            }
          })

        setSuggestions([...filteredCategories, ...productItems])
      } catch (error) {
        console.error('Ошибка при поиске данных:', error)
      }
    }

    fetchSuggestions()
  }, [searchQuery])

  const handleOutsideClick = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setSuggestions([])
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  return (
    <div className="search" ref={searchRef}>
      <input
        type="text"
        placeholder="Поиск товаров и категорий..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-input"
      />

      {suggestions.length > 0 && (
        <div className="suggestions-container">
          {suggestions.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="suggestion-item"
              onClick={() => handleItemClick(item)}
            >
              <img
                src={item.image || item.main_image || ''}
                className="suggestion-image"
                alt={item.name}
              />

              <div className="suggestion-details">
                <p className="suggestion-name">{item.name}</p>

                {item.type === 'category' ? (
                  <p className="suggestion-section">
                    Раздел: {item.sectionName || 'Без раздела'}
                  </p>
                ) : (
                  <p className="suggestion-company">{item.company_name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Search
