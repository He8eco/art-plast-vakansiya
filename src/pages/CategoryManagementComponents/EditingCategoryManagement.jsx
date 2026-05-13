import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const EditingCategoryManagement = () => {
  const [sectionName, setSectionName] = useState('')
  const [sections, setSections] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [filteredSections, setFilteredSections] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [image, setImage] = useState(null)

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching sections:', error)
      return
    }

    setSections(data)
  }

  useEffect(() => {
    fetchSections()
  }, [])

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

  const handleSearchTermChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value) {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories([])
    }
  }

  const handleSaveChanges = async () => {
    if (!editingCategoryId) return

    try {
      let imageUrl = image

      if (image && typeof image !== 'string') {
        imageUrl = await uploadImageToStorage(image)
      }

      const { error } = await supabase
        .from('categories')
        .update({
          name: newCategoryName,
          section_id: selectedSection?.id || null,
          image: imageUrl,
        })
        .eq('id', editingCategoryId)

      if (error) {
        throw error
      }

      resetFormFields()
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const resetFormFields = () => {
    setEditingCategoryId(null)
    setNewCategoryName('')
    setSelectedSection(null)
    setSectionName('')
    setImage(null)
    setSearchTerm('')
    setFilteredCategories([])
    setFilteredSections([])
    fetchCategories()
  }

  const handleEditCategory = (category) => {
    const categorySection = sections.find(
      (section) => section.id === category.section_id
    )

    setEditingCategoryId(category.id)
    setNewCategoryName(category.name)
    setSelectedSection(categorySection || null)
    setSectionName(categorySection?.name || '')
    setImage(category.image || null)
    setSearchTerm(category.name)
    setFilteredCategories([])
  }

  const uploadImageToStorage = async (file) => {
    if (!file) return null

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`
    const filePath = `categories/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('category-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSearchSections = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm)
    )
    setFilteredSections(filtered)
    setSectionName(searchTerm)
  }

  const handleSelectSection = (section) => {
    setSelectedSection(section)
    setSectionName(section.name)
    setFilteredSections([])
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
    }
  }

  const handleDeleteImage = () => {
    setImage(null)
  }

  return (
    <div className="editing">
      <p className="title">Редактирование категории</p>
      <p>Название категории</p>
      <div className="list-editing z2">
        <input
          className="z z3"
          type="text"
          placeholder="Поиск категории"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        {searchTerm && filteredCategories.length > 0 && (
          <ul>
            {filteredCategories.map((category) => (
              <li
                key={category.id}
                onClick={() => handleEditCategory(category)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p>Новое название категории</p>
        <input
          type="text"
          placeholder="Название категории"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          disabled={!editingCategoryId}
        />
        <p>Раздел категории</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Выберите раздел"
            value={sectionName}
            onChange={handleSearchSections}
            disabled={!editingCategoryId}
          />
          {filteredSections.length > 0 && (
            <ul>
              {filteredSections.map((section) => (
                <li
                  key={section.id}
                  onClick={() => handleSelectSection(section)}
                >
                  {section.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="photo-editing">
            {image ? (
              typeof image === 'string' ? (
                <img
                  src={image}
                  alt="Обложка категории"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Обложка категории"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )
            ) : (
              <p style={{ textAlign: 'center', lineHeight: '150px' }}>
                Обложка категории
              </p>
            )}
          </div>
          <div className="buttons-photo">
            <button
              className="button-editing"
              onClick={() => document.getElementById('editFileInput').click()}
              disabled={!editingCategoryId}
            >
              Загрузить фотографию
            </button>
            <input
              type="file"
              id="editFileInput"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <button
              className="button-editing"
              onClick={handleDeleteImage}
              disabled={!image || !editingCategoryId}
            >
              Удалить фотографию
            </button>
          </div>
        </div>
        <button
          className="button-editing"
          onClick={handleSaveChanges}
          disabled={!editingCategoryId}
        >
          Сохранить изменения
        </button>
      </div>
    </div>
  )
}

export default EditingCategoryManagement
