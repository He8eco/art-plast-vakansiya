import React, { useState, useEffect, useContext } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './promotions.css'
import { AuthContext } from '../../AuthContext.jsx'
import PromotionBlock from '../PromotionBlock.jsx'

export default function Promotions() {
  const [promotions, setPromotions] = useState([])
  const [categorySectionMap, setCategorySectionMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  const { currentUser } = useContext(AuthContext)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: promotionsData, error: promotionsError } = await supabase
          .from('promotions')
          .select('*')
          .order('position', { ascending: true })

        if (promotionsError) {
          throw promotionsError
        }

        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')

        if (categoriesError) {
          throw categoriesError
        }

        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('*')

        if (sectionsError) {
          throw sectionsError
        }

        const sectionNameById = {}

        sectionsData.forEach((section) => {
          sectionNameById[section.id] = section.name
        })

        const newCategorySectionMap = {}

        categoriesData.forEach((category) => {
          const sectionName = sectionNameById[category.section_id]

          if (sectionName) {
            newCategorySectionMap[category.name] = sectionName
          }
        })

        setPromotions(promotionsData)
        setCategorySectionMap(newCategorySectionMap)
      } catch (error) {
        console.error('Error fetching promotions data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const groupedPromotions = {
    Акции: [],
    Рекомендуем: [],
    'Хиты продаж': [],
    Новинки: [],
  }

  promotions.forEach((promotion) => {
    if (groupedPromotions[promotion.promotion_type]) {
      groupedPromotions[promotion.promotion_type].push(promotion)
    } else {
      groupedPromotions[promotion.promotion_type] = [promotion]
    }
  })

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  return (
    <div className="promotions">
      {Object.keys(groupedPromotions).map((promotionType) => {
        const promotionsArray = groupedPromotions[promotionType]

        if (promotionsArray.length === 0) {
          return null
        }

        return (
          <PromotionBlock
            key={promotionType}
            promotionType={promotionType}
            promotionsArray={promotionsArray}
            categorySectionMap={categorySectionMap}
            currentUser={currentUser}
          />
        )
      })}
    </div>
  )
}
