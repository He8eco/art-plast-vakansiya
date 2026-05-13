import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const CategoryDeletion = () => {
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isDropdownVisible, setIsDropdownVisible] = useState(false) // Состояние для видимости списка

  // Получение категорий из базы данных
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching categories:', error)
      return
    }

    setCategories(data)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSearchCategories = (e) => {
    setSearchTerm(e.target.value.toLowerCase())
    setIsDropdownVisible(true) // Показываем список при изменении текста
  }

  const handleSelectCategory = (category) => {
    setSelectedCategory(category)
    setSearchTerm(category.name) // Устанавливаем название категории в поле поиска
    setIsDropdownVisible(false) // Скрываем список после выбора категории
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', selectedCategory.id)

      if (error) {
        throw error
      }

      setSelectedCategory(null)
      setSearchTerm('')
      setIsDropdownVisible(false)
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  return (
    <div className="editing">
      <p className="title">Удаление категории</p>
      <p>Название категории</p>
      <div className="list-editing">
        <input
          className="z"
          type="text"
          placeholder="Поиск категории"
          value={searchTerm}
          onChange={handleSearchCategories}
        />
        {/* Отображаем список только если он видим и введённый текст не пуст */}
        {isDropdownVisible && searchTerm && categories.length > 0 && (
          <ul>
            {categories
              .filter((category) =>
                category.name.toLowerCase().includes(searchTerm)
              )
              .map((category) => (
                <li
                  key={category.id}
                  onClick={() => handleSelectCategory(category)}
                >
                  {category.name}
                </li>
              ))}
          </ul>
        )}
      </div>
      <button
        className="button-editing"
        onClick={handleDeleteCategory}
        disabled={!selectedCategory}
      >
        Удалить категорию
      </button>
    </div>
  )
}

export default CategoryDeletion
