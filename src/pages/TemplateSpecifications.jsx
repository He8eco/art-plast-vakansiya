import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import AddProductSpecifications from './AddCharacteristics.jsx'
import ListEditing from '../components/listEditing/listEditing'
import '../styles/editing.css'

export default function TemplateSpecifications() {
  const [categoryName, setCategoryName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [showCategoryList, setShowCategoryList] = useState(false)

  // Состояния для создания шаблона
  const [createShortSpecs, setCreateShortSpecs] = useState([
    { name: '', value: '' },
  ])
  const [createFullSpecs, setCreateFullSpecs] = useState([
    { name: '', value: '' },
  ])

  const [templates, setTemplates] = useState([])

  // Для редактирования
  const [editCategoryName, setEditCategoryName] = useState('')
  const [filteredTemplates, setFilteredTemplates] = useState([])
  const [showTemplateList, setShowTemplateList] = useState(false)
  const [selectedEditTemplate, setSelectedEditTemplate] = useState(null)

  // Состояния для редактирования шаблона
  const [editShortSpecs, setEditShortSpecs] = useState([])
  const [editFullSpecs, setEditFullSpecs] = useState([])

  // Для удаления
  const [deleteCategoryName, setDeleteCategoryName] = useState('')
  const [filteredTemplatesForDelete, setFilteredTemplatesForDelete] = useState(
    []
  )
  const [showTemplateListForDelete, setShowTemplateListForDelete] =
    useState(false)
  const [selectedDeleteTemplate, setSelectedDeleteTemplate] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchTemplates()
  }, [])

  // Функция для получения категорий из Firebase
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

  // Функция для получения шаблонов из Firebase
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

  // Функции для поиска категорий при создании шаблона
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

  // Функция для создания шаблона
  const handleAddTemplate = async () => {
    if (!selectedCategory) {
      alert('Пожалуйста, выберите категорию')
      return
    }

    const { error } = await supabase.from('spec_templates').insert({
      category_id: selectedCategory.id,
      category_name: selectedCategory.name,
      short_specs: createShortSpecs,
      full_specs: createFullSpecs,
    })

    if (error) {
      console.error('Error adding template:', error)
      return
    }

    setCategoryName('')
    setSelectedCategory(null)
    setCreateShortSpecs([{ name: '', value: '' }])
    setCreateFullSpecs([{ name: '', value: '' }])

    alert('Шаблон успешно создан')
    await fetchTemplates()
  }

  // Функции для поиска шаблонов при редактировании
  const handleTemplateSearch = (name) => {
    setEditCategoryName(name)

    const filtered = templates.filter((template) =>
      template.category_name.toLowerCase().includes(name.toLowerCase())
    )

    setFilteredTemplates(filtered)
    setShowTemplateList(name.length > 0 && filtered.length > 0)
  }

  const handleTemplateSelect = (template) => {
    setEditCategoryName(template.category_name)
    setEditShortSpecs(template.short_specs || [])
    setEditFullSpecs(template.full_specs || [])
    setSelectedEditTemplate(template)
    setShowTemplateList(false)
  }

  // Функция для сохранения изменений шаблона
  const handleSaveTemplateChanges = async () => {
    if (!selectedEditTemplate) return

    const { error } = await supabase
      .from('spec_templates')
      .update({
        short_specs: editShortSpecs,
        full_specs: editFullSpecs,
      })
      .eq('id', selectedEditTemplate.id)

    if (error) {
      console.error('Error updating template:', error)
      return
    }

    setEditCategoryName('')
    setEditShortSpecs([])
    setEditFullSpecs([])
    setSelectedEditTemplate(null)

    alert('Изменения сохранены')
    await fetchTemplates()
  }

  // Функции для поиска шаблонов при удалении
  const handleTemplateSearchForDelete = (name) => {
    setDeleteCategoryName(name)

    const filtered = templates.filter((template) =>
      template.category_name.toLowerCase().includes(name.toLowerCase())
    )

    setFilteredTemplatesForDelete(filtered)
    setShowTemplateListForDelete(name.length > 0 && filtered.length > 0)
  }

  const handleTemplateSelectForDelete = (template) => {
    setDeleteCategoryName(template.category_name)
    setSelectedDeleteTemplate(template)
    setShowTemplateListForDelete(false)
  }

  // Функция для удаления шаблона
  const handleDeleteTemplate = async () => {
    if (!selectedDeleteTemplate) {
      alert('Пожалуйста, выберите шаблон для удаления')
      return
    }

    const { error } = await supabase
      .from('spec_templates')
      .delete()
      .eq('id', selectedDeleteTemplate.id)

    if (error) {
      console.error('Error deleting template:', error)
      return
    }

    setDeleteCategoryName('')
    setSelectedDeleteTemplate(null)

    alert('Шаблон удален')
    await fetchTemplates()
  }

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        {/* Создание шаблона */}
        <p className="title top">Создание шаблона характеристик</p>
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

        <AddProductSpecifications
          shortSpecs={createShortSpecs}
          setShortSpecs={setCreateShortSpecs}
          fullSpecs={createFullSpecs}
          setFullSpecs={setCreateFullSpecs}
        />

        <button className="button-editing" onClick={handleAddTemplate}>
          Создать шаблон
        </button>

        {/* Редактирование шаблона */}
        <p className="title">Редактирование шаблона характеристик</p>
        <p>Название категории</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название категории"
            value={editCategoryName}
            onChange={(e) => handleTemplateSearch(e.target.value)}
          />
          {showTemplateList && filteredTemplates.length > 0 && (
            <ul className="product-list">
              {filteredTemplates.map((template) => (
                <li
                  key={template.id}
                  className="product-list-item"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template.category_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedEditTemplate && (
          <>
            <AddProductSpecifications
              shortSpecs={editShortSpecs}
              setShortSpecs={setEditShortSpecs}
              fullSpecs={editFullSpecs}
              setFullSpecs={setEditFullSpecs}
            />
            <button
              className="button-editing"
              onClick={handleSaveTemplateChanges}
            >
              Сохранить изменения
            </button>
          </>
        )}

        {/* Удаление шаблона */}
        <p className="title">Удаление шаблона характеристик</p>
        <p>Название категории</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название категории"
            value={deleteCategoryName}
            onChange={(e) => handleTemplateSearchForDelete(e.target.value)}
          />
          {showTemplateListForDelete &&
            filteredTemplatesForDelete.length > 0 && (
              <ul className="product-list">
                {filteredTemplatesForDelete.map((template) => (
                  <li
                    key={template.id}
                    className="product-list-item"
                    onClick={() => handleTemplateSelectForDelete(template)}
                  >
                    {template.category_name}
                  </li>
                ))}
              </ul>
            )}
        </div>
        <button className="button-editing" onClick={handleDeleteTemplate}>
          Удалить шаблон
        </button>
      </div>
    </div>
  )
}
