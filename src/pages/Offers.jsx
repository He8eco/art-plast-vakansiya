import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import ListEditing from '../components/listEditing/listEditing'
import '../styles/editing.css'

export default function Offers() {
  const [categoryName, setCategoryName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [position, setPosition] = useState('')
  const [showCategoryList, setShowCategoryList] = useState(false)

  // Для редактирования и удаления
  const [offers, setOffers] = useState([])
  const [editPosition, setEditPosition] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [deletePosition, setDeletePosition] = useState('')

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
    setFilteredCategories(data)
  }
  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching offers:', error)
      return
    }

    setOffers(data)
  }
  useEffect(() => {
    fetchCategories()
    fetchOffers()
  }, [])

  const handleCategorySearch = (name) => {
    setCategoryName(name)
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(name.toLowerCase())
    )
    setFilteredCategories(filtered)
    setShowCategoryList(name.length > 0 && filtered.length > 0)
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setCategoryName(category.name)
    setShowCategoryList(false)
  }

  const handleAddOffer = async () => {
    if (!selectedCategory || !position) {
      alert('Пожалуйста, заполните все поля')
      return
    }

    const { error } = await supabase.from('offers').insert({
      category_id: selectedCategory.id,
      category_name: selectedCategory.name,
      position: Number(position),
      image: selectedCategory.image,
    })

    if (error) {
      console.error('Error adding offer:', error)
      return
    }

    setCategoryName('')
    setSelectedCategory(null)
    setPosition('')

    await fetchOffers()
  }

  const handleEditOffer = async () => {
    if (!editPosition) return

    const newOfferData = {}

    if (newPosition) {
      newOfferData.position = Number(newPosition)
    }

    if (newCategory) {
      const foundCategory = categories.find(
        (category) => category.name.toLowerCase() === newCategory.toLowerCase()
      )

      if (!foundCategory) {
        alert('Категория не найдена')
        return
      }

      newOfferData.category_id = foundCategory.id
      newOfferData.category_name = foundCategory.name
      newOfferData.image = foundCategory.image
    }

    const { error } = await supabase
      .from('offers')
      .update(newOfferData)
      .eq('id', editPosition)

    if (error) {
      console.error('Error updating offer:', error)
      return
    }

    setEditPosition('')
    setNewPosition('')
    setNewCategory('')

    await fetchOffers()
  }

  const handleDeleteOffer = async () => {
    if (!deletePosition) return

    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', deletePosition)

    if (error) {
      console.error('Error deleting offer:', error)
      return
    }

    setDeletePosition('')

    await fetchOffers()
  }

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Добавить предложение</p>
        <p>Название категории</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название категории"
            value={categoryName}
            onChange={(e) => handleCategorySearch(e.target.value)}
          />
          {showCategoryList && filteredCategories.length > 0 && (
            <ul className="product-list">
              {filteredCategories.map((category) => (
                <li
                  key={category.id}
                  className="product-list-item"
                  onClick={() => handleCategorySelect(category)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p>Введите позицию</p>
        <input
          type="number"
          placeholder="Введите позицию"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <br />
        <button className="button-editing" onClick={handleAddOffer}>
          Добавить предложение
        </button>

        {/* Редактирование предложения */}
        <div className="edit-offer">
          <p className="title">Редактирование предложения</p>
          <p>Выберите категорию</p>
          <select
            value={editPosition}
            onChange={(e) => setEditPosition(e.target.value)}
          >
            <option value="">Выберите предложение для редактирования</option>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                Позиция: {offer.position} - Категория: {offer.category_name}
              </option>
            ))}
          </select>
          <p>Выберите позицию</p>
          <input
            type="number"
            placeholder="Новое число позиции (необязательно)"
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
          />
          <p>Выберите новую категорию</p>
          <input
            type="text"
            placeholder="Новое название категории (необязательно)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="button-editing" onClick={handleEditOffer}>
            Сохранить изменения
          </button>
        </div>

        {/* Удаление предложения */}
        <div className="delete-offer">
          <p className="title">Удаление предложения</p>
          <p>Выберите категорию</p>
          <select
            value={deletePosition}
            onChange={(e) => setDeletePosition(e.target.value)}
          >
            <option value="">Выберите предложение для удаления</option>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                Позиция: {offer.position} - Категория: {offer.category_name}
              </option>
            ))}
          </select>
          <br />
          <button className="button-editing" onClick={handleDeleteOffer}>
            Удалить предложение
          </button>
        </div>
      </div>
    </div>
  )
}
