import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import ListEditing from '../components/listEditing/listEditing.jsx'

const SectionManagement = () => {
  const [sectionName, setSectionName] = useState('')
  const [sectionPosition, setSectionPosition] = useState('') // Поле для позиции
  const [sections, setSections] = useState([])
  const [filteredSectionsForEdit, setFilteredSectionsForEdit] = useState([])
  const [filteredSectionsForDelete, setFilteredSectionsForDelete] = useState([])
  const [searchTermForEdit, setSearchTermForEdit] = useState('')
  const [searchTermForDelete, setSearchTermForDelete] = useState('')
  const [editingSectionId, setEditingSectionId] = useState(null)
  const [newSectionName, setNewSectionName] = useState('')
  const [newSectionPosition, setNewSectionPosition] = useState('')
  const [deletingSectionId, setDeletingSectionId] = useState(null)

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
  // Получение разделов из базы данных, отсортированных по `position`
  useEffect(() => {
    fetchSections()
  }, [])

  const handleAddSection = async () => {
    if (!sectionName || !sectionPosition) return

    try {
      const { error } = await supabase.from('sections').insert({
        name: sectionName,
        position: parseInt(sectionPosition),
      })

      if (error) {
        throw error
      }

      setSectionName('')
      setSectionPosition('')
      fetchSections()
    } catch (error) {
      console.error('Error adding section:', error)
    }
  }

  const handleSearchSectionsForEdit = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm)
    )
    setFilteredSectionsForEdit(filtered)
    setSearchTermForEdit(searchTerm)
  }

  const handleSearchSectionsForDelete = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm)
    )
    setFilteredSectionsForDelete(filtered)
    setSearchTermForDelete(searchTerm)
  }

  const handleSelectSectionForEdit = (section) => {
    setSearchTermForEdit(section.name)
    setFilteredSectionsForEdit([])
    setEditingSectionId(section.id)
    setNewSectionName(section.name)
    setNewSectionPosition(section.position)
  }

  const handleSelectSectionForDelete = (section) => {
    setSearchTermForDelete(section.name)
    setFilteredSectionsForDelete([])
    setDeletingSectionId(section.id)
  }

  const handleDeleteSection = async () => {
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', deletingSectionId)

      if (error) {
        throw error
      }

      setSearchTermForDelete('')
      setDeletingSectionId(null)
      fetchSections()
    } catch (error) {
      console.error('Error deleting section: ', error)
    }
  }

  const handleEditSection = async () => {
    if (!editingSectionId || !newSectionName || !newSectionPosition) return

    try {
      const { error } = await supabase
        .from('sections')
        .update({
          name: newSectionName,
          position: parseInt(newSectionPosition),
        })
        .eq('id', editingSectionId)

      if (error) {
        throw error
      }

      setEditingSectionId(null)
      setNewSectionName('')
      setNewSectionPosition('')
      setSearchTermForEdit('')

      fetchSections()
    } catch (error) {
      console.error('Error updating section: ', error)
    }
  }

  return (
    <div className="flex">
      <ListEditing></ListEditing>
      <div className="editing">
        <p className="title top">Создание раздела</p>
        <div>
          <p>Введите название раздела и позицию</p>
          <input
            type="text"
            placeholder="Название раздела"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Позиция раздела"
            value={sectionPosition}
            onChange={(e) => setSectionPosition(e.target.value)}
          />
        </div>
        <button className="button-editing" onClick={handleAddSection}>
          Создать раздел
        </button>

        <div>
          <p className="title">Редактирование раздела</p>
          <p>Выберите раздел</p>
          <div className="list-editing">
            <input
              className="z"
              type="text"
              placeholder="Поиск раздела"
              value={searchTermForEdit}
              onChange={handleSearchSectionsForEdit}
            />
            {searchTermForEdit && filteredSectionsForEdit.length > 0 && (
              <ul>
                {filteredSectionsForEdit.map((section) => (
                  <li
                    key={section.id}
                    onClick={() => handleSelectSectionForEdit(section)}
                  >
                    {section.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p>Введите название раздела и позицию</p>
          <div>
            <input
              type="text"
              placeholder="Новое название раздела"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              disabled={!editingSectionId}
            />
            <input
              type="number"
              placeholder="Новая позиция"
              value={newSectionPosition}
              onChange={(e) => setNewSectionPosition(e.target.value)}
              disabled={!editingSectionId}
            />
          </div>
          <button
            className="button-editing"
            onClick={handleEditSection}
            disabled={
              !editingSectionId || !newSectionName || !newSectionPosition
            }
          >
            Сохранить изменения
          </button>
        </div>

        <div>
          <p className="title">Удаление раздела</p>
          <p>Выберите раздел</p>
          <div className="list-editing">
            <input
              className="z"
              type="text"
              placeholder="Поиск раздела"
              value={searchTermForDelete}
              onChange={handleSearchSectionsForDelete}
            />
            {searchTermForDelete && filteredSectionsForDelete.length > 0 && (
              <ul>
                {filteredSectionsForDelete.map((section) => (
                  <li
                    key={section.id}
                    onClick={() => handleSelectSectionForDelete(section)}
                  >
                    {section.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <button
          className="button-editing"
          onClick={handleDeleteSection}
          disabled={!deletingSectionId}
        >
          Удалить раздел
        </button>
      </div>
    </div>
  )
}

export default SectionManagement
