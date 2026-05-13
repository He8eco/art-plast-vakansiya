import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import AddProductSpecifications from './AddCharacteristics.jsx'
import ListEditing from '../components/listEditing/listEditing.jsx'

const EditProduct = () => {
  const [productName, setProductName] = useState('')
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [category, setCategory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [filteredCategories, setFilteredCategories] = useState([])
  const [price, setPrice] = useState('')
  const [discount, setDiscount] = useState('')
  const [description, setDescription] = useState('')
  const [benefits, setBenefits] = useState([{ text: '' }])
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const [mainImage, setMainImage] = useState(null)
  const [shortSpecs, setShortSpecs] = useState([{ name: '', value: '' }])
  const [fullSpecs, setFullSpecs] = useState([{ name: '', value: '' }])
  const [imageURLs, setImageURLs] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [newProductName, setNewProductName] = useState('')
  const [companyName, setCompanyName] = useState('')
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
    fetchProducts()
    fetchTemplates()
  }, [])
  const handleProductSearch = (name) => {
    setProductName(name)

    if (name.trim() === '') {
      setFilteredProducts([])
      return
    }

    const filtered = products.filter((product) => {
      const combinedName =
        `${product.company_name || ''} ${product.name || ''}`.toLowerCase()

      return combinedName.includes(name.toLowerCase())
    })

    setFilteredProducts(filtered)
  }
  const handleProductSelect = (product) => {
    const productCategory = categories.find(
      (cat) => cat.id === product.category_id
    )

    setSelectedProduct(product)

    setProductName(`${product.company_name || ''} ${product.name || ''}`)

    setNewProductName(product.name || '')
    setCompanyName(product.company_name || '')

    setSelectedCategory(productCategory || null)
    setCategory(productCategory?.name || product.category_name || '')

    setPrice(product.price || '')
    setDiscount(product.discount || '')
    setDescription(product.description || '')

    setBenefits(product.benefits?.map((text) => ({ text })) || [{ text: '' }])

    setShortSpecs(product.short_specs || [{ name: '', value: '' }])
    setFullSpecs(product.full_specs || [{ name: '', value: '' }])

    setExistingImages(product.images || [])
    setImages([])
    setImageURLs([])

    setMainImage(product.main_image || null)

    setSelectedImage(null)
    setSelectedImageIndex(null)

    setFilteredProducts([])
  }
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat)
    setCategory(cat.name)
    setFilteredCategories([])
  }
  const handleCategorySearch = (name) => {
    setCategory(name)

    if (name.trim() === '') {
      setFilteredCategories([]) // Скрыть список, если поле пустое
      return
    }

    const filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(name.toLowerCase())
    )

    setFilteredCategories(filtered)
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

    const newImageURLs = files.map((file) => URL.createObjectURL(file))
    setImageURLs((prevURLs) => [...prevURLs, ...newImageURLs])
  }

  const handleDeleteImage = () => {
    if (selectedImageIndex === null) return

    if (selectedImageIndex < existingImages.length) {
      const imageToDelete = existingImages[selectedImageIndex]

      setExistingImages((prevImages) =>
        prevImages.filter((_, i) => i !== selectedImageIndex)
      )

      if (mainImage === imageToDelete) {
        setMainImage(null)
      }
    } else {
      const newImageIndex = selectedImageIndex - existingImages.length
      const imageToDelete = images[newImageIndex]

      setImages((prevImages) =>
        prevImages.filter((_, i) => i !== newImageIndex)
      )

      setImageURLs((prevUrls) => prevUrls.filter((_, i) => i !== newImageIndex))

      if (mainImage === imageToDelete) {
        setMainImage(null)
      }
    }

    setSelectedImage(null)
    setSelectedImageIndex(null)
  }

  const handleSetMainImage = () => {
    if (selectedImageIndex === null) return

    if (selectedImageIndex < existingImages.length) {
      setMainImage(existingImages[selectedImageIndex])
    } else {
      const newImageIndex = selectedImageIndex - existingImages.length
      setMainImage(images[newImageIndex])
    }
  }
  const handleImageClick = (index) => {
    setSelectedImage(index)
    setSelectedImageIndex(index) // сохранить индекс выбранного изображения
  }

  const handleSaveChanges = async () => {
    if (!selectedProduct) return

    try {
      const newImageUrls = []

      for (const image of images) {
        const imageUrl = await uploadProductImage(image)
        newImageUrls.push(imageUrl)
      }

      const updatedImages = [...existingImages, ...newImageUrls]

      let mainImageUrl = null

      if (typeof mainImage === 'string') {
        mainImageUrl = mainImage
      } else if (mainImage) {
        const newImageIndex = images.indexOf(mainImage)
        mainImageUrl = newImageIndex !== -1 ? newImageUrls[newImageIndex] : null
      }

      const updatedProductData = {
        name: newProductName || selectedProduct.name,
        company_name: companyName || selectedProduct.company_name,
        category_id:
          selectedCategory?.id || selectedProduct.category_id || null,
        category_name: selectedCategory?.name || category,
        price: Number(price),
        discount: discount ? Number(discount) : null,
        description,
        benefits: benefits.map((benefit) => benefit.text),
        images: updatedImages,
        main_image: mainImageUrl,
        short_specs: shortSpecs,
        full_specs: fullSpecs,
      }

      const { error } = await supabase
        .from('products')
        .update(updatedProductData)
        .eq('id', selectedProduct.id)

      if (error) {
        throw error
      }

      setSelectedProduct({ ...selectedProduct, ...updatedProductData })

      setProductName('')
      setNewProductName('')
      setCompanyName('')
      setCategory('')
      setSelectedCategory(null)
      setPrice('')
      setDiscount('')
      setDescription('')
      setBenefits([{ text: '' }])
      setImages([])
      setImageURLs([])
      setExistingImages([])
      setSelectedImage(null)
      setSelectedImageIndex(null)
      setMainImage(null)
      setShortSpecs([{ name: '', value: '' }])
      setFullSpecs([{ name: '', value: '' }])
      setTemplateCategory('')
      setFilteredProducts([])

      await fetchProducts()

      alert('Изменения успешно сохранены!')
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Произошла ошибка при сохранении изменений')
    }
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

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Редактирование товара</p>
        <p>Название товара</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название товара"
            value={productName}
            onChange={(e) => handleProductSearch(e.target.value)}
          />
          {filteredProducts.length > 0 && ( // Условие для отображения списка
            <ul className="product-list">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="product-list-item"
                >
                  {`${product.company_name} ${product.name}`}{' '}
                  {/* Отображение полной строки */}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p>Новое название товара</p>
        <input
          type="text"
          placeholder="Новое название товара"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
        />

        <p>Изменение названия компании</p>
        <input
          type="text"
          placeholder="Изменение названия компании"
          value={companyName} // Добавьте состояние для хранения названия компании
          onChange={(e) => setCompanyName(e.target.value)} // Обновите состояние при вводе
        />
        <p>Категория товара</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Категория товара"
            value={category}
            onChange={(e) => handleCategorySearch(e.target.value)}
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

        <p>Фотографии товара</p>
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

        <div>
          <ul className="list-photos-product">
            {existingImages.map((imageUrl, index) => (
              <li key={index}>
                <img
                  src={imageUrl}
                  onClick={() => handleImageClick(index)} // обновлено
                  alt="Product"
                  className={`image ${
                    mainImage === imageUrl ? 'main-photo' : ''
                  } ${selectedImage === index ? 'photo-selected' : ''}`} // добавлено
                />
                {mainImage === imageUrl && <span>Основная</span>}
              </li>
            ))}
            {imageURLs.map((imageUrl, index) => (
              <li key={`new-${index}`}>
                <img
                  src={imageUrl}
                  onClick={() =>
                    handleImageClick(existingImages.length + index)
                  } // обновлено
                  alt="New Upload"
                  className={`image ${
                    mainImage === images[index] ? 'main-photo' : ''
                  } ${
                    selectedImage === existingImages.length + index
                      ? 'photo-selected'
                      : ''
                  }`} // добавлено
                />
                {mainImage === images[index] && <span>Основная</span>}
              </li>
            ))}
          </ul>
        </div>
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
        <button className="button-editing" onClick={handleSaveChanges}>
          Сохранить изменения
        </button>
      </div>
    </div>
  )
}

export default EditProduct
