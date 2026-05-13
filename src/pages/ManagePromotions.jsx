import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import ListEditing from '../components/listEditing/listEditing'
import '../styles/editing.css'

export default function ManagePromotions() {
  const [promotionType, setPromotionType] = useState('') // Тип акции
  const [promotionName, setPromotionName] = useState('') // Название товара
  const [products, setProducts] = useState([]) // Список всех товаров
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filteredProducts, setFilteredProducts] = useState([]) // Отфильтрованные товары
  const [position, setPosition] = useState('') // Позиция товара в акции
  const [showProductList, setShowProductList] = useState(false) // Показать список товаров

  // Для редактирования акций
  const [promotions, setPromotions] = useState([]) // Список акций

  // Состояния для редактирования акций
  const [selectedPromotionType, setSelectedPromotionType] = useState('') // Выбранный тип акции для редактирования
  const [promotionProducts, setPromotionProducts] = useState([]) // Товары в выбранной акции
  const [selectedPromotionProduct, setSelectedPromotionProduct] = useState('') // Выбранный товар в акции
  const [newPosition, setNewPosition] = useState('') // Новая позиция
  const [newPromotionType, setNewPromotionType] = useState('') // Новый тип акции

  // Состояния для удаления акций
  const [deletePromotionType, setDeletePromotionType] = useState('') // Выбранный тип акции для удаления
  const [deletePromotionProducts, setDeletePromotionProducts] = useState([]) // Товары в выбранной акции для удаления
  const [selectedDeletePromotionProduct, setSelectedDeletePromotionProduct] =
    useState('') // Выбранный товар для удаления

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return
    }

    setProducts(data)
    setFilteredProducts(data)
  }

  const fetchPromotions = async () => {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching promotions:', error)
      return
    }

    setPromotions(data)
  }
  useEffect(() => {
    fetchProducts()
    fetchPromotions()
  }, [])
  // Функция для поиска товара по названию
  const handleProductSearch = (name) => {
    setPromotionName(name)

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(name.toLowerCase()) ||
        product.company_name?.toLowerCase().includes(name.toLowerCase())
    )

    setFilteredProducts(filtered)
    setShowProductList(name.length > 0 && filtered.length > 0)
  }

  // Функция для выбора товара из списка
  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    setPromotionName(`${product.company_name || ''} ${product.name || ''}`)
    setShowProductList(false)
  }

  // Функция для добавления товара в акцию
  const handleAddPromotion = async () => {
    if (!promotionType || !selectedProduct || !position) {
      alert('Пожалуйста, заполните все поля')
      return
    }

    const { error } = await supabase.from('promotions').insert({
      product_name: selectedProduct.name,
      position: Number(position),
      main_image: selectedProduct.main_image,
      promotion_type: promotionType,
      product_id: selectedProduct.id,
      category_name: selectedProduct.category_name,
      price: selectedProduct.price,
      discount: selectedProduct.discount,
      company_name: selectedProduct.company_name,
    })

    if (error) {
      console.error('Error adding promotion:', error)
      return
    }

    setPromotionName('')
    setPosition('')
    setPromotionType('')
    setSelectedProduct(null)
    setShowProductList(false)

    await fetchPromotions()
  }

  // Обработчик выбора типа акции для редактирования
  const handlePromotionTypeSelect = (e) => {
    const type = e.target.value

    setSelectedPromotionType(type)
    setSelectedPromotionProduct('')
    setNewPosition('')
    setNewPromotionType('')

    const filteredPromotions = promotions.filter(
      (promotion) => promotion.promotion_type === type
    )

    setPromotionProducts(filteredPromotions)
  }

  // Обработчик обновления акции
  const handleUpdatePromotion = async () => {
    if (!selectedPromotionProduct) return

    const updatedData = {}

    if (newPosition) updatedData.position = Number(newPosition)
    if (newPromotionType) updatedData.promotion_type = newPromotionType

    const { error } = await supabase
      .from('promotions')
      .update(updatedData)
      .eq('id', selectedPromotionProduct)

    if (error) {
      console.error('Error updating promotion:', error)
      return
    }

    setNewPosition('')
    setNewPromotionType('')

    await fetchPromotions()

    const { data, error: fetchError } = await supabase
      .from('promotions')
      .select('*')
      .eq('promotion_type', selectedPromotionType)
      .order('position', { ascending: true })

    if (fetchError) {
      console.error('Error refreshing promotion products:', fetchError)
      return
    }

    setPromotionProducts(data)

    alert('Изменения успешно сохранены.')
  }

  // Обработчик выбора типа акции для удаления
  const handleDeletePromotionTypeSelect = (e) => {
    const type = e.target.value

    setDeletePromotionType(type)
    setSelectedDeletePromotionProduct('')

    const filteredPromotions = promotions.filter(
      (promotion) => promotion.promotion_type === type
    )

    setDeletePromotionProducts(filteredPromotions)
  }

  // Функция для удаления товара из акции
  const handleDeletePromotion = async () => {
    if (!selectedDeletePromotionProduct) return

    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', selectedDeletePromotionProduct)

    if (error) {
      console.error('Error deleting promotion:', error)
      return
    }

    setSelectedDeletePromotionProduct('')

    await fetchPromotions()

    const { data, error: fetchError } = await supabase
      .from('promotions')
      .select('*')
      .eq('promotion_type', deletePromotionType)
      .order('position', { ascending: true })

    if (fetchError) {
      console.error('Error refreshing delete promotion products:', fetchError)
      return
    }

    setDeletePromotionProducts(data)

    alert('Товар успешно удален из акции.')
  }

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Добавить товар в акцию</p>

        {/* Добавление товара в акцию */}
        <p>Выберите тип акции</p>
        <select
          value={promotionType}
          onChange={(e) => setPromotionType(e.target.value)}
        >
          <option value="">Выберите тип акции</option>
          <option value="Акции">Акции</option>
          <option value="Рекомендуем">Рекомендуем</option>
          <option value="Хиты продаж">Хиты продаж</option>
          <option value="Новинки">Новинки</option>
        </select>

        <p>Название товара</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название товара"
            value={promotionName}
            onChange={(e) => handleProductSearch(e.target.value)}
          />
          {showProductList && filteredProducts.length > 0 && (
            <ul className="product-list">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  className="product-list-item"
                  onClick={() => handleProductSelect(product)}
                >
                  <div>
                    {product.company_name} {product.name}
                  </div>
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
        <button className="button-editing" onClick={handleAddPromotion}>
          Добавить товар в акцию
        </button>

        {/* Редактирование акций */}
        <div className="edit-promotion">
          <p className="title">Редактирование акций</p>

          {/* Выбор типа акции */}
          <p>Выберите тип акции для редактирования:</p>
          <select
            value={selectedPromotionType}
            onChange={handlePromotionTypeSelect}
          >
            <option value="">Выберите тип акции</option>
            <option value="Акции">Акции</option>
            <option value="Рекомендуем">Рекомендуем</option>
            <option value="Хиты продаж">Хиты продаж</option>
            <option value="Новинки">Новинки</option>
          </select>

          {/* Выбор товара из выбранной акции */}
          {selectedPromotionType && (
            <>
              <p>Выберите товар в акции:</p>
              <select
                value={selectedPromotionProduct}
                onChange={(e) => setSelectedPromotionProduct(e.target.value)}
              >
                <option value="">Выберите товар</option>
                {promotionProducts.map((promotion) => (
                  <option key={promotion.id} value={promotion.id}>
                    Позиция: {promotion.position} - {promotion.product_name}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Поля для изменения позиции и типа акции */}
          {selectedPromotionProduct && (
            <>
              <p>Изменить позицию:</p>
              <input
                type="number"
                placeholder="Новая позиция"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
              />

              <p>Изменить тип акции:</p>
              <select
                value={newPromotionType}
                onChange={(e) => setNewPromotionType(e.target.value)}
              >
                <option value="">Выберите новый тип акции</option>
                <option value="Акции">Акции</option>
                <option value="Рекомендуем">Рекомендуем</option>
                <option value="Хиты продаж">Хиты продаж</option>
                <option value="Новинки">Новинки</option>
              </select>

              <button
                className="button-editing"
                onClick={handleUpdatePromotion}
              >
                Сохранить изменения
              </button>
            </>
          )}
        </div>

        {/* Удаление акций */}
        <div className="delete-promotion">
          <p className="title">Удаление акций</p>

          {/* Выбор типа акции */}
          <p>Выберите тип акции для удаления:</p>
          <select
            value={deletePromotionType}
            onChange={handleDeletePromotionTypeSelect}
          >
            <option value="">Выберите тип акции</option>
            <option value="Акции">Акции</option>
            <option value="Рекомендуем">Рекомендуем</option>
            <option value="Хиты продаж">Хиты продаж</option>
            <option value="Новинки">Новинки</option>
          </select>

          {/* Выбор товара из выбранной акции */}
          {deletePromotionType && (
            <>
              <p>Выберите товар в акции:</p>
              <select
                value={selectedDeletePromotionProduct}
                onChange={(e) =>
                  setSelectedDeletePromotionProduct(e.target.value)
                }
              >
                <option value="">Выберите товар</option>
                {deletePromotionProducts.map((promotion) => (
                  <option key={promotion.id} value={promotion.id}>
                    Позиция: {promotion.position} - {promotion.product_name}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Кнопка для удаления товара из акции */}
          {selectedDeletePromotionProduct && (
            <button className="button-editing" onClick={handleDeletePromotion}>
              Удалить товар из акции
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
