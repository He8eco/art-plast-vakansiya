import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import AddProductSpecifications from './AddCharacteristics.jsx' // Подключаем компонент характеристик
import ListEditing from '../components/listEditing/listEditing.jsx'

const AddProduct = () => {
  const [companyName, setCompanyName] = useState('')
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [filteredCategories, setFilteredCategories] = useState([])
  const [price, setPrice] = useState('')
  const [discount, setDiscount] = useState('')
  const [description, setDescription] = useState('')
  const [benefits, setBenefits] = useState([{ text: '' }])
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const [mainImage, setMainImage] = useState(null)
  const [shortSpecs, setShortSpecs] = useState([{ name: '', value: '' }])
  const [fullSpecs, setFullSpecs] = useState([{ name: '', value: '' }])

  // Новые состояния для работы с шаблонами
  const [templates, setTemplates] = useState([])
  const [templateCategory, setTemplateCategory] = useState('')
  const [filteredTemplates, setFilteredTemplates] = useState([])
  const [showTemplateList, setShowTemplateList] = useState(false)

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

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('spec_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return
    }

    setTemplates(data)
  }
  useEffect(() => {
    fetchCategories()
    fetchTemplates()
  }, [])

  const handleTemplateInputChange = (e) => {
    const input = e.target.value
    setTemplateCategory(input)

    if (input === '') {
      setFilteredTemplates([])
      setShowTemplateList(false)
      return
    }

    const filtered = templates.filter((template) =>
      template.category_name.toLowerCase().includes(input.toLowerCase())
    )

    setFilteredTemplates(filtered)
    setShowTemplateList(filtered.length > 0)
  }

  const handleTemplateSelect = (template) => {
    setTemplateCategory(template.category_name)
    setShortSpecs(template.short_specs || [{ name: '', value: '' }])
    setFullSpecs(template.full_specs || [{ name: '', value: '' }])
    setShowTemplateList(false)
  }

  const uploadProductImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setImages((prevImages) => [...prevImages, ...files])
  }

  const handleDeleteImage = () => {
    if (selectedImageIndex !== null) {
      const updatedImages = images.filter((_, i) => i !== selectedImageIndex)
      setImages(updatedImages)
      if (mainImage === images[selectedImageIndex]) {
        setMainImage(null)
      }
      setSelectedImageIndex(null) // Сбрасываем выбор
    }
  }

  const handleSetMainImage = () => {
    if (selectedImageIndex !== null) {
      setMainImage(images[selectedImageIndex])
    }
  }

  const handleAddProduct = async () => {
    if (!productName || !selectedCategory || !price) {
      alert('Пожалуйста, заполните название, категорию и цену товара')
      return
    }

    try {
      const imageUrls = []

      for (const image of images) {
        const imageUrl = await uploadProductImage(image)
        imageUrls.push(imageUrl)
      }

      const mainImageUrl =
        mainImage && images.includes(mainImage)
          ? imageUrls[images.indexOf(mainImage)]
          : null

      const { error } = await supabase.from('products').insert({
        company_name: companyName,
        name: productName,
        category_id: selectedCategory.id,
        category_name: selectedCategory.name,
        price: Number(price),
        discount: discount ? Number(discount) : null,
        description,
        benefits: benefits.map((benefit) => benefit.text),
        images: imageUrls,
        main_image: mainImageUrl,
        short_specs: shortSpecs,
        full_specs: fullSpecs,
      })

      if (error) {
        throw error
      }

      setCompanyName('')
      setProductName('')
      setCategory('')
      setSelectedCategory(null)
      setPrice('')
      setDiscount('')
      setDescription('')
      setBenefits([{ text: '' }])
      setImages([])
      setSelectedImageIndex(null)
      setMainImage(null)
      setShortSpecs([{ name: '', value: '' }])
      setFullSpecs([{ name: '', value: '' }])
      setTemplateCategory('')

      alert('Товар успешно добавлен')
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  const handleCategoryInputChange = (e) => {
    const input = e.target.value
    setCategory(input)
    if (input === '') {
      setFilteredCategories([])
    } else {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(input.toLowerCase())
      )
      setFilteredCategories(filtered)
    }
  }

  const handleCategorySelect = (selectedCategory) => {
    setSelectedCategory(selectedCategory)
    setCategory(selectedCategory.name)
    setFilteredCategories([])
  }

  const handleBenefitChange = (index, value) => {
    const updatedBenefits = [...benefits]
    updatedBenefits[index].text = value
    setBenefits(updatedBenefits)
  }

  const handleAddBenefit = () => {
    setBenefits([...benefits, { text: '' }])
  }

  const handleRemoveBenefit = (index) => {
    const updatedBenefits = benefits.filter((_, i) => i !== index)
    setBenefits(updatedBenefits)
  }

  const handleImageClick = (index) => {
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null) // Сброс выбора, если кликнули по уже выбранной фотографии
    } else {
      setSelectedImageIndex(index) // Устанавливаем выбранное изображение
    }
  }

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Добавить новый товар</p>
        <div>
          <p>Наименование компании</p>
          <input
            type="text"
            placeholder="Наименование компании"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p>Название товара</p>
          <input
            type="text"
            placeholder="Название товара"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
          <p>Категория товара</p>
          <div className="list-editing">
            <input
              className="z"
              type="text"
              placeholder="Категория товара"
              value={category}
              onChange={handleCategoryInputChange}
            />
            {filteredCategories.length > 0 && (
              <ul className="category-list">
                {filteredCategories.map((cat) => (
                  <li
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className="category-list-item"
                  >
                    {cat.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p>Цена товара</p>
          <input
            type="number"
            placeholder="Цена товара"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <p>Скидка</p>
          <input
            type="number"
            placeholder="Цена со скидкой"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
          <p>Описание товара</p>
          <textarea
            placeholder="Описание товара"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <p>Преимущества товара</p>
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-row">
              <input
                type="text"
                placeholder="Преимущество"
                value={benefit.text}
                onChange={(e) => handleBenefitChange(index, e.target.value)}
              />
              <button
                className="button-editing"
                onClick={() => handleRemoveBenefit(index)}
              >
                Удалить
              </button>
            </div>
          ))}
          <button className="button-editing" onClick={handleAddBenefit}>
            Добавить преимущество
          </button>
        </div>

        <p>Выберите фотографии для товара</p>
        <div className="buttons-product">
          <button
            className="button-editing"
            onClick={() => document.getElementById('fileInput').click()}
          >
            Загрузить фотографии
          </button>
          <button
            className="button-editing"
            onClick={handleDeleteImage}
            disabled={selectedImageIndex === null}
          >
            Удалить фотографию
          </button>
          <button
            className="button-editing"
            onClick={handleSetMainImage}
            disabled={selectedImageIndex === null}
          >
            Сделать основной
          </button>
        </div>
        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          multiple
          onChange={handleImageUpload}
        />
        {images.length > 0 && (
          <div>
            <ul className="list-photos-product">
              {images.map((image, index) => (
                <li key={index}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Загрузка ${index + 1}`}
                    onClick={() => handleImageClick(index)} // Обработчик клика
                    className={`photo ${
                      selectedImageIndex === index ? 'photo-selected' : ''
                    }`} // Добавляем класс photo-selected
                  />
                  {mainImage === image && <span>Основная</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Добавляем выбор категории шаблона */}
        <p>Выберите категорию шаблона</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Выберите категорию шаблона"
            value={templateCategory}
            onChange={handleTemplateInputChange}
          />
          {showTemplateList && filteredTemplates.length > 0 && (
            <ul className="template-list">
              {filteredTemplates.map((template) => (
                <li
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="template-list-item"
                >
                  {template.category_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <AddProductSpecifications
          shortSpecs={shortSpecs}
          setShortSpecs={setShortSpecs}
          fullSpecs={fullSpecs}
          setFullSpecs={setFullSpecs}
        />
        <button className="button-editing" onClick={handleAddProduct}>
          Добавить товар
        </button>
      </div>
    </div>
  )
}

export default AddProduct
