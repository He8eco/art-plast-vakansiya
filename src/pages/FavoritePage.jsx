// FavoritesPage.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import FavoriteButton from '../components/UI/FavoriteButton'

const FavoritesPage = () => {
  const [favoriteProducts, setFavoriteProducts] = useState([])

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      const favorites = JSON.parse(localStorage.getItem('favorites')) || []

      if (favorites.length === 0) {
        setFavoriteProducts([])
        return
      }

      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', favorites)

        if (productsError) {
          throw productsError
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

        const categoryById = {}

        categoriesData.forEach((category) => {
          categoryById[category.id] = {
            ...category,
            sectionName: sectionNameById[category.section_id] || '',
          }
        })

        const productsWithRoutes = productsData.map((product) => {
          const category = categoryById[product.category_id]

          return {
            ...product,
            sectionName: category?.sectionName || '',
            categoryName: category?.name || product.category_name || '',
          }
        })

        setFavoriteProducts(productsWithRoutes)
      } catch (error) {
        console.error('Ошибка при получении избранных товаров:', error)
      }
    }

    fetchFavoriteProducts()
  }, [])

  return (
    <div className="favorites-page">
      <h2>Избранные товары</h2>

      {favoriteProducts.length === 0 ? (
        <p>У вас нет избранных товаров.</p>
      ) : (
        <div className="flex">
          {favoriteProducts.map((product) => (
            <Link
              key={product.id}
              to={`/${product.sectionName}/${product.categoryName}/${product.id}`}
              className="card"
            >
              <div style={{ position: 'relative' }}>
                {product.main_image && (
                  <img
                    className="product-photo"
                    src={product.main_image}
                    alt={product.name}
                  />
                )}

                <FavoriteButton productId={product.id} />
              </div>

              <div className="product-values">
                <p className="product-name">
                  {product.company_name} {product.name}
                </p>

                <div>
                  <p
                    className={`product-price ${
                      product.discount ? 'product-price-none' : ''
                    }`}
                  >
                    {product.price} ₽
                  </p>

                  {product.discount && (
                    <p className="product-discount-price">
                      {product.discount} ₽
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
