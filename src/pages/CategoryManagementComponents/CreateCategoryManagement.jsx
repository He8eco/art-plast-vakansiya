import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const CreateCategoryManagement = () => {
  const [categoryName, setCategoryName] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [sections, setSections] = useState([])
  const [filteredSections, setFilteredSections] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')

  // Получение разделов из базы данных
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

  const uploadCategoryImage = async (file) => {
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

  const handleAddCategory = async () => {
    if (!categoryName || !selectedSection) {
      setError('Пожалуйста, заполните все поля.')
      return
    }
    setError('')

    try {
      let imageUrl = null
      if (image) {
        imageUrl = await uploadCategoryImage(image)
      }

      const { error } = await supabase.from('categories').insert({
        name: categoryName,
        section_id: selectedSection.id,
        image: imageUrl,
      })

      if (error) {
        throw error
      }

      // Сброс состояния после добавления
      setCategoryName('')
      setSelectedSection(null)
      setSectionName('')
      setImage(null)
    } catch (error) {
      console.error('Error adding category:', error)
      setError('Не удалось создать категорию.')
    }
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
      <p className="title top">Создание категории</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <p>Раздел категории</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Выберите раздел"
            value={sectionName}
            onChange={handleSearchSections}
          />
          {sectionName && filteredSections.length > 0 && (
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
        <p>Название категории</p>
        <input
          type="text"
          placeholder="Название категории"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <div className="photo-editing">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="Обложка категории"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <p style={{ textAlign: 'center', lineHeight: '150px' }}>
                Обложка
              </p>
            )}
          </div>
          <div className="buttons-photo">
            <button
              className="button-editing"
              onClick={() => document.getElementById('createFileInput').click()}
            >
              Загрузить фотографию
            </button>
            <input
              type="file"
              id="createFileInput"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <button
              className="button-editing"
              onClick={handleDeleteImage}
              disabled={!image}
            >
              Удалить фотографию
            </button>
          </div>
        </div>
        <button className="button-editing" onClick={handleAddCategory}>
          Создать категорию
        </button>
      </div>
    </div>
  )
}

export default CreateCategoryManagement
