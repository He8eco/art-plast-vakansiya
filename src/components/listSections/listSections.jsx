import './listSections.css'
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

const SectionsList = ({ className, onClose }) => {
  const [sections, setSections] = useState([])
  const [categories, setCategories] = useState([])
  const [hoveredSection, setHoveredSection] = useState(null)
  const [hoverTimeout, setHoverTimeout] = useState(null)
  const [isDropdownVisible, setDropdownVisible] = useState(true)

  const navigate = useNavigate()

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
    localStorage.setItem('cachedSections', JSON.stringify(data))
  }

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
    localStorage.setItem('cachedCategories', JSON.stringify(data))
  }

  useEffect(() => {
    fetchSections()
    fetchCategories()
  }, [])

  const getCategoriesBySection = (sectionId) => {
    return categories.filter((category) => category.section_id === sectionId)
  }

  const handleMouseEnter = (sectionId) => {
    clearTimeout(hoverTimeout)
    setDropdownVisible(true) // Сбрасываем видимость dropdown
    const timer = setTimeout(() => {
      setHoveredSection(sectionId)
    }, 300)
    setHoverTimeout(timer)
  }

  const handleContainerMouseLeave = () => {
    clearTimeout(hoverTimeout)
    setHoveredSection(null)
  }

  const handleCategoryClick = (categoryName, sectionName) => {
    navigate(`/${sectionName}/${categoryName}`)
  }

  return (
    <div
      className={`listSections ${className}`}
      onMouseLeave={handleContainerMouseLeave}
    >
      <button
        className="close-listSections close-button"
        onClick={() => {
          onClose()
          setHoveredSection(null) // Сброс hoveredSection
        }}
      >
        ×
      </button>
      <p className="section-categorie-title">Разделы</p>
      <ul>
        {sections.map((section) => (
          <li
            key={section.id}
            className={`section ${
              hoveredSection === section.id ? 'active-section' : ''
            }`}
            onMouseEnter={() => handleMouseEnter(section.id)}
          >
            {section.name}
            {hoveredSection === section.id && isDropdownVisible && (
              <ul className="dropdown">
                <button
                  className="close-dropdown close-button"
                  onClick={() => setDropdownVisible(false)}
                >
                  ×
                </button>
                <p className="section-categorie-title">Категории</p>
                {getCategoriesBySection(section.id).map((category) => (
                  <li
                    key={category.id}
                    className="categorie"
                    onClick={() =>
                      handleCategoryClick(category.name, section.name)
                    }
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SectionsList
